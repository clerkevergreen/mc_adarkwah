import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';
import { Service } from '../../models/service.model';
import { CurrencyService } from '../../services/currency.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss'],
})
export class ServicesComponent implements OnInit, OnDestroy {
  services: Service[] = [];
  selectedService: Service | null = null;
  loading = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private dataService: DataService,
    public currencyService: CurrencyService,
  ) {
    this.currencyService.currency$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      const s = this.selectedService;
      this.selectedService = null;
      setTimeout(() => this.selectedService = s, 0);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;
    this.dataService.getServices().subscribe({
      next: (data) => { this.services = data; this.loading = false; },
      error: (err) => { this.error = err.error?.message || err.message || 'Failed to load'; this.loading = false; }
    });
  }

  retry(): void {
    this.loadData();
  }

  selectService(service: Service): void {
    this.selectedService = service;
  }

  closeModal(): void {
    this.selectedService = null;
  }

  closeModalAndScroll(): void {
    this.selectedService = null;
    setTimeout(() => {
      const el = document.getElementById('booking');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  }
}
