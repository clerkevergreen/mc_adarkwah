import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DataService } from '../../services/data.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
  activeTab: 'events' | 'gallery' | 'bookings' | 'testimonials' | 'faqs' = 'events';
  events: any[] = [];
  galleryItems: any[] = [];
  testimonials: any[] = [];
  faqs: any[] = [];
  bookings: any[] = [];

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    forkJoin({
      upcoming: this.dataService.getUpcomingEvents(),
      past: this.dataService.getPastEvents(),
      gallery: this.dataService.getGalleryItems(),
      testimonials: this.dataService.getTestimonials(),
      faqs: this.dataService.getFAQs(),
    }).subscribe(({ upcoming, past, gallery, testimonials, faqs }) => {
      this.events = [...upcoming, ...past];
      this.galleryItems = gallery;
      this.testimonials = testimonials;
      this.faqs = faqs;
    });
  }

  switchTab(tab: 'events' | 'gallery' | 'bookings' | 'testimonials' | 'faqs'): void {
    this.activeTab = tab;
  }

  deleteItem(type: string, id: string): void {
    if (confirm('Are you sure you want to delete this item?')) {
      console.log(`Delete ${type} with id: ${id}`);
    }
  }

  getStatus(date: string): string {
    return new Date(date) > new Date() ? 'Upcoming' : 'Past';
  }
}
