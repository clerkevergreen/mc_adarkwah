import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DataService } from '../../services/data.service';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';
import { CountdownTimerComponent } from '../countdown-timer/countdown-timer.component';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-upcoming-events',
  standalone: true,
  imports: [CommonModule, RouterModule, ScrollRevealDirective, CountdownTimerComponent],
  templateUrl: './upcoming-events.component.html',
  styleUrls: ['./upcoming-events.component.scss'],
})
export class UpcomingEventsComponent implements OnInit {
  upcomingEvents: Event[] = [];
  loading = true;
  error: string | null = null;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;
    this.dataService.getUpcomingEvents().subscribe({
      next: (data) => { this.upcomingEvents = data; this.loading = false; },
      error: (err) => { this.error = err.error?.message || err.message || 'Failed to load'; this.loading = false; }
    });
  }

  retry(): void {
    this.loadData();
  }
}
