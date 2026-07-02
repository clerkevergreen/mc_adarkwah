import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Event, EventCategory, Testimonial } from '../models/event.model';
import { GalleryItem, GalleryCategory } from '../models/gallery.model';
import { Service } from '../models/service.model';
import { FAQ } from '../models/faq.model';
import { NewsItem } from '../models/news.model';
import { NavItem } from '../models/navigation.model';

@Injectable({ providedIn: 'root' })
export class DataService {
  constructor(private api: ApiService) {}

  getNavItems(): Observable<NavItem[]> {
    return this.api.getNavItems().pipe(
      map(items => items.length > 0 ? items : this.defaultNavItems),
      catchError(() => of(this.defaultNavItems))
    );
  }

  private get defaultNavItems(): NavItem[] {
    return [
      { label: 'Home', path: '/', fragment: 'hero', icon: 'home' },
      { label: 'About', path: '/', fragment: 'about', icon: 'user' },
      { label: 'Events', path: '/', fragment: 'events', icon: 'calendar' },
      { label: 'Gallery', path: '/', fragment: 'gallery', icon: 'image' },
      { label: 'Services', path: '/', fragment: 'services', icon: 'star' },
      { label: 'Testimonials', path: '/', fragment: 'testimonials', icon: 'message-circle' },
      { label: 'Booking', path: '/', fragment: 'booking', icon: 'calendar-check' },
      { label: 'Contact', path: '/', fragment: 'contact', icon: 'phone' },
    ];
  }

  getUpcomingEvents(): Observable<Event[]> {
    return this.api.getEvents({ isUpcoming: true });
  }

  getPastEvents(): Observable<Event[]> {
    return this.api.getEvents({ isUpcoming: false });
  }

  getFeaturedEvents(): Observable<Event[]> {
    return this.api.getEvents({ isFeatured: true });
  }

  getEventBySlug(slug: string): Observable<Event | null> {
    return this.api.getEventBySlug(slug);
  }

  getGalleryItems(): Observable<GalleryItem[]> {
    return this.api.getGalleryItems();
  }

  getGalleryCategories(): { value: GalleryCategory; label: string }[] {
    return [
      { value: 'all', label: 'All' },
      { value: 'corporate-events', label: 'Corporate Events' },
      { value: 'weddings', label: 'Weddings' },
      { value: 'conferences', label: 'Conferences' },
      { value: 'concerts', label: 'Concerts' },
      { value: 'awards-nights', label: 'Awards Nights' },
      { value: 'church-programs', label: 'Church Programs' },
    ];
  }

  getServices(): Observable<Service[]> {
    return this.api.getServices();
  }

  getTestimonials(): Observable<Testimonial[]> {
    return this.api.getTestimonials();
  }

  getFAQs(): Observable<FAQ[]> {
    return this.api.getFAQs();
  }

  getNewsItems(): Observable<NewsItem[]> {
    return this.api.getNews();
  }

  getSponsors(): Observable<{ name: string; logo: string; website?: string }[]> {
    return this.api.getSponsors();
  }

  getStatistics(): Observable<any[]> {
    return this.api.getStatistics().pipe(
      map(stats => stats.length > 0 ? stats : this.defaultStats),
      catchError(() => of(this.defaultStats))
    );
  }

  private get defaultStats(): any[] {
    return [
      { id: '1', value: 500, suffix: '+', label: 'Events Hosted', icon: 'calendar-check' },
      { id: '2', value: 50, suffix: '+', label: 'Corporate Clients', icon: 'briefcase' },
      { id: '3', value: 20, suffix: '+', label: 'Awards Won', icon: 'award' },
      { id: '4', value: 100000, suffix: '+', label: 'Audience Reached', icon: 'users' },
    ];
  }

  getAboutInfo(): Observable<any> {
    return this.api.getProfile().pipe(
      catchError(() => of(null))
    );
  }
}
