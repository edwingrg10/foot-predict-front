import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

type MainTab = 'results' | 'global' | 'feedback';
type DayTab  = 'today'   | 'yesterday';

@Component({
  selector: 'app-model-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">

      <!-- Page header -->
      <div class="page-header">
        <div>
          <h1 class="title">Rendimiento del Modelo</h1>
          <p class="subtitle">Predicciones vs resultados reales</p>
        </div>
        <div class="header-actions">
          <div class="header-btns">
            <button class="btn-eval" (click)="runEvaluate()" [disabled]="evaluating()">
              {{ evaluating() ? 'Evaluando...' : 'Evaluar ahora' }}
            </button>
            <button class="btn-retrain" (click)="runRetrain()" [disabled]="retraining()">
              {{ retraining() ? 'Reentrenando...' : 'Reentrenar modelo' }}
            </button>
          </div>
        </div>
      </div>

      @if (evalMsg()) {
        <div class="eval-toast" [class.success]="evalSuccess()">{{ evalMsg() }}</div>
      }
      @if (retrainMsg()) {
        <div class="eval-toast" [class.success]="retrainSuccess()">{{ retrainMsg() }}</div>
      }

      <!-- Main tabs -->
      <div class="main-tabs">
        <button class="main-tab" [class.active]="mainTab() === 'results'" (click)="mainTab.set('results')">
          Resultados
        </button>
        <button class="main-tab" [class.active]="mainTab() === 'global'" (click)="mainTab.set('global')">
          Rendimiento global
        </button>
        <button class="main-tab" [class.active]="mainTab() === 'feedback'" (click)="switchToFeedback()">
          Retroalimentación
        </button>
      </div>

      <!-- ── TAB: RESULTADOS ── -->
      @if (mainTab() === 'results') {
        <div class="day-tabs">
          <button class="day-tab" [class.active]="dayTab() === 'yesterday'" (click)="switchDay('yesterday')">
            Ayer
          </button>
          <button class="day-tab" [class.active]="dayTab() === 'today'" (click)="switchDay('today')">
            Hoy
          </button>
        </div>

        @if (loadingResults()) {
          <div class="center-msg"><div class="spinner"></div><p>Cargando resultados...</p></div>
        } @else if (resultGroups().length === 0) {
          <div class="empty-state">
            <span class="empty-icon">🏁</span>
            <p>No hay partidos terminados {{ dayTab() === 'today' ? 'hoy' : 'ayer' }}.</p>
          </div>
        } @else {
          <!-- Summary bar -->
          <div class="summary-bar">
            <div class="sum-item">
              <span class="sum-n">{{ totalFinished() }}</span>
              <span class="sum-label">Partidos</span>
            </div>
            <div class="sum-item" [class.good]="resultAccuracy() >= 50">
              <span class="sum-n">{{ resultAccuracy() }}%</span>
              <span class="sum-label">1X2 acertados</span>
            </div>
            <div class="sum-item" [class.good]="smartBetWinRate() >= 65">
              <span class="sum-n accent">{{ smartBetWinRate() }}%</span>
              <span class="sum-label">Apuesta recomendada</span>
            </div>
            <div class="sum-item">
              <span class="sum-n">{{ evaluated() }}/{{ totalFinished() }}</span>
              <span class="sum-label">Evaluados</span>
            </div>
          </div>

          @for (group of resultGroups(); track group.league_id) {
            <div class="league-group">
              <div class="league-header">
                <img [src]="group.league_logo" [alt]="group.league_name"
                  class="league-logo" onerror="this.style.display='none'" />
                <span class="league-name">{{ group.league_name }}</span>
                <span class="league-country">{{ group.league_country }}</span>
                <span class="match-count">{{ group.matches.length }} partido{{ group.matches.length !== 1 ? 's' : '' }}</span>
              </div>

              @for (match of group.matches; track match.id) {
                <div class="result-card">
                  <!-- Teams & score -->
                  <div class="rc-teams">
                    <div class="rc-team home">
                      <img [src]="match.home_team.logo" class="rc-logo" onerror="this.style.display='none'" />
                      <span class="rc-name">{{ match.home_team.name }}</span>
                    </div>
                    <div class="rc-score">
                      <span class="rc-score-val">{{ match.home_score }} - {{ match.away_score }}</span>
                      <span class="rc-time">{{ formatTime(match.match_date) }}</span>
                    </div>
                    <div class="rc-team away">
                      <span class="rc-name">{{ match.away_team.name }}</span>
                      <img [src]="match.away_team.logo" class="rc-logo" onerror="this.style.display='none'" />
                    </div>
                  </div>

                  @if (match.prediction && match.prediction.evaluated_at) {
                    <!-- Prediction result row -->
                    <div class="rc-eval">
                      <!-- 1X2 -->
                      <div class="rc-eval-item" [class.correct]="match.prediction.outcome_correct"
                           [class.wrong]="match.prediction.outcome_correct === false">
                        <span class="rc-eval-icon">{{ match.prediction.outcome_correct ? '✓' : '✗' }}</span>
                        <div class="rc-eval-body">
                          <span class="rc-eval-label">1X2</span>
                          <span class="rc-eval-val">{{ outcomeLabel(match) }}</span>
                        </div>
                      </div>
                      <!-- Over 2.5 -->
                      <div class="rc-eval-item" [class.correct]="match.prediction.over25_correct"
                           [class.wrong]="match.prediction.over25_correct === false">
                        <span class="rc-eval-icon">{{ match.prediction.over25_correct ? '✓' : '✗' }}</span>
                        <div class="rc-eval-body">
                          <span class="rc-eval-label">Over 2.5</span>
                          <span class="rc-eval-val">{{ match.prediction.actual_goals }} goles</span>
                        </div>
                      </div>
                      <!-- BTTS -->
                      <div class="rc-eval-item" [class.correct]="match.prediction.btts_correct"
                           [class.wrong]="match.prediction.btts_correct === false">
                        <span class="rc-eval-icon">{{ match.prediction.btts_correct ? '✓' : '✗' }}</span>
                        <div class="rc-eval-body">
                          <span class="rc-eval-label">BTTS</span>
                          <span class="rc-eval-val">{{ bttsLabel(match) }}</span>
                        </div>
                      </div>
                      <!-- Smart bet -->
                      @if (match.prediction.smart_bet) {
                        <div class="rc-eval-item smart"
                             [class.correct]="match.prediction.smart_bet_correct"
                             [class.wrong]="match.prediction.smart_bet_correct === false"
                             [class.pending]="match.prediction.smart_bet_correct === null">
                          <span class="rc-eval-icon">
                            {{ match.prediction.smart_bet_correct === true ? '✓' :
                               match.prediction.smart_bet_correct === false ? '✗' : '?' }}
                          </span>
                          <div class="rc-eval-body">
                            <span class="rc-eval-label">{{ match.prediction.smart_bet.type }}</span>
                            <span class="rc-eval-val">
                              @for (pick of match.prediction.smart_bet.picks; track $index) {
                                {{ pick.label }}{{ $last ? '' : ' + ' }}
                              }
                              · &#64;{{ match.prediction.smart_bet.estimated_odds }}
                            </span>
                          </div>
                        </div>
                      }
                    </div>
                  } @else if (match.prediction) {
                    <div class="rc-no-eval">Sin evaluar — ejecuta "Evaluar ahora"</div>
                  } @else {
                    <div class="rc-no-eval">Sin predicción</div>
                  }
                </div>
              }
            </div>
          }
        }
      }

      <!-- ── TAB: RETROALIMENTACIÓN ── -->
      @if (mainTab() === 'feedback') {
        @if (loadingFeedback()) {
          <div class="center-msg"><div class="spinner"></div><p>Cargando estado del modelo...</p></div>
        } @else if (!feedbackStatus()) {
          <div class="empty-state">
            <span class="empty-icon">🔄</span>
            <p>No se pudo cargar el estado de retroalimentación.</p>
          </div>
        } @else {

          <!-- Embudo de datos -->
          <div class="section-label">Embudo de datos</div>
          <div class="section-desc">Cómo fluyen los partidos desde el scraping hasta el aprendizaje del modelo</div>
          <div class="funnel-row">
            <div class="funnel-step">
              <div class="funnel-icon">⚽</div>
              <div class="funnel-n">{{ feedbackStatus()!.data_pipeline.finished_matches }}</div>
              <div class="funnel-label">Partidos terminados</div>
            </div>
            <div class="funnel-arrow">→</div>
            <div class="funnel-step">
              <div class="funnel-icon">📊</div>
              <div class="funnel-n">{{ feedbackStatus()!.data_pipeline.finished_with_stats }}</div>
              <div class="funnel-label">Con estadísticas</div>
              <div class="funnel-sub">{{ statsRatio() }}% del total</div>
            </div>
            <div class="funnel-arrow">→</div>
            <div class="funnel-step good">
              <div class="funnel-icon">✓</div>
              <div class="funnel-n green">{{ feedbackStatus()!.data_pipeline.evaluated_predictions }}</div>
              <div class="funnel-label">Predicciones evaluadas</div>
              <div class="funnel-sub">retroalimentan el modelo</div>
            </div>
            <div class="funnel-arrow">→</div>
            <div class="funnel-step" [class.warn-step]="feedbackStatus()!.data_pipeline.pending_evaluation > 0">
              <div class="funnel-icon">⏳</div>
              <div class="funnel-n" [class.orange]="feedbackStatus()!.data_pipeline.pending_evaluation > 0">
                {{ feedbackStatus()!.data_pipeline.pending_evaluation }}
              </div>
              <div class="funnel-label">Pendientes de evaluar</div>
              @if (feedbackStatus()!.data_pipeline.pending_evaluation > 0) {
                <div class="funnel-sub warn">Usa "Evaluar ahora"</div>
              }
            </div>
          </div>

          <!-- Estado de los modelos -->
          <div class="section-label">Estado de los modelos</div>
          @if (lastTrainingRun()) {
            <div class="last-train-banner">
              Último entrenamiento: <strong>{{ formatTs(lastTrainingRun()!.timestamp) }}</strong>
              con <strong>{{ lastTrainingRun()!.total_samples }}</strong> partidos
            </div>
          } @else {
            <div class="last-train-banner warn-banner">
              El modelo aún no tiene historial de entrenamientos registrado.
            </div>
          }
          <div class="model-grid">
            @for (entry of modelEntries(); track entry.key) {
              <div class="model-card" [class.missing]="!entry.value.exists">
                <div class="model-card-header">
                  <span class="model-name">{{ entry.value.label }}</span>
                  <span class="model-status-dot" [class.ok]="entry.value.exists" [class.ko]="!entry.value.exists"></span>
                </div>
                @if (entry.value.exists) {
                  <div class="model-trained-at">{{ formatTs(entry.value.trained_at) }}</div>
                  <div class="model-size">{{ entry.value.size_kb }} KB</div>
                  @if (lastRunAccuracy(entry.key) !== null) {
                    <div class="model-acc">CV accuracy: <strong>{{ fmtPct(lastRunAccuracy(entry.key)) }}</strong></div>
                  }
                } @else {
                  <div class="model-missing-msg">Sin entrenar</div>
                }
              </div>
            }
          </div>

          <!-- Historial de entrenamientos -->
          @if (feedbackStatus()!.training_history.length > 0) {
            <div class="section-label">Historial de entrenamientos</div>
            <div class="train-table">
              <div class="train-header">
                <span>Fecha</span>
                <span class="center">Muestras</span>
                <span class="center">1X2</span>
                <span class="center">Over 2.5</span>
                <span class="center">BTTS</span>
                <span class="center">Corners</span>
              </div>
              @for (run of feedbackStatus()!.training_history; track run.timestamp) {
                <div class="train-row">
                  <span class="train-date">{{ formatTs(run.timestamp) }}</span>
                  <span class="center muted">{{ run.total_samples }}</span>
                  <span class="center" [class.acc-good]="(run.models?.result_1x2?.accuracy ?? 0) >= 0.5">
                    {{ fmtPct(run.models?.result_1x2?.accuracy) }}
                  </span>
                  <span class="center" [class.acc-good]="(run.models?.over_25?.accuracy ?? 0) >= 0.55">
                    {{ fmtPct(run.models?.over_25?.accuracy) }}
                  </span>
                  <span class="center" [class.acc-good]="(run.models?.btts?.accuracy ?? 0) >= 0.55">
                    {{ fmtPct(run.models?.btts?.accuracy) }}
                  </span>
                  <span class="center" [class.acc-good]="(run.models?.corners_over_95?.accuracy ?? 0) >= 0.55">
                    {{ fmtPct(run.models?.corners_over_95?.accuracy) }}
                  </span>
                </div>
              }
            </div>
          } @else {
            <div class="section-label">Historial de entrenamientos</div>
            <div class="empty-inline">
              <p>Sin historial registrado. El historial se genera al usar "Reentrenar modelo".</p>
            </div>
          }

          <!-- Scheduler automático -->
          @if (feedbackStatus()!.scheduler_jobs.length > 0) {
            <div class="section-label">Scraping automático</div>
            <div class="scheduler-list">
              @for (job of feedbackStatus()!.scheduler_jobs; track job.id) {
                <div class="scheduler-item">
                  <span class="scheduler-name">{{ job.name }}</span>
                  <span class="scheduler-next">Próxima ejecución: {{ formatTs(job.next_run) }}</span>
                </div>
              }
            </div>
          }

          <!-- ── Historial de predicciones evaluadas ── -->
          <div class="section-label" style="margin-top:28px">
            Historial de predicciones evaluadas
            <span class="section-badge">{{ historyTotal() }} en DB</span>
          </div>
          <div class="section-desc">
            Lo que el modelo predijo antes de cada partido vs lo que ocurrió realmente.
            Este historial retroalimenta el reentrenamiento.
          </div>

          @if (loadingHistory()) {
            <div class="center-msg"><div class="spinner"></div><p>Cargando historial...</p></div>
          } @else if (historyItems().length === 0) {
            <div class="empty-inline">
              Sin predicciones evaluadas aún. Se generan automáticamente al terminar los partidos.
            </div>
          } @else {
            <div class="history-table">
              <div class="ht-header">
                <span>Fecha</span>
                <span>Partido</span>
                <span class="center">Predicción</span>
                <span class="center">Real</span>
                <span class="center">1X2</span>
                <span class="center">O2.5</span>
                <span class="center">BTTS</span>
                <span class="center">Smart Bet</span>
                <span class="center">Brier</span>
              </div>
              @for (item of historyItems(); track item.prediction_id) {
                <div class="ht-row" [class.ht-correct]="item.outcome_correct" [class.ht-wrong]="item.outcome_correct === false">
                  <span class="ht-date">{{ shortDate(item.match_date) }}</span>

                  <div class="ht-match">
                    <img [src]="item.league_logo" class="ht-league-logo" onerror="this.style.display='none'" />
                    <div class="ht-teams">
                      <span class="ht-home">{{ item.home_team }}</span>
                      <span class="ht-vs">vs</span>
                      <span class="ht-away">{{ item.away_team }}</span>
                    </div>
                  </div>

                  <div class="ht-pred center">
                    <span class="ht-pred-label" [class]="'pred-' + item.predicted_outcome.toLowerCase()">
                      {{ item.predicted_label }}
                    </span>
                    <span class="ht-prob">{{ pct(item.confidence_score) }}</span>
                  </div>

                  <div class="ht-actual center">
                    <span class="ht-score">{{ item.actual_score ?? '—' }}</span>
                    <span class="ht-actual-label">{{ item.actual_label }}</span>
                  </div>

                  <span class="ht-cell center" [class.cell-ok]="item.outcome_correct" [class.cell-ko]="item.outcome_correct === false">
                    {{ item.outcome_correct === true ? '✓' : item.outcome_correct === false ? '✗' : '—' }}
                  </span>
                  <span class="ht-cell center" [class.cell-ok]="item.over25_correct" [class.cell-ko]="item.over25_correct === false">
                    {{ item.over25_correct === true ? '✓' : item.over25_correct === false ? '✗' : '—' }}
                  </span>
                  <span class="ht-cell center" [class.cell-ok]="item.btts_correct" [class.cell-ko]="item.btts_correct === false">
                    {{ item.btts_correct === true ? '✓' : item.btts_correct === false ? '✗' : '—' }}
                  </span>
                  <span class="ht-cell center smart" [class.cell-ok]="item.smart_bet_correct" [class.cell-ko]="item.smart_bet_correct === false" [class.cell-na]="item.smart_bet_correct === null">
                    @if (item.smart_bet) {
                      {{ item.smart_bet_correct === true ? '✓' : item.smart_bet_correct === false ? '✗' : '?' }}
                    } @else { — }
                  </span>
                  <span class="ht-brier center" [class.brier-good]="(item.brier_1x2??1) < 0.25" [class.brier-bad]="(item.brier_1x2??0) > 0.5">
                    {{ item.brier_1x2 != null ? item.brier_1x2.toFixed(3) : '—' }}
                  </span>
                </div>
              }
            </div>

            <!-- Paginación -->
            <div class="pagination">
              <button class="page-btn" [disabled]="historyPage() <= 1" (click)="goToPage(historyPage() - 1)">← Anterior</button>
              <span class="page-info">Página {{ historyPage() }} de {{ historyPages() }} · {{ historyTotal() }} predicciones</span>
              <button class="page-btn" [disabled]="historyPage() >= historyPages()" (click)="goToPage(historyPage() + 1)">Siguiente →</button>
            </div>
          }

        }
      }

      <!-- ── TAB: RENDIMIENTO GLOBAL ── -->
      @if (mainTab() === 'global') {
        @if (loadingStats()) {
          <div class="center-msg"><div class="spinner"></div><p>Cargando estadísticas...</p></div>
        } @else if (!stats() || stats()!.total_evaluated === 0) {
          <div class="empty-state">
            <span class="empty-icon">📊</span>
            <h2>Sin evaluaciones aún</h2>
            <p>Las predicciones se evalúan automáticamente al terminar los partidos.</p>
            <button class="btn-eval big" (click)="runEvaluate()">Evaluar predicciones</button>
          </div>
        } @else {
          <!-- Métricas globales -->
          <div class="section-label">Métricas globales · {{ stats()!.total_evaluated }} partidos</div>
          <div class="metrics-grid">
            <div class="metric-card highlight">
              <div class="metric-label">Apuesta recomendada</div>
              <div class="metric-value accent">{{ fmt(stats()!.smart_bet_accuracy) }}</div>
              <div class="metric-bar"><div class="metric-fill fill-accent" [style.width]="barW(stats()!.smart_bet_accuracy)"></div></div>
              <div class="metric-sub">% de smart bets ganadoras</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Resultado 1X2</div>
              <div class="metric-value">{{ fmt(stats()!.outcome_accuracy) }}</div>
              <div class="metric-bar"><div class="metric-fill" [class.fill-good]="(stats()!.outcome_accuracy??0)>=50" [style.width]="barW(stats()!.outcome_accuracy)"></div></div>
              <div class="metric-sub">Brier: {{ fmtB(stats()!.avg_brier_1x2) }}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Over / Under 2.5</div>
              <div class="metric-value">{{ fmt(stats()!.over25_accuracy) }}</div>
              <div class="metric-bar"><div class="metric-fill" [class.fill-good]="(stats()!.over25_accuracy??0)>=55" [style.width]="barW(stats()!.over25_accuracy)"></div></div>
            </div>
            <div class="metric-card">
              <div class="metric-label">BTTS</div>
              <div class="metric-value">{{ fmt(stats()!.btts_accuracy) }}</div>
              <div class="metric-bar"><div class="metric-fill" [class.fill-good]="(stats()!.btts_accuracy??0)>=55" [style.width]="barW(stats()!.btts_accuracy)"></div></div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Últimos 20</div>
              <div class="metric-value accent">{{ fmt(stats()!.recent_20.outcome_accuracy) }}</div>
              <div class="metric-bar"><div class="metric-fill fill-accent" [style.width]="barW(stats()!.recent_20.outcome_accuracy)"></div></div>
              <div class="metric-sub">1X2 reciente</div>
            </div>
          </div>

          <!-- Por liga -->
          <div class="section-label">Rendimiento por liga</div>
          <div class="league-table">
            <div class="lt-header">
              <span>Liga</span>
              <span class="center">Partidos</span>
              <span class="center">1X2</span>
              <span class="center">Over 2.5</span>
              <span class="center">BTTS</span>
              <span class="center highlight-col">Apuesta rec.</span>
              <span class="center">Brier</span>
            </div>
            @for (lg of stats()!.by_league; track lg.league) {
              <div class="lt-row">
                <span class="lt-name">{{ lg.league }}</span>
                <span class="lt-n center">{{ lg.total }}</span>
                <span class="lt-pct center" [class.good]="(lg.outcome_accuracy??0)>=50" [class.bad]="(lg.outcome_accuracy??0)<40">{{ fmt(lg.outcome_accuracy) }}</span>
                <span class="lt-pct center" [class.good]="(lg.over25_accuracy??0)>=55">{{ fmt(lg.over25_accuracy) }}</span>
                <span class="lt-pct center" [class.good]="(lg.btts_accuracy??0)>=55">{{ fmt(lg.btts_accuracy) }}</span>
                <span class="lt-pct center highlight-col" [class.good]="(lg.smart_bet_accuracy??0)>=65" [class.warn]="(lg.smart_bet_accuracy??0)>=50&&(lg.smart_bet_accuracy??0)<65" [class.bad]="(lg.smart_bet_accuracy??0)<50">{{ fmt(lg.smart_bet_accuracy) }}</span>
                <span class="lt-brier center" [class.good]="(lg.avg_brier_1x2??1)<0.35" [class.bad]="(lg.avg_brier_1x2??0)>0.5">{{ fmtB(lg.avg_brier_1x2) }}</span>
              </div>
            }
          </div>

          <!-- Calibración -->
          @if (stats()!.calibration.length) {
            <div class="section-label">Calibración de probabilidades</div>
            <div class="section-desc">Cuando decimos X%, ¿qué % de las veces acierta realmente?</div>
            <div class="calib-table">
              <div class="calib-header">
                <span>Rango predicho</span><span>Partidos</span>
                <span>Prob. promedio</span><span>Acierto real</span><span>Visual</span>
              </div>
              @for (b of stats()!.calibration; track b.range) {
                <div class="calib-row">
                  <span class="calib-range">{{ b.range }}</span>
                  <span class="calib-n">{{ b.total }}</span>
                  <span class="calib-pred">{{ b.avg_predicted | number:'1.1-1' }}%</span>
                  <span class="calib-actual" [class.good]="diff(b)<=5" [class.warn]="diff(b)>5&&diff(b)<=15" [class.bad]="diff(b)>15">{{ b.actual_pct | number:'1.1-1' }}%</span>
                  <div class="calib-bars">
                    <div class="calib-bar-wrap"><div class="calib-bar declared" [style.width.%]="b.avg_predicted"></div></div>
                    <div class="calib-bar-wrap"><div class="calib-bar actual" [style.width.%]="b.actual_pct"></div></div>
                  </div>
                </div>
              }
            </div>
          }
        }
      }
    </div>
  `,
  styles: [`
    .page { padding: 20px 24px; max-width: 1100px; margin: 0 auto; }

    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; gap: 16px; flex-wrap: wrap; }
    .title { font-size: 22px; font-weight: 800; color: var(--text-primary); margin: 0 0 4px; }
    .subtitle { font-size: 13px; color: var(--text-muted); margin: 0; }
    .btn-eval { background: var(--accent); border: none; border-radius: 8px; padding: 9px 18px; color: #000; font-weight: 700; font-size: 13px; cursor: pointer; }
    .btn-eval:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-eval.big { padding: 12px 28px; font-size: 15px; margin-top: 16px; }

    .eval-toast { padding: 10px 16px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); color: #ef4444; }
    .eval-toast.success { background: rgba(16,185,129,0.15); border-color: rgba(16,185,129,0.3); color: #10b981; }

    /* Main tabs */
    .main-tabs { display: flex; gap: 4px; margin-bottom: 16px; border-bottom: 1px solid var(--border); padding-bottom: 0; }
    .main-tab { padding: 10px 20px; background: none; border: none; border-bottom: 2px solid transparent; color: var(--text-muted); font-size: 14px; font-weight: 600; cursor: pointer; margin-bottom: -1px; transition: all 0.2s; }
    .main-tab:hover { color: var(--text-primary); }
    .main-tab.active { color: var(--accent); border-bottom-color: var(--accent); }

    /* Day tabs */
    .day-tabs { display: flex; gap: 8px; margin-bottom: 14px; }
    .day-tab { padding: 8px 20px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; color: var(--text-muted); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .day-tab:hover { border-color: var(--accent); color: var(--text-primary); }
    .day-tab.active { background: var(--accent); border-color: var(--accent); color: #000; }

    /* Summary bar */
    .summary-bar { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
    .sum-item { flex: 1; min-width: 100px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 12px 16px; display: flex; flex-direction: column; gap: 3px; }
    .sum-item.good { border-color: rgba(16,185,129,0.4); }
    .sum-n { font-size: 24px; font-weight: 800; color: var(--text-primary); }
    .sum-n.accent { color: var(--accent); }
    .sum-label { font-size: 11px; color: var(--text-muted); }

    /* League group */
    .league-group { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; margin-bottom: 14px; }
    .league-header { display: flex; align-items: center; gap: 10px; padding: 10px 16px; background: var(--bg-input); border-bottom: 1px solid var(--border); }
    .league-logo { width: 22px; height: 22px; object-fit: contain; }
    .league-name { font-size: 13px; font-weight: 700; color: var(--text-primary); }
    .league-country { font-size: 11px; color: var(--text-muted); }
    .match-count { margin-left: auto; font-size: 11px; color: var(--text-muted); background: var(--bg-card); padding: 2px 8px; border-radius: 20px; border: 1px solid var(--border); }

    /* Result card */
    .result-card { border-bottom: 1px solid var(--border); padding: 12px 16px; }
    .result-card:last-child { border-bottom: none; }

    .rc-teams { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .rc-team { display: flex; align-items: center; gap: 8px; flex: 1; }
    .rc-team.away { justify-content: flex-end; }
    .rc-logo { width: 24px; height: 24px; object-fit: contain; }
    .rc-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .rc-score { text-align: center; min-width: 80px; }
    .rc-score-val { display: block; font-size: 20px; font-weight: 800; color: var(--text-primary); }
    .rc-time { font-size: 11px; color: var(--text-muted); }

    /* Eval row */
    .rc-eval { display: flex; gap: 6px; flex-wrap: wrap; }
    .rc-eval-item {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 10px; border-radius: 8px; flex: 1; min-width: 140px;
      background: var(--bg-input); border: 1px solid var(--border);
    }
    .rc-eval-item.correct { background: rgba(16,185,129,0.1); border-color: rgba(16,185,129,0.3); }
    .rc-eval-item.wrong   { background: rgba(239,68,68,0.1);  border-color: rgba(239,68,68,0.3); }
    .rc-eval-item.pending { background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.3); }
    .rc-eval-item.smart   { min-width: 200px; flex: 2; }
    .rc-eval-icon { font-size: 14px; font-weight: 800; }
    .correct .rc-eval-icon { color: #10b981; }
    .wrong   .rc-eval-icon { color: #ef4444; }
    .pending .rc-eval-icon { color: #f59e0b; }
    .rc-eval-body { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
    .rc-eval-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); }
    .rc-eval-val { font-size: 12px; color: var(--text-primary); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .rc-no-eval { font-size: 12px; color: var(--text-muted); padding: 4px 0; font-style: italic; }

    /* Global stats */
    .section-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); margin: 20px 0 10px; }
    .section-desc { font-size: 12px; color: var(--text-muted); margin: -6px 0 10px; }

    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px; }
    .metric-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 14px; }
    .metric-card.highlight { border-color: rgba(16,185,129,0.4); }
    .metric-label { font-size: 11px; color: var(--text-muted); margin-bottom: 6px; }
    .metric-value { font-size: 28px; font-weight: 800; color: var(--text-primary); line-height: 1; margin-bottom: 8px; }
    .metric-value.accent { color: var(--accent); }
    .metric-bar { height: 5px; background: var(--bg-input); border-radius: 3px; overflow: hidden; margin-bottom: 5px; }
    .metric-fill { height: 100%; border-radius: 3px; background: var(--text-muted); transition: width 0.6s ease; }
    .metric-fill.fill-good   { background: #10b981; }
    .metric-fill.fill-accent { background: var(--accent); }
    .metric-sub { font-size: 11px; color: var(--text-muted); }

    /* League table */
    .league-table { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
    .lt-header, .lt-row { display: grid; grid-template-columns: 1fr 70px 70px 80px 70px 100px 70px; align-items: center; padding: 10px 16px; gap: 6px; }
    .lt-header { background: var(--bg-input); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); border-bottom: 1px solid var(--border); }
    .lt-row { border-bottom: 1px solid var(--border); font-size: 13px; }
    .lt-row:last-child { border-bottom: none; }
    .center { text-align: center; }
    .lt-name { font-weight: 600; color: var(--text-primary); }
    .lt-n { color: var(--text-muted); }
    .lt-pct { font-weight: 700; color: var(--text-secondary); }
    .lt-pct.good { color: #10b981; }
    .lt-pct.warn { color: #f59e0b; }
    .lt-pct.bad  { color: #ef4444; }
    .highlight-col { background: rgba(16,185,129,0.05); }
    .lt-brier { font-weight: 600; color: var(--text-secondary); }
    .lt-brier.good { color: #10b981; }
    .lt-brier.bad  { color: #ef4444; }

    /* Calibración */
    .calib-table { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
    .calib-header, .calib-row { display: grid; grid-template-columns: 90px 60px 100px 90px 1fr; align-items: center; padding: 9px 16px; gap: 8px; }
    .calib-header { background: var(--bg-input); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); border-bottom: 1px solid var(--border); }
    .calib-row { border-bottom: 1px solid var(--border); font-size: 13px; }
    .calib-row:last-child { border-bottom: none; }
    .calib-range { font-weight: 700; color: var(--text-primary); }
    .calib-n { color: var(--text-muted); }
    .calib-pred { color: var(--text-secondary); }
    .calib-actual { font-weight: 700; }
    .calib-actual.good { color: #10b981; }
    .calib-actual.warn { color: #f59e0b; }
    .calib-actual.bad  { color: #ef4444; }
    .calib-bars { display: flex; flex-direction: column; gap: 3px; }
    .calib-bar-wrap { height: 7px; background: var(--bg-input); border-radius: 4px; overflow: hidden; }
    .calib-bar.declared { background: rgba(99,102,241,0.6); height: 100%; border-radius: 4px; }
    .calib-bar.actual   { background: #10b981; height: 100%; border-radius: 4px; }

    /* Header buttons */
    .header-btns { display: flex; gap: 8px; flex-wrap: wrap; }
    .btn-retrain { background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 9px 18px; color: var(--text-primary); font-weight: 700; font-size: 13px; cursor: pointer; transition: border-color 0.2s; }
    .btn-retrain:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
    .btn-retrain:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Funnel */
    .funnel-row { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; flex-wrap: wrap; }
    .funnel-step { flex: 1; min-width: 120px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 14px 12px; text-align: center; display: flex; flex-direction: column; gap: 4px; }
    .funnel-step.good { border-color: rgba(16,185,129,0.4); }
    .funnel-step.warn-step { border-color: rgba(245,158,11,0.4); }
    .funnel-icon { font-size: 22px; }
    .funnel-n { font-size: 28px; font-weight: 800; color: var(--text-primary); }
    .funnel-n.green { color: #10b981; }
    .funnel-n.orange { color: #f59e0b; }
    .funnel-label { font-size: 12px; font-weight: 600; color: var(--text-secondary); }
    .funnel-sub { font-size: 11px; color: var(--text-muted); }
    .funnel-sub.warn { color: #f59e0b; }
    .funnel-arrow { font-size: 22px; color: var(--text-muted); flex-shrink: 0; }

    /* Last training banner */
    .last-train-banner { background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 10px 16px; font-size: 13px; color: var(--text-secondary); margin-bottom: 12px; }
    .warn-banner { border-color: rgba(245,158,11,0.4); color: #f59e0b; background: rgba(245,158,11,0.05); }

    /* Model grid */
    .model-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px; margin-bottom: 24px; }
    .model-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 4px; }
    .model-card.missing { opacity: 0.6; border-style: dashed; }
    .model-card-header { display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 2px; }
    .model-name { font-size: 12px; font-weight: 700; color: var(--text-primary); }
    .model-status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .model-status-dot.ok { background: #10b981; }
    .model-status-dot.ko { background: #ef4444; }
    .model-trained-at { font-size: 11px; color: var(--text-muted); }
    .model-size { font-size: 11px; color: var(--text-muted); }
    .model-acc { font-size: 12px; color: var(--text-secondary); }
    .model-acc strong { color: var(--accent); }
    .model-missing-msg { font-size: 12px; color: var(--text-muted); font-style: italic; }

    /* Training history table */
    .train-table { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; margin-bottom: 24px; }
    .train-header, .train-row { display: grid; grid-template-columns: 1.6fr 70px 70px 80px 70px 80px; align-items: center; padding: 9px 16px; gap: 6px; }
    .train-header { background: var(--bg-input); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); border-bottom: 1px solid var(--border); }
    .train-row { border-bottom: 1px solid var(--border); font-size: 13px; }
    .train-row:last-child { border-bottom: none; }
    .train-date { color: var(--text-secondary); font-size: 12px; }
    .muted { color: var(--text-muted); text-align: center; }
    .acc-good { color: #10b981; font-weight: 700; }

    /* Scheduler */
    .scheduler-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 6px; }
    .scheduler-item { background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
    .scheduler-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .scheduler-next { font-size: 12px; color: var(--text-muted); }

    /* Empty inline */
    .empty-inline { background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 20px; text-align: center; color: var(--text-muted); font-size: 13px; margin-bottom: 20px; }

    /* Section badge */
    .section-badge { background: var(--accent); color: #000; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 20px; margin-left: 8px; vertical-align: middle; }

    /* History table */
    .history-table { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; margin-bottom: 12px; overflow-x: auto; }
    .ht-header, .ht-row {
      display: grid;
      grid-template-columns: 72px 1fr 100px 90px 40px 40px 40px 80px 56px;
      align-items: center; padding: 9px 14px; gap: 8px; min-width: 700px;
    }
    .ht-header { background: var(--bg-input); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); border-bottom: 1px solid var(--border); }
    .ht-row { border-bottom: 1px solid var(--border); font-size: 12px; transition: background 0.15s; }
    .ht-row:last-child { border-bottom: none; }
    .ht-row:hover { background: var(--bg-input); }
    .ht-row.ht-correct { border-left: 3px solid rgba(16,185,129,0.4); }
    .ht-row.ht-wrong   { border-left: 3px solid rgba(239,68,68,0.3); }

    .ht-date { font-size: 11px; color: var(--text-muted); white-space: nowrap; }
    .ht-match { display: flex; align-items: center; gap: 7px; min-width: 0; }
    .ht-league-logo { width: 16px; height: 16px; object-fit: contain; flex-shrink: 0; }
    .ht-teams { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
    .ht-home, .ht-away { font-size: 11px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ht-vs { font-size: 9px; color: var(--text-muted); }

    .ht-pred { display: flex; flex-direction: column; align-items: center; gap: 2px; }
    .ht-pred-label { font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 4px; }
    .pred-h { background: rgba(59,130,246,0.15); color: #3b82f6; }
    .pred-d { background: rgba(107,114,128,0.15); color: #9ca3af; }
    .pred-a { background: rgba(139,92,246,0.15); color: #8b5cf6; }
    .ht-prob { font-size: 10px; color: var(--text-muted); }

    .ht-actual { display: flex; flex-direction: column; align-items: center; gap: 2px; }
    .ht-score { font-size: 13px; font-weight: 800; color: var(--text-primary); }
    .ht-actual-label { font-size: 10px; color: var(--text-muted); }

    .ht-cell { font-size: 14px; font-weight: 800; color: var(--text-muted); }
    .ht-cell.cell-ok { color: #10b981; }
    .ht-cell.cell-ko { color: #ef4444; }
    .ht-cell.cell-na { color: var(--text-muted); opacity: 0.5; }
    .ht-cell.smart { font-size: 13px; }
    .ht-brier { font-size: 11px; font-weight: 700; color: var(--text-secondary); }
    .ht-brier.brier-good { color: #10b981; }
    .ht-brier.brier-bad  { color: #ef4444; }

    /* Pagination */
    .pagination { display: flex; align-items: center; justify-content: center; gap: 16px; padding: 12px 0 20px; }
    .page-btn { background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 7px 16px; color: var(--text-primary); font-size: 13px; cursor: pointer; transition: all 0.2s; }
    .page-btn:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .page-info { font-size: 12px; color: var(--text-muted); }

    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 60px 20px; gap: 10px; text-align: center; }
    .empty-icon  { font-size: 48px; }
    .empty-state h2 { color: var(--text-primary); margin: 0; font-size: 18px; }
    .empty-state p  { color: var(--text-muted); font-size: 14px; margin: 0; }
    .center-msg { display: flex; flex-direction: column; align-items: center; padding: 60px 20px; gap: 12px; color: var(--text-muted); font-size: 14px; }
    .spinner { width: 32px; height: 32px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 700px) {
      .rc-eval { flex-direction: column; }
      .lt-header, .lt-row { grid-template-columns: 1fr 60px 60px 60px; }
      .lt-header span:nth-child(n+5), .lt-row span:nth-child(n+5) { display: none; }
    }
  `]
})
export class ModelStatsComponent implements OnInit {
  mainTab  = signal<MainTab>('results');
  dayTab   = signal<DayTab>('yesterday');

  resultGroups = signal<any[]>([]);
  loadingResults = signal(false);

  stats        = signal<any | null>(null);
  loadingStats = signal(false);

  evaluating  = signal(false);
  evalMsg     = signal('');
  evalSuccess = signal(false);

  feedbackStatus    = signal<any | null>(null);
  loadingFeedback   = signal(false);
  retraining        = signal(false);
  retrainMsg        = signal('');
  retrainSuccess    = signal(false);

  // Historial de predicciones evaluadas
  historyItems    = signal<any[]>([]);
  historyPage     = signal(1);
  historyTotal    = signal(0);
  historyPages    = signal(1);
  loadingHistory  = signal(false);

  // Computed summary stats from result groups
  allResultMatches = () => this.resultGroups().flatMap(g => g.matches);

  totalFinished = () => this.allResultMatches().length;

  evaluated = () => this.allResultMatches().filter(
    m => m.prediction?.evaluated_at
  ).length;

  resultAccuracy = () => {
    const evald = this.allResultMatches().filter(m => m.prediction?.outcome_correct !== null && m.prediction?.outcome_correct !== undefined);
    if (!evald.length) return 0;
    return Math.round(evald.filter(m => m.prediction.outcome_correct).length / evald.length * 100);
  };

  smartBetWinRate = () => {
    const evald = this.allResultMatches().filter(m => m.prediction?.smart_bet_correct !== null && m.prediction?.smart_bet_correct !== undefined);
    if (!evald.length) return 0;
    return Math.round(evald.filter(m => m.prediction.smart_bet_correct).length / evald.length * 100);
  };

  constructor(private api: ApiService) {}

  // Computed para la pestaña de retroalimentación
  lastTrainingRun = () => {
    const h = this.feedbackStatus()?.training_history;
    return (h && h.length > 0) ? h[0] : null;
  };

  statsRatio = () => {
    const d = this.feedbackStatus()?.data_pipeline;
    if (!d || !d.finished_matches) return 0;
    return Math.round(d.finished_with_stats / d.finished_matches * 100);
  };

  modelEntries = () => {
    const models = this.feedbackStatus()?.models ?? {};
    return Object.entries(models).map(([key, value]) => ({ key, value: value as any }));
  };

  lastRunAccuracy = (modelKey: string): number | null => {
    const run = this.lastTrainingRun();
    return run?.models?.[modelKey]?.accuracy ?? null;
  };

  ngOnInit(): void {
    this.loadResults();
    this.loadStats();
  }

  switchToFeedback(): void {
    this.mainTab.set('feedback');
    if (!this.feedbackStatus()) this.loadFeedback();
    if (this.historyItems().length === 0) this.loadHistory();
  }

  loadFeedback(): void {
    this.loadingFeedback.set(true);
    this.api.getTrainingStatus().subscribe({
      next: s  => { this.feedbackStatus.set(s); this.loadingFeedback.set(false); },
      error: () => this.loadingFeedback.set(false),
    });
  }

  loadHistory(page = 1): void {
    this.loadingHistory.set(true);
    this.api.getPredictionsHistory(page).subscribe({
      next: r => {
        this.historyItems.set(r.items ?? []);
        this.historyTotal.set(r.total ?? 0);
        this.historyPages.set(r.pages ?? 1);
        this.historyPage.set(r.page ?? 1);
        this.loadingHistory.set(false);
      },
      error: () => this.loadingHistory.set(false),
    });
  }

  goToPage(page: number): void {
    this.loadHistory(page);
  }

  runRetrain(): void {
    this.retraining.set(true);
    this.retrainMsg.set('');
    this.api.retrainModels().subscribe({
      next: r => {
        this.retraining.set(false);
        this.retrainSuccess.set(true);
        const trained = Object.keys(r.models_trained ?? {}).length;
        this.retrainMsg.set(
          r.ok
            ? `Reentrenamiento completado. ${r.evaluated ?? 0} predicciones evaluadas, ${trained} modelos actualizados.`
            : (r.message ?? 'Dataset insuficiente para reentrenar.')
        );
        setTimeout(() => this.retrainMsg.set(''), 6000);
        // Refrescar estado
        this.loadFeedback();
        this.loadStats();
      },
      error: () => {
        this.retraining.set(false);
        this.retrainSuccess.set(false);
        this.retrainMsg.set('Error al reentrenar el modelo.');
        setTimeout(() => this.retrainMsg.set(''), 5000);
      },
    });
  }

  switchDay(day: DayTab): void {
    this.dayTab.set(day);
    this.loadResults();
  }

  loadResults(): void {
    this.loadingResults.set(true);
    this.api.getMatchResults(this.dayTab()).subscribe({
      next: r  => { this.resultGroups.set(r.groups ?? []); this.loadingResults.set(false); },
      error: () => this.loadingResults.set(false),
    });
  }

  loadStats(): void {
    this.loadingStats.set(true);
    this.api.getModelStats().subscribe({
      next: s  => { this.stats.set(s); this.loadingStats.set(false); },
      error: () => this.loadingStats.set(false),
    });
  }

  runEvaluate(): void {
    this.evaluating.set(true);
    this.evalMsg.set('');
    this.api.evaluatePredictions().subscribe({
      next: r => {
        this.evaluating.set(false);
        this.evalSuccess.set(true);
        this.evalMsg.set(`Evaluados: ${r.evaluated} partidos.`);
        setTimeout(() => this.evalMsg.set(''), 4000);
        if (r.evaluated > 0) { this.loadResults(); this.loadStats(); }
      },
      error: () => {
        this.evaluating.set(false);
        this.evalSuccess.set(false);
        this.evalMsg.set('Error al evaluar.');
        setTimeout(() => this.evalMsg.set(''), 4000);
      },
    });
  }

  outcomeLabel(match: any): string {
    const p = match.prediction;
    const maxP = Math.max(p.prob_home_win, p.prob_draw, p.prob_away_win);
    if (maxP === p.prob_home_win) return `Gana ${match.home_team.name}`;
    if (maxP === p.prob_away_win) return `Gana ${match.away_team.name}`;
    return 'Empate';
  }

  bttsLabel(match: any): string {
    const hs = match.home_score ?? 0;
    const as_ = match.away_score ?? 0;
    return (hs > 0 && as_ > 0) ? 'Ambos anotaron' : 'No ambos';
  }

  formatTime(dateStr: string): string {
    if (!dateStr) return '--:--';
    return new Date(dateStr).toLocaleTimeString('es-CO', {
      hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota'
    });
  }

  fmtPct(v: number | null | undefined): string {
    return v != null ? (v * 100).toFixed(1) + '%' : '—';
  }

  formatTs(ts: string | null | undefined): string {
    if (!ts) return '—';
    try {
      return new Date(ts).toLocaleString('es-CO', {
        dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Bogota'
      });
    } catch { return ts; }
  }

  fmt(v: number | null | undefined): string {
    return v != null ? v.toFixed(1) + '%' : '—';
  }
  fmtB(v: number | null | undefined): string {
    return v != null ? v.toFixed(3) : '—';
  }
  barW(v: number | null | undefined): string {
    return (v != null ? Math.min(v, 100) : 0) + '%';
  }
  diff(b: any): number {
    return Math.abs(b.avg_predicted - b.actual_pct);
  }

  pct(v: number | null | undefined): string {
    return v != null ? (v * 100).toFixed(0) + '%' : '—';
  }

  shortDate(dateStr: string): string {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: '2-digit', timeZone: 'America/Bogota' });
    } catch { return dateStr.slice(0, 10); }
  }
}
