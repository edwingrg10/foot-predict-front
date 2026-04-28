import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ParlayBuilderComponent } from './components/parlay-builder/parlay-builder.component';
import { LandingComponent } from './components/landing/landing.component';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';

interface PlanOption {
  id: string;
  label: string;
  icon: string;
  access: string;
  feature: string;
  color: string;
}

const PLANS: PlanOption[] = [
  { id: 'hincha',  label: 'Hincha',      icon: '🏟️', access: 'Resumen global', feature: 'Stats de rendimiento del admin', color: '#64748b' },
  { id: 'bronce',  label: 'Bronce ⚽',   icon: '⚽',  access: '33% de apuestas', feature: 'Últimas apuestas recientes', color: '#b45309' },
  { id: 'plata',   label: 'Plata 🥈',    icon: '🥈',  access: '66% de apuestas', feature: 'Mayoría de picks del admin', color: '#64748b' },
  { id: 'oro',     label: 'Oro 🏆',      icon: '🏆',  access: '100% de apuestas', feature: 'Acceso completo a todos los picks', color: '#d97706' },
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterOutlet,
    NavbarComponent,
    ParlayBuilderComponent,
    LandingComponent,
  ],
  template: `
    @if (isVerifyRoute()) {
      <router-outlet />

    } @else if (!auth.isLoggedIn()) {
      <!-- ── Landing Page ── -->
      <app-landing
        (openLogin)="openAuthModal('login')"
        (openRegister)="openAuthModal('register')"
      />

      <!-- ── Auth Modal ── -->
      @if (showAuthModal()) {
        <div class="auth-modal-overlay" (click)="closeModal()">
          <div class="auth-modal" (click)="$event.stopPropagation()">
            <button class="modal-close" (click)="closeModal()">×</button>

            <div class="gate-card">
              <div class="gate-tabs">
                <button class="gate-tab" [class.active]="!isRegister()" (click)="isRegister.set(false)">Iniciar sesión</button>
                <button class="gate-tab" [class.active]="isRegister()" (click)="isRegister.set(true)">Registrarse</button>
              </div>

              @if (!isRegister()) {
                <div class="gate-inputs">
                  <input class="gate-input" type="email" placeholder="Email" [(ngModel)]="authEmail" />
                  <input
                    class="gate-input"
                    type="password"
                    placeholder="Contraseña"
                    [(ngModel)]="authPassword"
                    (keyup.enter)="login()"
                  />
                  @if (authError()) {
                    <div class="gate-error">{{ authError() }}</div>
                  }
                  <button class="gate-submit" (click)="login()">Entrar</button>
                </div>

              } @else if (!planSelected()) {
                <div class="gate-inputs plan-step">
                  <p class="plan-intro">Elige tu plan para comenzar</p>
                  <div class="plan-grid">
                    @for (p of plans; track p.id) {
                      <div class="plan-card" [class.plan-active]="selectedPlan() === p.id" (click)="selectedPlan.set(p.id)">
                        <span class="plan-icon">{{ p.icon }}</span>
                        <span class="plan-name">{{ p.label }}</span>
                        <span class="plan-access">{{ p.access }}</span>
                        <span class="plan-feat">{{ p.feature }}</span>
                      </div>
                    }
                  </div>
                  <button class="gate-submit" [disabled]="!selectedPlan()" (click)="planSelected.set(true)">
                    Continuar con plan {{ planLabelOf(selectedPlan()) }}
                  </button>
                  @if (authError()) {
                    <div class="gate-error">{{ authError() }}</div>
                  }
                </div>

              } @else {
                <div class="gate-inputs">
                  <div class="plan-back-row">
                    <button class="plan-back-btn" (click)="planSelected.set(false)">← Cambiar plan</button>
                    <span class="plan-chosen-badge">{{ planLabelOf(selectedPlan()) }}</span>
                  </div>
                  <input class="gate-input" type="text" placeholder="Nombre de usuario" [(ngModel)]="regUsername" />
                  <input class="gate-input" type="email" placeholder="Email" [(ngModel)]="authEmail" />
                  <input
                    class="gate-input"
                    type="password"
                    placeholder="Contraseña"
                    [(ngModel)]="authPassword"
                    (keyup.enter)="register()"
                  />
                  @if (authError()) {
                    <div class="gate-error" [class.gate-success]="registerSuccess()">{{ authError() }}</div>
                  }
                  <button class="gate-submit" (click)="register()">Crear cuenta</button>
                </div>
              }
            </div>

            <p class="gate-disclaimer">
              ⚠️ Solo para análisis estadístico. No constituye asesoramiento de apuestas.
            </p>
          </div>
        </div>
      }

    } @else {
      <!-- ── APP COMPLETA ── -->
      <app-navbar (showLogin)="noop()" (search)="onSearch($event)" />
      <router-outlet />
      <app-parlay-builder />
    }
  `,
  styles: [`
    :host { display: block; }

    /* ── Auth Modal ── */
    .auth-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.7);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .auth-modal {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      width: 100%;
      max-width: 440px;
      animation: modalIn 0.2s ease;
    }
    @keyframes modalIn {
      from { opacity: 0; transform: scale(0.96) translateY(10px); }
      to   { opacity: 1; transform: scale(1)    translateY(0); }
    }
    .modal-close {
      position: absolute;
      top: -12px;
      right: -12px;
      width: 32px; height: 32px;
      border-radius: 50%;
      background: var(--bg-card);
      border: 1px solid var(--border);
      color: var(--text-secondary);
      font-size: 18px; line-height: 1;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
      z-index: 1;
    }
    .modal-close:hover { color: var(--text-primary); border-color: var(--accent); }

    .gate-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      width: 100%;
      max-width: 420px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .gate-tabs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      border-bottom: 1px solid var(--border);
    }
    .gate-tab {
      background: transparent;
      border: none;
      padding: 16px;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.2s;
      border-bottom: 2px solid transparent;
    }
    .gate-tab.active {
      color: var(--text-primary);
      background: var(--bg-input);
      border-bottom-color: var(--accent);
    }
    .gate-inputs {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .gate-input {
      background: var(--bg-input);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 12px 14px;
      color: var(--text-primary);
      font-size: 14px;
      outline: none;
      width: 100%;
      box-sizing: border-box;
    }
    .gate-input:focus { border-color: var(--accent); }
    .gate-error {
      color: #ef4444;
      font-size: 13px;
      padding: 8px 12px;
      background: rgba(239,68,68,0.1);
      border-radius: 6px;
    }
    .gate-error.gate-success {
      color: #10b981;
      background: rgba(16,185,129,0.1);
    }
    .gate-submit {
      background: var(--accent);
      border: none;
      border-radius: 8px;
      padding: 13px;
      color: #000;
      font-weight: 800;
      font-size: 15px;
      cursor: pointer;
      width: 100%;
      transition: opacity 0.2s;
    }
    .gate-submit:hover:not(:disabled) { opacity: 0.85; }
    .gate-submit:disabled { opacity: 0.4; cursor: not-allowed; }
    .gate-disclaimer {
      font-size: 11px;
      color: var(--text-muted);
      text-align: center;
      max-width: 420px;
    }

    /* ── Plan selection ── */
    .plan-step { padding: 20px 20px; }
    .plan-intro {
      font-size: 13px;
      color: var(--text-muted);
      margin: 0;
      text-align: center;
    }
    .plan-intro strong { color: var(--accent); }
    .plan-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .plan-card {
      background: var(--bg-input);
      border: 2px solid var(--border);
      border-radius: 12px;
      padding: 14px 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
    }
    .plan-card:hover { border-color: var(--accent); }
    .plan-card.plan-active {
      border-color: var(--accent);
      background: rgba(16,185,129,0.08);
    }
    .plan-icon { font-size: 28px; line-height: 1; }
    .plan-name { font-size: 13px; font-weight: 800; color: var(--text-primary); }
    .plan-access { font-size: 11px; font-weight: 700; color: var(--accent); }
    .plan-feat { font-size: 10px; color: var(--text-muted); line-height: 1.4; }

    .plan-back-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .plan-back-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 13px;
      cursor: pointer;
      padding: 0;
    }
    .plan-back-btn:hover { color: var(--text-primary); }
    .plan-chosen-badge {
      font-size: 12px;
      font-weight: 700;
      color: var(--accent);
      background: rgba(16,185,129,0.1);
      padding: 3px 10px;
      border-radius: 20px;
      border: 1px solid rgba(16,185,129,0.3);
    }
  `],
})
export class AppComponent implements OnInit {
  isRegister    = signal(false);
  planSelected  = signal(false);
  selectedPlan  = signal<string>('bronce');
  registerSuccess = signal(false);

