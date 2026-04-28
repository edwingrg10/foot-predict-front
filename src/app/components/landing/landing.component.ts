import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="landing">

      <!-- ── Sticky Nav ── -->
      <nav class="ln-nav">
        <div class="ln-brand">
          <span class="ln-brand-icon">
            <svg viewBox="0 0 60 46" fill="none" xmlns="http://www.w3.org/2000/svg" width="30" height="23">
              <path d="M5 16C5 10 10 7 17 7H43C50 7 55 10 55 16V29C55 37 49 42 41 43L34 44.5C31 45 29 45 26 44.5L19 43C11 42 5 37 5 29V16Z"
                stroke="#39ff5a" stroke-width="3.5" fill="none" stroke-linejoin="round"/>
              <rect x="26" y="2" width="8" height="7" rx="2" fill="#39ff5a"/>
              <rect x="17" y="20" width="5" height="14" rx="1.5" fill="#39ff5a"/>
              <rect x="12" y="24" width="15" height="5" rx="1.5" fill="#39ff5a"/>
              <rect x="37" y="13" width="8" height="8" rx="1" fill="white"/>
              <rect x="37" y="24" width="5" height="5" rx="0.5" fill="#39ff5a"/>
              <rect x="44" y="24" width="5" height="5" rx="0.5" fill="#39ff5a"/>
            </svg>
          </span>
          <span class="ln-brand-name">Foot Predict <span class="ln-brand-ai">IA</span></span>
        </div>
        <div class="ln-nav-btns">
          <a class="ln-btn-tg-nav" href="https://t.me/+3JI2TWICJEU2ZmIx" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
            <span class="tg-nav-full">Canal Telegram</span>
            <span class="tg-nav-short">Telegram</span>
          </a>
          <button class="ln-btn-ghost" (click)="openLogin.emit()">Iniciar sesión</button>
          <button class="ln-btn-primary-sm" (click)="openRegister.emit()">
            <span class="btn-text-full">Registrarse gratis</span>
            <span class="btn-text-short">Registrarse</span>
          </button>
        </div>
      </nav>

      <!-- ── Hero ── -->
      <section class="ln-hero">
        <div class="ln-hero-content">
          <div class="ln-hero-badge">
            <span class="ln-badge-pulse"></span>
            Predicciones actualizadas dos veces al día
          </div>
          <h1 class="ln-h1">
            Gana más con<br>
            <span class="ln-gradient-text">predicciones de IA</span>
          </h1>
          <p class="ln-hero-desc">
            6 modelos XGBoost analizan +60 variables por partido.
            <strong>Premier League, La Liga, UCL y más.</strong>
            Value bets automáticos, parlay builder y predicciones de goles, córneres y tarjetas.
          </p>
          <div class="ln-hero-actions">
            <button class="ln-btn-hero" (click)="openRegister.emit()">
              Empezar gratis <span>→</span>
            </button>
            <button class="ln-btn-ghost-lg" (click)="openLogin.emit()">
              Ya tengo cuenta
            </button>
          </div>
          <div class="ln-hero-trust">
            <span>✅ Sin tarjeta de crédito</span>
            <span>✅ Plan gratuito disponible</span>
            <span>✅ Datos de Sofascore</span>
          </div>
          <a class="ln-hero-tg" href="https://t.me/+3JI2TWICJEU2ZmIx" target="_blank" rel="noopener">
            <span class="ln-hero-tg-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
            </span>
            <span>Únete gratis al canal de Telegram — picks en tiempo real</span>
            <span class="ln-hero-tg-arr">→</span>
          </a>
        </div>

        <div class="ln-hero-visual">
          <div class="ln-mock">
            <div class="ln-mock-header">
              <span class="ln-mock-league">🇪🇸 La Liga · El Clásico</span>
              <span class="ln-mock-time">HOY 20:00</span>
            </div>
            <div class="ln-mock-teams">
              <div class="ln-mock-team">
                <div class="ln-mock-badge">
                  <img src="https://img.sofascore.com/api/v1/team/2829/image" alt="Real Madrid" />
                </div>
                <span>Real Madrid</span>
              </div>
              <div class="ln-mock-vs">VS</div>
              <div class="ln-mock-team ln-mock-team-r">
                <div class="ln-mock-badge">
                  <img src="https://img.sofascore.com/api/v1/team/2817/image" alt="Barcelona" />
                </div>
                <span>Barcelona</span>
              </div>
            </div>
            <div class="ln-mock-section-lbl">Predicción IA</div>
            <div class="ln-mock-bars">
              <div class="ln-mock-bar">
                <span class="ln-bar-lbl">Local</span>
                <div class="ln-bar-track"><div class="ln-bar-fill ln-bar-h" style="width:38%"></div></div>
                <span class="ln-bar-pct">38%</span>
              </div>
              <div class="ln-mock-bar">
                <span class="ln-bar-lbl">Empate</span>
                <div class="ln-bar-track"><div class="ln-bar-fill ln-bar-d" style="width:28%"></div></div>
                <span class="ln-bar-pct">28%</span>
              </div>
              <div class="ln-mock-bar">
                <span class="ln-bar-lbl">Visitante</span>
                <div class="ln-bar-track"><div class="ln-bar-fill ln-bar-a" style="width:34%"></div></div>
                <span class="ln-bar-pct">34%</span>
              </div>
            </div>
            <div class="ln-mock-vbet ln-mock-vbet-winner">
              <span class="ln-vbet-icon">🏆</span>
              <div class="ln-vbet-body">
                <span class="ln-vbet-title">
                  Ambos marcan
                  <span class="ln-winner-badge">GANADORA</span>
                </span>
                <span class="ln-vbet-sub">BTTS · 78% prob · Valor +22%</span>
              </div>
              <span class="ln-vbet-arr">→</span>
            </div>
            <div class="ln-mock-smart">
              🎰 Smart Bet: Ambos marcan &#64; 1.65
            </div>
          </div>
          <div class="ln-mock-chip ln-chip1">📊 La Liga · Hoy</div>
          <div class="ln-mock-chip ln-chip2">🏆 UCL picks</div>
        </div>
      </section>

      <!-- ── Stats bar ── -->
      <div class="ln-stats-bar">
        @for (s of stats; track s.num) {
          <div class="ln-stat">
            <span class="ln-stat-num">{{ s.num }}</span>
            <span class="ln-stat-lbl">{{ s.lbl }}</span>
          </div>
          @if (!$last) {
            <div class="ln-stat-div"></div>
          }
        }
      </div>

      <!-- ── Telegram banner ── -->
      <a class="ln-tg-banner" href="https://t.me/+3JI2TWICJEU2ZmIx" target="_blank" rel="noopener">
        <div class="ln-tg-logo">
          <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
        </div>
        <div class="ln-tg-text">
          <span class="ln-tg-title">📢 Canal de Telegram — Picks en tiempo real</span>
          <span class="ln-tg-sub">Recibe value bets, alertas de partidos y predicciones antes de que empiecen. ¡Gratis!</span>
        </div>
        <div class="ln-tg-cta">
          Unirse al canal →
        </div>
      </a>

      <!-- ── Features ── -->
      <section class="ln-section">
        <div class="ln-section-hdr">
          <p class="ln-overline">FUNCIONALIDADES</p>
          <h2 class="ln-h2">Todo para apostar <span class="ln-gradient-text">con ventaja real</span></h2>
          <p class="ln-section-desc">IA aplicada al análisis de fútbol, actualizada dos veces al día</p>
        </div>
        <div class="ln-feat-grid">
          @for (f of features; track f.title) {
            <div class="ln-feat">
              <div class="ln-feat-ico">{{ f.icon }}</div>
              <h3 class="ln-feat-title">{{ f.title }}</h3>
              <p class="ln-feat-desc">{{ f.desc }}</p>
            </div>
          }
        </div>
      </section>

      <!-- ── How it works ── -->
      <section class="ln-how-section">
        <div class="ln-section-inner">
          <div class="ln-section-hdr">
            <p class="ln-overline">EL PROCESO</p>
            <h2 class="ln-h2">¿Cómo funciona?</h2>
          </div>
          <div class="ln-steps">
            <div class="ln-step">
              <div class="ln-step-num">01</div>
              <h3>Recopila datos</h3>
              <p>Scrapeamos Sofascore automáticamente: xG, posesión, forma reciente, H2H y +60 variables por partido.</p>
            </div>
            <div class="ln-step-arrow">→</div>
            <div class="ln-step">
              <div class="ln-step-num">02</div>
              <h3>Entrena la IA</h3>
              <p>6 modelos XGBoost aprenden patrones de miles de partidos históricos y se re-entrenan con cada resultado.</p>
            </div>
            <div class="ln-step-arrow">→</div>
            <div class="ln-step">
              <div class="ln-step-num">03</div>
              <h3>Recibe tus picks</h3>
              <p>Accede a predicciones con probabilidades reales, value bets identificados y el mejor parlay del día.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Plans ── -->
      <section class="ln-plans-section">
        <div class="ln-section-inner">
          <div class="ln-section-hdr">
            <p class="ln-overline">PRECIOS</p>
            <h2 class="ln-h2">Elige tu <span class="ln-gradient-text">plan</span></h2>
            <p class="ln-section-desc">Empieza gratis. Actualiza cuando quieras.</p>
          </div>
          <div class="ln-plans-grid">
            @for (p of pricingPlans; track p.name) {
              <div class="ln-plan" [class.ln-plan-featured]="p.featured">
                @if (p.featured) {
                  <div class="ln-plan-badge">⭐ MÁS POPULAR</div>
                }
                <div class="ln-plan-icon">{{ p.icon }}</div>
                <h3 class="ln-plan-name">{{ p.name }}</h3>
                <div class="ln-plan-price">
                  <span class="ln-price-num">{{ p.price }}</span>
                  @if (p.period) {
                    <span class="ln-price-period">{{ p.period }}</span>
                  }
                </div>
                <div class="ln-plan-access">{{ p.access }}</div>
                <ul class="ln-plan-feats">
                  @for (f of p.features; track f) {
                    <li>✓ {{ f }}</li>
                  }
                </ul>
                <button class="ln-plan-cta" [class.ln-plan-cta-green]="p.featured" (click)="openRegister.emit()">
                  {{ p.cta }}
                </button>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- ── Final CTA ── -->
      <section class="ln-final-cta">
        <h2 class="ln-h2">¿Listo para empezar?</h2>
        <p>Únete gratis y analiza partidos de hoy mismo con IA.</p>
        <div class="ln-final-btns">
          <button class="ln-btn-hero ln-final-btn" (click)="openRegister.emit()">
            Crear cuenta gratis →
          </button>
          <a class="ln-btn-tg-final" href="https://t.me/+3JI2TWICJEU2ZmIx" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
            Unirse al canal
          </a>
        </div>
      </section>

      <!-- ── Footer ── -->
      <footer class="ln-footer">
        <div class="ln-footer-brand">
          <svg viewBox="0 0 60 46" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="17" style="vertical-align:middle;margin-right:6px">
            <path d="M5 16C5 10 10 7 17 7H43C50 7 55 10 55 16V29C55 37 49 42 41 43L34 44.5C31 45 29 45 26 44.5L19 43C11 42 5 37 5 29V16Z"
              stroke="var(--accent)" stroke-width="3.5" fill="none" stroke-linejoin="round"/>
            <rect x="26" y="2" width="8" height="7" rx="2" fill="var(--accent)"/>
            <rect x="17" y="20" width="5" height="14" rx="1.5" fill="var(--accent)"/>
            <rect x="12" y="24" width="15" height="5" rx="1.5" fill="var(--accent)"/>
            <rect x="37" y="13" width="8" height="8" rx="1" fill="var(--bg-card)"/>
            <rect x="37" y="24" width="5" height="5" rx="0.5" fill="var(--accent)"/>
            <rect x="44" y="24" width="5" height="5" rx="0.5" fill="var(--accent)"/>
          </svg>
          Foot Predict IA
        </div>
        <p class="ln-footer-disc">
          ⚠️ Esta plataforma es exclusivamente para análisis estadístico.
          No constituye asesoramiento financiero ni de apuestas.
          Juega siempre con responsabilidad.
        </p>
      </footer>

    </div>
  `,
  styles: [`
    .landing {
      min-height: 100vh;
      background: var(--bg-primary);
      color: var(--text-primary);
      overflow-x: hidden;
    }

    /* ── Nav ── */
    .ln-nav {
      position: sticky;
      top: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 40px;
      background: rgba(13,17,23,0.92);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
    }
    .ln-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 20px;
      font-weight: 800;
      color: var(--text-primary);
    }
    .ln-brand-icon { display: flex; align-items: center; }
    .ln-brand-ai { color: var(--accent); }
    .ln-nav-btns { display: flex; gap: 8px; align-items: center; }
    .ln-btn-ghost {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text-secondary);
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .ln-btn-ghost:hover { border-color: var(--accent); color: var(--text-primary); }
    .ln-btn-primary-sm {
      background: var(--accent);
      border: none;
      color: #000;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 800;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .ln-btn-primary-sm:hover { opacity: 0.85; }

    /* ── Hero ── */
    .ln-hero {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 64px;
      align-items: center;
      padding: 80px 80px 60px;
      max-width: 1280px;
      margin: 0 auto;
      position: relative;
    }
    .ln-hero::before {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse at 15% 50%, rgba(0,255,135,0.06) 0%, transparent 55%);
      pointer-events: none;
    }
    .ln-hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(0,255,135,0.08);
      border: 1px solid rgba(0,255,135,0.25);
      color: var(--accent);
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .ln-badge-pulse {
      width: 7px; height: 7px;
      background: var(--accent);
      border-radius: 50%;
      animation: bpulse 2s infinite;
    }
    @keyframes bpulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.75); }
    }
    .ln-h1 {
      font-size: 58px;
      font-weight: 900;
      line-height: 1.1;
      margin: 0 0 22px;
    }
    .ln-gradient-text {
      background: linear-gradient(135deg, #00ff87 0%, #00d4ff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .ln-hero-desc {
      font-size: 17px;
      color: var(--text-secondary);
      line-height: 1.7;
      margin: 0 0 32px;
      max-width: 500px;
    }
    .ln-hero-desc strong { color: var(--text-primary); }
    .ln-hero-actions {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .ln-btn-hero {
      background: var(--accent);
      border: none;
      color: #000;
      padding: 14px 28px;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 800;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
      box-shadow: 0 0 30px rgba(0,255,135,0.25);
    }
    .ln-btn-hero:hover {
      transform: translateY(-2px);
      box-shadow: 0 0 44px rgba(0,255,135,0.4);
    }
    .ln-btn-ghost-lg {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text-secondary);
      padding: 14px 24px;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .ln-btn-ghost-lg:hover { border-color: var(--text-secondary); color: var(--text-primary); }
    .ln-hero-trust {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
    .ln-hero-trust span { font-size: 12px; color: var(--text-muted); }

    /* ── Mock Card ── */
    .ln-hero-visual { position: relative; }
    .ln-mock {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 32px 80px rgba(0,0,0,0.4), 0 0 50px rgba(0,255,135,0.07);
      animation: float 6s ease-in-out infinite;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    .ln-mock-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 13px 16px;
      border-bottom: 1px solid var(--border);
      background: var(--bg-input);
    }
    .ln-mock-league { font-size: 12px; color: var(--text-secondary); font-weight: 600; }
    .ln-mock-time { font-size: 11px; color: var(--accent); font-weight: 700; }
    .ln-mock-teams {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      gap: 8px;
    }
    .ln-mock-team {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      flex: 1;
    }
    .ln-mock-team-r { align-items: flex-end; }
    .ln-mock-badge {
      width: 48px; height: 48px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .ln-mock-badge img {
      width: 48px; height: 48px;
      object-fit: contain;
      filter: drop-shadow(0 2px 6px rgba(0,0,0,0.5));
    }
    .ln-mock-team span { font-size: 13px; font-weight: 700; color: var(--text-primary); }
    .ln-mock-vs { font-size: 12px; font-weight: 700; color: var(--text-muted); flex-shrink: 0; }
    .ln-mock-section-lbl {
      font-size: 11px; font-weight: 700;
      color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;
      padding: 0 16px 8px;
    }
    .ln-mock-bars { padding: 0 16px 14px; display: flex; flex-direction: column; gap: 8px; }
    .ln-mock-bar { display: flex; align-items: center; gap: 8px; }
    .ln-bar-lbl { font-size: 11px; color: var(--text-muted); width: 60px; flex-shrink: 0; }
    .ln-bar-track {
      flex: 1; height: 6px;
      background: var(--bg-input);
      border-radius: 3px; overflow: hidden;
    }
    .ln-bar-fill { height: 100%; border-radius: 3px; transition: width 1s ease; }
    .ln-bar-h { background: var(--accent); }
    .ln-bar-d { background: #fbbf24; }
    .ln-bar-a { background: #ef4444; }
    .ln-bar-pct { font-size: 12px; font-weight: 700; color: var(--text-primary); width: 32px; text-align: right; flex-shrink: 0; }
    .ln-mock-vbet {
      margin: 0 12px 10px;
      background: rgba(0,255,135,0.06);
      border: 1px solid rgba(0,255,135,0.2);
      border-radius: 10px;
      padding: 10px 12px;
      display: flex; align-items: center; gap: 10px;
    }
    .ln-mock-vbet-winner {
      background: rgba(251,191,36,0.08);
      border-color: rgba(251,191,36,0.45);
      box-shadow: 0 0 16px rgba(251,191,36,0.12);
    }
    .ln-mock-vbet-winner .ln-vbet-title { color: #fbbf24; }
    .ln-mock-vbet-winner .ln-vbet-arr  { color: #fbbf24; }
    .ln-winner-badge {
      display: inline-block;
      background: #fbbf24;
      color: #000;
      font-size: 9px;
      font-weight: 900;
      padding: 2px 6px;
      border-radius: 4px;
      margin-left: 6px;
      letter-spacing: 0.5px;
      vertical-align: middle;
    }
    .ln-vbet-icon { font-size: 18px; flex-shrink: 0; }
    .ln-vbet-body { flex: 1; }
    .ln-vbet-title { display: flex; align-items: center; font-size: 12px; font-weight: 700; color: var(--accent); }
    .ln-vbet-sub { display: block; font-size: 11px; color: var(--text-muted); margin-top: 1px; }
    .ln-vbet-arr { font-size: 14px; color: var(--accent); font-weight: 700; }
    .ln-mock-smart {
      margin: 0 12px 14px;
      background: rgba(251,191,36,0.06);
      border: 1px solid rgba(251,191,36,0.2);
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 12px; color: #fbbf24; font-weight: 600;
    }
    .ln-mock-chip {
      position: absolute;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 6px 14px;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-secondary);
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    .ln-chip1 { top: -16px; right: 20px; animation: float 7s ease-in-out infinite 1s; }
    .ln-chip2 { bottom: -14px; left: 20px; animation: float 5s ease-in-out infinite 0.5s; }

    /* ── Stats Bar ── */
    .ln-stats-bar {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 32px 40px;
      background: var(--bg-card);
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      flex-wrap: wrap;
      gap: 0;
    }
    .ln-stat { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 48px; }
    .ln-stat-num { font-size: 38px; font-weight: 900; color: var(--accent); line-height: 1; }
    .ln-stat-lbl { font-size: 13px; color: var(--text-muted); text-align: center; }
    .ln-stat-div { width: 1px; height: 40px; background: var(--border); }

    /* ── Sections common ── */
    .ln-section {
      max-width: 1200px;
      margin: 0 auto;
      padding: 80px 40px;
    }
    .ln-section-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 80px 40px;
    }
    .ln-section-hdr { text-align: center; margin-bottom: 56px; }
    .ln-overline {
      font-size: 12px; font-weight: 700; letter-spacing: 2px;
      color: var(--accent); text-transform: uppercase;
      margin: 0 0 12px;
    }
    .ln-h2 { font-size: 40px; font-weight: 900; line-height: 1.2; margin: 0 0 14px; }
    .ln-section-desc { font-size: 16px; color: var(--text-secondary); margin: 0; }

    /* ── Features ── */
    .ln-feat-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    .ln-feat {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 28px 24px;
      transition: all 0.25s;
    }
    .ln-feat:hover {
      border-color: rgba(0,255,135,0.3);
      transform: translateY(-4px);
      box-shadow: 0 16px 40px rgba(0,0,0,0.2);
    }
    .ln-feat-ico { font-size: 36px; margin-bottom: 16px; }
    .ln-feat-title { font-size: 16px; font-weight: 700; margin: 0 0 8px; color: var(--text-primary); }
    .ln-feat-desc { font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin: 0; }

    /* ── How it works ── */
    .ln-how-section {
      background: linear-gradient(180deg, transparent, rgba(0,255,135,0.025), transparent);
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
    }
    .ln-steps {
      display: flex;
      align-items: flex-start;
      gap: 20px;
    }
    .ln-step {
      flex: 1;
      text-align: center;
      padding: 32px 24px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 16px;
    }
    .ln-step-num {
      font-size: 52px; font-weight: 900;
      color: rgba(0,255,135,0.15); line-height: 1; margin-bottom: 16px;
    }
    .ln-step h3 { font-size: 18px; font-weight: 700; margin: 0 0 10px; }
    .ln-step p { font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin: 0; }
    .ln-step-arrow {
      font-size: 24px; color: var(--accent);
      align-self: center; flex-shrink: 0; font-weight: 700;
    }

    /* ── Plans ── */
    .ln-plans-section {
      background: var(--bg-card);
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
    }
    .ln-plans-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }
    .ln-plan {
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 28px 20px;
      position: relative;
      transition: transform 0.2s;
    }
    .ln-plan:hover { transform: translateY(-4px); }
    .ln-plan-featured {
      border-color: rgba(0,255,135,0.4);
      background: linear-gradient(180deg, rgba(0,255,135,0.04) 0%, var(--bg-primary) 35%);
      box-shadow: 0 0 30px rgba(0,255,135,0.07);
    }
    .ln-plan-badge {
      position: absolute; top: -13px; left: 50%;
      transform: translateX(-50%);
      background: var(--accent); color: #000;
      font-size: 11px; font-weight: 800;
      padding: 4px 14px; border-radius: 20px; white-space: nowrap;
    }
    .ln-plan-icon { font-size: 36px; margin-bottom: 12px; }
    .ln-plan-name { font-size: 20px; font-weight: 800; margin: 0 0 12px; }
    .ln-plan-price { display: flex; align-items: baseline; gap: 4px; margin-bottom: 6px; }
    .ln-price-num { font-size: 28px; font-weight: 900; }
    .ln-price-period { font-size: 13px; color: var(--text-muted); }
    .ln-plan-access { font-size: 13px; font-weight: 700; color: var(--accent); margin-bottom: 20px; }
    .ln-plan-feats {
      list-style: none; padding: 0; margin: 0 0 24px;
      display: flex; flex-direction: column; gap: 8px;
    }
    .ln-plan-feats li { font-size: 13px; color: var(--text-secondary); }
    .ln-plan-cta {
      width: 100%; padding: 12px; border-radius: 8px;
      font-size: 14px; font-weight: 800; cursor: pointer; transition: all 0.2s;
      border: 1px solid var(--border);
      background: var(--bg-card); color: var(--text-primary);
    }
    .ln-plan-cta:hover { border-color: var(--accent); color: var(--accent); }
    .ln-plan-cta-green {
      background: var(--accent); border-color: var(--accent); color: #000;
    }
    .ln-plan-cta-green:hover { opacity: 0.85; color: #000; }

    /* ── Final CTA ── */
    .ln-final-cta {
      text-align: center;
      padding: 100px 40px;
      background: radial-gradient(ellipse at center, rgba(0,255,135,0.06) 0%, transparent 65%);
      border-top: 1px solid var(--border);
    }
    .ln-final-cta .ln-h2 { margin-bottom: 12px; }
    .ln-final-cta p { font-size: 16px; color: var(--text-secondary); margin: 0 0 32px; }
    .ln-final-btn { font-size: 17px; padding: 16px 40px; }

    /* ── Footer ── */
    .ln-footer {
      border-top: 1px solid var(--border);
      padding: 32px 40px; text-align: center;
    }
    .ln-footer-brand { font-size: 18px; font-weight: 800; margin-bottom: 12px; }
    .ln-footer-disc {
      font-size: 12px; color: var(--text-muted);
      max-width: 600px; margin: 0 auto; line-height: 1.6;
    }

    /* ── Telegram — nav button ── */
    .ln-btn-tg-nav {
      display: inline-flex; align-items: center; gap: 6px;
      background: #229ED9; color: #fff;
      padding: 8px 14px; border-radius: 8px;
      font-size: 13px; font-weight: 700;
      text-decoration: none; transition: opacity 0.2s;
      white-space: nowrap;
    }
    .ln-btn-tg-nav:hover { opacity: 0.85; }
    .tg-nav-short { display: none; }
    .tg-nav-full  { display: inline; }

    /* ── Telegram — hero link ── */
    .ln-hero-tg {
      display: inline-flex; align-items: center; gap: 10px;
      background: rgba(34,158,217,0.08);
      border: 1px solid rgba(34,158,217,0.35);
      border-radius: 10px;
      padding: 10px 16px;
      color: #229ED9; font-size: 13px; font-weight: 600;
      text-decoration: none; transition: all 0.2s;
      margin-top: 16px;
    }
    .ln-hero-tg:hover {
      background: rgba(34,158,217,0.15);
      border-color: rgba(34,158,217,0.6);
    }
    .ln-hero-tg-icon {
      display: flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; border-radius: 50%;
      background: #229ED9; flex-shrink: 0;
      color: #fff;
    }
    .ln-hero-tg-arr { margin-left: auto; font-weight: 700; flex-shrink: 0; }

    /* ── Telegram — full-width banner ── */
    .ln-tg-banner {
      display: flex; align-items: center; gap: 20px;
      padding: 20px 40px;
      background: linear-gradient(135deg, rgba(34,158,217,0.12) 0%, rgba(34,158,217,0.05) 100%);
      border-top: 1px solid rgba(34,158,217,0.25);
      border-bottom: 1px solid rgba(34,158,217,0.25);
      text-decoration: none; transition: background 0.2s;
      cursor: pointer;
    }
    .ln-tg-banner:hover { background: linear-gradient(135deg, rgba(34,158,217,0.18) 0%, rgba(34,158,217,0.09) 100%); }
    .ln-tg-logo {
      width: 56px; height: 56px; border-radius: 50%;
      background: #229ED9; display: flex; align-items: center;
      justify-content: center; flex-shrink: 0;
      color: #fff;
      box-shadow: 0 4px 16px rgba(34,158,217,0.35);
    }
    .ln-tg-text { flex: 1; min-width: 0; }
    .ln-tg-title {
      display: block; font-size: 16px; font-weight: 800;
      color: var(--text-primary); margin-bottom: 4px;
    }
    .ln-tg-sub {
      display: block; font-size: 13px; color: var(--text-secondary);
      line-height: 1.5;
    }
    .ln-tg-cta {
      background: #229ED9; color: #fff;
      padding: 10px 20px; border-radius: 10px;
      font-size: 14px; font-weight: 800;
      white-space: nowrap; flex-shrink: 0;
      transition: opacity 0.2s;
    }
    .ln-tg-banner:hover .ln-tg-cta { opacity: 0.9; }

    /* ── Telegram — final CTA ── */
    .ln-final-btns {
      display: flex; gap: 12px; justify-content: center;
      flex-wrap: wrap;
    }
    .ln-btn-tg-final {
      display: inline-flex; align-items: center; gap: 8px;
      background: #229ED9; color: #fff;
      padding: 16px 28px; border-radius: 10px;
      font-size: 16px; font-weight: 800;
      text-decoration: none; transition: all 0.2s;
      box-shadow: 0 0 24px rgba(34,158,217,0.3);
    }
    .ln-btn-tg-final:hover {
      transform: translateY(-2px);
      box-shadow: 0 0 36px rgba(34,158,217,0.45);
    }

    /* ── Button text variants ── */
    .btn-text-short { display: none; }
    .btn-text-full  { display: inline; }

    /* ── Responsive ── */
    @media (max-width: 1100px) {
      .ln-feat-grid { grid-template-columns: repeat(2, 1fr); }
      .ln-plans-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 768px) {
      /* Nav */
      .ln-nav { padding: 10px 16px; }
      .ln-brand { gap: 6px; }
      .ln-brand-name { font-size: 17px; }
      .ln-brand-ball { font-size: 18px; }
      .ln-btn-ghost { display: none; }
      .ln-btn-primary-sm { padding: 8px 12px; font-size: 13px; }
      .btn-text-full { display: none; }
      .btn-text-short { display: inline; }
      .ln-btn-tg-nav { padding: 8px 10px; font-size: 12px; }
      .tg-nav-full { display: none; }
      .tg-nav-short { display: inline; }

      /* Telegram banner */
      .ln-tg-banner { padding: 16px 16px; gap: 12px; }
      .ln-tg-logo { width: 44px; height: 44px; }
      .ln-tg-logo svg { width: 24px; height: 24px; }
      .ln-tg-title { font-size: 14px; }
      .ln-tg-sub { font-size: 12px; display: none; }
      .ln-tg-cta { padding: 8px 14px; font-size: 13px; }

      /* Hero Telegram */
      .ln-hero-tg { font-size: 12px; padding: 9px 12px; }
      .ln-hero-tg-icon { width: 28px; height: 28px; }

      /* Final CTA */
      .ln-final-btns { flex-direction: column; align-items: center; }
      .ln-btn-tg-final { width: 100%; justify-content: center; font-size: 15px; }

      /* Hero */
      .ln-hero {
        grid-template-columns: 1fr;
        padding: 32px 16px 40px;
        gap: 36px;
      }
      .ln-hero::before { background: radial-gradient(ellipse at 50% 0%, rgba(0,255,135,0.06) 0%, transparent 60%); }
      .ln-hero-badge { font-size: 12px; padding: 5px 12px; }
      .ln-h1 { font-size: 34px; }
      .ln-hero-desc { font-size: 15px; max-width: 100%; }
      .ln-hero-actions { flex-direction: column; gap: 10px; }
      .ln-btn-hero { width: 100%; justify-content: center; font-size: 15px; }
      .ln-btn-ghost-lg { width: 100%; justify-content: center; font-size: 14px; }
      .ln-hero-trust { gap: 8px; }

      /* Mock card: slightly smaller */
      .ln-mock-chip { display: none; }
      .ln-mock-header { padding: 10px 14px; }
      .ln-mock-teams { padding: 12px 14px; }
      .ln-mock-bars { padding: 0 14px 10px; }
      .ln-mock-vbet { margin: 0 10px 8px; }
      .ln-mock-smart { margin: 0 10px 12px; }

      /* Stats */
      .ln-stats-bar { padding: 20px 16px; flex-wrap: wrap; gap: 0; }
      .ln-stat { padding: 10px 0; width: 50%; align-items: flex-start; }
      .ln-stat-num { font-size: 28px; }
      .ln-stat-lbl { font-size: 12px; }
      .ln-stat-div { display: none; }

      /* Sections */
      .ln-section { padding: 48px 16px; }
      .ln-section-inner { padding: 48px 16px; }
      .ln-section-hdr { margin-bottom: 36px; }
      .ln-overline { font-size: 11px; }
      .ln-h2 { font-size: 26px; }
      .ln-section-desc { font-size: 14px; }

      /* Features */
      .ln-feat-grid { grid-template-columns: 1fr; gap: 12px; }
      .ln-feat { padding: 20px 16px; }
      .ln-feat-ico { font-size: 28px; margin-bottom: 10px; }
      .ln-feat-title { font-size: 15px; }
      .ln-feat-desc { font-size: 13px; }

      /* Steps */
      .ln-steps { flex-direction: column; gap: 12px; }
      .ln-step { padding: 20px 16px; }
      .ln-step-num { font-size: 40px; }
      .ln-step h3 { font-size: 16px; }
      .ln-step-arrow { transform: rotate(90deg); align-self: center; font-size: 18px; }

      /* Plans */
      .ln-plans-grid { grid-template-columns: 1fr; gap: 16px; }
      .ln-plan { padding: 24px 16px; margin-top: 8px; }
      .ln-plan-name { font-size: 18px; }
      .ln-price-num { font-size: 24px; }

      /* Final CTA */
      .ln-final-cta { padding: 56px 16px; }
      .ln-final-cta .ln-h2 { font-size: 26px; }
      .ln-final-cta p { font-size: 14px; }
      .ln-final-btn { width: 100%; justify-content: center; font-size: 15px; }

      /* Footer */
      .ln-footer { padding: 24px 16px; }
      .ln-footer-disc { font-size: 11px; }
    }

    @media (max-width: 400px) {
      .ln-brand-name { font-size: 15px; }
      .ln-h1 { font-size: 30px; }
    }
  `],
})
export class LandingComponent {
  @Output() openLogin = new EventEmitter<void>();
  @Output() openRegister = new EventEmitter<void>();

  stats = [
    { num: '1.377+', lbl: 'Partidos analizados' },
    { num: '6',      lbl: 'Modelos XGBoost' },
    { num: '5',      lbl: 'Ligas activas' },
    { num: '60+',    lbl: 'Variables por partido' },
  ];

  features = [
    { icon: '🎯', title: 'Predicciones 1X2', desc: 'Probabilidades exactas de local, empate y visitante con XGBoost entrenado en miles de partidos históricos.' },
    { icon: '💡', title: 'Value Bets automáticos', desc: 'Solo cuando la probabilidad del modelo supera la implícita de las cuotas. Ventaja real y medible.' },
    { icon: '🎰', title: 'Parlay Builder', desc: 'Combina picks de diferentes partidos. La IA calcula la probabilidad real del combo y sugiere los mejores.' },
    { icon: '⚽', title: 'Goles, Córneres y Tarjetas', desc: 'Over/Under 2.5, 3.5, BTTS, córneres >9.5 y tarjetas >3.5. Cobertura completa de cada mercado.' },
    { icon: '📊', title: '5 Ligas activas', desc: 'Premier League, La Liga, Champions League y Liga BetPlay. Cobertura diaria automatizada desde Sofascore.' },
    { icon: '🤖', title: 'Aprendizaje continuo', desc: 'Los modelos evalúan cada resultado real y se re-entrenan automáticamente para mejorar su precisión.' },
  ];

  pricingPlans = [
    {
      icon: '🏟️', name: 'Hincha', price: 'Gratis', period: null,
      access: 'Stats del modelo', featured: false, cta: 'Empezar gratis',
      features: ['Rendimiento histórico del modelo', 'Estadísticas globales (win rate, ROI)', 'Gráfica P&L acumulada'],
    },
    {
      icon: '⚽', name: 'Bronce', price: '$5.000', period: 'COP/mes',
      access: '33% de los picks', featured: false, cta: 'Elegir Bronce',
      features: ['33% de los picks del día', 'Value bets básicos', 'Predicciones 1X2'],
    },
    {
      icon: '🥈', name: 'Plata', price: '$10.000', period: 'COP/mes',
      access: '66% de los picks', featured: true, cta: 'Elegir Plata',
      features: ['66% de los picks del día', 'Value bets + Parlay sugerido', 'Goles, córneres y tarjetas', 'Filtros por mercado'],
    },
    {
      icon: '🏆', name: 'Oro', price: '$15.000', period: 'COP/mes',
      access: '100% de los picks', featured: false, cta: 'Elegir Oro',
      features: ['100% de todos los picks', 'ROI desglosado por liga', 'Parlay builder ilimitado', 'Acceso completo a la IA'],
    },
  ];
}
