import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

interface ActionState {
  loading: boolean;
  result: string | null;
  ok: boolean | null;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-page">

      <div class="admin-header">
        <h1>⚙️ Panel de Administración</h1>
        <p>Controla el scraping, entrenamiento de modelos y pipeline de datos</p>
      </div>

      <!-- Status row -->
      <div class="status-row">
        <div class="status-card">
          <div class="status-label">Estado del sistema</div>
          @if (status()) {
            <div class="status-chips">
              <span class="chip" [class.chip-ok]="status().scheduler_running" [class.chip-warn]="!status().scheduler_running">
                {{ status().scheduler_running ? '✅ Scheduler activo' : '⚠️ Scheduler detenido' }}
              </span>
              @if (status().next_run) {
                <span class="chip chip-info">Próximo: {{ formatDate(status().next_run) }}</span>
              }
              @if (status().model_ready !== undefined) {
                <span class="chip" [class.chip-ok]="status().model_ready" [class.chip-warn]="!status().model_ready">
                  {{ status().model_ready ? '🤖 Modelos listos' : '⚠️ Modelos sin entrenar' }}
                </span>
              }
            </div>
          } @else {
            <button class="btn-refresh" (click)="loadStatus()">Cargar estado</button>
          }
        </div>
      </div>

      <div class="panels-grid">

        <!-- Scraping panel -->
        <div class="panel">
          <div class="panel-header">
            <span class="panel-icon">🕷️</span>
            <h2>Scraping</h2>
          </div>

          <div class="actions-list">

            <div class="action-item">
              <div class="action-info">
                <strong>Scraping diario</strong>
                <span>Scrapea partidos de hoy y mañana, genera predicciones y evalúa resultados</span>
              </div>
              <button class="btn-action"
                [class.loading]="states['daily'].loading"
                [disabled]="states['daily'].loading"
                (click)="run('daily')">
                {{ states['daily'].loading ? '⏳ Ejecutando...' : '▶ Ejecutar' }}
              </button>
            </div>
            @if (states['daily'].result) {
              <div class="action-result" [class.result-ok]="states['daily'].ok" [class.result-err]="!states['daily'].ok">
                {{ states['daily'].result }}
              </div>
            }

            <div class="action-item">
              <div class="action-info">
                <strong>Detalles de partidos</strong>
                <span>Scrapea estadísticas, eventos y alineaciones de partidos pendientes</span>
              </div>
              <button class="btn-action"
                [class.loading]="states['details'].loading"
                [disabled]="states['details'].loading"
                (click)="run('details')">
                {{ states['details'].loading ? '⏳ Ejecutando...' : '▶ Ejecutar' }}
              </button>
            </div>
            @if (states['details'].result) {
              <div class="action-result" [class.result-ok]="states['details'].ok" [class.result-err]="!states['details'].ok">
                {{ states['details'].result }}
              </div>
            }

            <div class="action-item">
              <div class="action-info">
                <strong>Carga histórica</strong>
                <span>Carga temporadas históricas completas. Puede tardar 30–120 min.</span>
                <div class="years-input">
                  <label>Años hacia atrás:</label>
                  <input type="number" [(ngModel)]="yearsBack" min="1" max="5" class="num-input">
                </div>
              </div>
              <button class="btn-action btn-warn"
                [class.loading]="states['historical'].loading"
                [disabled]="states['historical'].loading"
                (click)="run('historical')">
                {{ states['historical'].loading ? '⏳ Cargando...' : '▶ Cargar' }}
              </button>
            </div>
            @if (states['historical'].result) {
              <div class="action-result" [class.result-ok]="states['historical'].ok" [class.result-err]="!states['historical'].ok">
                {{ states['historical'].result }}
              </div>
            }

            <div class="action-item">
              <div class="action-info">
                <strong>Inicialización</strong>
                <span>Primera ejecución: ligas, standings, partidos de hoy</span>
              </div>
              <button class="btn-action btn-warn"
                [class.loading]="states['init'].loading"
                [disabled]="states['init'].loading"
                (click)="run('init')">
                {{ states['init'].loading ? '⏳ Iniciando...' : '▶ Init' }}
              </button>
            </div>
            @if (states['init'].result) {
              <div class="action-result" [class.result-ok]="states['init'].ok" [class.result-err]="!states['init'].ok">
                {{ states['init'].result }}
              </div>
            }

          </div>
        </div>

        <!-- ML panel -->
        <div class="panel">
          <div class="panel-header">
            <span class="panel-icon">🤖</span>
            <h2>Machine Learning</h2>
          </div>

          <div class="actions-list">

            <div class="action-item">
              <div class="action-info">
                <strong>Predecir todos los partidos</strong>
                <span>Genera predicciones ML para todos los partidos programados sin predicción</span>
              </div>
              <button class="btn-action"
                [class.loading]="states['predict'].loading"
                [disabled]="states['predict'].loading"
                (click)="run('predict')">
                {{ states['predict'].loading ? '⏳ Prediciendo...' : '▶ Predecir' }}
              </button>
            </div>
            @if (states['predict'].result) {
              <div class="action-result" [class.result-ok]="states['predict'].ok" [class.result-err]="!states['predict'].ok">
                {{ states['predict'].result }}
              </div>
            }

