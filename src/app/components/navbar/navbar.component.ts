import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <nav class="navbar" [class.menu-open]="mobileMenuOpen()">

      <!-- Brand -->
      <div class="nav-brand">
        <a routerLink="/" class="brand-link" (click)="closeMobile()">
          <span class="brand-icon">
            <svg viewBox="0 0 60 46" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="22">
              <path d="M5 16C5 10 10 7 17 7H43C50 7 55 10 55 16V29C55 37 49 42 41 43L34 44.5C31 45 29 45 26 44.5L19 43C11 42 5 37 5 29V16Z"
                stroke="var(--accent)" stroke-width="3.5" fill="none" stroke-linejoin="round"/>
              <rect x="26" y="2" width="8" height="7" rx="2" fill="var(--accent)"/>
              <rect x="17" y="20" width="5" height="14" rx="1.5" fill="var(--accent)"/>
              <rect x="12" y="24" width="15" height="5" rx="1.5" fill="var(--accent)"/>
              <rect x="37" y="13" width="8" height="8" rx="1" fill="var(--bg-card)"/>
              <rect x="37" y="24" width="5" height="5" rx="0.5" fill="var(--accent)"/>
              <rect x="44" y="24" width="5" height="5" rx="0.5" fill="var(--accent)"/>
            </svg>
          </span>
          <span class="brand-name">Foot Predict <span class="brand-ai">IA</span></span>
        </a>
      </div>

      <!-- Desktop: nav links -->
      <div class="nav-links">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" class="nav-link">Partidos</a>
        <a routerLink="/predicciones" routerLinkActive="active" class="nav-link">Predicciones</a>
        <a routerLink="/stats" routerLinkActive="active" class="nav-link nav-bets">💰 Mis Apuestas</a>
        <a routerLink="/planes" routerLinkActive="active" class="nav-link nav-planes">⭐ Planes</a>
        <a routerLink="/chat" routerLinkActive="active" class="nav-link nav-chat">💬 Chat IA</a>
        @if (auth.isAdmin()) {
          <a routerLink="/admin" routerLinkActive="active" class="nav-link nav-admin">⚙️ Admin</a>
        }
      </div>

      <!-- Desktop: search -->
      <div class="nav-search">
        <input class="search-input" type="text" placeholder="Buscar equipo o partido..."
          [(ngModel)]="searchQuery" (keyup.enter)="onSearch()" />
        <button class="search-btn" (click)="onSearch()">🔍</button>
      </div>

      <!-- Desktop: user actions -->
      <div class="nav-actions">
        <button class="dark-toggle" (click)="toggleDark()" title="Cambiar tema">
          {{ isDark() ? '☀️' : '🌙' }}
        </button>
        @if (auth.isLoggedIn()) {
          <span class="nav-user">{{ auth.currentUser()?.username || 'Usuario' }}</span>
          <span class="nav-plan" [attr.data-plan]="auth.plan()">{{ auth.planLabel() }}</span>
          <button class="btn-logout" (click)="auth.logout()">Salir</button>
        }
      </div>

      <!-- Mobile: right side (theme toggle + hamburger) -->
      <div class="nav-mobile-right">
        <button class="dark-toggle" (click)="toggleDark()">{{ isDark() ? '☀️' : '🌙' }}</button>
        <button class="nav-hamburger" (click)="toggleMobile()"
          [class.is-open]="mobileMenuOpen()" aria-label="Menú">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

    </nav>

    <!-- Mobile dropdown menu (outside nav so it doesn't affect sticky height) -->
    @if (mobileMenuOpen()) {
      <div class="nav-mobile-backdrop" (click)="closeMobile()"></div>
      <div class="nav-mobile-menu">
        <a routerLink="/" routerLinkActive="mob-active" [routerLinkActiveOptions]="{exact:true}"
          class="mob-link" (click)="closeMobile()">
          <span class="mob-link-icon">⚽</span> Partidos
        </a>
        <a routerLink="/predicciones" routerLinkActive="mob-active"
          class="mob-link" (click)="closeMobile()">
          <span class="mob-link-icon">📊</span> Predicciones
        </a>
        <a routerLink="/stats" routerLinkActive="mob-active"
          class="mob-link mob-bets" (click)="closeMobile()">
          <span class="mob-link-icon">💰</span> Mis Apuestas
        </a>
        <a routerLink="/planes" routerLinkActive="mob-active"
          class="mob-link mob-planes" (click)="closeMobile()">
          <span class="mob-link-icon">⭐</span> Planes
        </a>
        <a routerLink="/chat" routerLinkActive="mob-active"
          class="mob-link mob-chat" (click)="closeMobile()">
          <span class="mob-link-icon">💬</span> Chat IA
        </a>
        @if (auth.isAdmin()) {
          <a routerLink="/admin" routerLinkActive="mob-active"
            class="mob-link mob-admin" (click)="closeMobile()">
            <span class="mob-link-icon">⚙️</span> Admin
          </a>
        }

        <div class="mob-search">
          <input class="search-input" type="text" placeholder="Buscar equipo o partido..."
            [(ngModel)]="searchQuery" (keyup.enter)="onSearch(); closeMobile()" />
          <button class="search-btn" (click)="onSearch(); closeMobile()">🔍</button>
        </div>

        @if (auth.isLoggedIn()) {
          <div class="mob-user-row">
            <div class="mob-user-info">
              <span class="nav-user">{{ auth.currentUser()?.username || 'Usuario' }}</span>
              <span class="nav-plan" [attr.data-plan]="auth.plan()">{{ auth.planLabel() }}</span>
            </div>
            <button class="btn-logout" (click)="auth.logout(); closeMobile()">Salir</button>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    /* ── Base navbar ── */
    .navbar {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 24px;
      background: var(--bg-card);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 200;
      box-shadow: 0 2px 16px rgba(0,0,0,0.3);
    }
    .nav-brand { min-width: 160px; }
    .brand-link { display: flex; align-items: center; gap: 8px; text-decoration: none; }
    .brand-icon { display: flex; align-items: center; }
    .brand-name { font-size: 18px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.3px; white-space: nowrap; }
    .brand-ai { color: var(--accent); }

    /* ── Desktop nav links ── */
    .nav-links { display: flex; gap: 4px; }
    .nav-link {
      padding: 7px 14px; border-radius: 8px;
      color: var(--text-muted); font-size: 14px; font-weight: 600;
      text-decoration: none; transition: all 0.2s; white-space: nowrap;
    }
    .nav-link:hover { color: var(--text-primary); background: var(--bg-input); }
    .nav-link.active { color: var(--accent); background: rgba(16,185,129,0.1); }
    .nav-chat  { border: 1px solid rgba(129,140,248,0.3); color: #818cf8 !important; }
    .nav-chat:hover, .nav-chat.active  { background: rgba(129,140,248,0.1) !important; color: #818cf8 !important; border-color: #818cf8; }
    .nav-bets  { border: 1px solid rgba(251,191,36,0.3);  color: #fbbf24 !important; }
    .nav-bets:hover, .nav-bets.active  { background: rgba(251,191,36,0.1)  !important; color: #fbbf24 !important; border-color: #fbbf24; }
    .nav-planes{ border: 1px solid rgba(99,91,255,0.3);   color: #a78bfa !important; }
    .nav-planes:hover, .nav-planes.active { background: rgba(99,91,255,0.1) !important; color: #a78bfa !important; border-color: #a78bfa; }
    .nav-admin { border: 1px solid rgba(251,191,36,0.3);  color: #fbbf24 !important; }
    .nav-admin:hover, .nav-admin.active  { background: rgba(251,191,36,0.1)  !important; color: #fbbf24 !important; border-color: #fbbf24; }

    /* ── Desktop search ── */
    .nav-search { flex: 1; display: flex; gap: 8px; max-width: 480px; }
    .search-input {
      flex: 1;
      background: var(--bg-input); border: 1px solid var(--border);
      border-radius: 8px; padding: 8px 14px;
      color: var(--text-primary); font-size: 14px; outline: none;
      transition: border-color 0.2s;
    }
    .search-input:focus { border-color: var(--accent); }
    .search-btn {
      background: var(--accent); border: none; border-radius: 8px;
      padding: 8px 14px; cursor: pointer; font-size: 16px; flex-shrink: 0;
    }

    /* ── Desktop actions ── */
    .nav-actions { display: flex; align-items: center; gap: 12px; margin-left: auto; }
    .dark-toggle {
      background: transparent; border: 1px solid var(--border);
      border-radius: 8px; padding: 6px 10px; cursor: pointer; font-size: 16px;
    }
    .nav-user { color: var(--text-secondary); font-size: 13px; }
    .nav-plan {
      font-size: 11px; font-weight: 700; padding: 3px 9px;
      border-radius: 20px; border: 1px solid var(--border);
      color: var(--text-muted); background: var(--bg-input);
    }
    .nav-plan[data-plan="oro"]   { color: #d97706; border-color: rgba(217,119,6,0.4);    background: rgba(217,119,6,0.08); }
    .nav-plan[data-plan="plata"] { color: #94a3b8; border-color: rgba(148,163,184,0.4);  background: rgba(148,163,184,0.08); }
    .nav-plan[data-plan="bronce"]{ color: #b45309; border-color: rgba(180,83,9,0.4);     background: rgba(180,83,9,0.08); }
    .btn-login, .btn-logout {
      background: var(--accent); border: none; border-radius: 8px;
      padding: 8px 16px; color: #000; font-weight: 700; font-size: 13px;
      cursor: pointer; transition: opacity 0.2s;
    }
    .btn-logout { background: var(--danger); color: #fff; }
    .btn-login:hover, .btn-logout:hover { opacity: 0.85; }

    /* ── Mobile: hide hamburger on desktop ── */
    .nav-mobile-right { display: none; }

    /* ── Mobile menu backdrop + panel ── */
    .nav-mobile-backdrop {
      display: none;
      position: fixed; inset: 0; z-index: 149;
      background: rgba(0,0,0,0.5);
    }
    .nav-mobile-menu {
      display: none;
      position: fixed; top: 57px; left: 0; right: 0;
      z-index: 150;
      background: var(--bg-card);
      border-bottom: 1px solid var(--border);
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      max-height: calc(100vh - 57px);
      overflow-y: auto;
      padding: 8px 0 16px;
      animation: slideDown 0.2s ease;
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ── Mobile breakpoint ── */
    @media (max-width: 768px) {
      .navbar { padding: 10px 16px; gap: 0; justify-content: space-between; }
      .nav-brand { min-width: unset; }
      .brand-name { font-size: 18px; }

      /* Hide desktop items */
      .nav-links, .nav-search, .nav-actions { display: none; }

      /* Show mobile right */
      .nav-mobile-right {
        display: flex; align-items: center; gap: 8px; margin-left: auto;
      }
      .nav-mobile-right .dark-toggle {
        padding: 6px 8px; font-size: 15px;
      }

      /* Show backdrop and menu */
      .nav-mobile-backdrop { display: block; }
      .nav-mobile-menu { display: block; }

      /* Hamburger icon */
      .nav-hamburger {
        display: flex; flex-direction: column; justify-content: center;
        align-items: center; gap: 5px;
        width: 36px; height: 36px; flex-shrink: 0;
        background: transparent; border: 1px solid var(--border);
        border-radius: 8px; cursor: pointer; padding: 0;
        transition: border-color 0.2s;
      }
      .nav-hamburger:hover { border-color: var(--accent); }
      .nav-hamburger span {
        display: block; width: 18px; height: 2px;
        background: var(--text-secondary); border-radius: 1px;
        transition: all 0.25s ease;
        transform-origin: center;
      }
      .nav-hamburger.is-open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
      .nav-hamburger.is-open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
      .nav-hamburger.is-open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

      /* Mobile menu links */
      .mob-link {
        display: flex; align-items: center; gap: 12px;
        padding: 13px 20px;
        color: var(--text-secondary); font-size: 15px; font-weight: 600;
        text-decoration: none; transition: all 0.15s;
        border-left: 3px solid transparent;
      }
      .mob-link:hover { color: var(--text-primary); background: var(--bg-input); }
      .mob-link.mob-active {
        color: var(--accent); background: rgba(0,255,135,0.05);
        border-left-color: var(--accent);
      }
      .mob-link-icon { font-size: 18px; width: 24px; text-align: center; flex-shrink: 0; }
      .mob-bets.mob-active  { color: #fbbf24; background: rgba(251,191,36,0.05); border-left-color: #fbbf24; }
      .mob-planes.mob-active{ color: #a78bfa; background: rgba(167,139,250,0.05); border-left-color: #a78bfa; }
      .mob-chat.mob-active  { color: #818cf8; background: rgba(129,140,248,0.05); border-left-color: #818cf8; }
      .mob-admin.mob-active { color: #fbbf24; background: rgba(251,191,36,0.05); border-left-color: #fbbf24; }

      .mob-search {
        display: flex; gap: 8px; padding: 12px 16px;
        border-top: 1px solid var(--border); margin-top: 4px;
      }
      .mob-search .search-input { flex: 1; }

      .mob-user-row {
        display: flex; align-items: center; justify-content: space-between;
        padding: 12px 16px; border-top: 1px solid var(--border);
        margin-top: 4px; gap: 12px;
      }
      .mob-user-info { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    }
  `]
})
export class NavbarComponent {
  @Output() showLogin = new EventEmitter<void>();
  @Output() search = new EventEmitter<string>();

  searchQuery = '';
  isDark = signal(true);
  mobileMenuOpen = signal(false);

  constructor(public auth: AuthService) {}

  onSearch(): void {
    if (this.searchQuery.trim()) this.search.emit(this.searchQuery.trim());
  }

  toggleDark(): void {
    this.isDark.update(v => !v);
    document.documentElement.setAttribute('data-theme', this.isDark() ? 'dark' : 'light');
  }

  toggleMobile(): void {
    this.mobileMenuOpen.update(v => !v);
  }

  closeMobile(): void {
    this.mobileMenuOpen.set(false);
  }
}