  authEmail    = '';
  authPassword = '';
  regUsername  = '';
  authError    = signal('');

  isVerifyRoute  = signal(false);
  showAuthModal  = signal(false);

  plans = PLANS;

  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.isVerifyRoute.set(e.urlAfterRedirects?.startsWith('/verify') ?? false);
    });
    const url = window.location.pathname;
    this.isVerifyRoute.set(url.startsWith('/verify'));
  }

  openAuthModal(mode: 'login' | 'register'): void {
    this.authError.set('');
    this.isRegister.set(mode === 'register');
    this.planSelected.set(false);
    this.showAuthModal.set(true);
  }

  closeModal(): void {
    this.showAuthModal.set(false);
    this.authError.set('');
  }

  noop(): void {}

  planLabelOf(id: string): string {
    return PLANS.find(p => p.id === id)?.label ?? id;
  }

  login(): void {
    this.authError.set('');
    this.auth.login(this.authEmail, this.authPassword).subscribe({
      next: () => { this.authEmail = ''; this.authPassword = ''; },
      error: (err) => {
        const msg = err.error?.detail ?? 'Credenciales incorrectas.';
        this.authError.set(msg);
      },
    });
  }

  register(): void {
    this.authError.set('');
    this.registerSuccess.set(false);
    this.auth.register(this.authEmail, this.regUsername, this.authPassword, this.selectedPlan()).subscribe({
      next: (user: any) => {
        if (!user.is_verified) {
          this.registerSuccess.set(true);
          this.authError.set('¡Cuenta creada! Revisa tu email para activarla.');
        } else {
          this.isRegister.set(false);
          this.planSelected.set(false);
          this.authError.set('¡Cuenta creada! Ahora inicia sesión.');
        }
        this.authPassword = '';
      },
      error: (err) => this.authError.set(err.error?.detail || 'Error al registrarse.'),
    });
  }

  onSearch(query: string): void {
    console.log('Search:', query);
  }
}