            <div class="action-item">
              <div class="action-info">
                <strong>Evaluar predicciones</strong>
                <span>Compara predicciones con resultados reales de partidos terminados</span>
              </div>
              <button class="btn-action"
                [class.loading]="states['evaluate'].loading"
                [disabled]="states['evaluate'].loading"
                (click)="run('evaluate')">
                {{ states['evaluate'].loading ? '⏳ Evaluando...' : '▶ Evaluar' }}
              </button>
            </div>
            @if (states['evaluate'].result) {
              <div class="action-result" [class.result-ok]="states['evaluate'].ok" [class.result-err]="!states['evaluate'].ok">
                {{ states['evaluate'].result }}
              </div>
            }

            <div class="action-item">
              <div class="action-info">
                <strong>Entrenar modelos</strong>
                <span>Re-entrena los 6 modelos XGBoost desde cero con los datos evaluados</span>
              </div>
              <button class="btn-action btn-warn"
                [class.loading]="states['train'].loading"
                [disabled]="states['train'].loading"
                (click)="run('train')">
                {{ states['train'].loading ? '⏳ Entrenando...' : '▶ Entrenar' }}
              </button>
            </div>
            @if (states['train'].result) {
              <div class="action-result" [class.result-ok]="states['train'].ok" [class.result-err]="!states['train'].ok">
                {{ states['train'].result }}
              </div>
            }

            <div class="action-item">
              <div class="action-info">
                <strong>Reentrenar (eval + train)</strong>
                <span>Evalúa resultados pendientes y luego re-entrena todos los modelos</span>
              </div>
              <button class="btn-action btn-warn"
                [class.loading]="states['retrain'].loading"
                [disabled]="states['retrain'].loading"
                (click)="run('retrain')">
                {{ states['retrain'].loading ? '⏳ Reentrenando...' : '▶ Reentrenar' }}
              </button>
            </div>
            @if (states['retrain'].result) {
              <div class="action-result" [class.result-ok]="states['retrain'].ok" [class.result-err]="!states['retrain'].ok">
                {{ states['retrain'].result }}
              </div>
            }

          </div>
        </div>

      </div>

