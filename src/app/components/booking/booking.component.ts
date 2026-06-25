import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';
import { ApiService } from '../../services/api.service';
import { CurrencyService, CurrencyCode } from '../../services/currency.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, ScrollRevealDirective],
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
  private destroy$ = new Subject<void>();

  eventTypes = [
    'Wedding Hosting', 'Corporate Event', 'Conference', 'Product Launch',
    'Awards Night', 'Concert Hosting', 'Church Program', 'Private Event',
    'Special Ceremony', 'Other'
  ];

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
    const today = new Date().toISOString().split('T')[0];
    (document.querySelector('input[type="date"]') as HTMLInputElement)?.setAttribute('min', today);
  }

  submitBooking(form: NgForm): void {
    if (form.invalid) return;

    this.isSubmitting = true;
    this.submitError = '';

    this.api.submitBooking(this.bookingData as any).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.isSubmitted = true;
        this.resetForm(form);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submitError = err.error?.message || 'Failed to submit booking. Please try again.';
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
        this.resetQuoteForm(form);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submitError = err.error?.message || 'Failed to submit quote request. Please try again.';
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
