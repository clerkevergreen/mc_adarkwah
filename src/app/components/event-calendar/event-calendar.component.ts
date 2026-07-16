import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-event-calendar',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  templateUrl: './event-calendar.component.html',
  styleUrls: ['./event-calendar.component.scss'],
})
export class EventCalendarComponent implements OnInit {
  allEvents: Event[] = [];
  currentMonth: number;
  currentYear: number;
  calendarDays: (number | null)[] = [];
  monthEvents: Event[] = [];
  loading = true;
  error: string | null = null;

  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  constructor(private dataService: DataService) {
    const now = new Date();
    this.currentMonth = now.getMonth();
    this.currentYear = now.getFullYear();
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;
    this.dataService.getUpcomingEvents().subscribe({
      next: (upcoming) => {
        this.dataService.getPastEvents().subscribe({
          next: (past) => {
            this.allEvents = [...upcoming, ...past];
            this.generateCalendar();
            this.loading = false;
          },
          error: (err) => {
            this.error = err.error?.message || err.message || 'Failed to load';
            this.loading = false;
          }
        });
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

  generateCalendar(): void {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

    this.calendarDays = [];
    for (let i = 0; i < firstDay; i++) {
      this.calendarDays.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      this.calendarDays.push(i);
    }

    this.monthEvents = this.allEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getMonth() === this.currentMonth && eventDate.getFullYear() === this.currentYear;
    });
  }

  previousMonth(): void {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.generateCalendar();
  }

  hasEvent(day: number): boolean {
    return this.monthEvents.some(event => new Date(event.date).getDate() === day);
  }
}
