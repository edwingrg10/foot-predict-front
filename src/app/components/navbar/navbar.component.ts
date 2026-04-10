import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <nav class="navbar">
      <div class="nav-brand">
        <span class="brand-icon">⚽</span>
        <span class="brand-name">FootPredict<span class="brand-ai">AI</span></span>
      </div>

      <div class="nav-search">
        <input
          class="search-input"
          type="text"
          placeholder="Buscar equipo o partido..."
          [(ngModel)]="searchQuery"
          (keyup.enter)="onSearch()"
        />
        <button class="search-btn" (click)="onSearch()">🔍</button>
      </div>

      <div class="nav-actions">
        <button class="dark-toggle" (click)="toggleDark()" title="Modo oscuro">
          {{ isDark() ? '☀️' : '🌙' }}
        </button>
        @if (auth.isLoggedIn()) {
          <span class="nav-user">{{ auth.currentUser()?.username || 'Usuario' }}</span>
          <button class="btn-logout" (click)="auth.logout()">Salir</button>
        } @else {
          <button class="btn-login" (click)="showLogin.emit()">Iniciar sesión</button>
        }
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 24px;
      background: var(--bg-card);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 16px rgba(0,0,0,0.3);
    }
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 200px;
    }
    .brand-icon { font-size: 24px; }
    .brand-name {
      font-size: 20px;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.5px;
    }
    .brand-ai { color: var(--accent); }
    .nav-search {
      flex: 1;
      display: flex;
      gap: 8px;
      max-width: 480px;
    }
    .search-input {
      flex: 1;
      background: var(--bg-input);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 8px 14px;
      color: var(--text-primary);
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }
    .search-input:focus { border-color: var(--accent); }
    .search-btn {
      background: var(--accent);
      border: none;
      border-radius: 8px;
      padding: 8px 14px;
      cursor: pointer;
      font-size: 16px;
    }
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-left: auto;
    }
    .dark-toggle {
      background: transparent;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 6px 10px;
      cursor: pointer;
      font-size: 16px;
    }
    .nav-user {
      color: var(--text-secondary);
      font-size: 13px;
    }
    .btn-login, .btn-logout {
      background: var(--accent);
      border: none;
      border-radius: 8px;
      padding: 8px 16px;
      color: #000;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .btn-logout { background: var(--danger); color: #fff; }
    .btn-login:hover, .btn-logout:hover { opacity: 0.85; }
  `]
})
export class NavbarComponent {
  @Output() showLogin = new EventEmitter<void>();
  @Output() search = new EventEmitter<string>();

  searchQuery = '';
  isDark = signal(true);

  constructor(public auth: AuthService) {}

  onSearch(): void {
    if (this.searchQuery.trim()) this.search.emit(this.searchQuery.trim());
  }

  toggleDark(): void {
    this.isDark.update(v => !v);
    document.documentElement.setAttribute('data-theme', this.isDark() ? 'dark' : 'light');
  }
}
