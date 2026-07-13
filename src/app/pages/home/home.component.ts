import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { SeoService } from '../../services/seo.service';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { HeroComponent } from '../../components/hero/hero.component';
import { AboutComponent } from '../../components/about/about.component';
import { EventsComponent } from '../../components/events/events.component';
import { GalleryComponent } from '../../components/gallery/gallery.component';
import { ServicesComponent } from '../../components/services/services.component';
import { TestimonialsComponent } from '../../components/testimonials/testimonials.component';
import { StatisticsComponent } from '../../components/statistics/statistics.component';
import { VideoHighlightsComponent } from '../../components/video-highlights/video-highlights.component';
import { BookingComponent } from '../../components/booking/booking.component';
import { ContactComponent } from '../../components/contact/contact.component';
import { FaqComponent } from '../../components/faq/faq.component';
import { SponsorsComponent } from '../../components/sponsors/sponsors.component';
import { McProfileComponent } from '../../components/mc-profile/mc-profile.component';
import { EventCalendarComponent } from '../../components/event-calendar/event-calendar.component';
import { UpcomingEventsComponent } from '../../components/upcoming-events/upcoming-events.component';
import { NewsComponent } from '../../components/news/news.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { LoadingScreenComponent } from '../../components/loading-screen/loading-screen.component';
import { BackToTopComponent } from '../../components/back-to-top/back-to-top.component';
import { WhatsappChatComponent } from '../../components/whatsapp-chat/whatsapp-chat.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    NavbarComponent, HeroComponent, AboutComponent, EventsComponent,
    GalleryComponent, ServicesComponent, TestimonialsComponent,
    StatisticsComponent, VideoHighlightsComponent, BookingComponent,
    ContactComponent, FaqComponent, SponsorsComponent, McProfileComponent,
    EventCalendarComponent, UpcomingEventsComponent, NewsComponent,
    FooterComponent, LoadingScreenComponent, BackToTopComponent,
    WhatsappChatComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  constructor(
    private seo: SeoService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.seo.setPageTitle('Home');
    this.seo.setMetaTags({
      description: 'MC Adarkwah - Ghana\'s premier professional Master of Ceremonies. Making every event memorable with elegance, energy, and excellence.',
      image: 'assets/images/og-image.jpg',
      url: 'https://mcadarkwah.com',
    });
    this.seo.setStructuredData({
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      '@id': 'https://mcadarkwah.com',
      name: 'MC Adarkwah',
      alternateName: 'MC Adarkwah — Professional Master of Ceremonies',
      description: 'Ghana\'s premier professional Master of Ceremonies. Specializing in corporate events, weddings, conferences, concerts, awards nights, and private celebrations.',
      url: 'https://mcadarkwah.com',
      image: 'assets/images/og-image.jpg',
      founder: {
        '@type': 'Person',
        name: 'MC Adarkwah',
        jobTitle: 'Professional Master of Ceremonies',
      },
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Accra',
        addressCountry: 'GH',
      },
      areaServed: [
        { '@type': 'City', 'name': 'Accra' },
        { '@type': 'Country', 'name': 'Ghana' },
      ],
      priceRange: 'GHS 2,000 — 25,000',
      sameAs: [
        'https://instagram.com/mc_adarkwah',
        'https://facebook.com/mc_adarkwah',
        'https://linkedin.com/in/mc-adarkwah',
      ],
    });

    this.route.fragment.subscribe(fragment => {
      setTimeout(() => {
        const el = document.getElementById(fragment || 'hero');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    });
  }
}
