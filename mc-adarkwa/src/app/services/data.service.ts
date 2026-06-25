import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
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
      map(items => items.length > 0 ? items : [
        { label: 'Home', path: '/', fragment: 'hero', icon: 'home' },
        { label: 'About', path: '/', fragment: 'about', icon: 'user' },
        { label: 'Events', path: '/', fragment: 'events', icon: 'calendar' },
        { label: 'Gallery', path: '/', fragment: 'gallery', icon: 'image' },
        { label: 'Services', path: '/', fragment: 'services', icon: 'star' },
        { label: 'Testimonials', path: '/', fragment: 'testimonials', icon: 'message-circle' },
        { label: 'Booking', path: '/', fragment: 'booking', icon: 'calendar-check' },
        { label: 'Contact', path: '/', fragment: 'contact', icon: 'phone' },
      ])
    );
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
      map(stats => stats.length > 0 ? stats : [
        { id: '1', value: 500, suffix: '+', label: 'Events Hosted', icon: 'calendar-check' },
        { id: '2', value: 50, suffix: '+', label: 'Corporate Clients', icon: 'briefcase' },
        { id: '3', value: 20, suffix: '+', label: 'Awards Won', icon: 'award' },
        { id: '4', value: 100000, suffix: '+', label: 'Audience Reached', icon: 'users' },
      ])
    );
  }

  getAboutInfo() {
    return {
      name: 'MC Adarkwah',
      title: 'Professional Master of Ceremonies & Event Host',
      bio: 'Meet MC Adarkwah, Ghana\'s most sought-after professional Master of Ceremonies. With over a decade of experience hosting events across Africa and internationally, she has earned a reputation for excellence, elegance, and unmatched stage presence. Her journey began with a passion for public speaking and event coordination, which has blossomed into a thriving career hosting some of the continent\'s most prestigious events. From intimate private celebrations to large-scale corporate conferences and international concerts, MC Adarkwah brings energy, professionalism, and a unique ability to connect with any audience.',
      fullBio: 'With a background in Communication Studies and Event Management, MC Adarkwah has mastered the art of event hosting. She has shared the stage with global icons, moderated high-level panels, and entertained audiences of over 25,000 people. Her ability to adapt to any event type, audience, or culture makes her one of the most versatile MCs in Africa. She is fluent in English, Twi, and Ga, allowing her to connect authentically with diverse audiences. Beyond hosting, MC Adarkwah is a mentor to aspiring emcees and a passionate advocate for women in the events industry.',
      image: 'assets/images/about/mc-adarkwah.jpg',
      image2: 'assets/images/about/mc-adarkwah-2.jpg',
      yearsExperience: 10,
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
      socialMedia: {
        instagram: 'https://instagram.com/mc_adarkwah',
        twitter: 'https://twitter.com/mc_adarkwah',
        facebook: 'https://facebook.com/mc_adarkwah',
        youtube: 'https://youtube.com/@mc_adarkwah',
        linkedin: 'https://linkedin.com/in/mc-adarkwah',
        tiktok: 'https://tiktok.com/@mc_adarkwah',
      },
      contact: {
        phone: '+44 7507 615314',
        phone2: '+233 55 291 7251',
        whatsapp: '+44 7507 615314',
        email: 'mcadarkwah@gmail.com',
        address: 'Ghana & United Kingdom',
        office: 'Accra, Ghana & London, UK',
      },
    };
  }
}
