import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AuthService } from './services/auth.service';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterOutlet,
    NavbarComponent,
  ],
  template: `
    <app-navbar (showLogin)="showLoginModal.set(true)" (search)="onSearch($event)" />
    <router-outlet />

    <!-- Login modal -->
    @if (showLoginModal()) {
      <div class="modal-overlay" (click)="showLoginModal.set(false)">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ isRegister() ? 'Crear cuenta' : 'Iniciar sesión' }}</h2>
            <button class="modal-close" (click)="showLoginModal.set(false)">✕</button>
          </div>
          <div class="modal-body">
            @if (isRegister()) {
              <input class="modal-input" type="text" placeholder="Nombre de usuario" [(ngModel)]="regUsername" />
            }
            <input class="modal-input" type="email" placeholder="Email" [(ngModel)]="authEmail" />
            <input class="modal-input" type="password" placeholder="Contraseña" [(ngModel)]="authPassword" />

            @if (authError()) {
              <div class="auth-error">{{ authError() }}</div>
            }

            <button class="modal-submit" (click)="isRegister() ? register() : login()">
              {{ isRegister() ? 'Registrarse' : 'Entrar' }}
            </button>

            <button class="modal-toggle" (click)="toggleRegister()">
              {{ isRegister() ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(4px);
    }
    .modal {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      width: 380px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid var(--border);
    }
    .modal-header h2 { font-size: 18px; font-weight: 800; margin: 0; }
    .modal-close {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 18px;
      cursor: pointer;
      padding: 4px 8px;
    }
    .modal-body {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .modal-input {
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
    .modal-input:focus { border-color: var(--accent); }
    .auth-error {
      color: #ef4444;
      font-size: 13px;
      padding: 8px 12px;
      background: rgba(239,68,68,0.1);
      border-radius: 6px;
    }
    .modal-submit {
      background: var(--accent);
      border: none;
      border-radius: 8px;
      padding: 12px;
      color: #000;
      font-weight: 800;
      font-size: 15px;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .modal-submit:hover { opacity: 0.85; }
    .modal-toggle {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 13px;
      cursor: pointer;
      text-align: center;
    }
    .modal-toggle:hover { color: var(--accent); }
  `]
})
export class AppComponent {
  showLoginModal = signal(false);
  isRegister = signal(false);
  authEmail = '';
  authPassword = '';
  regUsername = '';
  authError = signal('');

  constructor(public auth: AuthService) {}

  toggleRegister(): void {
    this.isRegister.update(v => !v);
  }

  login(): void {
    this.authError.set('');
    this.auth.login(this.authEmail, this.authPassword).subscribe({
      next: () => this.showLoginModal.set(false),
      error: () => this.authError.set('Credenciales incorrectas. Intenta de nuevo.'),
    });
  }

  register(): void {
    this.authError.set('');
    this.auth.register(this.authEmail, this.regUsername, this.authPassword).subscribe({
      next: () => {
        this.isRegister.set(false);
        this.authError.set('Cuenta creada. Ahora inicia sesión.');
      },
      error: (err) => this.authError.set(err.error?.detail || 'Error al registrarse.'),
    });
  }

  onSearch(query: string): void {
    console.log('Search:', query);
  }
}
