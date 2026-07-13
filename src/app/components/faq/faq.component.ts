import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { SeoService } from '../../services/seo.service';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';
import { FAQ } from '../../models/faq.model';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
})
export class FaqComponent implements OnInit {
  faqs: FAQ[] = [];

  constructor(private dataService: DataService, private seo: SeoService) {}

  ngOnInit(): void {
    this.dataService.getFAQs().subscribe(data => {
      this.faqs = data.map(f => ({ ...f, isOpen: false }));
      if (data.length > 0) {
        this.seo.setStructuredData({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: data.map(f => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.answer,
            },
          })),
        });
      }
    });
  }

  toggleFAQ(id: string): void {
    this.faqs = this.faqs.map(f => ({
      ...f,
      isOpen: f.id === id ? !f.isOpen : false,
    }));
  }
}
