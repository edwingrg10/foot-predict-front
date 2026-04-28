import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="verify-page">
      <div class="verify-card">
        @if (state() === 'loading') {
          <div class="verify-icon spin">⚽</div>
          <h2 class="verify-title">Verificando tu cuenta...</h2>
        } @else if (state() === 'success') {
          <div class="verify-icon">✅</div>
          <h2 class="verify-title">¡Cuenta activada!</h2>
          <p class="verify-msg">Hola <strong>{{ username() }}</strong>, tu cuenta está lista. Ya puedes iniciar sesión.</p>
          <a routerLink="/" class="verify-btn">Ir al inicio</a>
        } @else {
          <div class="verify-icon">❌</div>
          <h2 class="verify-title">Enlace inválido</h2>
          <p class="verify-msg">{{ errorMsg() }}</p>
          <a routerLink="/" class="verify-btn secondary">Volver al inicio</a>
        }
      </div>
    </div>
  `,
  styles: [`
    .verify-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-primary);
      padding: 20px;
    }
    .verify-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 48px 40px;
      max-width: 400px;
      width: 100%;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .verify-icon {
      font-size: 56px;
      line-height: 1;
    }
    .spin {
      animation: spin 1s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .verify-title {
      font-size: 22px;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0;
    }
    .verify-msg {
      font-size: 14px;
      color: var(--text-muted);
      margin: 0;
      line-height: 1.6;
    }
    .verify-msg strong { color: var(--accent); }
    .verify-btn {
      display: inline-block;
      background: var(--accent);
      color: #000;
      font-weight: 800;
      font-size: 14px;
      padding: 12px 32px;
      border-radius: 10px;
      text-decoration: none;
      margin-top: 8px;
      transition: opacity 0.2s;
    }
    .verify-btn:hover { opacity: 0.85; }
    .verify-btn.secondary {
      background: var(--bg-input);
      color: var(--text-primary);
      border: 1px solid var(--border);
    }
  `],
})
export class VerifyComponent implements OnInit {
  state    = signal<'loading' | 'success' | 'error'>('loading');
  username = signal('');
  errorMsg = signal('El enlace es inválido o ya fue utilizado.');

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.state.set('error');
      return;
    }
    this.api.verifyAccount(token).subscribe({
      next: res => {
        this.username.set(res.username);
        this.state.set('success');
      },
      error: err => {
        this.errorMsg.set(err.error?.detail ?? 'El enlace es inválido o ya fue utilizado.');
        this.state.set('error');
      },
    });
  }
}
