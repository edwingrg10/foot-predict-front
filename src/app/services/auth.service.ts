import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { User } from '../models/interfaces';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = environment.apiUrl;
  currentUser = signal<User | null>(null);
  token = signal<string | null>(localStorage.getItem('fp_token'));

  constructor(private http: HttpClient) {
    const t = localStorage.getItem('fp_token');
    if (t) {
      this.token.set(t);
      this.loadProfile();
    }
  }

  register(email: string, username: string, password: string, plan: string = 'bronce'): Observable<User> {
    return this.http.post<User>(`${this.base}/auth/register`, { email, username, password, plan });
  }

  login(email: string, password: string): Observable<{ access_token: string }> {
    const form = new FormData();
    form.append('username', email);
    form.append('password', password);
    return this.http.post<{ access_token: string }>(`${this.base}/auth/login`, form).pipe(
      tap(res => {
        localStorage.setItem('fp_token', res.access_token);
        this.token.set(res.access_token);
        this.loadProfile();
      })
    );
  }

  loadProfile(): void {
    this.http.get<User>(`${this.base}/auth/me`).subscribe({
      next:  u  => this.currentUser.set(u),
      error: () => {},
    });
  }

  logout(): void {
    localStorage.removeItem('fp_token');
    this.token.set(null);
    this.currentUser.set(null);
  }

  isLoggedIn(): boolean {
    return !!this.token();
  }

  isAdmin(): boolean {
    return !!this.currentUser()?.is_admin;
  }

  plan(): string {
    if (this.isAdmin()) return 'oro';
    return this.currentUser()?.plan ?? 'bronce';
  }

  planLabel(): string {
    const labels: Record<string, string> = {
      hincha: 'Hincha',
      bronce: 'Bronce ⚽',
      plata:  'Plata 🥈',
      oro:    'Oro 🏆',
    };
    return labels[this.plan()] ?? this.plan();
  }
}
