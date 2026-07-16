import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DataService } from '../../services/data.service';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';
import { CountdownTimerComponent } from '../countdown-timer/countdown-timer.component';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RouterModule, ScrollRevealDirective, CountdownTimerComponent],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
})
export class EventsComponent implements OnInit {
  upcomingEvents: Event[] = [];
  featuredEvents: Event[] = [];
  loadingFeatured = true;
  loadingUpcoming = true;
  errorFeatured: string | null = null;
  errorUpcoming: string | null = null;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.loadFeatured();
    this.loadUpcoming();
  }

  loadFeatured(): void {
    this.loadingFeatured = true;
    this.errorFeatured = null;
    this.dataService.getFeaturedEvents().subscribe({
      next: (data) => { this.featuredEvents = data; this.loadingFeatured = false; },
      error: (err) => { this.errorFeatured = err.error?.message || err.message || 'Failed to load'; this.loadingFeatured = false; }
    });
  }

  loadUpcoming(): void {
    this.loadingUpcoming = true;
    this.errorUpcoming = null;
    this.dataService.getUpcomingEvents().subscribe({
      next: (data) => { this.upcomingEvents = data; this.loadingUpcoming = false; },
      error: (err) => { this.errorUpcoming = err.error?.message || err.message || 'Failed to load'; this.loadingUpcoming = false; }
    });
  }

  scrollTo(section: string): void {
    const el = document.getElementById(section);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
