import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { LeagueGroup, League, Match, FINISHED_STATUSES, LIVE_STATUSES } from '../../models/interfaces';
import { MatchRowComponent } from '../match-row/index';
import { MatchDetailComponent } from '../match-detail/match-detail.component';

type DayTab = 'today' | 'tomorrow';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, MatchRowComponent, MatchDetailComponent],
  template: `
    <div class="page">

      <!-- Tabs Hoy / Mañana -->
      <div class="day-tabs">
        <button class="day-tab" [class.active]="activeDay() === 'today'" (click)="switchDay('today')">
          <span class="tab-icon">📅</span>
          <span>Hoy</span>
          <span class="tab-badge">{{ activeDay() === 'today' ? totalMatches() : '' }}</span>
        </button>
        <button class="day-tab" [class.active]="activeDay() === 'tomorrow'" (click)="switchDay('tomorrow')">
          <span class="tab-icon">🔮</span>
          <span>Mañana</span>
          <span class="tab-badge">{{ activeDay() === 'tomorrow' ? totalMatches() : '' }}</span>
        </button>
      </div>

      <!-- Toolbar -->
      <div class="toolbar">
        <div class="search-wrap">
          <input class="search-input" type="text" placeholder="🔍  Buscar equipo o liga..."
            [(ngModel)]="searchQuery" (input)="onSearch()" />
          @if (searchQuery) {
            <button class="clear-btn" (click)="clearSearch()">✕</button>
          }
        </div>

        <select class="filter-sel" [(ngModel)]="selectedLeagueId" (change)="load()">
          <option [ngValue]="null">Todas las ligas</option>
          @for (l of leagues(); track l.id) {
            <option [ngValue]="l.id">{{ l.name }}</option>
          }
        </select>

        <select class="filter-sel" [(ngModel)]="statusFilter">
          <option value="">Todo</option>
          <option value="upcoming">Por jugar</option>
          <option value="live">En vivo</option>
          <option value="finished">Terminados</option>
        </select>

        <button class="refresh-btn" (click)="load()">↻</button>
      </div>

      <!-- Stats bar -->
      <div class="stats-bar">
        <div class="stat">
          <span class="snum">{{ totalMatches() }}</span>
          <span class="slabel">Partidos</span>
        </div>
        <div class="stat">
          <span class="snum live-color">{{ liveCount() }}</span>
          <span class="slabel">En vivo</span>
        </div>
        <div class="stat">
          <span class="snum finished-color">{{ finishedCount() }}</span>
          <span class="slabel">Terminados</span>
        </div>
        <div class="stat">
          <span class="snum accent">{{ valueBetCount() }}</span>
          <span class="slabel">Value bets</span>
        </div>
      </div>

      <!-- Banner mañana -->
      @if (activeDay() === 'tomorrow') {
        <div class="tomorrow-banner">
          🔮 Pronósticos estadísticos para mañana — basados en modelo Dixon-Coles + Kelly Criterion
        </div>
      }

      <!-- Main layout -->
      <div class="main-layout" [class.has-detail]="selectedMatch()">

        <div class="groups-col">
          @if (loading()) {
            <div class="center-msg">
              <div class="spinner"></div>
              <p>Cargando partidos...</p>
            </div>
          } @else if (filteredGroups().length === 0) {
            <div class="center-msg">
              <span style="font-size:40px">📭</span>
              <p>No hay partidos disponibles.</p>
            </div>
          } @else {
            @for (group of filteredGroups(); track group.league_id) {
              <div class="league-group">
                <div class="league-header">
                  <img [src]="group.league_logo" [alt]="group.league_name"
                    class="league-logo" onerror="this.style.display='none'" />
                  <div class="league-info">
                    <span class="league-name">{{ group.league_name }}</span>
                    <span class="league-country">{{ group.league_country }}</span>
                  </div>
                  <span class="match-count">{{ group.matches.length }} partido{{ group.matches.length !== 1 ? 's' : '' }}</span>
                </div>

                @for (match of group.matches; track match.id) {
                  <app-match-row
                    [match]="match"
                    [selected]="selectedMatch()?.id === match.id"
                    (select)="selectMatch($event)"
                  />
                }
              </div>
            }
          }
        </div>

        @if (selectedMatch()) {
          <div class="detail-col">
            <div class="detail-close-bar">
              <button class="close-btn" (click)="selectedMatch.set(null)">✕ Cerrar</button>
            </div>
            <app-match-detail [match]="selectedMatch()" />
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 16px 20px; max-width: 1400px; margin: 0 auto; }

    /* Day tabs */
    .day-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 14px;
    }
    .day-tab {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 24px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 10px;
      color: var(--text-muted);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .day-tab:hover { border-color: var(--accent); color: var(--text-primary); }
    .day-tab.active {
      background: var(--accent);
      border-color: var(--accent);
      color: #000;
    }
    .tab-icon { font-size: 16px; }
    .tab-badge {
      background: rgba(0,0,0,0.15);
      border-radius: 20px;
      padding: 1px 8px;
      font-size: 12px;
      min-width: 20px;
      text-align: center;
    }
    .day-tab:not(.active) .tab-badge { background: var(--bg-input); color: var(--text-muted); }

    /* Tomorrow banner */
    .tomorrow-banner {
      background: linear-gradient(135deg, rgba(139,92,246,0.15), rgba(59,130,246,0.15));
      border: 1px solid rgba(139,92,246,0.3);
      border-radius: 10px;
      padding: 10px 16px;
      font-size: 13px;
      color: var(--text-secondary);
      margin-bottom: 14px;
    }

    /* Toolbar */
    .toolbar {
      display: flex;
      gap: 10px;
      margin-bottom: 14px;
      flex-wrap: wrap;
      align-items: center;
    }
    .search-wrap { flex: 1; min-width: 200px; position: relative; }
    .search-input {
      width: 100%;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 9px 36px 9px 14px;
      color: var(--text-primary);
      font-size: 14px;
      outline: none;
      box-sizing: border-box;
    }
    .search-input:focus { border-color: var(--accent); }
    .clear-btn {
      position: absolute; right: 10px; top: 50%;
      transform: translateY(-50%);
      background: none; border: none;
      color: var(--text-muted); cursor: pointer; font-size: 13px;
    }
    .filter-sel {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 9px 12px;
      color: var(--text-primary);
      font-size: 13px;
      cursor: pointer;
      outline: none;
    }
    .filter-sel:focus { border-color: var(--accent); }
    .refresh-btn {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 9px 14px;
      color: var(--text-primary);
      font-size: 16px;
      cursor: pointer;
    }
    .refresh-btn:hover { border-color: var(--accent); }

    /* Stats */
    .stats-bar { display: flex; gap: 10px; margin-bottom: 16px; }
    .stat {
      flex: 1;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 12px 16px;
      display: flex; flex-direction: column; gap: 3px;
    }
    .snum { font-size: 26px; font-weight: 800; color: var(--text-primary); }
    .snum.accent { color: var(--accent); }
    .snum.live-color { color: #ef4444; }
    .snum.finished-color { color: var(--text-secondary); }
    .slabel { font-size: 11px; color: var(--text-muted); }

    /* Layout */
    .main-layout { display: grid; grid-template-columns: 1fr; gap: 16px; }
    .main-layout.has-detail { grid-template-columns: 1fr 440px; }
    .groups-col { display: flex; flex-direction: column; gap: 16px; }

    .league-group {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
    }
    .league-header {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 16px;
      background: var(--bg-input);
      border-bottom: 1px solid var(--border);
    }
    .league-logo { width: 24px; height: 24px; object-fit: contain; }
    .league-info { flex: 1; }
    .league-name { display: block; font-size: 14px; font-weight: 700; color: var(--text-primary); }
    .league-country { font-size: 11px; color: var(--text-muted); }
    .match-count {
      font-size: 11px; color: var(--text-muted);
      background: var(--bg-card);
      padding: 2px 8px; border-radius: 20px;
      border: 1px solid var(--border);
    }

    /* Detail */
    .detail-col {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      position: sticky; top: 68px;
      height: calc(100vh - 84px);
      overflow: hidden;
      display: flex; flex-direction: column;
    }
    app-match-detail {
      flex: 1;
      min-height: 0;
      display: block;
      overflow: hidden;
    }
    .detail-close-bar {
      padding: 8px 12px;
      border-bottom: 1px solid var(--border);
      display: flex; justify-content: flex-end;
    }
    .close-btn {
      background: none; border: 1px solid var(--border);
      border-radius: 6px; color: var(--text-muted);
      padding: 4px 10px; font-size: 12px; cursor: pointer;
    }
    .close-btn:hover { border-color: var(--danger); color: var(--danger); }

    /* Misc */
    .center-msg {
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding: 60px 20px; gap: 12px;
      color: var(--text-muted); font-size: 14px;
    }
    .spinner {
      width: 36px; height: 36px;
      border: 3px solid var(--border);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 900px) {
      .main-layout.has-detail { grid-template-columns: 1fr; }
      .detail-col { position: static; height: auto; }
      .stats-bar { flex-wrap: wrap; }
      .stat { min-width: calc(50% - 5px); }
    }
  `]
})
export class DashboardComponent implements OnInit {
  groups        = signal<LeagueGroup[]>([]);
  leagues       = signal<League[]>([]);
  loading       = signal(false);
  selectedMatch = signal<Match | null>(null);
  activeDay     = signal<DayTab>('today');

