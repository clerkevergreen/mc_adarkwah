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

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getUpcomingEvents().subscribe(data => this.upcomingEvents = data);
  }
}
