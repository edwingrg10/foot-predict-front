import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

interface Plan {
  id: string;
  name: string;
  icon: string;
  price: number;
  access: string;
  features: string[];
  highlight: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'bronce', name: 'Bronce', icon: '⚽', price: 5_000,
    access: '33% de los picks',
    features: [
      '33% de las apuestas recientes del admin',
      'Estadísticas globales (win rate, ROI)',
      'Gráfica P&L acumulada',
    ],
    highlight: false,
  },
  {
    id: 'plata', name: 'Plata', icon: '🥈', price: 10_000,
    access: '66% de los picks',
    features: [
      '66% de las apuestas recientes del admin',
      'Estadísticas globales (win rate, ROI)',
      'Gráfica P&L acumulada',
      'Filtros por estado y mercado',
    ],
    highlight: true,
  },
  {
    id: 'oro', name: 'Oro', icon: '🏆', price: 15_000,
    access: '100% de los picks',
    features: [
      'Todos los picks del admin (100%)',
      'Estadísticas globales (win rate, ROI)',
      'Gráfica P&L acumulada',
      'Filtros por estado y mercado',
      'ROI desglosado por liga',
    ],
    highlight: false,
  },
];

@Component({
  selector: 'app-planes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">

      <div class="page-header">
        <h1 class="title">⭐ Planes</h1>
        <p class="subtitle">Accede a los picks del admin · Pago mensual · Cancela cuando quieras</p>
      </div>

      <!-- Active subscription banner -->
      @if (sub()?.status === 'active') {
        <div class="active-banner">
          <span class="active-icon">✅</span>
          <div class="active-info">
            <strong>Plan {{ auth.planLabel() }} activo</strong>
            @if (sub()?.days_left !== null) {
              <span class="active-renew">Vence en {{ sub()?.days_left }} días — {{ formatDate(sub()?.ends_at) }}</span>
            }
          </div>
          <div class="active-note">Renueva con un nuevo pago antes de que venza para mantener el acceso.</div>
        </div>
      }

      @if (sub()?.status === 'expired') {
        <div class="expired-banner">
          ⏰ Tu plan venció. Renueva para seguir viendo los picks.
        </div>
      }

      <!-- Cards -->
      <div class="plans-grid">
        @for (plan of plans; track plan.id) {
          <div class="plan-card"
               [class.plan-highlight]="plan.highlight"
               [class.plan-current]="auth.plan() === plan.id && sub()?.status === 'active'">

            @if (plan.highlight) {
              <div class="badge popular">Más popular</div>
            }
            @if (auth.plan() === plan.id && sub()?.status === 'active') {
              <div class="badge current">Plan actual</div>
            }

            <div class="plan-icon">{{ plan.icon }}</div>
            <div class="plan-name">{{ plan.name }}</div>
            <div class="plan-access">{{ plan.access }}</div>

            <div class="plan-price">
              <span class="price-val">$ {{ plan.price | number:'1.0-0' }}</span>
              <span class="price-unit">COP / mes</span>
            </div>

            <ul class="features">
              @for (f of plan.features; track f) {
                <li>✓ {{ f }}</li>
              }
            </ul>

            <button
              class="btn-pay"
              [class.btn-current]="auth.plan() === plan.id && sub()?.status === 'active'"
              (click)="pay(plan.id)"
              [disabled]="loading() === plan.id"
            >
              @if (loading() === plan.id) {
                Procesando...
              } @else if (auth.plan() === plan.id && sub()?.status === 'active') {
                Renovar plan
              } @else {
                Suscribirse
              }
            </button>
            @if (testMode()) {
              <button class="btn-test" (click)="testActivate(plan.id)" [disabled]="loading() === 'test_' + plan.id">
                @if (loading() === 'test_' + plan.id) { Activando... }
                @else { 🧪 Activar sin pago (prueba) }
              </button>
            }

          </div>
        }
      </div>

      <!-- Free plan info -->
      <div class="free-info">
        <strong>Plan Hincha (gratis):</strong> Solo estadísticas globales del admin, sin picks individuales.
      </div>

      <!-- Payment methods -->
      <div class="methods-row">
        <span class="methods-label">Métodos de pago aceptados por Wompi:</span>
        <div class="methods-list">
          <span class="method">💳 Visa</span>
          <span class="method">💳 Mastercard</span>
          <span class="method">💳 Amex</span>
          <span class="method">🏦 PSE</span>
          <span class="method">📱 Nequi</span>
          <span class="method">🟡 Bancolombia</span>
          <span class="method">🌍 Tarjetas internacionales</span>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .page { padding: 24px; max-width: 860px; margin: 0 auto; }

    .page-header { text-align: center; margin-bottom: 32px; }
    .title { font-size: 26px; font-weight: 900; color: var(--text-primary); margin: 0 0 8px; }
    .subtitle { font-size: 14px; color: var(--text-muted); margin: 0; }

    /* Banners */
    .active-banner {
      display: flex; align-items: flex-start; gap: 14px; flex-wrap: wrap;
      background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.3);
      border-radius: 12px; padding: 16px 20px; margin-bottom: 28px;
    }
    .active-icon { font-size: 22px; }
    .active-info { display: flex; flex-direction: column; gap: 2px; }
    .active-info strong { color: var(--accent); font-size: 15px; }
    .active-renew { font-size: 12px; color: var(--text-muted); }
    .active-note { font-size: 12px; color: var(--text-muted); margin-left: auto; font-style: italic; }

    .expired-banner {
      background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.3);
      border-radius: 12px; padding: 14px 20px; margin-bottom: 28px;
      font-size: 14px; color: #ef4444;
    }

    /* Grid */
    .plans-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 24px;
    }
    @media (max-width: 680px) { .plans-grid { grid-template-columns: 1fr; } }

    .plan-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 28px 20px 22px;
      display: flex; flex-direction: column; align-items: center;
      gap: 12px; position: relative;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .plan-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.2); }
    .plan-highlight {
      border-color: var(--accent);
      box-shadow: 0 0 0 1px var(--accent), 0 8px 32px rgba(16,185,129,0.15);
    }
    .plan-current { border-color: #3b82f6; }

    .badge {
      position: absolute; top: -13px;
      font-size: 11px; font-weight: 800;
      padding: 3px 14px; border-radius: 20px;
    }
    .badge.popular { background: var(--accent); color: #000; }
    .badge.current { background: #3b82f6; color: #fff; }

    .plan-icon { font-size: 42px; line-height: 1; }
    .plan-name { font-size: 20px; font-weight: 900; color: var(--text-primary); }
    .plan-access { font-size: 12px; font-weight: 700; color: var(--accent); background: rgba(16,185,129,0.1); padding: 3px 10px; border-radius: 20px; }

    .plan-price { text-align: center; }
    .price-val { font-size: 30px; font-weight: 900; color: var(--text-primary); }
    .price-unit { font-size: 12px; color: var(--text-muted); margin-left: 4px; }

    .features {
      list-style: none; margin: 0; padding: 0; width: 100%;
      display: flex; flex-direction: column; gap: 6px;
    }
    .features li {
      font-size: 12px; color: var(--text-secondary);
      padding: 5px 0; border-bottom: 1px solid var(--border);
    }
    .features li:last-child { border-bottom: none; }

    .btn-pay {
      width: 100%; border: none; border-radius: 10px;
      padding: 12px; font-size: 14px; font-weight: 800; cursor: pointer;
      background: #fbbf24; color: #000;
      transition: opacity 0.2s; margin-top: 4px;
    }
    .btn-pay:hover:not(:disabled) { opacity: 0.85; }
    .btn-pay:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-pay.btn-current { background: var(--accent); }
    .btn-test {
      width: 100%; border: 1px dashed var(--border); border-radius: 10px;
      padding: 9px; font-size: 12px; font-weight: 600; cursor: pointer;
      background: transparent; color: var(--text-muted);
      transition: all 0.2s;
    }
    .btn-test:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
    .btn-test:disabled { opacity: 0.4; cursor: not-allowed; }

    /* Footer info */
    .free-info {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: 10px; padding: 13px 18px;
      font-size: 13px; color: var(--text-muted); margin-bottom: 16px;
    }
    .free-info strong { color: var(--text-secondary); }

    .methods-row {
      display: flex; flex-direction: column; align-items: center; gap: 10px;
      padding: 16px; background: var(--bg-card); border: 1px solid var(--border);
      border-radius: 10px;
    }
    .methods-label { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
    .methods-list { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
    .method {
      font-size: 12px; color: var(--text-secondary);
      background: var(--bg-input); border: 1px solid var(--border);
      border-radius: 6px; padding: 4px 10px;
    }
  `],
})
export class PlanesComponent implements OnInit {
  plans    = PLANS;
  loading  = signal('');
  sub      = signal<any>(null);
  testMode = signal(true); // set to false once Wompi account is approved

  constructor(public auth: AuthService, private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.api.getMySubscription().subscribe({
      next: s => this.sub.set(s),
      error: () => {},
    });
  }

  pay(planId: string): void {
    this.loading.set(planId);
    this.api.createWompiCheckout(planId).subscribe({
      next:  r => { window.location.href = r.checkout_url; },
      error: () => this.loading.set(''),
    });
  }

  testActivate(planId: string): void {
    this.loading.set('test_' + planId);
    this.api.testActivatePlan(planId).subscribe({
      next: () => {
        this.auth.loadProfile();
        this.router.navigate(['/planes/exito'], { queryParams: { test: '1' } });
      },
      error: () => this.loading.set(''),
    });
  }

  formatDate(iso: string | null): string {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
  }
}
