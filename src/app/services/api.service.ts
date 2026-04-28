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

  getModelStats(): Observable<any> {
    return this.http.get<any>(`${this.base}/matches/model-stats`);
  }

  evaluatePredictions(): Observable<any> {
    return this.http.post<any>(`${this.base}/matches/evaluate`, {});
  }

  getMatchResults(day: 'today' | 'yesterday'): Observable<any> {
    return this.http.get<any>(`${this.base}/matches/results?day=${day}`);
  }

  getTrainingStatus(): Observable<any> {
    return this.http.get<any>(`${this.base}/matches/training-status`);
  }

  retrainModels(): Observable<any> {
    return this.http.post<any>(`${this.base}/matches/retrain`, {});
  }

  chat(message: string, history: {role: string; content: string}[], matchId: number | null): Observable<{response: string}> {
    return this.http.post<{response: string}>(`${this.base}/chat/`, { message, history, match_id: matchId });
  }

  getBetPerformance(): Observable<any> {
    return this.http.get<any>(`${this.base}/bets/performance`);
  }

  verifyAccount(token: string): Observable<{ message: string; username: string }> {
    return this.http.get<{ message: string; username: string }>(`${this.base}/auth/verify?token=${token}`);
  }

  createWompiCheckout(plan: string): Observable<{ checkout_url: string }> {
    return this.http.post<{ checkout_url: string }>(`${this.base}/payments/wompi/checkout?plan=${plan}`, {});
  }

  getMySubscription(): Observable<any> {
    return this.http.get<any>(`${this.base}/payments/subscription`);
  }

  verifyWompiTransaction(transactionId: string): Observable<{ activated: boolean; plan?: string; status?: string }> {
    return this.http.post<any>(`${this.base}/payments/wompi/verify?transaction_id=${transactionId}`, {});
  }

  testActivatePlan(plan: string): Observable<{ activated: boolean; plan: string }> {
    return this.http.post<any>(`${this.base}/payments/test/activate?plan=${plan}`, {});
  }

  // ── Admin / scraping ────────────────────────────────────────────────────────
  getScraperStatus(): Observable<any> {
    return this.http.get<any>(`${this.base}/scraper/status`);
  }

  scrapeInit(): Observable<any> {
    return this.http.post<any>(`${this.base}/scraper/init`, {});
  }

  scrapeDaily(): Observable<any> {
    return this.http.post<any>(`${this.base}/scraper/daily`, {});
  }

  scrapeDetails(limit = 50): Observable<any> {
    return this.http.post<any>(`${this.base}/scraper/details?limit=${limit}`, {});
  }

  scrapeHistorical(yearsBack = 2): Observable<any> {
    return this.http.post<any>(`${this.base}/scraper/historical?years_back=${yearsBack}`, {});
  }

  predictAll(): Observable<any> {
    return this.http.post<any>(`${this.base}/matches/predict-all`, {});
  }

  trainModel(): Observable<any> {
    return this.http.post<any>(`${this.base}/matches/train`, {});
  }

  getPredictionsHistory(page = 1, perPage = 25, leagueId?: number): Observable<any> {
    let params = new HttpParams()
      .set('page', page)
      .set('per_page', perPage)
      .set('only_evaluated', 'true');
    if (leagueId) params = params.set('league_id', leagueId);
    return this.http.get<any>(`${this.base}/matches/predictions-history`, { params });
  }
}
