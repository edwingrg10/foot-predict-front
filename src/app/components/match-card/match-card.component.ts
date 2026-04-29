import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Match } from '../../models/interfaces';

@Component({
  selector: 'app-match-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="match-card" [class.selected]="selected" (click)="select.emit(match)">
      <div class="card-header">
        <div class="league-info">
          <img [src]="match.league.logo" [alt]="match.league.name" class="league-logo" referrerpolicy="no-referrer" onerror="this.style.display='none'" />
          <span class="league-name">{{ match.league.name }}</span>
          <span class="match-time">{{ formatTime(match.match_date) }}</span>
        </div>
        <div class="importance-badge" [class]="match.importance">
          {{ importanceLabel(match.importance) }}
        </div>
      </div>

      <div class="teams-row">
        <div class="team home">
          <img [src]="match.home_team.logo" [alt]="match.home_team.name" class="team-logo" referrerpolicy="no-referrer" onerror="this.style.display='none'" />
          <span class="team-name">{{ match.home_team.name }}</span>
          <span class="form-badge" [title]="'Forma: ' + match.home_team.form">
            {{ match.home_team.form }}
          </span>
        </div>

        <div class="vs-block">
          @if (match.status === 'live' || match.status === 'finished') {
            <div class="score-display">
              {{ match.home_score ?? '-' }} - {{ match.away_score ?? '-' }}
            </div>
          } @else {
            <span class="vs">VS</span>
          }
          @if (pred) {
            <div class="predicted-score">⚽ {{ pred.predicted_score }}</div>
          }
        </div>

        <div class="team away">
          <span class="form-badge" [title]="'Forma: ' + match.away_team.form">
            {{ match.away_team.form }}
          </span>
          <span class="team-name">{{ match.away_team.name }}</span>
          <img [src]="match.away_team.logo" [alt]="match.away_team.name" class="team-logo" referrerpolicy="no-referrer" onerror="this.style.display='none'" />
        </div>
      </div>

      @if (pred) {
        <div class="prediction-row">
          <div class="prob-bar-group">
            <div class="prob-item home-win">
              <span class="prob-label">Local</span>
              <div class="prob-bar">
                <div class="prob-fill" [style.width.%]="pred.prob_home_win * 100" style="background:var(--accent)"></div>
              </div>
              <span class="prob-value">{{ (pred.prob_home_win * 100).toFixed(0) }}%</span>
            </div>
            <div class="prob-item draw">
              <span class="prob-label">Empate</span>
              <div class="prob-bar">
                <div class="prob-fill" [style.width.%]="pred.prob_draw * 100" style="background:#f59e0b"></div>
              </div>
              <span class="prob-value">{{ (pred.prob_draw * 100).toFixed(0) }}%</span>
            </div>
            <div class="prob-item away-win">
              <span class="prob-label">Visitante</span>
              <div class="prob-bar">
                <div class="prob-fill" [style.width.%]="pred.prob_away_win * 100" style="background:#ef4444"></div>
              </div>
              <span class="prob-value">{{ (pred.prob_away_win * 100).toFixed(0) }}%</span>
            </div>
          </div>
        </div>

        <div class="meta-row">
          <span class="badge" [class]="'risk-' + pred.risk_level">
            {{ riskIcon(pred.risk_level) }} {{ pred.risk_level }}
          </span>
          <span class="badge confidence">
            🎯 {{ pred.confidence_score.toFixed(0) }}% confianza
          </span>
          @if (pred.value_bets.length > 0) {
            <span class="badge value-alert">
              💡 {{ pred.value_bets.length }} value bet{{ pred.value_bets.length > 1 ? 's' : '' }}
            </span>
          }
          <span class="over-under">
            Over 2.5: {{ (pred.prob_over_25 * 100).toFixed(0) }}% |
            BTTS: {{ (pred.prob_btts * 100).toFixed(0) }}%
          </span>
        </div>
      }

      @if (match.odds) {
        <div class="odds-row">
          <span>Cuotas:</span>
          <span class="odd">🏠 {{ match.odds.home }}</span>
          <span class="odd">🤝 {{ match.odds.draw }}</span>
          <span class="odd">✈️ {{ match.odds.away }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .match-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.2s;
      position: relative;
    }
    .match-card:hover { border-color: var(--accent); transform: translateY(-1px); box-shadow: 0 4px 20px rgba(0,255,135,0.1); }
    .match-card.selected { border-color: var(--accent); box-shadow: 0 0 0 2px rgba(0,255,135,0.3); }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
    }
    .league-info {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .league-logo { width: 18px; height: 18px; object-fit: contain; }
    .league-name { font-size: 12px; color: var(--text-secondary); font-weight: 600; }
    .match-time { font-size: 11px; color: var(--text-muted); margin-left: 8px; }
    .importance-badge {
      font-size: 10px;
      padding: 2px 8px;
      border-radius: 4px;
      background: var(--bg-input);
      color: var(--text-secondary);
      font-weight: 600;
      text-transform: uppercase;
    }
    .importance-badge.derby { background: rgba(239,68,68,0.2); color: #ef4444; }
    .importance-badge.final { background: rgba(0,255,135,0.2); color: var(--accent); }
    .importance-badge.relegation { background: rgba(245,158,11,0.2); color: #f59e0b; }
    .teams-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 14px;
    }
    .team {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .team.away { flex-direction: row-reverse; }
    .team-logo { width: 32px; height: 32px; object-fit: contain; }
    .team-name { font-weight: 700; font-size: 14px; color: var(--text-primary); }
    .form-badge {
      font-size: 10px;
      color: var(--text-muted);
      letter-spacing: 1px;
      font-family: monospace;
    }
    .vs-block {
      text-align: center;
      min-width: 80px;
    }
    .vs { font-size: 18px; font-weight: 800; color: var(--text-muted); }
    .score-display { font-size: 22px; font-weight: 800; color: var(--text-primary); }
    .predicted-score { font-size: 11px; color: var(--accent); margin-top: 2px; }
    .prediction-row { margin-bottom: 12px; }
    .prob-bar-group { display: flex; flex-direction: column; gap: 5px; }
    .prob-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .prob-label { font-size: 11px; color: var(--text-secondary); min-width: 64px; }
    .prob-bar {
      flex: 1;
      height: 5px;
      background: var(--bg-input);
      border-radius: 3px;
      overflow: hidden;
    }
    .prob-fill { height: 100%; border-radius: 3px; transition: width 0.5s ease; }
    .prob-value { font-size: 11px; font-weight: 700; color: var(--text-primary); min-width: 32px; text-align: right; }
    .meta-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: center;
      margin-bottom: 10px;
    }
    .badge {
      font-size: 10px;
      padding: 3px 8px;
      border-radius: 20px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .risk-low { background: rgba(0,255,135,0.15); color: var(--accent); }
    .risk-medium { background: rgba(245,158,11,0.15); color: #f59e0b; }
    .risk-high { background: rgba(239,68,68,0.15); color: #ef4444; }
    .confidence { background: var(--bg-input); color: var(--text-secondary); }
    .value-alert { background: rgba(99,102,241,0.2); color: #818cf8; }
    .over-under { font-size: 11px; color: var(--text-muted); margin-left: auto; }
    .odds-row {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 12px;
      color: var(--text-muted);
      border-top: 1px solid var(--border);
      padding-top: 10px;
    }
    .odd { font-weight: 700; color: var(--text-secondary); }
  `]
})
export class MatchCardComponent {
  @Input() match!: Match;
  @Input() selected = false;
  @Output() select = new EventEmitter<Match>();

  get pred() { return this.match.prediction; }

  formatTime(dateStr: string): string {
    if (!dateStr) return '--:--';
    return new Date(dateStr).toLocaleTimeString('es-CO', {
      hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota'
    });
  }

  importanceLabel(imp?: string): string {
    const map: Record<string, string> = {
      derby: 'Derby', final: 'Final', relegation: 'Descenso', regular: 'Regular'
    };
    return map[imp || 'regular'] || imp || '';
  }

  riskIcon(risk: string): string {
    return risk === 'low' ? '🟢' : risk === 'medium' ? '🟡' : '🔴';
  }
}
