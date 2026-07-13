import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DataService } from '../../services/data.service';
import { SeoService } from '../../services/seo.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { CountdownTimerComponent } from '../countdown-timer/countdown-timer.component';
import { RegistrationFormComponent } from '../registration-form/registration-form.component';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent, CountdownTimerComponent, RegistrationFormComponent],
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss'],
})
export class EventDetailComponent implements OnInit {
  event: Event | undefined | null = null;
  bannerError = false;
  showRegistration = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private seo: SeoService
  ) {}

  openRegistration(): void {
    this.showRegistration = true;
  }

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.dataService.getEventBySlug(slug).subscribe(event => {
        this.event = event;
        this.bannerError = false;
        if (this.event) {
          this.seo.setPageTitle(this.event.title);
          this.seo.setMetaTags({
            description: this.event.shortDescription,
            image: this.event.bannerImage,
            url: `https://mcadarkwah.com/events/${slug}`,
          });
          this.seo.setStructuredData({
            '@context': 'https://schema.org',
            '@type': 'Event',
            '@id': `https://mcadarkwah.com/events/${slug}`,
            name: this.event.title,
            description: this.event.shortDescription,
            startDate: new Date(this.event.date).toISOString().split('T')[0],
            eventStatus: this.event.isUpcoming ? 'https://schema.org/EventScheduled' : 'https://schema.org/EventPast',
            eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
            location: {
              '@type': 'Place',
              name: this.event.venue,
              address: {
                '@type': 'PostalAddress',
                addressLocality: this.event.city || '',
                addressCountry: this.event.country || 'GH',
              },
            },
            image: this.event.bannerImage,
            performer: {
              '@type': 'Person',
              name: 'MC Adarkwah',
              jobTitle: 'Master of Ceremonies',
            },
          });
        }
      });
    }
  }
}
