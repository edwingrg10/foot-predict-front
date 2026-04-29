import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Match, FINISHED_STATUSES, LIVE_STATUSES } from '../../models/interfaces';

@Component({
  selector: 'app-match-row',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="match-row" [class.selected]="selected" [class.finished]="isFinished"
         [class.live]="isLive" (click)="select.emit(match)">

      <!-- Hora / Estado -->
      <div class="time-col">
        @if (isLive) {
          <span class="status-live">● EN VIVO</span>
          <span class="status-text">{{ match.status }}</span>
        } @else if (isFinished) {
          <span class="status-ft">FT</span>
        } @else {
          <span class="match-time">{{ formatTime(match.match_date) }}</span>
        }
      </div>

      <!-- Equipo local -->
      <div class="team home-team">
        <span class="team-name">{{ match.home_team.name }}</span>
        <img [src]="match.home_team.logo" [alt]="match.home_team.name"
          class="team-logo" referrerpolicy="no-referrer" onerror="this.style.display='none'" />
      </div>

      <!-- Marcador / VS -->
      <div class="score-col">
        @if (isFinished || isLive) {
          <span class="score">
            {{ match.home_score ?? 0 }} - {{ match.away_score ?? 0 }}
          </span>
        } @else {
          <!-- Predicción: marcador más probable -->
          @if (pred) {
            <div class="pred-score">{{ pred.predicted_score }}</div>
            <div class="xg-row">
              <span>xG {{ pred.expected_home_goals.toFixed(1) }}</span>
              <span>-</span>
              <span>{{ pred.expected_away_goals.toFixed(1) }}</span>
            </div>
          } @else {
            <span class="vs">vs</span>
          }
        }
      </div>

      <!-- Equipo visitante -->
      <div class="team away-team">
        <img [src]="match.away_team.logo" [alt]="match.away_team.name"
          class="team-logo" referrerpolicy="no-referrer" onerror="this.style.display='none'" />
        <span class="team-name">{{ match.away_team.name }}</span>
      </div>

      <!-- Info derecha -->
      <div class="right-col">
        @if (isFinished) {
          <!-- Partido terminado: mostrar solo resultado, nada de apuestas -->
          <span class="badge finished-badge">Finalizado</span>
        } @else if (pred) {
          <!-- Partido por jugar: predicciones y value bets -->
          <div class="probs">
            <span class="prob home-p" [title]="'Local: ' + pct(pred.prob_home_win)">
              {{ pct(pred.prob_home_win) }}
            </span>
            <span class="prob draw-p" [title]="'Empate: ' + pct(pred.prob_draw)">
              {{ pct(pred.prob_draw) }}
            </span>
            <span class="prob away-p" [title]="'Visitante: ' + pct(pred.prob_away_win)">
              {{ pct(pred.prob_away_win) }}
            </span>
          </div>
          <div class="badges-row">
            <span class="badge risk-badge" [class]="'risk-' + pred.risk_level">
              {{ riskLabel(pred.risk_level) }}
            </span>
            @if (pred.value_bets.length > 0) {
              <span class="badge vb-badge">💡 {{ pred.value_bets.length }} VB</span>
            }
          </div>
        }
        <span class="detail-hint">Ver análisis →</span>
      </div>
    </div>
  `,
  styles: [`
    .match-row {
      display: grid;
      grid-template-columns: 76px 1fr auto 1fr 140px;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border);
      cursor: pointer;
      transition: background 0.15s;
    }
    .match-row:last-child { border-bottom: none; }
    .match-row:hover { background: var(--bg-input); }
    .match-row.selected { background: rgba(0,255,135,0.06); border-left: 3px solid var(--accent); }
    .match-row.live { background: rgba(239,68,68,0.04); }

    /* Hora */
    .time-col { text-align: center; min-width: 64px; }
    .match-time { font-size: 15px; font-weight: 700; color: var(--text-primary); }
    .status-live { display: block; font-size: 9px; font-weight: 800; color: #ef4444; letter-spacing: 1px; }
    .status-text { display: block; font-size: 13px; font-weight: 700; color: #ef4444; }
    .status-ft { font-size: 11px; font-weight: 700; color: var(--text-muted); letter-spacing: 1px; }

    /* Equipos */
    .team {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }
    .home-team { justify-content: flex-end; }
    .away-team { justify-content: flex-start; }
    .team-logo { width: 24px; height: 24px; object-fit: contain; flex-shrink: 0; }
    .team-name {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Marcador / Score */
    .score-col { text-align: center; min-width: 80px; }
    .score { font-size: 20px; font-weight: 800; color: var(--text-primary); }
    .vs { font-size: 13px; color: var(--text-muted); font-weight: 600; }
    .pred-score { font-size: 15px; font-weight: 800; color: var(--accent); }
    .xg-row { font-size: 10px; color: var(--text-muted); display: flex; gap: 4px; justify-content: center; margin-top: 1px; }

    /* Derecha */
    .right-col {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
      min-width: 130px;
    }
    .probs { display: flex; gap: 6px; align-items: center; }
    .prob { font-size: 12px; font-weight: 700; padding: 2px 6px; border-radius: 4px; }
    .home-p { color: var(--accent); background: rgba(0,255,135,0.1); }
    .draw-p  { color: #f59e0b; background: rgba(245,158,11,0.1); }
    .away-p  { color: #ef4444; background: rgba(239,68,68,0.1); }
    .badges-row { display: flex; gap: 4px; }
    .badge { font-size: 10px; padding: 2px 7px; border-radius: 20px; font-weight: 700; white-space: nowrap; }
    .risk-badge.risk-low    { background: rgba(0,255,135,0.15); color: var(--accent); }
    .risk-badge.risk-medium { background: rgba(245,158,11,0.15); color: #f59e0b; }
    .risk-badge.risk-high   { background: rgba(239,68,68,0.15); color: #ef4444; }
    .vb-badge     { background: rgba(99,102,241,0.15); color: #818cf8; }
    .finished-badge { background: var(--bg-input); color: var(--text-muted); }
    .detail-hint { font-size: 10px; color: var(--text-muted); opacity: 0; transition: opacity 0.2s; }
    .match-row:hover .detail-hint { opacity: 1; }

    @media (max-width: 640px) {
      .match-row { grid-template-columns: 56px 1fr auto 1fr auto; }
      .right-col { min-width: 80px; }
      .probs { flex-wrap: wrap; }
      .detail-hint { display: none; }
    }
  `]
})
export class MatchRowComponent {
  @Input() match!: Match;
  @Input() selected = false;
  @Output() select = new EventEmitter<Match>();

  get pred()       { return this.match.prediction; }
  get isFinished() { return FINISHED_STATUSES.includes(this.match.status); }
  get isLive()     { return LIVE_STATUSES.includes(this.match.status); }

  formatTime(dateStr: string): string {
    if (!dateStr) return '--:--';
    return new Date(dateStr).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota' });
  }

  pct(v: number): string { return `${(v * 100).toFixed(0)}%`; }

  riskLabel(r: string): string {
    return r === 'low' ? '🟢 Bajo' : r === 'medium' ? '🟡 Medio' : '🔴 Alto';
  }
}
