import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

const BANKROLL_KEY = 'fp_bankroll';

@Component({
  selector: 'app-model-stats',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">

      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="title">💰 Mis Apuestas</h1>
          <p class="subtitle">Seguimiento de tus apuestas guardadas</p>
        </div>
        <button class="btn-refresh" (click)="load()" [disabled]="loading()">
          {{ loading() ? 'Cargando...' : '↻ Actualizar' }}
        </button>
      </div>

      @if (loading()) {
        <div class="center-msg"><div class="spinner"></div><p>Cargando apuestas...</p></div>
      } @else if (!perf()) {
        <div class="empty-state">
          <span class="empty-icon">⚠️</span>
          <p>No se pudo cargar. ¿Estás logueado?</p>
        </div>
      } @else if (perf()!.total === 0) {
        <div class="empty-state">
          <span class="empty-icon">🎯</span>
          <h2>Sin apuestas guardadas</h2>
          <p>Usa el parlay builder (🎰) en los partidos para guardar selecciones.</p>
        </div>
      } @else {

        <!-- Bankroll (admin only) -->
        @if (auth.isAdmin() && bankroll() > 0) {
          <div class="bankroll-row">
            <div class="bk-card">
              <div class="bk-label">Bankroll inicial</div>
              <div class="bk-val">$ {{ bankroll() | number:'1.0-0' }}</div>
            </div>
            <div class="bk-card" [class.bk-good]="currentBankroll() >= bankroll()" [class.bk-bad]="currentBankroll() < bankroll()">
              <div class="bk-label">Bankroll actual</div>
              <div class="bk-val" [class.green]="currentBankroll() >= bankroll()" [class.red]="currentBankroll() < bankroll()">
                $ {{ currentBankroll() | number:'1.0-0' }}
              </div>
            </div>
            <div class="bk-card" [class.bk-good]="bankrollPct() >= 0" [class.bk-bad]="bankrollPct() < 0">
              <div class="bk-label">Rendimiento</div>
              <div class="bk-val" [class.green]="bankrollPct() >= 0" [class.red]="bankrollPct() < 0">
                {{ bankrollPct() >= 0 ? '+' : '' }}{{ bankrollPct() }}%
              </div>
            </div>
            <button class="bk-edit" (click)="editingBankroll.set(true)" title="Editar bankroll">✏️</button>
          </div>
        }

        <!-- Bankroll setup (admin only) -->
        @if (auth.isAdmin() && (bankroll() === 0 || editingBankroll())) {
          <div class="bankroll-setup">
            <span class="bk-setup-label">{{ bankroll() === 0 ? '💡 Ingresa tu bankroll inicial para ver el rendimiento real' : '✏️ Cambiar bankroll inicial' }}</span>
            <input class="bk-input" type="number" min="1000" step="1000" placeholder="ej: 100000" [(ngModel)]="bankrollInput" />
            <button class="bk-save" (click)="saveBankroll()">Guardar</button>
            @if (bankroll() > 0) {
              <button class="bk-cancel" (click)="editingBankroll.set(false)">Cancelar</button>
            }
          </div>
        }

        <!-- KPIs -->
        <div class="kpis">
          <div class="kpi-card">
            <div class="kpi-n">{{ perf()!.total }}</div>
            <div class="kpi-label">Total</div>
          </div>
          <div class="kpi-card" [class.kpi-good]="perf()!.won > 0">
            <div class="kpi-n green">{{ perf()!.won }}</div>
            <div class="kpi-label">Ganadas ✓</div>
          </div>
          <div class="kpi-card" [class.kpi-bad]="perf()!.lost > 0">
            <div class="kpi-n red">{{ perf()!.lost }}</div>
            <div class="kpi-label">Perdidas ✗</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-n muted">{{ perf()!.pending }}</div>
            <div class="kpi-label">Pendientes</div>
          </div>
          @if (perf()!.win_rate !== null) {
            <div class="kpi-card" [class.kpi-good]="perf()!.win_rate >= 55" [class.kpi-bad]="perf()!.win_rate < 40">
              <div class="kpi-n accent">{{ perf()!.win_rate }}%</div>
              <div class="kpi-label">Win rate</div>
            </div>
          }
          <div class="kpi-card" [class.kpi-good]="perf()!.profit > 0" [class.kpi-bad]="perf()!.profit < 0">
            <div class="kpi-n" [class.green]="perf()!.profit > 0" [class.red]="perf()!.profit < 0">
              {{ perf()!.profit >= 0 ? '+' : '' }}$ {{ perf()!.profit | number:'1.0-0' }}
            </div>
            <div class="kpi-label">Beneficio (COP)</div>
          </div>
          @if (perf()!.roi !== null) {
            <div class="kpi-card" [class.kpi-good]="perf()!.roi > 0" [class.kpi-bad]="perf()!.roi < 0">
              <div class="kpi-n" [class.green]="perf()!.roi > 0" [class.red]="perf()!.roi < 0">
                {{ perf()!.roi >= 0 ? '+' : '' }}{{ perf()!.roi }}%
              </div>
              <div class="kpi-label">ROI</div>
            </div>
          }
        </div>

        <!-- Plan access banner -->
        @if (!auth.isAdmin() && perf()?.user_plan !== 'oro') {
          <div class="plan-banner">
            <span class="plan-banner-icon">{{ perf()?.user_plan === 'hincha' ? '🏟️' : perf()?.user_plan === 'bronce' ? '⚽' : '🥈' }}</span>
            <div class="plan-banner-text">
              <strong>Plan {{ auth.planLabel() }}</strong>
              @if (perf()?.user_plan === 'hincha') {
                — Solo ves el resumen de estadísticas. Activa un plan Bronce, Plata u Oro para ver los picks.
              } @else {
                — Ves {{ perf()?.bets?.length }} de {{ perf()?.total_bets }} apuestas recientes.
                Para ver más, actualiza tu plan.
              }
            </div>
          </div>
        }

        <!-- Gráfica P&L acumulado -->
        @if (chartPoints().length >= 2) {
          <div class="section-label">Evolución P&L acumulado</div>
          <div class="chart-wrap">
            <svg class="chart-svg" viewBox="0 0 580 110" preserveAspectRatio="none">
              <!-- Zero line -->
              <line
                x1="10" [attr.y1]="chartZeroY()"
                x2="570" [attr.y2]="chartZeroY()"
                stroke="rgba(255,255,255,0.15)" stroke-width="1" stroke-dasharray="4,4"
              />
              <!-- P&L line -->
              <polyline
                [attr.points]="chartPolyline()"
                fill="none"
                [attr.stroke]="chartPositive() ? '#10b981' : '#ef4444'"
                stroke-width="2"
                stroke-linejoin="round"
                stroke-linecap="round"
              />
              <!-- Dots -->
              @for (pt of chartPoints(); track $index) {
                <circle
                  [attr.cx]="pt.x" [attr.cy]="pt.y" r="3"
                  [attr.fill]="pt.won ? '#10b981' : '#ef4444'"
                />
              }
            </svg>
            <div class="chart-labels">
              <span class="chart-label-last" [class.green]="chartPositive()" [class.red]="!chartPositive()">
                {{ chartPositive() ? '+' : '' }}$ {{ chartLastValue() | number:'1.0-0' }}
              </span>
            </div>
          </div>
        }

        <!-- Por mercado -->
        @if (markets().length > 0) {
          <div class="section-label">Por mercado</div>
          <div class="market-table">
            <div class="mt-header">
              <span>Mercado</span>
              <span class="center">Total</span>
              <span class="center">Ganadas</span>
              <span class="center">Perdidas</span>
              <span class="center">Win rate</span>
            </div>
            @for (m of markets(); track m.key) {
              <div class="mt-row">
                <span class="mt-name">{{ m.key }}</span>
                <span class="center">{{ m.total }}</span>
                <span class="center green">{{ m.won }}</span>
                <span class="center red">{{ m.lost }}</span>
                <span class="center" [class.good]="m.win_rate >= 55" [class.bad]="m.win_rate !== null && m.win_rate < 45">
                  {{ m.win_rate !== null ? m.win_rate + '%' : '—' }}
                </span>
              </div>
            }
          </div>
        }

        <!-- Por liga -->
        @if (leagues().length > 0) {
          <div class="section-label">Por liga</div>
          <div class="market-table">
            <div class="lg-header">
              <span>Liga</span>
              <span class="center">Total</span>
              <span class="center">Gan.</span>
              <span class="center">Per.</span>
              <span class="center">Win %</span>
              <span class="center">P&L</span>
              <span class="center">ROI</span>
            </div>
            @for (lg of leagues(); track lg.key) {
              <div class="lg-row">
                <span class="mt-name">{{ lg.key }}</span>
                <span class="center">{{ lg.total }}</span>
                <span class="center green">{{ lg.won }}</span>
                <span class="center red">{{ lg.lost }}</span>
                <span class="center" [class.good]="lg.win_rate >= 55" [class.bad]="lg.win_rate !== null && lg.win_rate < 45">
                  {{ lg.win_rate !== null ? lg.win_rate + '%' : '—' }}
                </span>
                <span class="center" [class.green]="lg.profit > 0" [class.red]="lg.profit < 0">
                  {{ lg.profit >= 0 ? '+' : '' }}$ {{ lg.profit | number:'1.0-0' }}
                </span>
                <span class="center" [class.good]="lg.roi > 0" [class.bad]="lg.roi !== null && lg.roi < 0">
                  {{ lg.roi !== null ? (lg.roi >= 0 ? '+' : '') + lg.roi + '%' : '—' }}
                </span>
              </div>
            }
          </div>
        }

        <!-- Filtros -->
        <div class="filters-row">
          <div class="filter-pills">
            <button class="pill" [class.pill-active]="statusFilter() === 'all'" (click)="statusFilter.set('all')">Todas</button>
            <button class="pill pill-won" [class.pill-active]="statusFilter() === 'won'" (click)="statusFilter.set('won')">✓ Ganadas</button>
            <button class="pill pill-lost" [class.pill-active]="statusFilter() === 'lost'" (click)="statusFilter.set('lost')">✗ Perdidas</button>
            <button class="pill pill-pending" [class.pill-active]="statusFilter() === 'pending'" (click)="statusFilter.set('pending')">⏳ Pendientes</button>
          </div>
          <select class="market-sel" [value]="marketFilter()" (change)="onMarketFilter($event)">
            <option value="all">Todos los mercados</option>
            @for (m of availableMarkets(); track m) {
              <option [value]="m">{{ m }}</option>
            }
          </select>
        </div>

        <!-- Historial -->
        <div class="section-label">
          Historial
          @if (filteredBets().length !== perf()!.bets.length) {
            <span class="filter-count">{{ filteredBets().length }} de {{ perf()!.bets.length }}</span>
          }
        </div>
        <div class="history">
          <div class="h-header">
            <span>Partido</span>
            <span>Mercado / Pick</span>
            <span class="center">Cuota Betplay</span>
            <span class="center">Estado</span>
            <span class="center">P&L ($)</span>
            <span></span>
          </div>
          @for (bet of filteredBets(); track bet.id) {
            <div class="h-row" [class.h-won]="bet.status === 'won'" [class.h-lost]="bet.status === 'lost'">
              <div class="h-match">
                <span class="h-label">{{ bet.match_label }}</span>
                <span class="h-league">{{ bet.league }}</span>
              </div>
              <div class="h-bet">
                <span class="h-type">{{ formatBetType(bet.bet_type) }}</span>
                <span class="h-pick">{{ bet.bet_pick }}</span>
              </div>
              <div class="center h-odds-col">
                @if (bet.real_odds) {
                  <span class="real-odds">&#64;{{ bet.real_odds }}</span>
                } @else {
                  <span class="muted-val">—</span>
                }
              </div>
              <span class="center h-status" [class.won]="bet.status === 'won'" [class.lost]="bet.status === 'lost'" [class.pending]="bet.status === 'pending'">
                {{ bet.status === 'won' ? '✓ Ganada' : bet.status === 'lost' ? '✗ Perdida' : '⏳' }}
              </span>
              <span class="center h-pnl" [class.green]="bet.profit > 0" [class.red]="bet.profit < 0">
                {{ bet.profit !== null ? (bet.profit >= 0 ? '+' : '') + '$ ' + (bet.profit | number:'1.0-0') : '—' }}
              </span>
              @if (auth.isAdmin()) {
                <button class="del-btn" (click)="deleteBet(bet.id)">×</button>
              }
            </div>
          }
          @if (filteredBets().length === 0) {
            <div class="empty-filter">Sin apuestas con ese filtro.</div>
          }
        </div>

      }
    </div>

    <!-- Modal confirmación eliminar -->
    @if (confirmDeleteId()) {
      <div class="modal-overlay" (click)="confirmDeleteId.set(null)">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-icon">🗑️</div>
          <h3 class="modal-title">¿Eliminar apuesta?</h3>
          <p class="modal-desc">Esta acción no se puede deshacer.</p>
          <div class="modal-actions">
            <button class="modal-btn-cancel" (click)="confirmDeleteId.set(null)">Cancelar</button>
            <button class="modal-btn-confirm" (click)="confirmDelete()">Sí, eliminar</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .page { padding: 20px 24px; max-width: 1000px; margin: 0 auto; }

    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; gap: 16px; flex-wrap: wrap; }
    .title { font-size: 22px; font-weight: 800; color: var(--text-primary); margin: 0 0 4px; }
    .subtitle { font-size: 13px; color: var(--text-muted); margin: 0; }
    .btn-refresh { background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 9px 18px; color: var(--text-primary); font-weight: 700; font-size: 13px; cursor: pointer; transition: all 0.2s; }
    .btn-refresh:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
    .btn-refresh:disabled { opacity: 0.5; cursor: not-allowed; }

    .section-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); margin: 22px 0 10px; display: flex; align-items: center; gap: 8px; }
    .filter-count { background: var(--accent); color: #000; font-size: 10px; padding: 1px 7px; border-radius: 10px; font-weight: 800; }

    /* Bankroll */
    .bankroll-row { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
    .bk-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 12px 18px; display: flex; flex-direction: column; gap: 3px; min-width: 140px; }
    .bk-card.bk-good { border-color: rgba(16,185,129,0.4); }
    .bk-card.bk-bad  { border-color: rgba(239,68,68,0.35); }
    .bk-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); }
    .bk-val { font-size: 20px; font-weight: 800; color: var(--text-primary); }
    .bk-edit { background: transparent; border: 1px solid var(--border); border-radius: 8px; padding: 6px 10px; cursor: pointer; font-size: 16px; color: var(--text-muted); margin-left: auto; }
    .bk-edit:hover { border-color: var(--accent); }
    .bankroll-setup { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 12px 16px; flex-wrap: wrap; }
    .bk-setup-label { font-size: 12px; color: var(--text-muted); flex: 1; min-width: 200px; }
    .bk-input { background: var(--bg-input); border: 1px solid var(--border); border-radius: 8px; padding: 7px 12px; color: var(--text-primary); font-size: 14px; font-weight: 700; outline: none; width: 140px; }
    .bk-input:focus { border-color: var(--accent); }
    .bk-save { background: var(--accent); border: none; border-radius: 8px; padding: 8px 16px; color: #000; font-weight: 700; font-size: 13px; cursor: pointer; }
    .bk-cancel { background: transparent; border: 1px solid var(--border); border-radius: 8px; padding: 8px 14px; color: var(--text-muted); font-size: 13px; cursor: pointer; }

    /* KPIs */
    .kpis { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 8px; }
    .kpi-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 14px 18px; display: flex; flex-direction: column; gap: 4px; min-width: 100px; flex: 1; }
    .kpi-card.kpi-good { border-color: rgba(16,185,129,0.4); }
    .kpi-card.kpi-bad  { border-color: rgba(239,68,68,0.4); }
    .kpi-n { font-size: 24px; font-weight: 800; color: var(--text-primary); }
    .kpi-n.green  { color: #10b981; }
    .kpi-n.red    { color: #ef4444; }
    .kpi-n.muted  { color: var(--text-muted); }
    .kpi-n.accent { color: var(--accent); }
    .kpi-label { font-size: 11px; color: var(--text-muted); }

    /* Chart */
    .chart-wrap { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 12px 16px; margin-bottom: 8px; position: relative; }
    .chart-svg { width: 100%; height: 110px; display: block; }
    .chart-labels { position: absolute; top: 12px; right: 16px; }
    .chart-label-last { font-size: 15px; font-weight: 800; }

    /* Market table */
    .market-table { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; margin-bottom: 8px; }
    .mt-header, .mt-row { display: grid; grid-template-columns: 1fr 70px 80px 80px 90px; align-items: center; padding: 9px 16px; gap: 8px; }
    .mt-header { background: var(--bg-input); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); border-bottom: 1px solid var(--border); }
    .mt-row { border-bottom: 1px solid var(--border); font-size: 13px; }
    .mt-row:last-child { border-bottom: none; }
    .mt-name { font-weight: 700; color: var(--text-primary); }

    /* League table */
    .lg-header, .lg-row { display: grid; grid-template-columns: 1fr 60px 60px 60px 70px 90px 75px; align-items: center; padding: 9px 16px; gap: 8px; }
    .lg-header { background: var(--bg-input); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); border-bottom: 1px solid var(--border); }
    .lg-row { border-bottom: 1px solid var(--border); font-size: 13px; }
    .lg-row:last-child { border-bottom: none; }

    /* Filters */
    .filters-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
    .filter-pills { display: flex; gap: 6px; flex-wrap: wrap; }
    .pill { background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; padding: 5px 14px; font-size: 12px; font-weight: 600; color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
    .pill:hover { border-color: var(--accent); color: var(--text-primary); }
    .pill.pill-active { background: var(--accent); border-color: var(--accent); color: #000; }
    .pill-won.pill-active  { background: #10b981; border-color: #10b981; }
    .pill-lost.pill-active { background: #ef4444; border-color: #ef4444; color: #fff; }
    .pill-pending.pill-active { background: #f59e0b; border-color: #f59e0b; color: #000; }
    .market-sel { background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 6px 12px; color: var(--text-primary); font-size: 12px; outline: none; cursor: pointer; }
    .market-sel:focus { border-color: var(--accent); }

    /* History */
    .history { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; overflow-x: auto; }
    .h-header, .h-row { display: grid; grid-template-columns: 1.8fr 1.4fr 110px 100px 80px 36px; align-items: center; padding: 9px 14px; gap: 8px; min-width: 580px; }
    .h-header { background: var(--bg-input); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); border-bottom: 1px solid var(--border); }
    .h-row { border-bottom: 1px solid var(--border); font-size: 12px; }
    .h-row:last-child { border-bottom: none; }
    .h-won  { border-left: 3px solid rgba(16,185,129,0.5); }
    .h-lost { border-left: 3px solid rgba(239,68,68,0.4); }

    .h-match { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
    .h-label { font-size: 12px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .h-league { font-size: 10px; color: var(--text-muted); }
    .h-bet { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .h-type { font-size: 10px; color: var(--text-muted); background: var(--bg-input); padding: 1px 5px; border-radius: 3px; width: fit-content; }
    .h-pick { font-size: 12px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .h-odds-col { display: flex; justify-content: center; }
    .real-odds { font-weight: 700; color: var(--accent); font-size: 13px; }
    .muted-val { color: var(--text-muted); font-size: 12px; }
    .h-status { font-size: 11px; font-weight: 700; }
    .h-status.won     { color: #10b981; }
    .h-status.lost    { color: #ef4444; }
    .h-status.pending { color: #f59e0b; }
    .h-pnl { font-size: 12px; font-weight: 800; }
    .h-row { position: relative; }
    .del-btn {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 1px solid rgba(239,68,68,0.4);
      background: rgba(239,68,68,0.08);
      color: #ef4444;
      font-size: 16px;
      line-height: 1;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.15s, background 0.15s;
      padding: 0;
    }
    .h-row:hover .del-btn { opacity: 1; }
    .del-btn:hover { background: rgba(239,68,68,0.22); }
    .empty-filter { padding: 24px; text-align: center; color: var(--text-muted); font-size: 13px; }

    .center { text-align: center; }
    .good  { color: #10b981; font-weight: 700; }
    .bad   { color: #ef4444; font-weight: 700; }
    .green { color: #10b981; }
    .red   { color: #ef4444; }

    /* Modal */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.55);
      z-index: 800; display: flex; align-items: center; justify-content: center;
    }
    .modal {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: 16px; padding: 32px 28px; width: 320px;
      text-align: center; display: flex; flex-direction: column; gap: 10px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }
    .modal-icon { font-size: 36px; }
    .modal-title { font-size: 18px; font-weight: 800; color: var(--text-primary); margin: 0; }
    .modal-desc { font-size: 13px; color: var(--text-muted); margin: 0; }
    .modal-actions { display: flex; gap: 10px; margin-top: 8px; }
    .modal-btn-cancel {
      flex: 1; background: var(--bg-input); border: 1px solid var(--border);
      border-radius: 8px; padding: 10px; color: var(--text-primary);
      font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s;
    }
    .modal-btn-cancel:hover { border-color: var(--accent); }
    .modal-btn-confirm {
      flex: 1; background: #ef4444; border: none; border-radius: 8px;
      padding: 10px; color: #fff; font-weight: 700; font-size: 14px;
      cursor: pointer; transition: opacity 0.2s;
    }
    .modal-btn-confirm:hover { opacity: 0.85; }

    /* Plan banner */
    .plan-banner {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background: rgba(217,119,6,0.08);
      border: 1px solid rgba(217,119,6,0.3);
      border-radius: 10px;
      padding: 12px 16px;
      margin-bottom: 8px;
      font-size: 13px;
      color: var(--text-secondary);
    }
    .plan-banner-icon { font-size: 22px; flex-shrink: 0; line-height: 1.2; }
    .plan-banner-text strong { color: #d97706; }

    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 80px 20px; gap: 12px; text-align: center; }
    .empty-icon  { font-size: 52px; }
    .empty-state h2 { color: var(--text-primary); margin: 0; font-size: 18px; }
    .empty-state p  { color: var(--text-muted); font-size: 14px; margin: 0; }
    .center-msg { display: flex; flex-direction: column; align-items: center; padding: 80px 20px; gap: 12px; color: var(--text-muted); font-size: 14px; }
    .spinner { width: 32px; height: 32px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class ModelStatsComponent implements OnInit {
  loading = signal(false);
  perf    = signal<any | null>(null);

  statusFilter    = signal<string>('all');
  marketFilter    = signal<string>('all');
  bankroll        = signal<number>(0);
  editingBankroll = signal(false);
  bankrollInput   = 0;
  confirmDeleteId = signal<number | null>(null);

  markets = () => Object.entries(this.perf()?.by_market ?? {})
    .map(([key, v]: [string, any]) => ({ key, ...v }));

  leagues = () => Object.entries(this.perf()?.by_league ?? {})
    .map(([key, v]: [string, any]) => ({ key, ...v }))
    .sort((a, b) => b.total - a.total);

  availableMarkets = computed(() =>
    [...new Set((this.perf()?.bets ?? []).map((b: any) => this.marketGroup(b.bet_type)))]
  );

  filteredBets = computed(() => {
    const bets: any[] = this.perf()?.bets ?? [];
    const sf = this.statusFilter();
    const mf = this.marketFilter();
    return bets.filter(b => {
      if (sf !== 'all' && b.status !== sf) return false;
      if (mf !== 'all' && this.marketGroup(b.bet_type) !== mf) return false;
      return true;
    });
  });

  // Chart computeds
  private chartData = computed(() => {
    const resolved = (this.perf()?.bets ?? [])
      .filter((b: any) => b.status === 'won' || b.status === 'lost')
      .slice().reverse();
    let cum = 0;
    return resolved.map((b: any) => {
      cum += b.profit ?? 0;
      return { cum, won: b.status === 'won' };
    });
  });

  chartPoints = computed(() => {
    const data = this.chartData();
    if (data.length < 2) return [];
    const W = 560, H = 90, PX = 10, PY = 10;
    const vals = data.map((d: any) => d.cum);
    const min = Math.min(0, ...vals);
    const max = Math.max(0, ...vals);
    const range = max - min || 1;
    return data.map((d: any, i: number) => ({
      x: PX + (i / (data.length - 1)) * W,
      y: PY + (1 - (d.cum - min) / range) * H,
      won: d.won,
    }));
  });

  chartPolyline = computed(() =>
    this.chartPoints().map((p: any) => `${p.x},${p.y}`).join(' ')
  );

  chartZeroY = computed(() => {
    const data = this.chartData();
    if (!data.length) return 55;
    const vals = data.map((d: any) => d.cum);
    const min = Math.min(0, ...vals);
    const max = Math.max(0, ...vals);
    const range = max - min || 1;
    return 10 + (1 - (0 - min) / range) * 90;
  });

  chartLastValue = computed(() => {
    const data = this.chartData();
    return data.length ? data[data.length - 1].cum : 0;
  });

  chartPositive = computed(() => this.chartLastValue() >= 0);

  // Bankroll
  currentBankroll = computed(() => this.bankroll() + (this.perf()?.profit ?? 0));
  bankrollPct = computed(() => {
    if (!this.bankroll()) return 0;
    return Math.round((this.perf()?.profit ?? 0) / this.bankroll() * 1000) / 10;
  });

  constructor(private api: ApiService, public auth: AuthService) {}

  ngOnInit(): void {
    const saved = localStorage.getItem(BANKROLL_KEY);
    if (saved) this.bankroll.set(parseFloat(saved));
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.getBetPerformance().subscribe({
      next:  r  => { this.perf.set(r); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  saveBankroll(): void {
    if (!this.bankrollInput || this.bankrollInput < 1) return;
    this.bankroll.set(this.bankrollInput);
    localStorage.setItem(BANKROLL_KEY, String(this.bankrollInput));
    this.editingBankroll.set(false);
  }

  deleteBet(id: number): void {
    this.confirmDeleteId.set(id);
  }

  confirmDelete(): void {
    const id = this.confirmDeleteId();
    if (!id) return;
    this.confirmDeleteId.set(null);
    this.api.deleteBet(id).subscribe({
      next: () => {
        this.perf.update(p => p ? { ...p, bets: p.bets.filter((b: any) => b.id !== id) } : p);
      },
    });
  }

  onMarketFilter(event: Event): void {
    this.marketFilter.set((event.target as HTMLSelectElement).value);
  }

  marketGroup(raw: string): string {
    const s = (raw ?? '').toLowerCase();
    if (s.startsWith('goals_'))   return 'Goles';
    if (s.startsWith('corners_')) return 'Córneres';
    if (s.startsWith('cards_'))   return 'Tarjetas';
    if (s.includes('1x2'))        return '1X2';
    if (s.includes('dc_'))        return 'Doble Oportunidad';
    if (s.includes('btts'))       return 'BTTS';
    return raw.toUpperCase();
  }

  formatBetType(raw: string): string {
    if (!raw) return '—';
    const s = raw.toLowerCase();
    if (s.startsWith('goals_'))   return '⚽ Goles ' + s.split('_')[1];
    if (s.startsWith('corners_')) return '🚩 Córneres ' + s.split('_')[1];
    if (s.startsWith('cards_'))   return '🟨 Tarjetas ' + s.split('_')[1];
    if (s === '1x2_home')         return '🏆 1X2 Local';
    if (s === '1x2_draw')         return '🏆 1X2 Empate';
    if (s === '1x2_away')         return '🏆 1X2 Visitante';
    if (s === '1x2')              return '🏆 1X2';
    if (s === 'dc_1x')            return '🔀 Local o Empate';
    if (s === 'dc_x2')            return '🔀 Visitante o Empate';
    if (s.includes('btts'))       return '🔄 BTTS';
    return raw.toUpperCase();
  }
}
