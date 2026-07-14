import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../shared/services/toast.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-registration-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reg-backdrop" (click)="close.emit()">
      <div class="reg-modal" (click)="$event.stopPropagation()">
        <button class="reg-close" (click)="close.emit()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div class="reg-header">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2"><path d="M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"/></svg>
          <h2>Register for {{ eventTitle }}</h2>
          <p *ngIf="!submitted">Fill in your details to register for this event.</p>
        </div>

        <ng-container *ngIf="!submitted; else successMsg">
          <div class="reg-form">
            <div class="reg-field">
              <label>Full Name *</label>
              <input type="text" #rName="ngModel" [(ngModel)]="form.fullName" name="fullName" required placeholder="Your full name"
                [class.reg-field__input--error]="rName.invalid && (rName.dirty || rName.touched)" />
              <div class="reg-field__error" *ngIf="rName.invalid && (rName.dirty || rName.touched)">
                <span *ngIf="rName.errors?.['required']">Name is required</span>
              </div>
            </div>
            <div class="reg-field">
              <label>Email *</label>
              <input type="email" #rEmail="ngModel" [(ngModel)]="form.email" name="email" required placeholder="your@email.com"
                [class.reg-field__input--error]="rEmail.invalid && (rEmail.dirty || rEmail.touched)" />
              <div class="reg-field__error" *ngIf="rEmail.invalid && (rEmail.dirty || rEmail.touched)">
                <span *ngIf="rEmail.errors?.['required']">Email is required</span>
                <span *ngIf="rEmail.errors?.['email']">Enter a valid email</span>
              </div>
            </div>
            <div class="reg-field">
              <label>Phone</label>
              <input type="tel" [(ngModel)]="form.phone" name="phone" placeholder="+233 55 000 0000" />
            </div>
            <div class="reg-field">
              <label>Message (optional)</label>
              <textarea [(ngModel)]="form.message" name="message" rows="3" placeholder="Any questions or special requests..."></textarea>
            </div>
            <div class="reg-error" *ngIf="error">{{ error }}</div>
            <button class="reg-submit" (click)="submit()" [disabled]="saving">
              <span *ngIf="saving" class="reg-spinner"></span>
              {{ saving ? 'Submitting...' : 'Complete Registration' }}
            </button>
          </div>
        </ng-container>

        <ng-template #successMsg>
          <div class="reg-success">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="16 8 10 16 7 13"/></svg>
            <h3>Registration Successful!</h3>
            <p>You have been registered for {{ eventTitle }}. We will send you a confirmation email with further details.</p>
            <button class="reg-submit" (click)="close.emit()">Done</button>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .reg-backdrop {
      position: fixed; inset: 0; z-index: 10000;
      background: rgba(0,0,0,0.7); display: flex;
      align-items: center; justify-content: center; padding: 1rem;
    }
    .reg-modal {
      background: #1a1a1a; border: 1px solid rgba(201,168,76,0.2);
      border-radius: 16px; width: 100%; max-width: 480px;
      max-height: 90vh; overflow-y: auto; padding: 2rem; position: relative;
    }
    .reg-close {
      position: absolute; top: 1rem; right: 1rem;
      background: rgba(255,255,255,0.05); border: none;
      color: rgba(255,255,255,0.5); cursor: pointer;
      width: 36px; height: 36px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
    }
    .reg-close:hover { background: rgba(255,255,255,0.1); color: #fff; }
    .reg-header { text-align: center; margin-bottom: 1.5rem; }
    .reg-header svg { margin-bottom: 0.5rem; }
    .reg-header h2 { color: #fff; font-size: 1.3rem; font-family: 'Playfair Display', serif; margin: 0; }
    .reg-header p { color: rgba(255,255,255,0.5); font-size: 0.85rem; margin-top: 0.5rem; }
    .reg-form { display: flex; flex-direction: column; gap: 1rem; }
    .reg-field label { display: block; color: rgba(255,255,255,0.7); font-size: 0.8rem; margin-bottom: 0.3rem; }
    .reg-field input, .reg-field textarea {
      width: 100%; padding: 0.7rem 0.9rem; background: rgba(255,255,255,0.05);
      border: 1px solid rgba(201,168,76,0.15); border-radius: 8px;
      color: #fff; font-size: 0.9rem; outline: none; box-sizing: border-box;
    }
    .reg-field input:focus, .reg-field textarea:focus { border-color: rgba(201,168,76,0.4); }
    .reg-field textarea { resize: vertical; font-family: inherit; }
    .reg-field__input--error { border-color: #ef4444 !important; }
    .reg-field__input--error:focus { border-color: #ef4444 !important; box-shadow: 0 0 0 2px rgba(#ef4444, 0.15) !important; }
    .reg-field__error { color: #ef4444; font-size: 0.7rem; margin-top: 0.2rem; }
    .reg-error { color: #ef4444; font-size: 0.8rem; }
    .reg-submit {
      width: 100%; padding: 0.85rem; background: #C9A84C; color: #1a1a1a;
      border: none; border-radius: 8px; font-size: 0.95rem; font-weight: 600;
      cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
      transition: background 0.2s;
    }
    .reg-submit:hover { background: #b8953a; }
    .reg-submit:disabled { opacity: 0.6; cursor: not-allowed; }
    .reg-spinner {
      width: 18px; height: 18px; border: 2px solid transparent;
      border-top-color: #1a1a1a; border-radius: 50%; animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .reg-success { text-align: center; padding: 1.5rem 0; }
    .reg-success svg { margin-bottom: 1rem; }
    .reg-success h3 { color: #10b981; font-size: 1.2rem; margin: 0 0 0.5rem; }
    .reg-success p { color: rgba(255,255,255,0.6); font-size: 0.9rem; line-height: 1.5; margin-bottom: 1.5rem; }
  `],
})
export class RegistrationFormComponent {
  @Input() eventId = '';
  @Input() eventTitle = '';
  @Output() close = new EventEmitter<void>();

  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private apiUrl = environment.apiUrl;

  form = { fullName: '', email: '', phone: '', message: '' };
  saving = false;
  submitted = false;
  error = '';

  submit(): void {
    this.error = '';
    if (!this.form.fullName.trim() || !this.form.email.trim()) {
      this.error = 'Please fill in your name and email.';
      return;
    }
    this.saving = true;
    this.http.post<any>(`${this.apiUrl}/registrations`, {
      fullName: this.form.fullName,
      email: this.form.email,
      phone: this.form.phone,
      message: this.form.message,
      event: this.eventId,
    }).subscribe({
      next: () => { this.saving = false; this.submitted = true; this.toast.show('Registration successful!', 'success'); },
      error: () => { this.saving = false; this.error = 'Something went wrong. Please try again.'; this.toast.show(this.error, 'error'); },
    });
  }
}
