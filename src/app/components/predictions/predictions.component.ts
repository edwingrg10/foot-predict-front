import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Match, LeagueGroup, FINISHED_STATUSES, LIVE_STATUSES } from '../../models/interfaces';

type DayTab = 'today' | 'tomorrow' | 'date';

@Component({
  selector: 'app-predictions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">

      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="title">Predicciones</h1>
          <p class="subtitle">Pronósticos pre-partido generados por el modelo</p>
        </div>
        <div class="header-stats">
          <div class="hstat">
            <span class="hstat-n">{{ totalWithPred() }}</span>
            <span class="hstat-l">Con predicción</span>
          </div>
          <div class="hstat accent">
            <span class="hstat-n">{{ highConfCount() }}</span>
            <span class="hstat-l">Alta confianza</span>
          </div>
          <div class="hstat gold">
            <span class="hstat-n">{{ smartBetCount() }}</span>
            <span class="hstat-l">Smart bets</span>
          </div>
        </div>
      </div>

      <!-- Day tabs -->
      <div class="day-tabs">
        <button class="day-tab" [class.active]="dayTab() === 'today'" (click)="switchDay('today')">
          Hoy
        </button>
        <button class="day-tab" [class.active]="dayTab() === 'tomorrow'" (click)="switchDay('tomorrow')">
          Mañana
        </button>
        <button class="day-tab" [class.active]="dayTab() === 'date'" (click)="switchDay('date')">
          Fecha
        </button>
        @if (dayTab() === 'date') {
          <input type="date" class="date-picker" [(ngModel)]="customDate" (change)="loadByDate()" />
        }
      </div>

      <!-- Filters -->
      <div class="filter-bar">
        <label class="filter-label">Confianza:</label>
        <button class="filter-chip" [class.active]="confFilter() === ''" (click)="confFilter.set('')">Todas</button>
        <button class="filter-chip good" [class.active]="confFilter() === 'low'" (click)="confFilter.set('low')">
          Baja
        </button>
        <button class="filter-chip warn" [class.active]="confFilter() === 'medium'" (click)="confFilter.set('medium')">
          Media
        </button>
        <button class="filter-chip best" [class.active]="confFilter() === 'high'" (click)="confFilter.set('high')">
          Alta ≥70%
        </button>

        <span class="sep"></span>
        <label class="filter-label">Smart Bet:</label>
        <button class="filter-chip gold" [class.active]="onlySmartBet()" (click)="toggleSmartBet()">
          Solo con Smart Bet
        </button>
      </div>

      <!-- Content -->
      @if (loading()) {
        <div class="center-msg">
          <div class="spinner"></div>
          <p>Cargando predicciones...</p>
        </div>
      } @else if (filteredGroups().length === 0) {
        <div class="empty-state">
          <span class="empty-icon">🔮</span>
          <p>No hay predicciones disponibles para los filtros seleccionados.</p>
        </div>
      } @else {
        @for (group of filteredGroups(); track group.league_id) {
          <div class="league-section">
            <div class="league-header">
              <img [src]="group.league_logo" [alt]="group.league_name"
                class="league-logo" onerror="this.style.display='none'" />
              <span class="league-name">{{ group.league_name }}</span>
              <span class="league-country">{{ group.league_country }}</span>
              <span class="league-count">{{ group.matches.length }} partido{{ group.matches.length !== 1 ? 's' : '' }}</span>
            </div>

            <div class="cards-grid">
              @for (match of group.matches; track match.id) {
                @if (match.prediction) {
                  <div class="pred-card" [class.finished]="isFinished(match)" [class.live]="isLive(match)">

                    <!-- Card header: teams -->
                    <div class="card-teams">
                      <div class="team-block home">
                        <img [src]="match.home_team.logo" class="team-logo"
                          onerror="this.style.display='none'" />
                        <span class="team-name">{{ match.home_team.name }}</span>
                      </div>

                      <div class="score-block">
                        @if (isFinished(match) || isLive(match)) {
                          <div class="real-score">{{ match.home_score }} - {{ match.away_score }}</div>
                          <div class="score-label">{{ isLive(match) ? '🔴 En vivo' : 'FT' }}</div>
                        } @else {
                          <div class="pred-score">{{ match.prediction.predicted_score }}</div>
                          <div class="score-label">Marcador prob.</div>
                        }
                        <div class="match-time">{{ formatTime(match.match_date) }}</div>
                      </div>

                      <div class="team-block away">
                        <img [src]="match.away_team.logo" class="team-logo"
                          onerror="this.style.display='none'" />
                        <span class="team-name">{{ match.away_team.name }}</span>
                      </div>
                    </div>

                    <!-- Confidence + Risk badge -->
                    <div class="badges-row">
                      <span class="badge" [class]="'risk-' + match.prediction.risk_level">
                        {{ riskLabel(match.prediction.risk_level) }}
                      </span>
                      <span class="badge confidence">
                        {{ (match.prediction.confidence_score * 100).toFixed(0) }}% confianza
                      </span>
                      @if (isFinished(match) && match.prediction.outcome_correct !== null && match.prediction.outcome_correct !== undefined) {
                        <span class="badge" [class.correct]="match.prediction.outcome_correct" [class.wrong]="!match.prediction.outcome_correct">
                          {{ match.prediction.outcome_correct ? '✓ Acertó 1X2' : '✗ Falló 1X2' }}
                        </span>
                      }
                    </div>

                    <!-- 1X2 bars -->
                    <div class="section-label">Resultado 1X2</div>
                    <div class="prob-bars">
                      <div class="prob-bar-item">
                        <div class="bar-label">Local</div>
                        <div class="bar-track">
                          <div class="bar-fill home-fill"
                            [style.width.%]="match.prediction.prob_home_win * 100"></div>
                        </div>
                        <div class="bar-pct">{{ (match.prediction.prob_home_win * 100).toFixed(0) }}%</div>
                      </div>
                      <div class="prob-bar-item">
                        <div class="bar-label">Empate</div>
                        <div class="bar-track">
                          <div class="bar-fill draw-fill"
                            [style.width.%]="match.prediction.prob_draw * 100"></div>
                        </div>
                        <div class="bar-pct">{{ (match.prediction.prob_draw * 100).toFixed(0) }}%</div>
                      </div>
                      <div class="prob-bar-item">
                        <div class="bar-label">Visitante</div>
                        <div class="bar-track">
                          <div class="bar-fill away-fill"
                            [style.width.%]="match.prediction.prob_away_win * 100"></div>
                        </div>
                        <div class="bar-pct">{{ (match.prediction.prob_away_win * 100).toFixed(0) }}%</div>
                      </div>
                    </div>

                    <!-- Markets grid -->
                    <div class="section-label">Mercados</div>
                    <div class="markets-grid">
                      <div class="market-pill" [class.highlighted]="match.prediction.prob_over_25 >= 0.65">
                        <span class="mkt-label">Over 2.5</span>
                        <span class="mkt-val">{{ (match.prediction.prob_over_25 * 100).toFixed(0) }}%</span>
                      </div>
                      <div class="market-pill" [class.highlighted]="match.prediction.prob_btts >= 0.65">
                        <span class="mkt-label">BTTS</span>
                        <span class="mkt-val">{{ (match.prediction.prob_btts * 100).toFixed(0) }}%</span>
                      </div>
                      <div class="market-pill" [class.highlighted]="(match.prediction.prob_over_95_corners ?? 0) >= 0.65">
                        <span class="mkt-label">Corn. +9.5</span>
                        <span class="mkt-val">{{ ((match.prediction.prob_over_95_corners ?? 0) * 100).toFixed(0) }}%</span>
                      </div>
                      <div class="market-pill" [class.highlighted]="(match.prediction.prob_over_35_cards ?? 0) >= 0.65">
                        <span class="mkt-label">Tarj. +3.5</span>
                        <span class="mkt-val">{{ ((match.prediction.prob_over_35_cards ?? 0) * 100).toFixed(0) }}%</span>
                      </div>
                      <div class="market-pill" [class.highlighted]="match.prediction.prob_over_35 >= 0.50">
                        <span class="mkt-label">Over 3.5</span>
                        <span class="mkt-val">{{ (match.prediction.prob_over_35 * 100).toFixed(0) }}%</span>
                      </div>
                      <div class="market-pill xg">
                        <span class="mkt-label">xG</span>
                        <span class="mkt-val">{{ match.prediction.expected_home_goals.toFixed(1) }} - {{ match.prediction.expected_away_goals.toFixed(1) }}</span>
                      </div>
                    </div>

                    <!-- Smart Bet -->
                    @if (match.prediction.smart_bet && match.prediction.smart_bet.type) {
                      <div class="smart-bet" [class.evaluated]="isFinished(match) && match.prediction.smart_bet_correct !== null && match.prediction.smart_bet_correct !== undefined">
                        <div class="sb-header">
                          <span class="sb-icon">⚡</span>
                          <span class="sb-title">Smart Bet — {{ match.prediction.smart_bet.type }}</span>
                          @if (isFinished(match) && match.prediction.smart_bet_correct !== null && match.prediction.smart_bet_correct !== undefined) {
                            <span class="sb-result" [class.won]="match.prediction.smart_bet_correct" [class.lost]="!match.prediction.smart_bet_correct">
                              {{ match.prediction.smart_bet_correct ? '✓ GANÓ' : '✗ PERDIÓ' }}
                            </span>
                          }
                        </div>
                        <div class="sb-picks">
                          @for (pick of match.prediction.smart_bet.picks; track pick.label) {
                            <span class="sb-pick">{{ pick.label }} <span class="pick-mkt">({{ pick.market }})</span></span>
                          }
                        </div>
                        <div class="sb-footer">
                          <span>Prob: {{ (match.prediction.smart_bet!.combined_prob * 100).toFixed(0) }}%</span>
                          <span class="odds-badge">Odds ~{{ match.prediction.smart_bet!.estimated_odds }}</span>
                        </div>
                        @if (match.prediction.smart_bet!.warning) {
                          <div class="sb-warning">⚠ {{ match.prediction.smart_bet!.warning }}</div>
                        }
                      </div>
                    }

                  </div>
                }
              }
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .page { padding: 16px 20px; max-width: 1400px; margin: 0 auto; }

    /* Header */
    .page-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      margin-bottom: 20px; flex-wrap: wrap; gap: 12px;
    }
    .title { font-size: 24px; font-weight: 800; color: var(--text-primary); margin: 0 0 4px; }
    .subtitle { font-size: 13px; color: var(--text-muted); margin: 0; }
    .header-stats { display: flex; gap: 12px; }
    .hstat {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: 10px; padding: 10px 16px; text-align: center; min-width: 80px;
    }
    .hstat.accent { border-color: var(--accent); }
    .hstat.gold   { border-color: #f59e0b; }
    .hstat-n { display: block; font-size: 22px; font-weight: 800; color: var(--text-primary); }
    .hstat.accent .hstat-n { color: var(--accent); }
    .hstat.gold .hstat-n   { color: #f59e0b; }
    .hstat-l { font-size: 10px; color: var(--text-muted); }

    /* Day tabs */
    .day-tabs {
      display: flex; gap: 8px; margin-bottom: 12px; align-items: center; flex-wrap: wrap;
    }
    .day-tab {
      padding: 8px 20px; background: var(--bg-card);
      border: 1px solid var(--border); border-radius: 8px;
      color: var(--text-muted); font-size: 13px; font-weight: 600; cursor: pointer;
      transition: all 0.2s;
    }
    .day-tab:hover { border-color: var(--accent); color: var(--text-primary); }
    .day-tab.active { background: var(--accent); border-color: var(--accent); color: #000; }
    .date-picker {
      background: var(--bg-card); border: 1px solid var(--accent);
      border-radius: 8px; padding: 7px 12px;
      color: var(--text-primary); font-size: 13px; outline: none;
      color-scheme: dark;
    }

    /* Filters */
    .filter-bar {
      display: flex; align-items: center; gap: 8px;
      margin-bottom: 20px; flex-wrap: wrap;
    }
    .filter-label { font-size: 12px; color: var(--text-muted); font-weight: 600; }
    .sep { flex: none; width: 1px; height: 20px; background: var(--border); margin: 0 4px; }
    .filter-chip {
      padding: 5px 12px; border-radius: 20px;
      border: 1px solid var(--border); background: var(--bg-card);
      color: var(--text-muted); font-size: 12px; font-weight: 600; cursor: pointer;
      transition: all 0.2s;
    }
    .filter-chip:hover { border-color: var(--accent); color: var(--text-primary); }
    .filter-chip.active { background: var(--accent); border-color: var(--accent); color: #000; }
    .filter-chip.active.good   { background: #10b981; border-color: #10b981; }
    .filter-chip.active.warn   { background: #f59e0b; border-color: #f59e0b; }
    .filter-chip.active.best   { background: var(--accent); border-color: var(--accent); }
    .filter-chip.active.gold   { background: #f59e0b; border-color: #f59e0b; }

    /* League section */
    .league-section { margin-bottom: 28px; }
    .league-header {
      display: flex; align-items: center; gap: 10px;
      margin-bottom: 12px; padding-bottom: 8px;
      border-bottom: 1px solid var(--border);
    }
    .league-logo { width: 22px; height: 22px; object-fit: contain; }
    .league-name { font-size: 15px; font-weight: 700; color: var(--text-primary); }
    .league-country { font-size: 12px; color: var(--text-muted); }
    .league-count {
      margin-left: auto; font-size: 11px; color: var(--text-muted);
      background: var(--bg-card); padding: 2px 8px;
      border-radius: 20px; border: 1px solid var(--border);
    }

    /* Cards grid */
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 14px;
    }

    /* Prediction card */
    .pred-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 16px;
      display: flex; flex-direction: column; gap: 12px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .pred-card:hover {
      border-color: var(--accent);
      box-shadow: 0 4px 20px rgba(16,185,129,0.1);
    }
    .pred-card.finished { border-color: rgba(107,114,128,0.4); opacity: 0.9; }
    .pred-card.live     { border-color: #ef4444; }

    /* Teams row */
    .card-teams {
      display: flex; align-items: center; gap: 8px;
    }
    .team-block {
      flex: 1; display: flex; align-items: center; gap: 8px;
    }
    .team-block.home { justify-content: flex-end; flex-direction: row-reverse; }
    .team-block.away { justify-content: flex-start; }
    .team-logo { width: 28px; height: 28px; object-fit: contain; flex-shrink: 0; }
    .team-name { font-size: 13px; font-weight: 700; color: var(--text-primary); line-height: 1.2; }

    .score-block {
      flex-shrink: 0; text-align: center; min-width: 80px;
    }
    .pred-score { font-size: 20px; font-weight: 800; color: var(--accent); }
    .real-score { font-size: 20px; font-weight: 800; color: var(--text-primary); }
    .score-label { font-size: 10px; color: var(--text-muted); margin-top: 1px; }
    .match-time  { font-size: 11px; color: var(--text-secondary); margin-top: 3px; }

    /* Badges */
    .badges-row { display: flex; gap: 6px; flex-wrap: wrap; }
    .badge {
      font-size: 10px; font-weight: 700; padding: 3px 8px;
      border-radius: 20px; border: 1px solid var(--border);
      color: var(--text-muted);
    }
    .badge.risk-low    { border-color: #10b981; color: #10b981; }
    .badge.risk-medium { border-color: #f59e0b; color: #f59e0b; }
    .badge.risk-high   { border-color: #ef4444; color: #ef4444; }
    .badge.confidence  { border-color: var(--accent); color: var(--accent); }
    .badge.correct     { border-color: #10b981; color: #10b981; background: rgba(16,185,129,0.1); }
    .badge.wrong       { border-color: #ef4444; color: #ef4444; background: rgba(239,68,68,0.1); }

    /* Section label */
    .section-label {
      font-size: 10px; font-weight: 700; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.05em;
    }

    /* Probability bars */
    .prob-bars { display: flex; flex-direction: column; gap: 5px; }
    .prob-bar-item { display: flex; align-items: center; gap: 8px; }
    .bar-label { font-size: 11px; color: var(--text-muted); width: 58px; flex-shrink: 0; }
    .bar-track {
      flex: 1; height: 6px; background: var(--bg-input);
      border-radius: 3px; overflow: hidden;
    }
    .bar-fill {
      height: 100%; border-radius: 3px; transition: width 0.4s ease;
    }
    .home-fill { background: #3b82f6; }
    .draw-fill { background: #6b7280; }
    .away-fill { background: #8b5cf6; }
    .bar-pct { font-size: 11px; font-weight: 700; color: var(--text-secondary); width: 32px; text-align: right; }

    /* Markets grid */
    .markets-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;
    }
    .market-pill {
      background: var(--bg-input); border: 1px solid var(--border);
      border-radius: 8px; padding: 6px 8px;
      display: flex; flex-direction: column; align-items: center; gap: 2px;
      transition: all 0.2s;
    }
    .market-pill.highlighted {
      border-color: var(--accent);
      background: rgba(16,185,129,0.08);
    }
    .market-pill.xg { border-color: rgba(139,92,246,0.4); }
    .mkt-label { font-size: 9px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }
    .mkt-val   { font-size: 13px; font-weight: 800; color: var(--text-primary); }
    .market-pill.highlighted .mkt-val { color: var(--accent); }

    /* Smart Bet */
    .smart-bet {
      background: linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.05));
      border: 1px solid rgba(245,158,11,0.4);
      border-radius: 10px;
      padding: 10px 12px;
      display: flex; flex-direction: column; gap: 6px;
    }
    .smart-bet.evaluated { opacity: 0.9; }
    .sb-header { display: flex; align-items: center; gap: 6px; }
    .sb-icon   { font-size: 14px; }
    .sb-title  { font-size: 12px; font-weight: 700; color: #f59e0b; flex: 1; }
    .sb-result {
      font-size: 11px; font-weight: 800; padding: 2px 8px;
      border-radius: 20px;
    }
    .sb-result.won  { background: rgba(16,185,129,0.2); color: #10b981; }
    .sb-result.lost { background: rgba(239,68,68,0.2);  color: #ef4444; }
    .sb-picks { display: flex; flex-direction: column; gap: 3px; }
    .sb-pick {
      font-size: 12px; font-weight: 600; color: var(--text-primary);
    }
    .pick-mkt { font-size: 10px; color: var(--text-muted); font-weight: 400; }
    .sb-footer {
      display: flex; justify-content: space-between; align-items: center;
      font-size: 11px; color: var(--text-muted);
    }
    .odds-badge {
      background: rgba(245,158,11,0.2); color: #f59e0b;
      padding: 2px 8px; border-radius: 20px;
      font-weight: 700; font-size: 11px;
    }
    .sb-warning { font-size: 10px; color: #f59e0b; opacity: 0.8; }

    /* Misc */
    .center-msg {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 60px 20px; gap: 12px;
      color: var(--text-muted); font-size: 14px;
    }
    .spinner {
      width: 36px; height: 36px;
      border: 3px solid var(--border); border-top-color: var(--accent);
      border-radius: 50%; animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-state {
      text-align: center; padding: 60px 20px;
      color: var(--text-muted); font-size: 14px;
    }
    .empty-icon { font-size: 48px; display: block; margin-bottom: 12px; }

    @media (max-width: 700px) {
      .cards-grid { grid-template-columns: 1fr; }
      .header-stats { display: none; }
      .markets-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class PredictionsComponent implements OnInit {
  groups    = signal<LeagueGroup[]>([]);
  loading   = signal(false);
  dayTab    = signal<DayTab>('today');
  confFilter  = signal('');
  onlySmartBet = signal(false);
  customDate = new Date().toISOString().split('T')[0];

  // computed stats
  allMatches = computed(() =>
    this.groups().flatMap(g => g.matches).filter(m => !!m.prediction)
  );
  totalWithPred  = computed(() => this.allMatches().length);
  highConfCount  = computed(() => this.allMatches().filter(m => (m.prediction!.confidence_score ?? 0) >= 0.70).length);
  smartBetCount  = computed(() => this.allMatches().filter(m => !!m.prediction!.smart_bet?.type).length);

  filteredGroups = computed(() => {
    const cf = this.confFilter();
    const sb = this.onlySmartBet();
    return this.groups().map(g => ({
      ...g,
      matches: g.matches.filter(m => {
        if (!m.prediction) return false;
        const conf = m.prediction.confidence_score ?? 0;
        if (cf === 'high'   && conf < 0.70) return false;
        if (cf === 'medium' && (conf < 0.55 || conf >= 0.70)) return false;
        if (cf === 'low'    && conf >= 0.55) return false;
        if (sb && !m.prediction.smart_bet?.type) return false;
        return true;
      })
    })).filter(g => g.matches.length > 0);
  });

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.load(); }

  switchDay(day: DayTab): void {
    this.dayTab.set(day);
    if (day !== 'date') this.load();
  }

  load(): void {
    this.loading.set(true);
    const day = this.dayTab();
    const obs = day === 'tomorrow'
      ? this.api.getTomorrowMatches()
      : this.api.getTodayMatches();

    obs.subscribe({
      next: res => { this.groups.set(res.groups ?? []); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  loadByDate(): void {
    if (!this.customDate) return;
    this.loading.set(true);
    this.api.getMatchesByDate(this.customDate).subscribe({
      next: res => { this.groups.set(res.groups ?? []); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  toggleSmartBet(): void { this.onlySmartBet.update(v => !v); }

  isFinished(m: Match): boolean { return FINISHED_STATUSES.includes(m.status); }
  isLive(m: Match): boolean     { return LIVE_STATUSES.includes(m.status); }

  formatTime(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    // Convertir de UTC a COT (UTC-5)
    const cot = new Date(d.getTime() - 5 * 60 * 60 * 1000);
    return cot.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
  }

  riskLabel(risk: string): string {
    return risk === 'low' ? 'Baja incertidumbre' : risk === 'medium' ? 'Incertidumbre media' : 'Alta incertidumbre';
  }
}