  selectedLeagueId: number | null = null;
  statusFilter = '';
  searchQuery  = '';
  private searchTimer: any;

  filteredGroups = computed(() => {
    return this.groups().map(g => ({
      ...g,
      matches: g.matches.filter(m => {
        if (!this.statusFilter) return true;
        const s = m.status;
        if (this.statusFilter === 'finished') return FINISHED_STATUSES.includes(s);
        if (this.statusFilter === 'live')     return LIVE_STATUSES.includes(s);
        if (this.statusFilter === 'upcoming') return !FINISHED_STATUSES.includes(s) && !LIVE_STATUSES.includes(s);
        return true;
      })
    })).filter(g => g.matches.length > 0);
  });

  totalMatches  = computed(() => this.groups().reduce((a, g) => a + g.matches.length, 0));
  liveCount     = computed(() => this.groups().reduce((a, g) => a + g.matches.filter(m => LIVE_STATUSES.includes(m.status)).length, 0));
  finishedCount = computed(() => this.groups().reduce((a, g) => a + g.matches.filter(m => FINISHED_STATUSES.includes(m.status)).length, 0));
  valueBetCount = computed(() => this.groups().reduce((a, g) => a + g.matches.reduce((b, m) => b + (m.prediction?.value_bets.length ?? 0), 0), 0));

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  switchDay(day: DayTab): void {
    if (this.activeDay() === day) return;
    this.activeDay.set(day);
    this.searchQuery = '';
    this.selectedLeagueId = null;
    this.load();
  }

