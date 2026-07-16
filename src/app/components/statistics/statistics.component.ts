import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
})
export class StatisticsComponent implements OnInit, AfterViewInit {
  statistics: any[] = [];
  isCounting = false;
  loading = true;
  error: string | null = null;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    // counter observer initialized after data loads
  }

  loadData(): void {
    this.loading = true;
    this.error = null;
    this.dataService.getStatistics().subscribe({
      next: (stats) => {
        this.statistics = stats.map(s => ({ ...s, current: 0 }));
        this.loading = false;
        if (this.statistics.length > 0) this.initCounterObserver();
      },
      error: (err) => {
        this.error = err.error?.message || err.message || 'Failed to load';
        this.loading = false;
      }
    });
  }

  retry(): void {
    this.loadData();
  }

  private initCounterObserver(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !this.isCounting) {
          this.isCounting = true;
          this.startCounters();
          observer.disconnect();
        }
      });
    }, { threshold: 0.3 });

    const el = document.getElementById('stats');
    if (el) observer.observe(el);
  }

  private startCounters(): void {
    this.statistics.forEach((stat, index) => {
      setTimeout(() => this.animateCounter(index), index * 200);
    });
  }

  private animateCounter(index: number): void {
    const target = this.statistics[index].value;
    const duration = 2000;
    const stepTime = Math.max(10, Math.floor(duration / target));
    let current = 0;

    const timer = setInterval(() => {
      current++;
      this.statistics[index] = { ...this.statistics[index], current };
      if (current >= target) clearInterval(timer);
    }, stepTime);
  }
}
