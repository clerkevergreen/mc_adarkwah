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

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getUpcomingEvents().subscribe(data => this.upcomingEvents = data);
    this.dataService.getFeaturedEvents().subscribe(data => this.featuredEvents = data);
  }

  scrollTo(section: string): void {
    const el = document.getElementById(section);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