  load(): void {
    this.searchQuery = '';
    this.loading.set(true);
    this.selectedMatch.set(null);

    const day = this.activeDay();
    const lid = this.selectedLeagueId ?? undefined;

    const matches$ = day === 'tomorrow'
      ? this.api.getTomorrowMatches(lid)
      : this.api.getTodayMatches(lid);

    matches$.subscribe({
      next: res => {
        this.groups.set(res.groups ?? []);
        this.loading.set(false);
      },
      error: e => { console.error('API error:', e); this.loading.set(false); },
    });

    // Refresca el filtro de ligas para el día activo
    this.api.getLeagues().subscribe(l => this.leagues.set(l));
  }

  onSearch(): void {
    clearTimeout(this.searchTimer);
    if (!this.searchQuery.trim()) { this.load(); return; }
    this.searchTimer = setTimeout(() => {
      this.loading.set(true);
      this.api.searchMatches(
        this.searchQuery.trim(),
        this.selectedLeagueId ?? undefined,
        this.activeDay()
      ).subscribe({
        next: res => { this.groups.set(res.groups ?? []); this.loading.set(false); },
        error: e  => { console.error('Search error:', e); this.loading.set(false); },
      });
    }, 400);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.load();
  }

  selectMatch(match: Match): void {
    this.selectedMatch.set(this.selectedMatch()?.id === match.id ? null : match);
  }
}
