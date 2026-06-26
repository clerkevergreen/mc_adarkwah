import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { SeoService } from '../../services/seo.service';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';
import { Event, EventCategory, EventFilter } from '../../models/event.model';

@Component({
  selector: 'app-past-events',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent, FooterComponent, ScrollRevealDirective],
  templateUrl: './past-events.component.html',
  styleUrls: ['./past-events.component.scss'],
})
export class PastEventsComponent implements OnInit {
  allPastEvents: Event[] = [];
  filteredEvents: Event[] = [];
  years: number[] = [];
  categories: { value: EventCategory | ''; label: string }[] = [];
  locations: string[] = [];

  filter: EventFilter = {};

  constructor(private dataService: DataService, private seo: SeoService) {}

  ngOnInit(): void {
    this.seo.setPageTitle('Past Events');
    this.dataService.getPastEvents().subscribe(events => {
      this.allPastEvents = events;
      this.filteredEvents = [...this.allPastEvents];

      this.years = [...new Set(this.allPastEvents.map(e => new Date(e.date).getFullYear()))].sort((a, b) => b - a);
      const uniqueCategories: EventCategory[] = [...new Set(this.allPastEvents.map(e => e.category))] as EventCategory[];
      this.categories = [
        { value: '' as EventCategory, label: 'All Categories' },
        ...uniqueCategories.map((c: EventCategory) => ({ value: c, label: c.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) })),
      ];
      this.locations = ['All Locations', ...new Set(this.allPastEvents.map(e => e.city))];
    });
  }

  applyFilters(): void {
    this.filteredEvents = this.allPastEvents.filter(event => {
      if (this.filter.year && new Date(event.date).getFullYear() !== this.filter.year) return false;
      if (this.filter.category && event.category !== this.filter.category) return false;
      if (this.filter.location && this.filter.location !== 'All Locations' && event.city !== this.filter.location) return false;
      if (this.filter.search) {
        const search = this.filter.search.toLowerCase();
        if (!event.title.toLowerCase().includes(search) && !event.description.toLowerCase().includes(search)) return false;
      }
      return true;
    });
  }

  clearFilters(): void {
    this.filter = {};
    this.filteredEvents = [...this.allPastEvents];
  }
}
