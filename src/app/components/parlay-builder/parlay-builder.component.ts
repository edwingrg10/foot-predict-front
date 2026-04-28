import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParlayService } from '../../services/parlay.service';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ParlayPick } from '../../models/interfaces';

@Component({
  selector: 'app-parlay-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (auth.isAdmin()) {
    <!-- FAB -->
    <button class="parlay-fab" (click)="parlay.isOpen.set(!parlay.isOpen())" title="Mi Parlay">
      🎰
      @if (parlay.picks().length > 0) {
        <span class="fab-badge">{{ parlay.picks().length }}</span>
      }
    </button>

    <!-- Overlay -->
    @if (parlay.isOpen()) {
      <div class="parlay-overlay" (click)="parlay.isOpen.set(false)"></div>

      <!-- Panel -->
      <div class="parlay-panel">
        <div class="parlay-header">
          <div class="header-title">
            🎰 Mi Parlay
            @if (parlay.picks().length > 0) {
              <span class="header-count">{{ parlay.picks().length }}</span>
            }
          </div>
          <button class="panel-close" (click)="parlay.isOpen.set(false)">✕</button>
        </div>

        @if (parlay.picks().length === 0) {
          <div class="parlay-empty">
            <div class="empty-icon">🎯</div>
            <p>Sin selecciones</p>
            <small>Añade picks usando los botones de sugerencia en cada partido</small>
          </div>
        } @else {
          <div class="parlay-body">

            <!-- Picks -->
            <div class="picks-list">
              @for (pick of parlay.picks(); track pick.matchId + '_' + pick.marketKey) {
                <div class="pick-item">
                  <div class="pick-header-row">
                    <span class="pick-market-badge">{{ pick.market }}</span>
                    <button class="pick-remove" (click)="parlay.removePick(pick.matchId, pick.marketKey)" title="Quitar">✕</button>
                  </div>
                  <div class="pick-match">{{ pick.matchLabel }}</div>
                  <div class="pick-meta">
                    <span class="pick-selection">{{ pick.pick }}</span>
                    @if (pick.modelExpected) {
                      <span class="pick-expected">↑ {{ pick.modelExpected.toFixed(1) }} esp.</span>
                    }
                  </div>
                  <div class="pick-odds-row">
                    <span class="pick-prob">{{ (pick.probability * 100).toFixed(0) }}% prob.</span>
                    <span class="pick-odds-badge">&#64;{{ pick.estimatedOdds }}</span>
                  </div>
                  <div class="real-odds-row">
                    <label class="real-odds-label">Cuota Betplay <span class="required-star">*</span></label>
                    <input
                      class="real-odds-input"
                      [class.input-missing]="!pick.real_odds"
                      type="number"
                      min="1.01"
                      step="0.05"
                      placeholder="obligatorio"
                      [value]="pick.real_odds ?? ''"
                      (change)="setRealOdds(pick, $event)"
                    />
                  </div>
                </div>
              }
            </div>

            <!-- Stats combinadas -->
            <div class="parlay-stats">
              <div class="stat-row">
                <span class="stat-label">Cuota combinada</span>
                <span class="stat-value accent">&#64;{{ parlay.combinedOdds() }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Probabilidad conjunta</span>
                <span class="stat-value">{{ (parlay.combinedProb() * 100).toFixed(1) }}%</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Selecciones</span>
                <span class="stat-value">{{ parlay.picks().length }}</span>
              </div>
            </div>

            <!-- Stake -->
            <div class="stake-row">
              <label class="stake-label">Apuesta ($)</label>
              <input
                class="stake-input"
                type="number"
                min="1"
                step="1"
                [value]="parlay.stake()"
                (input)="onStakeInput($event)"
              />
            </div>

            <!-- Retorno -->
            <div class="return-row">
              <span>Retorno potencial</span>
              <span class="return-amount">$ {{ parlay.potentialReturn() | number:'1.0-0' }}</span>
            </div>

            <!-- Acciones -->
            @if (auth.isLoggedIn()) {
              @if (!canSave()) {
                <div class="missing-odds-hint">⚠️ Ingresa la cuota Betplay en cada selección</div>
              }
              <button class="btn-save" (click)="saveParlay()" [disabled]="saving() || saved() || !canSave()">
                @if (saved()) { ✅ Apuesta guardada }
                @else if (saving()) { Guardando... }
                @else { 💾 Guardar apuesta }
              </button>
            } @else {
              <div class="login-hint">Inicia sesión para guardar apuestas</div>
            }

            <button class="btn-clear" (click)="parlay.clear()">Limpiar todo</button>
          </div>
        }

        <div class="parlay-footer">
          ⚠️ Solo análisis estadístico. No constituye asesoramiento de apuestas.
        </div>
      </div>
    }
    }
  `,
  styles: [`
    .parlay-fab {
      position: fixed;
      bottom: 28px;
      right: 28px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--accent);
      border: none;
      font-size: 22px;
      cursor: pointer;
      z-index: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(0,255,135,0.35);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .parlay-fab:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 28px rgba(0,255,135,0.5);
    }
    .fab-badge {
      position: absolute;
      top: -5px;
      right: -5px;
      background: #ef4444;
      color: #fff;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      font-size: 11px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }
    .parlay-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.35);
      z-index: 599;
    }
    .parlay-panel {
      position: fixed;
      top: 0;
      right: 0;
      width: 340px;
      height: 100vh;
      background: var(--bg-card);
      border-left: 1px solid var(--border);
      z-index: 600;
      display: flex;
      flex-direction: column;
      box-shadow: -8px 0 40px rgba(0,0,0,0.4);
      overflow: hidden;
    }
    @media (max-width: 480px) {
      .parlay-panel { width: 100vw; }
    }
    .parlay-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border);
      background: var(--bg-primary);
      flex-shrink: 0;
      font-size: 15px;
      font-weight: 800;
    }
    .header-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .header-count {
      background: var(--accent);
      color: #000;
      border-radius: 12px;
      padding: 1px 8px;
      font-size: 12px;
      font-weight: 800;
    }
    .panel-close {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 18px;
      cursor: pointer;
      padding: 4px 8px;
    }
    .panel-close:hover { color: var(--text-primary); }
    .parlay-empty {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 32px;
      text-align: center;
      color: var(--text-muted);
    }
    .empty-icon { font-size: 48px; }
    .parlay-empty p { font-size: 15px; font-weight: 600; color: var(--text-secondary); margin: 0; }
    .parlay-empty small { font-size: 12px; line-height: 1.5; }
    .parlay-body {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }
    .picks-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 14px;
    }
    .pick-item {
      background: var(--bg-input);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 11px;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .pick-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .pick-market-badge {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--accent);
      background: rgba(0,255,135,0.1);
      padding: 2px 8px;
      border-radius: 4px;
    }
    .pick-remove {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 12px;
      cursor: pointer;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .pick-remove:hover { background: rgba(239,68,68,0.12); color: #ef4444; }
    .pick-match {
      font-size: 11px;
      color: var(--text-muted);
    }
    .pick-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .pick-selection {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-primary);
    }
    .pick-expected {
      font-size: 11px;
      color: var(--text-muted);
      background: var(--bg-card);
      padding: 1px 6px;
      border-radius: 4px;
    }
    .pick-odds-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .pick-prob { font-size: 11px; color: var(--text-muted); }
    .real-odds-row {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 4px;
    }
    .required-star { color: #ef4444; }
    .real-odds-label { font-size: 10px; color: var(--text-muted); white-space: nowrap; }
    .input-missing { border-color: rgba(239,68,68,0.5) !important; }
    .missing-odds-hint {
      margin: 0 14px 6px;
      font-size: 11px;
      color: #f59e0b;
      background: rgba(245,158,11,0.1);
      border: 1px solid rgba(245,158,11,0.25);
      border-radius: 6px;
      padding: 7px 10px;
      text-align: center;
    }
    .real-odds-input {
      flex: 1;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 4px 8px;
      color: var(--text-primary);
      font-size: 12px;
      font-weight: 700;
      outline: none;
      width: 0;
    }
    .real-odds-input:focus { border-color: var(--accent); }
    .real-odds-input::placeholder { color: var(--text-muted); font-weight: 400; }
    .pick-odds-badge {
      font-size: 13px;
      font-weight: 800;
      color: #10b981;
      background: rgba(16,185,129,0.1);
      padding: 2px 8px;
      border-radius: 6px;
    }
    .parlay-stats {
      margin: 0 14px 10px;
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .stat-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .stat-label { font-size: 12px; color: var(--text-muted); }
    .stat-value { font-size: 15px; font-weight: 800; color: var(--text-primary); }
    .stat-value.accent { color: var(--accent); font-size: 18px; }
    .stake-row {
      margin: 0 14px 8px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .stake-label { font-size: 13px; color: var(--text-secondary); white-space: nowrap; }
    .stake-input {
      flex: 1;
      background: var(--bg-input);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 8px 12px;
      color: var(--text-primary);
      font-size: 15px;
      font-weight: 700;
      text-align: right;
      outline: none;
    }
    .stake-input:focus { border-color: var(--accent); }
    .return-row {
      margin: 0 14px 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 14px;
      background: rgba(16,185,129,0.07);
      border: 1px solid rgba(16,185,129,0.2);
      border-radius: 8px;
    }
    .return-row span:first-child { font-size: 13px; color: var(--text-secondary); }
    .return-amount { font-size: 20px; font-weight: 800; color: #10b981; }
    .btn-save {
      margin: 0 14px 6px;
      background: var(--accent);
      border: none;
      border-radius: 8px;
      padding: 12px;
      color: #000;
      font-weight: 800;
      font-size: 14px;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .btn-save:hover:not(:disabled) { opacity: 0.85; }
    .btn-save:disabled { opacity: 0.5; cursor: default; }
    .login-hint {
      margin: 0 14px 6px;
      text-align: center;
      font-size: 12px;
      color: var(--text-muted);
      padding: 10px;
      background: var(--bg-input);
      border-radius: 8px;
    }
    .btn-clear {
      margin: 0 14px 14px;
      background: transparent;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 8px;
      color: var(--text-muted);
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-clear:hover { border-color: #ef4444; color: #ef4444; }
    .parlay-footer {
      padding: 12px 16px;
      font-size: 10px;
      color: var(--text-muted);
      border-top: 1px solid var(--border);
      background: var(--bg-primary);
      text-align: center;
      flex-shrink: 0;
    }
  `],
})
export class ParlayBuilderComponent {
  saving = signal(false);
  saved = signal(false);

  constructor(
    public parlay: ParlayService,
    private api: ApiService,
    public auth: AuthService,
  ) {}

  onStakeInput(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    if (!isNaN(val) && val > 0) this.parlay.stake.set(val);
  }

  canSave(): boolean {
    return this.parlay.picks().every(p => !!p.real_odds && p.real_odds >= 1.01);
  }

  setRealOdds(pick: ParlayPick, event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.parlay.picks.update(ps =>
      ps.map(p =>
        p.matchId === pick.matchId && p.marketKey === pick.marketKey
          ? { ...p, real_odds: isNaN(val) || val < 1.01 ? undefined : val }
          : p
      )
    );
  }


  saveParlay(): void {
    const picks = this.parlay.picks();
    if (!picks.length) return;
    this.saving.set(true);
    const total = picks.length;
    const combinedOdds = this.parlay.combinedOdds();
    const combinedProb = this.parlay.combinedProb();
    const stakePerPick = Math.round((this.parlay.stake() / total) * 100) / 100;
    let done = 0;

    picks.forEach(pick => {
      this.api.saveBet({
        match_id: pick.matchId,
        bet_type: pick.marketKey.toUpperCase(),
        bet_pick: pick.pick,
        odds: pick.estimatedOdds,
        real_odds: pick.real_odds,
        stake: stakePerPick,
        notes: `Parlay ${total}x @${combinedOdds} · Prob conjunta: ${(combinedProb * 100).toFixed(1)}%`,
      }).subscribe({
        next: () => {
          done++;
          if (done === total) {
            this.saving.set(false);
            this.saved.set(true);
            setTimeout(() => {
              this.saved.set(false);
              this.parlay.clear();
            }, 2500);
          }
        },
        error: () => {
          done++;
          if (done === total) this.saving.set(false);
        },
      });
    });
  }
}
