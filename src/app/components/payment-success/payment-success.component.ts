import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="success-page">
      <div class="success-card">

        @if (state() === 'verifying') {
          <div class="icon spin">⚽</div>
          <h2 class="title">Verificando pago...</h2>
          <p class="msg">Estamos confirmando tu transacción con Wompi.</p>

        } @else if (state() === 'success') {
          <div class="icon">🎉</div>
          <h2 class="title">¡Suscripción activada!</h2>
          <p class="msg">
            Tu plan <strong>{{ auth.planLabel() }}</strong> ya está activo.<br>
            Tienes 30 días de acceso a los picks del admin.
          </p>
          <a routerLink="/stats" class="btn-primary">Ver Mis Apuestas →</a>
          <a routerLink="/" class="btn-secondary">Ir a partidos</a>

        } @else if (state() === 'pending') {
          <div class="icon">⏳</div>
          <h2 class="title">Pago en proceso</h2>
          <p class="msg">
            Tu pago está siendo procesado. Una vez confirmado, tu plan se activará automáticamente.<br>
            Puedes revisar el estado en unos minutos.
          </p>
          <a routerLink="/planes" class="btn-primary">Ver mis planes</a>

        } @else {
          <div class="icon">❌</div>
          <h2 class="title">Pago no completado</h2>
          <p class="msg">{{ errorMsg() }}</p>
          <a routerLink="/planes" class="btn-primary">Intentar de nuevo</a>
        }

      </div>
    </div>
  `,
  styles: [`
    .success-page {
      min-height: 100vh; display: flex; align-items: center;
      justify-content: center; background: var(--bg-primary); padding: 20px;
    }
    .success-card {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: 20px; padding: 52px 40px; max-width: 420px; width: 100%;
      text-align: center; display: flex; flex-direction: column;
      align-items: center; gap: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .icon { font-size: 60px; line-height: 1; }
    .spin { animation: spin 1s linear infinite; display: inline-block; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .title { font-size: 22px; font-weight: 900; color: var(--text-primary); margin: 0; }
    .msg { font-size: 14px; color: var(--text-muted); margin: 0; line-height: 1.7; }
    .msg strong { color: var(--accent); }
    .btn-primary {
      display: block; width: 100%; box-sizing: border-box;
      background: var(--accent); color: #000;
      font-weight: 800; font-size: 14px; padding: 13px 32px;
      border-radius: 10px; text-decoration: none; transition: opacity 0.2s;
    }
    .btn-primary:hover { opacity: 0.85; }
    .btn-secondary {
      font-size: 13px; color: var(--text-muted);
      text-decoration: none; cursor: pointer;
    }
    .btn-secondary:hover { color: var(--text-primary); }
  `],
})
export class PaymentSuccessComponent implements OnInit {
  state    = signal<'verifying' | 'success' | 'pending' | 'error'>('verifying');
  errorMsg = signal('El pago no pudo completarse. Intenta de nuevo.');

  constructor(
    public auth: AuthService,
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const txnId   = this.route.snapshot.queryParamMap.get('id');
    const isTest  = this.route.snapshot.queryParamMap.get('test') === '1';

    if (isTest) {
      this.state.set('success');
      return;
    }

    if (!txnId) {
      this.router.navigate(['/planes']);
      return;
    }

    this.api.verifyWompiTransaction(txnId).subscribe({
      next: res => {
        if (res.activated) {
          this.auth.loadProfile();
          this.state.set('success');
        } else if (res.status === 'PENDING') {
          this.state.set('pending');
        } else {
          this.errorMsg.set(`El pago fue ${res.status?.toLowerCase() ?? 'rechazado'}. Intenta con otro método.`);
          this.state.set('error');
        }
      },
      error: err => {
        this.errorMsg.set(err.error?.detail ?? 'Error verificando el pago.');
        this.state.set('error');
      },
    });
  }
}
