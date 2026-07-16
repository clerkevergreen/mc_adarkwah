import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';
import { ApiService } from '../../services/api.service';
import { CurrencyService, CurrencyCode } from '../../services/currency.service';
import { ToastService } from '../../shared/services/toast.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ScrollRevealDirective],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss'],
})
export class BookingComponent implements OnInit, OnDestroy {
  bookingData = {
    fullName: '',
    email: '',
    phone: '',
    eventType: '',
    eventDate: '',
    eventLocation: '',
    guestCount: 0,
    budgetRange: '',
    additionalNotes: '',
    agreeToTerms: false,
  };

  quoteData = {
    name: '',
    email: '',
    phone: '',
    eventType: '',
    eventDate: '',
    guestCount: 0,
    message: '',
  };

  showQuoteForm = false;
  isSubmitting = false;
  isSubmitted = false;
  submitError = '';
  currency: CurrencyCode = 'GHS';
  today = new Date().toISOString().split('T')[0];
  bookingReference = '';
  bookingId = '';
  paying = false;
  blockedDates = new Set<string>();
  bookingDateError = '';
  loadingAvailability = true;
  private destroy$ = new Subject<void>();

  eventTypes = [
    'Wedding Hosting', 'Corporate Event', 'Conference', 'Product Launch',
    'Awards Night', 'Concert Hosting', 'Church Program', 'Private Event',
    'Special Ceremony', 'Other'
  ];

  private toast = inject(ToastService);

  constructor(
    private api: ApiService,
    public currencyService: CurrencyService,
  ) {
    this.currencyService.currency$.pipe(takeUntil(this.destroy$)).subscribe(c => {
      this.currency = c;
    });
    this.currencyService.budgetRanges$.pipe(takeUntil(this.destroy$)).subscribe(() => {});
  }

  get budgetRanges(): string[] {
    const ranges = this.currencyService.budgetRanges;
    if (this.currency === 'GHS') {
      return ranges.map(r => r.label).concat('Not Sure');
    }
    return ranges.map(r => {
      if (r.max === 0) {
        const usd = Math.round(r.min * this.currencyService.rate);
        return `$${usd.toLocaleString()}+`;
      }
      const usdMin = Math.round(r.min * this.currencyService.rate);
      const usdMax = Math.round(r.max * this.currencyService.rate);
      return `$${usdMin.toLocaleString()} - $${usdMax.toLocaleString()}`;
    }).concat('Not Sure');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.api.getAvailability().subscribe({
      next: data => {
        for (const entry of data) {
          if (entry.status === 'blocked' || entry.status === 'booked') {
            this.blockedDates.add(entry.date);
          }
        }
        this.loadingAvailability = false;
      },
      error: () => { this.loadingAvailability = false; },
    });
  }

  onDateChange(dateStr: string): void {
    this.bookingDateError = '';
    this.bookingData.eventDate = dateStr;
    if (dateStr && this.blockedDates.has(dateStr)) {
      this.bookingDateError = 'This date is not available. Please select another date.';
    }
  }

  isDateBlocked(dateStr: string): boolean {
    return this.blockedDates.has(dateStr);
  }

  submitBooking(form: NgForm): void {
    if (form.invalid) return;
    if (this.bookingData.eventDate && this.blockedDates.has(this.bookingData.eventDate)) {
      this.bookingDateError = 'This date is not available. Please select another date.';
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';

    this.api.submitBooking(this.bookingData as any).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.isSubmitted = true;
        this.bookingReference = res.referenceCode || '';
        this.bookingId = res.bookingId || '';
        this.toast.show('Booking request submitted successfully!', 'success');
        this.resetForm(form);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submitError = err.error?.message || 'Failed to submit booking. Please try again.';
        this.toast.show(this.submitError, 'error');
      },
    });
  }

  submitQuote(form: NgForm): void {
    if (form.invalid) return;

    this.isSubmitting = true;
    this.submitError = '';

    this.api.submitQuote(this.quoteData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.isSubmitted = true;
        this.toast.show('Quote request submitted successfully!', 'success');
        this.resetQuoteForm(form);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submitError = err.error?.message || 'Failed to submit quote request. Please try again.';
        this.toast.show(this.submitError, 'error');
      },
    });
  }

  toggleForm(): void {
    this.showQuoteForm = !this.showQuoteForm;
    this.submitError = '';
  }

  private resetForm(form: NgForm): void {
    form.resetForm();
    this.bookingData = {
      fullName: '', email: '', phone: '', eventType: '', eventDate: '',
      eventLocation: '', guestCount: 0, budgetRange: '', additionalNotes: '',
      agreeToTerms: false,
    };
  }

  payNow(): void {
    if (!this.bookingId) return;
    this.paying = true;
    this.api.initializePayment(this.bookingId).subscribe({
      next: (res) => {
        this.paying = false;
        window.location.href = res.authorizationUrl;
      },
      error: (err) => {
        this.paying = false;
        this.toast.show(err.error?.message || 'Failed to initialize payment', 'error');
      },
    });
  }

  resetAll(): void {
    this.isSubmitted = false;
    this.showQuoteForm = false;
    this.submitError = '';
  }

  private resetQuoteForm(form: NgForm): void {
    form.resetForm();
    this.quoteData = {
      name: '', email: '', phone: '', eventType: '', eventDate: '',
      guestCount: 0, message: '',
    };
  }
}
