import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toasts; track toast.id) {
        <div class="toast" [class.toast--success]="toast.type === 'success'"
          [class.toast--error]="toast.type === 'error'"
          [class.toast--warning]="toast.type === 'warning'">
          <svg class="toast__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path [attr.d]="iconPath(toast.type)" />
          </svg>
          <span class="toast__text">{{ toast.text }}</span>
          <button class="toast__dismiss" (click)="dismiss(toast.id)" aria-label="Dismiss">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container { position:fixed; bottom:1.5rem; right:1.5rem; z-index:3000; display:flex; flex-direction:column; gap:0.5rem; pointer-events:none; }
    @media (max-width:375px) { .toast-container { right:0.5rem; left:0.5rem; } }
    .toast { display:flex; align-items:center; gap:0.65rem; padding:0.85rem 1rem; border-radius:10px; background:rgba(18,18,31,0.95); backdrop-filter:blur(12px); border:1px solid rgba(255,255,255,0.08); box-shadow:0 8px 32px rgba(0,0,0,0.4); min-width:300px; max-width:420px; pointer-events:auto; animation:toastIn 0.3s ease; }
    @media (max-width:375px) { .toast { min-width:0; width:100%; } }
    .toast--success { border-left:3px solid #22c55e; }
    .toast--error { border-left:3px solid #ef4444; }
    .toast--warning { border-left:3px solid #d4a84b; }
    .toast__icon { flex-shrink:0; }
    .toast--success .toast__icon { color:#22c55e; }
    .toast--error .toast__icon { color:#ef4444; }
    .toast--warning .toast__icon { color:#d4a84b; }
    .toast__text { flex:1; font-size:0.85rem; color:rgba(255,255,255,0.9); line-height:1.3; }
    .toast__dismiss { display:flex; align-items:center; justify-content:center; width:24px; height:24px; border-radius:4px; border:none; background:transparent; color:rgba(255,255,255,0.3); cursor:pointer; flex-shrink:0; transition:all 0.2s; }
    .toast__dismiss:hover { background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.7); }
    @keyframes toastIn { from { opacity:0; transform:translateX(100%); } to { opacity:1; transform:translateX(0); } }
  `],
})
export class ToastContainerComponent implements OnInit {
  private toastService = inject(ToastService);
  toasts: ToastMessage[] = [];

  ngOnInit(): void {
    this.toastService.toasts$.subscribe(t => this.toasts = t);
  }

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }

  iconPath(type: string): string {
    switch (type) {
      case 'success': return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'error': return 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'warning': return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
      default: return '';
    }
  }
}
