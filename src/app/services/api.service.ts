import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { TodayResponse, LeagueGroup, League, SavedBet, Match } from '../models/interfaces';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /** Normaliza cualquier formato de respuesta a {groups, total} */
  private normalize(res: any): TodayResponse {
    if (res.groups) return res as TodayResponse;

    // Formato antiguo {matches:[]} → agrupamos en frontend
    const matches: Match[] = res.matches ?? [];
    const groupMap: Record<string, LeagueGroup> = {};
    for (const m of matches) {
      const key = String(m.league?.id ?? 0);
      if (!groupMap[key]) {
        groupMap[key] = {
          league_id:      m.league?.id ?? 0,
          league_name:    m.league?.name ?? '',
          league_country: m.league?.country ?? '',
          league_logo:    m.league?.logo ?? '',
          matches:        [],
        };
      }
      groupMap[key].matches.push(m);
    }
    return { groups: Object.values(groupMap), total: matches.length };
  }

  getTodayMatches(leagueId?: number): Observable<TodayResponse> {
    let params = new HttpParams();
    if (leagueId) params = params.set('league_id', leagueId);
    return this.http.get<any>(`${this.base}/matches/today`, { params })
      .pipe(map(r => this.normalize(r)));
  }

  getTomorrowMatches(leagueId?: number): Observable<TodayResponse> {
    let params = new HttpParams();
    if (leagueId) params = params.set('league_id', leagueId);
    return this.http.get<any>(`${this.base}/matches/tomorrow`, { params })
      .pipe(map(r => this.normalize(r)));
  }

  searchMatches(q: string, leagueId?: number, day: 'today' | 'tomorrow' = 'today'): Observable<TodayResponse> {
    let params = new HttpParams().set('q', q).set('day', day);
    if (leagueId) params = params.set('league_id', leagueId);
    return this.http.get<any>(`${this.base}/matches/search`, { params })
      .pipe(map(r => this.normalize(r)));
  }

  getMatchDetail(id: number): Observable<Match> {
    return this.http.get<Match>(`${this.base}/matches/detail/${id}`);
  }

  getMatchesByDate(dateStr: string, leagueId?: number): Observable<TodayResponse> {
    let params = new HttpParams();
    if (leagueId) params = params.set('league_id', leagueId);
    return this.http.get<any>(`${this.base}/matches/date/${dateStr}`, { params })
      .pipe(map(r => this.normalize(r)));
  }

  getLeagues(): Observable<League[]> {
    return this.http.get<League[]>(`${this.base}/leagues`);
  }

  getSavedBets(): Observable<SavedBet[]> {
    return this.http.get<SavedBet[]>(`${this.base}/bets/`);
  }

  saveBet(payload: Partial<SavedBet>): Observable<SavedBet> {
    return this.http.post<SavedBet>(`${this.base}/bets/`, payload);
  }

  deleteBet(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/bets/${id}`);
  }
}
