import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
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

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getFAQs().subscribe(data => {
      this.faqs = data.map(f => ({ ...f, isOpen: false }));
    });
  }

  toggleFAQ(id: string): void {
    this.faqs = this.faqs.map(f => ({
      ...f,
      isOpen: f.id === id ? !f.isOpen : false,
    }));
  }
}
