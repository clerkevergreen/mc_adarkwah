import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map } from 'rxjs';
import { environment } from '../../environments/environment';

export type CurrencyCode = 'GHS' | 'USD';

export interface BudgetRange {
  min: number;
  max: number;
  label: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private currencySubject = new BehaviorSubject<CurrencyCode>(
    (localStorage.getItem('preferred_currency') as CurrencyCode) || 'GHS'
  );
  currency$ = this.currencySubject.asObservable();

  private rateSubject = new BehaviorSubject<number>(0.077);
  rate$ = this.rateSubject.asObservable();

  private budgetRangesSubject = new BehaviorSubject<BudgetRange[]>([
    { min: 2000, max: 5000, label: 'GHS 2,000 - 5,000' },
    { min: 5000, max: 10000, label: 'GHS 5,000 - 10,000' },
    { min: 10000, max: 20000, label: 'GHS 10,000 - 20,000' },
    { min: 20000, max: 50000, label: 'GHS 20,000 - 50,000' },
    { min: 50000, max: 0, label: 'GHS 50,000+' },
  ]);
  budgetRanges$ = this.budgetRangesSubject.asObservable();

  constructor() {
    this.loadProfile();
  }

  refresh(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    this.http.get<ApiResponse<any>>(`${this.apiUrl}/profile`).pipe(
      map(res => res.data)
    ).subscribe({
      next: data => {
        if (data?.exchangeRate) this.rateSubject.next(data.exchangeRate);
        if (data?.budgetRanges?.length) {
          this.budgetRangesSubject.next(
            data.budgetRanges.map((r: any) => ({ min: r.min, max: r.max, label: r.label }))
          );
        }
      },
    });
  }

  get currency(): CurrencyCode {
    return this.currencySubject.value;
  }

  setCurrency(code: CurrencyCode): void {
    this.currencySubject.next(code);
    localStorage.setItem('preferred_currency', code);
  }

  toggle(): void {
    this.setCurrency(this.currency === 'GHS' ? 'USD' : 'GHS');
  }

  getSymbol(): string {
    return this.currency === 'GHS' ? '₵' : '$';
  }

  getCode(): string {
    return this.currency;
  }

  get rate(): number {
    return this.rateSubject.value;
  }

  get budgetRanges(): BudgetRange[] {
    return this.budgetRangesSubject.value;
  }

  convertToUSD(ghsAmount: number): number {
    return ghsAmount * this.rate;
  }

  formatPrice(ghsAmount: number): string {
    if (this.currency === 'GHS') {
      return `₵${ghsAmount.toLocaleString()}`;
    }
    const usd = this.convertToUSD(ghsAmount);
    return `$${Math.round(usd).toLocaleString()}`;
  }

  formatPriceRange(ghsRange: string): string {
    if (!ghsRange) return '';

    const ghsMatch = ghsRange.match(/GHS\s*([\d,]+)\s*-\s*([\d,]+)/);
    if (!ghsMatch) return ghsRange;

    const min = parseInt(ghsMatch[1].replace(/,/g, ''), 10);
    const max = parseInt(ghsMatch[2].replace(/,/g, ''), 10);

    if (isNaN(min) || isNaN(max)) return ghsRange;

    if (this.currency === 'GHS') {
      return `₵${min.toLocaleString()} - ₵${max.toLocaleString()}`;
    }

    const usdMin = Math.round(this.convertToUSD(min));
    const usdMax = Math.round(this.convertToUSD(max));
    return `$${usdMin.toLocaleString()} - $${usdMax.toLocaleString()}`;
  }
}
