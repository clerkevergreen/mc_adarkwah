import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';
import { forkJoin } from 'rxjs';

const defaultAboutInfo = {
  name: 'MC Adarkwah',
  title: 'Professional Master of Ceremonies & Event Host',
  bio: 'Meet MC Adarkwah, one of Africa\'s most sought-after professional Masters of Ceremonies. With over a decade of experience hosting events across Africa and internationally, she has earned a reputation for excellence, elegance, and unmatched stage presence.',
  achievements: [
    'Best Event Host - Ghana Events Awards 2024',
    'Event Host of the Year - African Entertainment Awards 2023',
    'Top 50 Most Influential Women in Events - 2024',
    'Professional MC Certification - International Association of Professional MCs',
  ],
  milestones: [
    { year: 2014, title: 'First Professional Event', description: 'Hosted first corporate event for a telecommunications company.' },
    { year: 2016, title: 'Major Breakthrough', description: 'Hosted the Ghana Music Awards, reaching national recognition.' },
    { year: 2018, title: 'International Debut', description: 'First international event hosting in Nigeria.' },
    { year: 2020, title: 'Digital Innovation', description: 'Launched virtual event hosting services during the pandemic.' },
    { year: 2022, title: 'Pan-African Recognition', description: 'Hosted events in 10+ African countries.' },
    { year: 2024, title: 'Award-Winning MC', description: 'Won multiple awards and recognized as top MC in Africa.' },
    { year: 2026, title: 'Global Stage', description: 'Expanding to international events and launching MC academy.' },
  ],
  socialMedia: {},
  contact: {},
};

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit, AfterViewInit {
  aboutInfo: any = defaultAboutInfo;
  statistics: any[] = [];
  counters: { current: number; target: number; suffix: string }[] = [];
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
    forkJoin({
      about: this.dataService.getAboutInfo(),
      stats: this.dataService.getStatistics()
    }).subscribe({
      next: ({ about, stats }) => {
        if (about) this.aboutInfo = about;
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
