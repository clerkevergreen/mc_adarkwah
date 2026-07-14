import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../shared/services/toast.service';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';

interface BookingData {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  eventLocation: string;
  guestCount: number;
  budgetRange: string;
  additionalNotes: string;
  referenceCode: string;
  status: string;
  createdAt: string;
}

@Component({
  selector: 'app-client-portal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ScrollRevealDirective],
  templateUrl: './client-portal.component.html',
  styleUrls: ['./client-portal.component.scss'],
})
export class ClientPortalComponent {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private apiUrl = environment.apiUrl;

  email = '';
  referenceCode = '';
  loading = false;
  error = '';
  booking: BookingData | null = null;
  downloading = false;

  lookup(): void {
    if (!this.email || !this.referenceCode) {
      this.error = 'Please enter both email and reference code.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.booking = null;

    this.http.post<{ success: boolean; data: BookingData }>(`${this.apiUrl}/portal/lookup`, {
      email: this.email,
      referenceCode: this.referenceCode,
    }).subscribe({
      next: (res) => {
        this.booking = res.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Booking not found. Check your details and try again.';
        this.loading = false;
      },
    });
  }

  downloadContract(): void {
    if (!this.booking) return;
    this.downloading = true;
    this.http.get(`${this.apiUrl}/portal/${this.booking._id}/contract`, { responseType: 'blob' })
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `contract-${this.booking!.referenceCode}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
          this.downloading = false;
          this.toast.show('Contract downloaded', 'success');
        },
        error: () => {
          this.downloading = false;
          this.toast.show('Failed to download contract', 'error');
        },
      });
  }

  reset(): void {
    this.booking = null;
    this.email = '';
    this.referenceCode = '';
    this.error = '';
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'badge--warning',
      confirmed: 'badge--success',
      cancelled: 'badge--danger',
      completed: 'badge--info',
    };
    return map[status] || 'badge--default';
  }
}