      <!-- Recent jobs -->
      @if (recentJobs().length > 0) {
        <div class="jobs-section">
          <h3>Últimos jobs de scraping</h3>
          <div class="jobs-table">
            <div class="jobs-header">
              <span>Tipo</span><span>Target</span><span>Estado</span><span>Insertados</span><span>Actualizados</span><span>Inicio</span>
            </div>
            @for (job of recentJobs(); track job.id) {
              <div class="jobs-row" [class.job-done]="job.status === 'done'" [class.job-fail]="job.status === 'failed'" [class.job-run]="job.status === 'running'">
                <span class="job-type">{{ job.job_type }}</span>
                <span>{{ job.target || '—' }}</span>
                <span class="job-status">{{ statusEmoji(job.status) }} {{ job.status }}</span>
                <span>{{ job.records_inserted ?? '—' }}</span>
                <span>{{ job.records_updated ?? '—' }}</span>
                <span>{{ job.started_at ? formatDate(job.started_at) : '—' }}</span>
              </div>
            }
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    .admin-page {
      max-width: 1100px;
      margin: 0 auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .admin-header h1 { font-size: 24px; font-weight: 800; margin: 0 0 4px; }
    .admin-header p  { font-size: 13px; color: var(--text-muted); margin: 0; }

    /* Status row */
    .status-row { display: flex; }
    .status-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 14px 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      flex: 1;
    }
    .status-label { font-size: 12px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
    .status-chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .chip {
      font-size: 12px;
      padding: 4px 10px;
      border-radius: 20px;
      border: 1px solid var(--border);
      color: var(--text-secondary);
    }
    .chip-ok   { border-color: var(--accent); color: var(--accent); background: rgba(16,185,129,0.08); }
    .chip-warn { border-color: #f59e0b; color: #f59e0b; background: rgba(245,158,11,0.08); }
    .chip-info { border-color: #60a5fa; color: #60a5fa; background: rgba(96,165,250,0.08); }
    .btn-refresh {
      font-size: 12px; padding: 6px 14px; border-radius: 8px;
      background: var(--bg-input); border: 1px solid var(--border);
      color: var(--text-primary); cursor: pointer;
    }

    /* Panels */
    .panels-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    @media (max-width: 768px) { .panels-grid { grid-template-columns: 1fr; } }

    .panel {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      overflow: hidden;
    }
    .panel-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border);
      background: var(--bg-input);
    }
    .panel-icon { font-size: 20px; }
    .panel-header h2 { font-size: 15px; font-weight: 700; margin: 0; }

    .actions-list { display: flex; flex-direction: column; }

    .action-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 20px;
      border-bottom: 1px solid var(--border);
    }
    .action-item:last-of-type { border-bottom: none; }
    .action-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .action-info strong { font-size: 13px; font-weight: 700; }
    .action-info span   { font-size: 12px; color: var(--text-muted); }
    .years-input {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 6px;
      font-size: 12px;
      color: var(--text-secondary);
    }
    .num-input {
      width: 52px;
      background: var(--bg-input);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 3px 6px;
      color: var(--text-primary);
      font-size: 12px;
      text-align: center;
      outline: none;
    }

    .btn-action {
      background: var(--accent);
      border: none;
      border-radius: 8px;
      padding: 8px 16px;
      color: #000;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
      transition: opacity 0.2s;
      flex-shrink: 0;
    }
    .btn-action:hover:not(:disabled) { opacity: 0.85; }
    .btn-action:disabled { opacity: 0.5; cursor: default; }
    .btn-action.loading { opacity: 0.7; }
    .btn-warn { background: #f59e0b; }

    .action-result {
      padding: 8px 20px 10px;
      font-size: 12px;
      border-radius: 0;
    }
    .result-ok  { color: var(--accent); background: rgba(16,185,129,0.06); }
    .result-err { color: #f87171;       background: rgba(248,113,113,0.06); }

    /* Jobs table */
    .jobs-section h3 { font-size: 14px; font-weight: 700; margin: 0 0 12px; }
    .jobs-table {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      font-size: 12px;
    }
    .jobs-header, .jobs-row {
      display: grid;
      grid-template-columns: 160px 1fr 100px 80px 80px 140px;
      gap: 12px;
      padding: 8px 16px;
      align-items: center;
    }
    .jobs-header {
      background: var(--bg-input);
      color: var(--text-muted);
      font-weight: 600;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .jobs-row { border-top: 1px solid var(--border); color: var(--text-secondary); }
    .job-done .job-status { color: var(--accent); }
    .job-fail .job-status { color: #f87171; }
    .job-run  .job-status { color: #60a5fa; }
    .job-type { font-weight: 600; color: var(--text-primary); }
  `],
})
export class AdminComponent implements OnInit {
  status = signal<any>(null);
  recentJobs = signal<any[]>([]);
  yearsBack = 2;

  states: Record<string, ActionState> = {
    daily:      { loading: false, result: null, ok: null },
    details:    { loading: false, result: null, ok: null },
    historical: { loading: false, result: null, ok: null },
    init:       { loading: false, result: null, ok: null },
    predict:    { loading: false, result: null, ok: null },
    evaluate:   { loading: false, result: null, ok: null },
    train:      { loading: false, result: null, ok: null },
    retrain:    { loading: false, result: null, ok: null },
  };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadStatus();
  }

  loadStatus(): void {
    this.api.getScraperStatus().subscribe({
      next: res => {
        this.status.set(res);
        this.recentJobs.set(res.recent_jobs || []);
      },
      error: () => {},
    });
    this.api.getTrainingStatus().subscribe({
      next: res => {
        const cur = this.status() || {};
        this.status.set({ ...cur, model_ready: res.model_ready ?? res.models_trained });
      },
      error: () => {},
    });
  }

  run(action: string): void {
    const s = this.states[action];
    if (s.loading) return;
    s.loading = true;
    s.result = null;
    s.ok = null;

    const obs$ = this.getObservable(action);
    obs$.subscribe({
      next: res => {
        s.loading = false;
        s.ok = true;
        s.result = this.summarize(res);
        this.loadStatus();
      },
      error: err => {
        s.loading = false;
        s.ok = false;
        s.result = err?.error?.detail || 'Error al ejecutar la acción.';
      },
    });
  }

  private getObservable(action: string) {
    switch (action) {
      case 'daily':      return this.api.scrapeDaily();
      case 'details':    return this.api.scrapeDetails(50);
      case 'historical': return this.api.scrapeHistorical(this.yearsBack);
      case 'init':       return this.api.scrapeInit();
      case 'predict':    return this.api.predictAll();
      case 'evaluate':   return this.api.evaluatePredictions();
      case 'train':      return this.api.trainModel();
      case 'retrain':    return this.api.retrainModels();
      default:           return this.api.scrapeDaily();
    }
  }

  private summarize(res: any): string {
    if (!res) return 'Completado.';
    const parts: string[] = [];
    if (res.message)            parts.push(res.message);
    if (res.matches_created != null) parts.push(`${res.matches_created} partidos creados`);
    if (res.matches_updated != null) parts.push(`${res.matches_updated} actualizados`);
    if (res.predictions_created != null) parts.push(`${res.predictions_created} predicciones`);
    if (res.evaluated != null)  parts.push(`${res.evaluated} evaluados`);
    if (res.trained_models)     parts.push(`Modelos: ${res.trained_models.join(', ')}`);
    if (res.status)             parts.push(res.status);
    return parts.length > 0 ? parts.join(' | ') : 'Completado correctamente.';
  }

  formatDate(dt: string): string {
    if (!dt) return '';
    try {
      return new Date(dt).toLocaleString('es-CO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch { return dt; }
  }

  statusEmoji(status: string): string {
    return { done: '✅', failed: '❌', running: '⏳', pending: '🕐' }[status] ?? '❓';
  }
}
