import {
  Component, Input, OnChanges, AfterViewInit, OnDestroy,
  ViewChild, ElementRef, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Match, ValueBet, FINISHED_STATUSES, LIVE_STATUSES } from '../../models/interfaces';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ParlayService } from '../../services/parlay.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-match-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (match) {
    <div class="detail-panel">
      <!-- Header -->
      <div class="detail-header">
        <div class="detail-league">
          <img [src]="match.league.logo" [alt]="match.league.name" referrerpolicy="no-referrer" onerror="this.style.display='none'" />
          {{ match.league.name }} · {{ match.league.country }}
        </div>
        <div class="detail-meta">
          <span>📅 {{ formatDate(match.match_date) }}</span>
          @if (match.venue) { <span>🏟️ {{ match.venue }}</span> }
          @if (match.referee) { <span>👤 {{ match.referee }}</span> }
          @if (match.weather) { <span>🌤️ {{ match.weather }}</span> }
        </div>
      </div>

      <!-- Teams header -->
      <div class="teams-header">
        <div class="team-block">
          <img [src]="match.home_team.logo" [alt]="match.home_team.name" class="team-logo-lg" referrerpolicy="no-referrer" onerror="this.style.display='none'" />
          <h2>{{ match.home_team.name }}</h2>
          <div class="form-chars">
            @for (ch of match.home_team.form?.split(''); track $index) {
              <span class="form-ch" [class]="ch">{{ ch }}</span>
            }
          </div>
        </div>
        <div class="score-center">
          @if (isFinished) {
            <div class="real-score">{{ match.home_score }} - {{ match.away_score }}</div>
            <span class="badge" style="background:var(--bg-input);color:var(--text-muted)">FINALIZADO</span>
          } @else if (isLive) {
            <div class="real-score live-score">{{ match.home_score }} - {{ match.away_score }}</div>
            <span class="badge" style="background:rgba(239,68,68,0.15);color:#ef4444">● EN VIVO</span>
          } @else if (pred) {
            <div class="expected-goals">
              <span class="xg">{{ pred.expected_home_goals.toFixed(2) }}</span>
              <span class="xg-label">xG</span>
              <span class="xg-sep">—</span>
              <span class="xg">{{ pred.expected_away_goals.toFixed(2) }}</span>
              <span class="xg-label">xG</span>
            </div>
            <div class="predicted-score-lg">⚽ {{ pred.predicted_score }}</div>
            <span class="badge" [class]="'risk-' + pred.risk_level">
              {{ pred.risk_level.toUpperCase() }} RISK
            </span>
          }
        </div>
        <div class="team-block right">
          <img [src]="match.away_team.logo" [alt]="match.away_team.name" class="team-logo-lg" referrerpolicy="no-referrer" onerror="this.style.display='none'" />
          <h2>{{ match.away_team.name }}</h2>
          <div class="form-chars">
            @for (ch of match.away_team.form?.split(''); track $index) {
              <span class="form-ch" [class]="ch">{{ ch }}</span>
            }
          </div>
        </div>
      </div>

      @if (isFinished) {
        <div class="section-title">Resultado final</div>
        <div style="padding:12px;background:var(--bg-input);border-radius:8px;text-align:center;font-size:13px;color:var(--text-secondary)">
          Partido finalizado. Las predicciones estaban basadas en datos previos al encuentro.
        </div>
      }

      @if (pred && !isFinished) {

        <!-- Resumen narrativo -->
        @if (pred.match_summary) {
          <div class="section-title">📝 Resumen del partido</div>
          <div class="match-summary">{{ pred.match_summary }}</div>
        }

        <!-- Apuesta recomendada -->
        @if (pred.smart_bet && pred.smart_bet.type) {
          <div class="section-title">🎯 Apuesta recomendada</div>
          <div class="smart-bet-card" [class.warning]="!!pred.smart_bet.warning">
            <div class="sb-header">
              <span class="sb-type">{{ pred.smart_bet.type }}</span>
              <span class="sb-prob">{{ (pred.smart_bet.combined_prob * 100).toFixed(0) }}% prob.</span>
              <span class="sb-odds">&#64;{{ pred.smart_bet.estimated_odds }}</span>
            </div>
            @if (pred.smart_bet.warning) {
              <div class="sb-warning">⚠️ {{ pred.smart_bet.warning }}</div>
            }
            <div class="sb-picks">
              @for (pick of pred.smart_bet.picks; track $index) {
                <div class="sb-pick">
                  <span class="sb-pick-market">{{ pick.market }}</span>
                  <span class="sb-pick-label">{{ pick.label }}</span>
                  <span class="sb-pick-prob">{{ (pick.prob * 100).toFixed(0) }}%</span>
                </div>
              }
            </div>
          </div>
        }

        <!-- 1X2 Probabilities -->
        <div class="section-title">Probabilidades 1X2</div>
        <div class="probs-big">
          <div class="prob-big home">
            <canvas #doughnutHome></canvas>
            <div class="prob-center">{{ (pred.prob_home_win * 100).toFixed(0) }}%</div>
            <span>Local</span>
          </div>
          <div class="prob-big draw">
            <canvas #doughnutDraw></canvas>
            <div class="prob-center" style="color:#f59e0b">{{ (pred.prob_draw * 100).toFixed(0) }}%</div>
            <span>Empate</span>
          </div>
          <div class="prob-big away">
            <canvas #doughnutAway></canvas>
            <div class="prob-center" style="color:#ef4444">{{ (pred.prob_away_win * 100).toFixed(0) }}%</div>
            <span>Visitante</span>
          </div>
        </div>
        @if (auth.isAdmin()) {
        <div class="parlay-multi-tip">
          <span class="multi-tip-label">💡 Resultado — Añadir al parlay:</span>
          <div class="multi-tip-options">
            <button class="multi-tip-btn"
              [class.added]="parlay.hasPick(match!.id, '1x2_home')"
              (click)="addOneX2ToParlay('home')">
              @if (parlay.hasPick(match!.id, '1x2_home')) { ✓ }
              {{ match!.home_team.name }} <span class="mtp-prob">{{ (pred.prob_home_win * 100).toFixed(0) }}%</span>
            </button>
            <button class="multi-tip-btn"
              [class.added]="parlay.hasPick(match!.id, '1x2_draw')"
              (click)="addOneX2ToParlay('draw')">
              @if (parlay.hasPick(match!.id, '1x2_draw')) { ✓ }
              Empate <span class="mtp-prob">{{ (pred.prob_draw * 100).toFixed(0) }}%</span>
            </button>
            <button class="multi-tip-btn"
              [class.added]="parlay.hasPick(match!.id, '1x2_away')"
              (click)="addOneX2ToParlay('away')">
              @if (parlay.hasPick(match!.id, '1x2_away')) { ✓ }
              {{ match!.away_team.name }} <span class="mtp-prob">{{ (pred.prob_away_win * 100).toFixed(0) }}%</span>
            </button>
          </div>
          <!-- Doble oportunidad -->
          <div class="multi-tip-options" style="margin-top:6px">
            <button class="multi-tip-btn dc-btn"
              [class.added]="parlay.hasPick(match!.id, 'dc_1x')"
              (click)="addDoubleChance('1x')">
              @if (parlay.hasPick(match!.id, 'dc_1x')) { ✓ }
              {{ match!.home_team.name }} o Empate
              <span class="mtp-prob">{{ ((pred.prob_home_win + pred.prob_draw) * 100).toFixed(0) }}%</span>
            </button>
            <button class="multi-tip-btn dc-btn"
              [class.added]="parlay.hasPick(match!.id, 'dc_x2')"
              (click)="addDoubleChance('x2')">
              @if (parlay.hasPick(match!.id, 'dc_x2')) { ✓ }
              {{ match!.away_team.name }} o Empate
              <span class="mtp-prob">{{ ((pred.prob_away_win + pred.prob_draw) * 100).toFixed(0) }}%</span>
            </button>
          </div>
        </div>
        }

        <!-- Markets grid — Goles -->
        <div class="section-title">⚽ Mercados de goles</div>
        <div class="markets-grid">
          <div class="market-card">
            <span class="market-name">Over 2.5</span>
            <div class="market-bar">
              <div [style.width.%]="pred.prob_over_25 * 100" style="background:var(--accent)"></div>
            </div>
            <span class="market-pct">{{ (pred.prob_over_25 * 100).toFixed(0) }}%</span>
          </div>
          <div class="market-card">
            <span class="market-name">Under 2.5</span>
            <div class="market-bar">
              <div [style.width.%]="pred.prob_under_25 * 100" style="background:#f59e0b"></div>
            </div>
            <span class="market-pct">{{ (pred.prob_under_25 * 100).toFixed(0) }}%</span>
          </div>
          <div class="market-card">
            <span class="market-name">Over 3.5</span>
            <div class="market-bar">
              <div [style.width.%]="pred.prob_over_35 * 100" style="background:#818cf8"></div>
            </div>
            <span class="market-pct">{{ (pred.prob_over_35 * 100).toFixed(0) }}%</span>
          </div>
          <div class="market-card">
            <span class="market-name">BTTS Sí</span>
            <div class="market-bar">
              <div [style.width.%]="pred.prob_btts * 100" style="background:#ec4899"></div>
            </div>
            <span class="market-pct">{{ (pred.prob_btts * 100).toFixed(0) }}%</span>
          </div>
        </div>
        @if (goalSuggestions.length > 0 && auth.isAdmin()) {
          <div class="parlay-multi-tip">
            <span class="multi-tip-label">💡 <strong>{{ goalExpected.toFixed(2) }}</strong> goles esperados — Añadir al parlay:</span>
            <div class="multi-tip-options">
              @for (s of goalSuggestions; track s.line) {
                <button
                  class="multi-tip-btn"
                  [class.added]="parlay.hasPick(match!.id, 'goals_' + s.line)"
                  (click)="addLineToParlay('goals', s)"
                >
                  @if (parlay.hasPick(match!.id, 'goals_' + s.line)) { ✓ }
                  Over {{ s.line }} <span class="mtp-prob">{{ (s.prob * 100).toFixed(0) }}%</span>
                </button>
              }
            </div>
          </div>
        }

        <!-- Corners -->
        <div class="section-title">🚩 Corners</div>
        <div class="corner-card-grid">
          <div class="expected-block">
            <div class="exp-row">
              <img [src]="match.home_team.logo" class="exp-logo" referrerpolicy="no-referrer" onerror="this.style.display='none'" />
              <span class="exp-label">{{ match.home_team.name }}</span>
              <span class="exp-val" style="color:var(--accent)">{{ corners(pred.expected_home_corners) }}</span>
            </div>
            <div class="exp-row">
              <img [src]="match.away_team.logo" class="exp-logo" referrerpolicy="no-referrer" onerror="this.style.display='none'" />
              <span class="exp-label">{{ match.away_team.name }}</span>
              <span class="exp-val" style="color:#ef4444">{{ corners(pred.expected_away_corners) }}</span>
            </div>
            <div class="exp-total">Total esperado: <strong>{{ corners((pred.expected_home_corners ?? 0) + (pred.expected_away_corners ?? 0)) }}</strong></div>
          </div>
          <div class="ou-block">
            <div class="ou-row">
              <span class="ou-label">Over 9.5</span>
              <div class="ou-bar-wrap">
                <div class="ou-bar" [style.width.%]="pct(pred.prob_over_95_corners)" style="background:var(--accent)"></div>
              </div>
              <span class="ou-pct">{{ pct(pred.prob_over_95_corners).toFixed(0) }}%</span>
            </div>
            <div class="ou-row">
              <span class="ou-label">Under 9.5</span>
              <div class="ou-bar-wrap">
                <div class="ou-bar" [style.width.%]="pct(pred.prob_under_95_corners)" style="background:#f59e0b"></div>
              </div>
              <span class="ou-pct">{{ pct(pred.prob_under_95_corners).toFixed(0) }}%</span>
            </div>
          </div>
        </div>
        @if (cornerSuggestions.length > 0 && auth.isAdmin()) {
          <div class="parlay-multi-tip">
            <span class="multi-tip-label">💡 <strong>{{ cornerExpected.toFixed(1) }}</strong> córneres esperados — Añadir al parlay:</span>
            <div class="multi-tip-options">
              @for (s of cornerSuggestions; track s.line) {
                <button
                  class="multi-tip-btn"
                  [class.added]="parlay.hasPick(match!.id, 'corners_' + s.line)"
                  (click)="addLineToParlay('corners', s)"
                >
                  @if (parlay.hasPick(match!.id, 'corners_' + s.line)) { ✓ }
                  Over {{ s.line }} <span class="mtp-prob">{{ (s.prob * 100).toFixed(0) }}%</span>
                </button>
              }
            </div>
          </div>
        }

        <!-- Tarjetas -->
        <div class="section-title">🟨 Tarjetas</div>
        <div class="corner-card-grid">
          <div class="expected-block">
            <div class="exp-row">
              <img [src]="match.home_team.logo" class="exp-logo" referrerpolicy="no-referrer" onerror="this.style.display='none'" />
              <span class="exp-label">{{ match.home_team.name }}</span>
              <span class="exp-val" style="color:var(--accent)">{{ corners(pred.expected_home_cards) }}</span>
            </div>
            <div class="exp-row">
              <img [src]="match.away_team.logo" class="exp-logo" referrerpolicy="no-referrer" onerror="this.style.display='none'" />
              <span class="exp-label">{{ match.away_team.name }}</span>
              <span class="exp-val" style="color:#ef4444">{{ corners(pred.expected_away_cards) }}</span>
            </div>
            <div class="exp-total">Total esperado: <strong>{{ corners((pred.expected_home_cards ?? 0) + (pred.expected_away_cards ?? 0)) }}</strong></div>
          </div>
          <div class="ou-block">
            <div class="ou-row">
              <span class="ou-label">Over 3.5</span>
              <div class="ou-bar-wrap">
                <div class="ou-bar" [style.width.%]="pct(pred.prob_over_35_cards)" style="background:#f59e0b"></div>
              </div>
              <span class="ou-pct">{{ pct(pred.prob_over_35_cards).toFixed(0) }}%</span>
            </div>
            <div class="ou-row">
              <span class="ou-label">Under 3.5</span>
              <div class="ou-bar-wrap">
                <div class="ou-bar" [style.width.%]="pct(pred.prob_under_35_cards)" style="background:#818cf8"></div>
              </div>
              <span class="ou-pct">{{ pct(pred.prob_under_35_cards).toFixed(0) }}%</span>
            </div>
          </div>
        </div>
        @if (cardSuggestions.length > 0 && auth.isAdmin()) {
          <div class="parlay-multi-tip">
            <span class="multi-tip-label">💡 <strong>{{ cardExpected.toFixed(1) }}</strong> tarjetas esperadas — Añadir al parlay:</span>
            <div class="multi-tip-options">
              @for (s of cardSuggestions; track s.line) {
                <button
                  class="multi-tip-btn"
                  [class.added]="parlay.hasPick(match!.id, 'cards_' + s.line)"
                  (click)="addLineToParlay('cards', s)"
                >
                  @if (parlay.hasPick(match!.id, 'cards_' + s.line)) { ✓ }
                  Over {{ s.line }} <span class="mtp-prob">{{ (s.prob * 100).toFixed(0) }}%</span>
                </button>
              }
            </div>
          </div>
        }

        <!-- Score distribution -->
        <div class="section-title">Distribución de resultados más probables</div>
        <div class="score-dist">
          @for (entry of topScores(); track entry.score) {
            <div class="score-chip" [style.opacity]="0.4 + entry.prob * 6">
              <span class="score-val">{{ entry.score }}</span>
              <span class="score-prob">{{ (entry.prob * 100).toFixed(1) }}%</span>
            </div>
          }
        </div>

        <!-- Value bets -->
        @if (pred.value_bets.length > 0) {
          <div class="section-title">💡 Value Bets detectados</div>
          <div class="value-bets">
            @for (vb of pred.value_bets; track vb.market) {
              <div class="vb-card">
                <div class="vb-header">
                  <span class="vb-market">{{ marketLabel(vb.market) }} — {{ vb.pick }}</span>
                  <span class="vb-edge accent">+{{ vb.edge }}% edge</span>
                </div>
                <div class="vb-stats">
                  <div class="vb-stat">
                    <span class="vb-key">Cuota justa</span>
                    <span class="vb-val">{{ vb.fair_odds }}</span>
                  </div>
                  <div class="vb-stat">
                    <span class="vb-key">Nuestra prob.</span>
                    <span class="vb-val accent">{{ (vb.our_prob * 100).toFixed(1) }}%</span>
                  </div>
                  <div class="vb-stat">
                    <span class="vb-key">Edge</span>
                    <span class="vb-val accent">+{{ vb.edge }}%</span>
                  </div>
                </div>
                @if (auth.isLoggedIn()) {
                  <button class="save-bet-btn" (click)="saveBet(vb)">
                    💾 Guardar apuesta
                  </button>
                }
              </div>
            }
          </div>
        }

        <!-- Analysis notes -->
        @if (pred.analysis_notes && pred.analysis_notes.length > 0) {
          <div class="section-title">📊 Análisis del modelo</div>
          <div class="notes">
            @for (note of pred.analysis_notes; track $index) {
              <div class="note">▸ {{ note }}</div>
            }
          </div>
        }

        <!-- Confidence -->
        <div class="confidence-block">
          <span class="conf-label">Confianza del modelo</span>
          <div class="conf-bar">
            <div class="conf-fill" [style.width.%]="pred.confidence_score * 100"></div>
          </div>
          <span class="conf-pct">{{ (pred.confidence_score * 100).toFixed(0) }}%</span>
        </div>
      }

      <!-- H2H -->
      @if (match.h2h) {
        <div class="section-title">⚔️ Historial directo (H2H)</div>
        <div class="h2h-block">
          <div class="h2h-stat">
            <span class="h2h-num home">{{ match.h2h.home_wins }}</span>
            <span class="h2h-label">Victorias local</span>
          </div>
          <div class="h2h-stat">
            <span class="h2h-num draw">{{ match.h2h.draws }}</span>
            <span class="h2h-label">Empates</span>
          </div>
          <div class="h2h-stat">
            <span class="h2h-num away">{{ match.h2h.away_wins }}</span>
            <span class="h2h-label">Victorias visitante</span>
          </div>
        </div>
        <div class="h2h-meetings">
          @for (m of match.h2h.last_meetings; track m.date) {
            <div class="h2h-row">
              <span class="h2h-date">{{ m.date }}</span>
              <span class="h2h-score">{{ m.score }}</span>
            </div>
          }
        </div>
      }

      <!-- Disclaimer -->
      <div class="disclaimer">
        ⚠️ Esta herramienta es solo de análisis estadístico. No garantiza ganancias.
        Las apuestas conllevan riesgo de pérdida. Juega responsablemente.
      </div>
    </div>
    } @else {
    <div class="no-selection">
      <div>⚽</div>
      <p>Selecciona un partido para ver el análisis completo</p>
    </div>
    }
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }
    .detail-panel {
      padding: 20px;
      flex: 1;
      overflow-y: auto;
      height: 80vh;
    }
    .detail-header {
      margin-bottom: 20px;
    }
    .detail-league {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--text-secondary);
      font-weight: 600;
      margin-bottom: 6px;
    }
    .detail-league img { width: 20px; height: 20px; object-fit: contain; }
    .detail-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      font-size: 12px;
      color: var(--text-muted);
    }
    .teams-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
      padding: 20px;
      background: var(--bg-input);
      border-radius: 12px;
      border: 1px solid var(--border);
    }
    .team-block {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      text-align: center;
    }
    .team-block.right { align-items: center; }
    .team-logo-lg { width: 56px; height: 56px; object-fit: contain; }
    .team-block h2 { font-size: 15px; font-weight: 800; margin: 0; }
    .form-chars { display: flex; gap: 4px; }
    .form-ch {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 800;
    }
    .form-ch.W { background: rgba(0,255,135,0.2); color: var(--accent); }
    .form-ch.D { background: rgba(245,158,11,0.2); color: #f59e0b; }
    .form-ch.L { background: rgba(239,68,68,0.2); color: #ef4444; }
    .score-center { text-align: center; min-width: 140px; }
    .expected-goals { display: flex; align-items: center; gap: 6px; justify-content: center; margin-bottom: 6px; }
    .xg { font-size: 22px; font-weight: 800; color: var(--text-primary); }
    .xg-label { font-size: 10px; color: var(--text-muted); }
    .xg-sep { color: var(--text-muted); }
    .real-score { font-size: 36px; font-weight: 900; color: var(--text-primary); margin-bottom: 6px; }
    .live-score { color: #ef4444; }
    .predicted-score-lg { font-size: 14px; color: var(--accent); font-weight: 700; margin-bottom: 8px; }
    .badge { font-size: 10px; padding: 3px 10px; border-radius: 20px; font-weight: 800; }
    .risk-low { background: rgba(0,255,135,0.15); color: var(--accent); }
    .risk-medium { background: rgba(245,158,11,0.15); color: #f59e0b; }
    .risk-high { background: rgba(239,68,68,0.15); color: #ef4444; }
    .section-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 20px 0 12px;
    }
    .probs-big {
      display: flex;
      gap: 16px;
      justify-content: center;
      margin-bottom: 4px;
    }
    .prob-big {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      position: relative;
    }
    .prob-big canvas { width: 80px !important; height: 80px !important; }
    .prob-center {
      position: absolute;
      top: 26px;
      font-size: 16px;
      font-weight: 800;
      color: var(--accent);
    }
    .prob-big span { font-size: 12px; color: var(--text-secondary); font-weight: 600; }
    .markets-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .market-card {
      background: var(--bg-input);
      border-radius: 8px;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .market-name { font-size: 12px; font-weight: 700; color: var(--text-secondary); min-width: 64px; }
    .market-bar {
      flex: 1;
      height: 6px;
      background: var(--border);
      border-radius: 3px;
      overflow: hidden;
    }
    .market-bar div { height: 100%; border-radius: 3px; transition: width 0.5s; }
    .market-pct { font-size: 13px; font-weight: 700; color: var(--text-primary); min-width: 36px; text-align: right; }
    .score-dist {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    /* Corners & Tarjetas */
    .corner-card-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 4px;
    }
    .expected-block {
      background: var(--bg-input);
      border-radius: 10px;
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .exp-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .exp-logo { width: 18px; height: 18px; object-fit: contain; }
    .exp-label { flex: 1; font-size: 12px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .exp-val { font-size: 20px; font-weight: 800; min-width: 32px; text-align: right; }
    .exp-total { font-size: 11px; color: var(--text-muted); border-top: 1px solid var(--border); padding-top: 6px; margin-top: 2px; }
    .exp-total strong { color: var(--text-primary); }
    .ou-block {
      background: var(--bg-input);
      border-radius: 10px;
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 12px;
    }
    .ou-row { display: flex; align-items: center; gap: 8px; }
    .ou-label { font-size: 11px; color: var(--text-secondary); min-width: 110px; font-weight: 600; }
    .ou-bar-wrap { flex: 1; height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
    .ou-bar { height: 100%; border-radius: 3px; transition: width 0.5s; }
    .ou-pct { font-size: 13px; font-weight: 700; color: var(--text-primary); min-width: 34px; text-align: right; }
    .score-chip {
      background: var(--bg-input);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 8px 12px;
      text-align: center;
      min-width: 60px;
    }
    .score-val { display: block; font-size: 16px; font-weight: 800; color: var(--text-primary); }
    .score-prob { display: block; font-size: 11px; color: var(--text-muted); }
    .value-bets { display: flex; flex-direction: column; gap: 10px; }
    .vb-card {
      background: var(--bg-input);
      border: 1px solid var(--accent);
      border-radius: 10px;
      padding: 14px;
    }
    .vb-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .vb-market { font-size: 14px; font-weight: 700; color: var(--text-primary); }
    .vb-edge { font-size: 12px; font-weight: 800; }
    .vb-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .vb-stat { text-align: center; }
    .vb-key { display: block; font-size: 10px; color: var(--text-muted); margin-bottom: 2px; }
    .vb-val { font-size: 14px; font-weight: 700; color: var(--text-primary); }
    .vb-val.muted { color: var(--text-muted); }
    .vb-val.accent { color: var(--accent); }
    .save-bet-btn {
      width: 100%;
      margin-top: 10px;
      background: rgba(0,255,135,0.1);
      border: 1px solid var(--accent);
      border-radius: 8px;
      color: var(--accent);
      padding: 8px;
      cursor: pointer;
      font-weight: 700;
      font-size: 13px;
      transition: background 0.2s;
    }
    .save-bet-btn:hover { background: rgba(0,255,135,0.2); }
    .notes { display: flex; flex-direction: column; gap: 6px; }
    .note { font-size: 13px; color: var(--text-secondary); padding: 6px 0; border-bottom: 1px solid var(--border); }
    .confidence-block {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 16px;
      padding: 14px;
      background: var(--bg-input);
      border-radius: 8px;
    }
    .conf-label { font-size: 12px; color: var(--text-muted); min-width: 120px; }
    .conf-bar {
      flex: 1;
      height: 8px;
      background: var(--border);
      border-radius: 4px;
      overflow: hidden;
    }
    .conf-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--accent), #00c97a);
      border-radius: 4px;
      transition: width 0.8s ease;
    }
    .conf-pct { font-size: 16px; font-weight: 800; color: var(--accent); min-width: 44px; }
    .h2h-block { display: flex; gap: 16px; margin-bottom: 12px; }
    .h2h-stat { flex: 1; text-align: center; padding: 12px; background: var(--bg-input); border-radius: 8px; }
    .h2h-num { display: block; font-size: 28px; font-weight: 800; }
    .h2h-num.home { color: var(--accent); }
    .h2h-num.draw { color: #f59e0b; }
    .h2h-num.away { color: #ef4444; }
    .h2h-label { font-size: 11px; color: var(--text-muted); }
    .h2h-meetings { display: flex; flex-direction: column; gap: 4px; }
    .h2h-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 10px;
      background: var(--bg-input);
      border-radius: 6px;
      font-size: 13px;
    }
    .h2h-date { color: var(--text-muted); }
    .h2h-score { font-weight: 700; color: var(--text-primary); }
    /* Resumen narrativo */
    .match-summary {
      background: var(--bg-input);
      border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0;
      padding: 14px 16px;
      font-size: 13px;
      line-height: 1.7;
      color: var(--text-secondary);
      margin-bottom: 4px;
    }

    /* Apuesta recomendada */
    .smart-bet-card {
      background: linear-gradient(135deg, rgba(16,185,129,0.08), rgba(59,130,246,0.08));
      border: 1px solid rgba(16,185,129,0.35);
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 4px;
    }
    .smart-bet-card.warning {
      background: rgba(245,158,11,0.08);
      border-color: rgba(245,158,11,0.35);
    }
    .sb-header {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 16px;
      background: rgba(16,185,129,0.1);
      border-bottom: 1px solid rgba(16,185,129,0.2);
    }
    .smart-bet-card.warning .sb-header {
      background: rgba(245,158,11,0.1);
      border-color: rgba(245,158,11,0.2);
    }
    .sb-type {
      font-size: 13px; font-weight: 800;
      text-transform: uppercase; letter-spacing: 0.06em;
      color: #10b981;
    }
    .smart-bet-card.warning .sb-type { color: #f59e0b; }
    .sb-prob {
      margin-left: auto;
      font-size: 18px; font-weight: 800; color: var(--text-primary);
    }
    .sb-odds {
      font-size: 18px; font-weight: 800;
      color: #10b981; background: rgba(16,185,129,0.15);
      padding: 2px 10px; border-radius: 6px;
    }
    .smart-bet-card.warning .sb-odds { color: #f59e0b; background: rgba(245,158,11,0.15); }
    .sb-warning {
      padding: 8px 16px;
      font-size: 12px; color: #f59e0b;
      background: rgba(245,158,11,0.08);
    }
    .sb-picks { padding: 10px 16px; display: flex; flex-direction: column; gap: 6px; }
    .sb-pick {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 12px;
      background: var(--bg-input); border-radius: 8px;
    }
    .sb-pick-market {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.06em; color: var(--text-muted);
      background: var(--bg-card); padding: 2px 6px; border-radius: 4px;
      white-space: nowrap;
    }
    .sb-pick-label { flex: 1; font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .sb-pick-prob {
      font-size: 13px; font-weight: 700; color: #10b981;
    }

    .parlay-multi-tip {
      margin: 8px 0 4px;
      padding: 10px 12px;
      background: rgba(0,255,135,0.04);
      border: 1px solid rgba(0,255,135,0.15);
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .multi-tip-label {
      font-size: 12px;
      color: var(--text-secondary);
    }
    .multi-tip-label strong { color: var(--text-primary); }
    .multi-tip-options {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .multi-tip-btn {
      background: rgba(0,255,135,0.08);
      border: 1px solid rgba(0,255,135,0.25);
      border-radius: 20px;
      padding: 4px 12px;
      font-size: 12px;
      font-weight: 600;
      color: var(--accent);
      cursor: pointer;
      transition: all 0.15s;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .multi-tip-btn:hover { background: rgba(0,255,135,0.18); }
    .multi-tip-btn.added {
      background: rgba(0,255,135,0.22);
      border-color: var(--accent);
    }
    .dc-btn {
      border-color: rgba(129,140,248,0.35);
      color: #a5b4fc;
    }
    .dc-btn:hover { background: rgba(129,140,248,0.12); border-color: #818cf8; }
    .dc-btn.added { background: rgba(129,140,248,0.18); border-color: #818cf8; }
    .mtp-prob {
      font-size: 11px;
      opacity: 0.8;
    }

    .parlay-tip {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin: 8px 0 4px;
      padding: 9px 12px;
      background: rgba(0,255,135,0.04);
      border: 1px solid rgba(0,255,135,0.15);
      border-radius: 8px;
      flex-wrap: wrap;
    }
    .parlay-tip.added {
      background: rgba(0,255,135,0.1);
      border-color: rgba(0,255,135,0.35);
    }
    .tip-text {
      font-size: 12px;
      color: var(--text-secondary);
      flex: 1;
      min-width: 0;
    }
    .tip-text strong { color: var(--text-primary); }
    .tip-btn {
      background: rgba(0,255,135,0.12);
      border: 1px solid rgba(0,255,135,0.3);
      border-radius: 6px;
      padding: 5px 10px;
      font-size: 12px;
      font-weight: 700;
      color: var(--accent);
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s;
      flex-shrink: 0;
    }
    .tip-btn:hover { background: rgba(0,255,135,0.22); }
    .parlay-tip.added .tip-btn { background: rgba(0,255,135,0.22); }

    .disclaimer {
      margin-top: 20px;
      padding: 12px;
      background: rgba(245,158,11,0.08);
      border: 1px solid rgba(245,158,11,0.3);
      border-radius: 8px;
      font-size: 11px;
      color: #f59e0b;
      text-align: center;
    }
    .no-selection {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 60vh;
      gap: 12px;
      font-size: 48px;
      color: var(--text-muted);
    }
    .no-selection p { font-size: 14px; }
  `]
})
export class MatchDetailComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() match?: Match | null;
  @ViewChild('doughnutHome') homeCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('doughnutDraw') drawCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('doughnutAway') awayCanvas!: ElementRef<HTMLCanvasElement>;

  private charts: Chart[] = [];
  private redrawTimer: any;

  constructor(private api: ApiService, public auth: AuthService, public parlay: ParlayService) { }

  get pred() { return this.match?.prediction; }
  get isFinished() { return FINISHED_STATUSES.includes(this.match?.status ?? ''); }
  get isLive() { return LIVE_STATUSES.includes(this.match?.status ?? ''); }

  ngAfterViewInit(): void {
    if (this.pred) this.drawCharts();
  }

  ngOnChanges(): void {
    this.destroyCharts();
    clearTimeout(this.redrawTimer);
    this.redrawTimer = setTimeout(() => { if (this.pred) this.drawCharts(); }, 50);
  }

  ngOnDestroy(): void {
    this.destroyCharts();
    clearTimeout(this.redrawTimer);
  }

  private destroyCharts(): void {
    this.charts.forEach(c => c.destroy());
    this.charts = [];
  }

  private destroyCanvasChart(canvas: HTMLCanvasElement): void {
    const existing = Chart.getChart(canvas);
    if (existing) existing.destroy();
  }

  private drawCharts(): void {
    if (!this.homeCanvas || !this.pred) return;
    const make = (canvas: HTMLCanvasElement, val: number, color: string) => {
      this.destroyCanvasChart(canvas);
      return new Chart(canvas, {
        type: 'doughnut',
        data: {
          datasets: [{
            data: [val * 100, 100 - val * 100],
            backgroundColor: [color, 'rgba(255,255,255,0.05)'],
            borderWidth: 0,
            circumference: 360,
          }]
        },
        options: { cutout: '75%', plugins: { legend: { display: false }, tooltip: { enabled: false } } }
      });
    };
    this.charts.push(
      make(this.homeCanvas.nativeElement, this.pred.prob_home_win, '#00ff87'),
      make(this.drawCanvas.nativeElement, this.pred.prob_draw, '#f59e0b'),
      make(this.awayCanvas.nativeElement, this.pred.prob_away_win, '#ef4444'),
    );
  }

  /** Convierte null/undefined/0 a "0.0" de forma segura */
  corners(v: number | null | undefined): string {
    return ((v ?? 0)).toFixed(1);
  }

  /** Convierte probabilidad (0-1) a porcentaje, con null safety */
  pct(v: number | null | undefined): number {
    return (v ?? 0) * 100;
  }

  topScores(): Array<{ score: string; prob: number }> {
    if (!this.pred) return [];
    return (this.pred.score_distribution || [])
      .slice()
      .sort((a, b) => b.prob - a.prob)
      .slice(0, 8)
      .map(e => ({ score: `${e.home}-${e.away}`, prob: e.prob }));
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('es-ES', {
      weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  }

  marketLabel(market: string): string {
    const labels: Record<string, string> = {
      '1X2': '🏆 1X2',
      'O/U': '📊 Over/Under',
      'BTTS': '⚽ BTTS',
    };
    return labels[market] || market;
  }

  // ── Parlay suggestions ──────────────────────────────────────────────────

  // ── Cálculo Poisson calibrado para múltiples líneas ────────────────────

  private normCDF(z: number): number {
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp(-0.5 * z * z);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.7814779 + t * (-1.8212559 + t * 1.3302745))));
    return z >= 0 ? 1 - p : p;
  }

  private poissonOver(lambda: number, line: number): number {
    if (lambda <= 0) return 0;
    const k = Math.floor(line);
    const z = (k + 0.5 - lambda) / Math.sqrt(lambda);
    return this.normCDF(-z);
  }

  private calibratedLines(
    lambda: number, modelProb95: number, lines: number[]
  ): Array<{ line: number; pick: string; prob: number }> {
    const p95 = this.poissonOver(lambda, 9.5);
    const cal = (p95 > 0.02 && modelProb95 > 0)
      ? Math.min(3, Math.max(0.15, modelProb95 / p95))
      : 1;
    return lines.map(line => ({
      line,
      pick: `Over ${line}`,
      prob: Math.max(0.04, Math.min(0.97, this.poissonOver(lambda, line) * cal)),
    }));
  }

  get cornerExpected(): number {
    return (this.pred?.expected_home_corners ?? 0) + (this.pred?.expected_away_corners ?? 0);
  }

  get cardExpected(): number {
    return (this.pred?.expected_home_cards ?? 0) + (this.pred?.expected_away_cards ?? 0);
  }

  get goalExpected(): number {
    return (this.pred?.expected_home_goals ?? 0) + (this.pred?.expected_away_goals ?? 0);
  }

  private calibratedLinesAnchored(
    lambda: number, anchorLine: number, anchorProb: number, lines: number[]
  ): Array<{ line: number; pick: string; prob: number }> {
    const pAnchor = this.poissonOver(lambda, anchorLine);
    const cal = (pAnchor > 0.02 && anchorProb > 0)
      ? Math.min(3, Math.max(0.15, anchorProb / pAnchor))
      : 1;
    return lines.map(line => ({
      line,
      pick: `Over ${line}`,
      prob: Math.max(0.04, Math.min(0.97, this.poissonOver(lambda, line) * cal)),
    }));
  }

  get goalSuggestions(): Array<{ line: number; pick: string; prob: number }> {
    const total = this.goalExpected;
    if (total < 0.3) return [];
    return this.calibratedLinesAnchored(total, 2.5, this.pred?.prob_over_25 ?? 0.5, [0.5, 1.5, 2.5, 3.5, 4.5])
      .filter(s => s.prob >= 0.08 && s.prob <= 0.96);
  }

  get cornerSuggestions(): Array<{ line: number; pick: string; prob: number }> {
    const total = this.cornerExpected;
    if (total < 5) return [];
    const allLines = [6.5, 7.5, 8.5, 9.5, 10.5, 11.5, 12.5];
    const lines = allLines.filter(l => l >= total - 4.5 && l <= total + 1.5);
    return this.calibratedLines(total, this.pred?.prob_over_95_corners ?? 0.5, lines)
      .filter(s => s.prob >= 0.13 && s.prob <= 0.95);
  }

  get cardSuggestions(): Array<{ line: number; pick: string; prob: number }> {
    const total = this.cardExpected;
    if (total < 2) return [];
    const allLines = [1.5, 2.5, 3.5, 4.5, 5.5, 6.5];
    const lines = allLines.filter(l => l >= total - 3 && l <= total + 1.5);
    return this.calibratedLines(total, this.pred?.prob_over_35_cards ?? 0.5, lines)
      .filter(s => s.prob >= 0.13 && s.prob <= 0.95);
  }

  addLineToParlay(type: 'corners' | 'cards' | 'goals', s: { line: number; pick: string; prob: number }): void {
    if (!this.match || !this.pred) return;
    const marketKey = `${type}_${s.line}`;
    const market = type === 'corners' ? '🚩 Córneres' : type === 'cards' ? '🟨 Tarjetas' : '⚽ Goles';
    const expected = type === 'corners' ? this.cornerExpected : type === 'cards' ? this.cardExpected : this.goalExpected;
    this.parlay.togglePick({
      matchId: this.match.id,
      matchLabel: `${this.match.home_team.name} vs ${this.match.away_team.name}`,
      league: this.match.league.name,
      marketKey,
      market,
      pick: s.pick,
      line: s.line,
      modelExpected: expected,
      probability: s.prob,
      estimatedOdds: ParlayService.oddsFromProb(s.prob),
    });
  }

  addOneX2ToParlay(outcome: 'home' | 'draw' | 'away'): void {
    if (!this.match || !this.pred) return;
    const home = this.match.home_team.name;
    const away = this.match.away_team.name;
    const marketKey = `1x2_${outcome}`;
    const pick  = outcome === 'home' ? `Local (${home})` : outcome === 'draw' ? 'Empate' : `Visitante (${away})`;
    const prob  = outcome === 'home' ? this.pred.prob_home_win : outcome === 'draw' ? this.pred.prob_draw : this.pred.prob_away_win;
    this.parlay.togglePick({
      matchId: this.match.id,
      matchLabel: `${home} vs ${away}`,
      league: this.match.league.name,
      marketKey,
      market: '🏆 1X2',
      pick,
      probability: prob,
      estimatedOdds: ParlayService.oddsFromProb(prob),
    });
  }

  addDoubleChance(type: '1x' | 'x2'): void {
    if (!this.match || !this.pred) return;
    const home = this.match.home_team.name;
    const away = this.match.away_team.name;
    const marketKey = `dc_${type}`;
    const pick = type === '1x' ? `${home} o Empate` : `${away} o Empate`;
    const prob = type === '1x'
      ? this.pred.prob_home_win + this.pred.prob_draw
      : this.pred.prob_away_win + this.pred.prob_draw;
    this.parlay.togglePick({
      matchId: this.match.id,
      matchLabel: `${home} vs ${away}`,
      league: this.match.league.name,
      marketKey,
      market: '🔀 Doble Oportunidad',
      pick,
      probability: Math.min(prob, 0.97),
      estimatedOdds: ParlayService.oddsFromProb(Math.min(prob, 0.97)),
    });
  }

  // ────────────────────────────────────────────────────────────────────────

  saveBet(vb: ValueBet): void {
    this.api.saveBet({
      match_id: this.match!.id,
      bet_type: vb.market,
      bet_pick: vb.pick,
      odds: vb.fair_odds,
      notes: `Edge: +${vb.edge}% | Prob: ${(vb.our_prob * 100).toFixed(1)}%`,
    }).subscribe(() => alert('Apuesta guardada correctamente ✅'));
  }
}
