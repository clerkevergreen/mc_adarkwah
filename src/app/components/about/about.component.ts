import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit, AfterViewInit {
  aboutInfo: any;
  statistics: any[] = [];
  counters: { current: number; target: number; suffix: string }[] = [];
  isCounting = false;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.aboutInfo = this.dataService.getAboutInfo();
    this.dataService.getStatistics().subscribe(stats => {
      this.statistics = stats;
    });
  }

  ngAfterViewInit(): void {
    this.initCounterObserver();
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

    const el = document.getElementById('about');
    if (el) observer.observe(el);
  }

  private startCounters(): void {
    this.statistics.forEach((stat, index) => {
      setTimeout(() => {
        this.animateCounter(index);
      }, index * 200);
    });
  }

  private animateCounter(index: number): void {
    const stat = this.statistics[index];
    const target = stat.value;
    const duration = 2000;
    const stepTime = Math.floor(duration / target);
    let current = 0;

    const timer = setInterval(() => {
      current++;
      this.statistics[index] = { ...stat, current };
      if (current >= target) {
        clearInterval(timer);
      }
    }, stepTime);
  }
}
