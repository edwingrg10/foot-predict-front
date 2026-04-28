import {
  Component, signal, ViewChild, ElementRef,
  AfterViewChecked, OnInit, OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ApiService } from '../../services/api.service';
import { Match } from '../../models/interfaces';

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-page">

      <!-- Header -->
      <div class="chat-header">
        <div class="chat-title">
          <span class="chat-icon">💬</span>
          <div>
            <h1>Chat con el Modelo</h1>
            <p>Pregunta sobre pronósticos, estadísticas y value bets</p>
          </div>
        </div>

        <div class="context-selector">
          <label>Contexto:</label>
          <select [(ngModel)]="selectedMatchId" class="match-select">
            <option [ngValue]="null">Todos los partidos de hoy</option>
            @for (m of todayMatches(); track m.id) {
              <option [ngValue]="m.id">{{ m.home_team.name }} vs {{ m.away_team.name }}</option>
            }
          </select>
        </div>
      </div>

      <!-- Messages -->
      <div class="messages-wrap" #messagesWrap>
        @if (messages().length === 0) {
          <div class="chat-welcome">
            <div class="welcome-icon">🤖</div>
            <h2>¡Hola! Soy el asistente de FootPredict</h2>
            <p>Tengo acceso a las predicciones de todos los partidos de hoy.<br>Pregúntame lo que quieras sobre pronósticos, cuotas o estrategias de apuesta.</p>
            <div class="suggestion-chips">
              <button class="chip" (click)="sendSuggestion('¿Cuáles son los mejores partidos de hoy para apostar Over 2.5?')">⚽ Mejores Over 2.5</button>
              <button class="chip" (click)="sendSuggestion('¿Qué partidos tienen más córneres esperados hoy?')">🚩 Más córneres</button>
              <button class="chip" (click)="sendSuggestion('¿Me puedes sugerir un parlay para hoy con buena cuota combinada?')">🎰 Sugerir parlay</button>
              <button class="chip" (click)="sendSuggestion('¿Cuáles son los value bets más destacados de hoy?')">💡 Value bets</button>
              <button class="chip" (click)="sendSuggestion('¿Qué partidos de Champions League hay hoy?')">🏆 Champions League</button>
              <button class="chip" (click)="sendSuggestion('¿Qué partidos hay esta noche?')">🌙 Esta noche</button>
              <button class="chip" (click)="sendSuggestion('¿Qué partidos hay esta tarde?')">☀️ Esta tarde</button>
              <button class="chip" (click)="sendSuggestion('¿Qué tarjetas se esperan hoy?')">🟨 Tarjetas</button>
            </div>
          </div>
        }

        @for (msg of messages(); track $index) {
          <div class="message-row" [class.user-row]="msg.role === 'user'" [class.ai-row]="msg.role === 'assistant'">
            @if (msg.role === 'assistant') {
              <div class="avatar">🤖</div>
            }
            <div class="bubble" [class.user-bubble]="msg.role === 'user'" [class.ai-bubble]="msg.role === 'assistant'">
              @if (msg.role === 'assistant') {
                <div class="ai-content" [innerHTML]="renderMarkdown(msg.content)"></div>
                @if (msg.streaming) {
                  <span class="cursor">▋</span>
                }
              } @else {
                {{ msg.content }}
              }
            </div>
            @if (msg.role === 'user') {
              <div class="avatar user-avatar">👤</div>
            }
          </div>
        }

        @if (loading() && (messages().length === 0 || messages()[messages().length - 1].role !== 'assistant')) {
          <div class="message-row ai-row">
            <div class="avatar">🤖</div>
            <div class="bubble ai-bubble typing-bubble">
              <span></span><span></span><span></span>
            </div>
          </div>
        }
      </div>

      <!-- Input -->
      <div class="chat-input-area">
        <div class="input-row">
          <textarea
            class="chat-textarea"
            [(ngModel)]="inputText"
            placeholder="Pregunta sobre algún partido, mercado o estrategia..."
            rows="1"
            (keydown.enter)="onEnter($event)"
            [disabled]="loading()"
          ></textarea>
          <button
            class="send-btn"
            (click)="send()"
            [disabled]="loading() || !inputText.trim()"
          >
            @if (loading()) { ⏳ } @else { ➤ }
          </button>
        </div>
        <div class="input-hint">Enter para enviar · Shift+Enter para nueva línea</div>
      </div>
    </div>
  `,
  styles: [`
    .chat-page {
      display: flex;
      flex-direction: column;
      height: calc(100vh - 57px);
      background: var(--bg-primary);
      max-width: 900px;
      margin: 0 auto;
      width: 100%;
    }
    .chat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
      padding: 16px 24px;
      border-bottom: 1px solid var(--border);
      background: var(--bg-card);
      flex-shrink: 0;
    }
    .chat-title { display: flex; align-items: center; gap: 12px; }
    .chat-icon { font-size: 32px; }
    .chat-title h1 { font-size: 18px; font-weight: 800; margin: 0; }
    .chat-title p { font-size: 12px; color: var(--text-muted); margin: 0; }
    .context-selector {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--text-secondary);
    }
    .match-select {
      background: var(--bg-input);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 6px 10px;
      color: var(--text-primary);
      font-size: 12px;
      outline: none;
      max-width: 240px;
    }
    .match-select:focus { border-color: var(--accent); }

    .messages-wrap {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      scroll-behavior: smooth;
    }
    .chat-welcome {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 12px;
      padding: 40px 20px;
      color: var(--text-secondary);
    }
    .welcome-icon { font-size: 56px; }
    .chat-welcome h2 { font-size: 20px; font-weight: 800; color: var(--text-primary); margin: 0; }
    .chat-welcome p { font-size: 14px; line-height: 1.6; margin: 0; }
    .suggestion-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
      margin-top: 8px;
    }
    .chip {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 7px 14px;
      font-size: 13px;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s;
    }
    .chip:hover { border-color: var(--accent); color: var(--accent); background: rgba(0,255,135,0.05); }

    .message-row {
      display: flex;
      align-items: flex-end;
      gap: 10px;
      max-width: 100%;
    }
    .user-row { flex-direction: row-reverse; }
    .avatar {
      font-size: 24px;
      flex-shrink: 0;
      width: 36px;
      text-align: center;
    }
    .user-avatar { font-size: 20px; }
    .bubble {
      max-width: 72%;
      padding: 12px 16px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.6;
      word-break: break-word;
    }
    .user-bubble {
      background: var(--accent);
      color: #000;
      border-bottom-right-radius: 4px;
      font-weight: 500;
    }
    .ai-bubble {
      background: var(--bg-card);
      border: 1px solid var(--border);
      color: var(--text-primary);
      border-bottom-left-radius: 4px;
    }
    .ai-content { white-space: pre-wrap; }
    .cursor {
      display: inline-block;
      animation: blink 0.8s step-end infinite;
      color: var(--accent);
      font-weight: bold;
    }
    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

    .typing-bubble {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 14px 18px;
    }
    .typing-bubble span {
      display: inline-block;
      width: 8px;
      height: 8px;
      background: var(--text-muted);
      border-radius: 50%;
      animation: bounce 1.2s infinite;
    }
    .typing-bubble span:nth-child(2) { animation-delay: 0.2s; }
    .typing-bubble span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
      40% { transform: scale(1.1); opacity: 1; }
    }

    .chat-input-area {
      padding: 16px 24px;
      border-top: 1px solid var(--border);
      background: var(--bg-card);
      flex-shrink: 0;
    }
    .input-row {
      display: flex;
      gap: 10px;
      align-items: flex-end;
    }
    .chat-textarea {
      flex: 1;
      background: var(--bg-input);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 12px 16px;
      color: var(--text-primary);
      font-size: 14px;
      resize: none;
      outline: none;
      min-height: 48px;
      max-height: 160px;
      line-height: 1.5;
      font-family: inherit;
      overflow-y: auto;
    }
    .chat-textarea:focus { border-color: var(--accent); }
    .chat-textarea:disabled { opacity: 0.5; }
    .send-btn {
      background: var(--accent);
      border: none;
      border-radius: 12px;
      width: 48px;
      height: 48px;
      font-size: 18px;
      cursor: pointer;
      color: #000;
      flex-shrink: 0;
      transition: opacity 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .send-btn:hover:not(:disabled) { opacity: 0.85; }
    .send-btn:disabled { opacity: 0.4; cursor: default; }
    .input-hint {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 6px;
      text-align: right;
    }
  `],
})
export class ChatComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('messagesWrap') messagesWrap!: ElementRef<HTMLDivElement>;

  messages = signal<ChatMsg[]>([]);
  loading = signal(false);
  todayMatches = signal<Match[]>([]);
  inputText = '';
  selectedMatchId: number | null = null;

  private shouldScroll = false;
  private typewriterTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private api: ApiService,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit(): void {
    this.api.getTodayMatches().subscribe({
      next: res => {
        const matches: Match[] = [];
        (res.groups || []).forEach(g => matches.push(...g.matches));
        this.todayMatches.set(matches);
      },
      error: () => { },
    });
  }

  ngOnDestroy(): void {
    this.clearTypewriter();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  private scrollToBottom(): void {
    try {
      const el = this.messagesWrap.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch { }
  }

  private clearTypewriter(): void {
    if (this.typewriterTimer !== null) {
      clearInterval(this.typewriterTimer);
      this.typewriterTimer = null;
    }
  }

  onEnter(event: Event): void {
    if (!(event as KeyboardEvent).shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  sendSuggestion(text: string): void {
    this.inputText = text;
    this.send();
  }

  send(): void {
    const text = this.inputText.trim();
    if (!text || this.loading()) return;

    this.inputText = '';
    this.loading.set(true);
    this.clearTypewriter();

    const history = this.messages().map(m => ({ role: m.role, content: m.content }));

    this.messages.update(msgs => [
      ...msgs,
      { role: 'user', content: text },
      { role: 'assistant', content: '', streaming: true },
    ]);
    this.shouldScroll = true;

    this.api.chat(text, history, this.selectedMatchId).subscribe({
      next: res => {
        this.typeWriter(res.response);
      },
      error: () => {
        this.updateLastMessage('Error de conexión. Verifica que el backend esté activo.', false);
        this.loading.set(false);
      },
    });
  }

  private typeWriter(fullText: string, chunkSize = 4, delayMs = 14): void {
    let i = 0;
    this.typewriterTimer = setInterval(() => {
      if (i >= fullText.length) {
        this.clearTypewriter();
        this.messages.update(msgs => {
          const updated = [...msgs];
          const last = updated[updated.length - 1];
          if (last?.role === 'assistant') {
            updated[updated.length - 1] = { ...last, streaming: false };
          }
          return updated;
        });
        this.loading.set(false);
        return;
      }
      const chunk = fullText.slice(i, i + chunkSize);
      this.appendToLastMessage(chunk);
      this.shouldScroll = true;
      i += chunkSize;
    }, delayMs);
  }

  private appendToLastMessage(text: string): void {
    this.messages.update(msgs => {
      const updated = [...msgs];
      const last = updated[updated.length - 1];
      if (last?.role === 'assistant') {
        updated[updated.length - 1] = { ...last, content: last.content + text };
      }
      return updated;
    });
  }

  private updateLastMessage(text: string, streaming: boolean): void {
    this.messages.update(msgs => {
      const updated = [...msgs];
      const last = updated[updated.length - 1];
      if (last?.role === 'assistant') {
        updated[updated.length - 1] = { ...last, content: text, streaming };
      }
      return updated;
    });
  }

  renderMarkdown(text: string): SafeHtml {
    if (!text) return this.sanitizer.bypassSecurityTrustHtml('');
    const html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^### (.+)$/gm, '<strong style="font-size:13px;text-transform:uppercase;color:var(--accent)">$1</strong>')
      .replace(/^## (.+)$/gm, '<strong style="font-size:15px">$1</strong>')
      .replace(/^- (.+)$/gm, '&nbsp;&nbsp;• $1')
      .replace(/\n/g, '<br>');
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
