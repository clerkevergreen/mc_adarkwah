import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';
import { Testimonial } from '../../models/event.model';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.scss'],
})
export class TestimonialsComponent implements OnInit, OnDestroy {
  testimonials: Testimonial[] = [];
  currentIndex = 0;
  loading = true;
  error: string | null = null;
  private autoSlideInterval: any;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;
    this.dataService.getTestimonials().subscribe({
      next: (data) => {
        this.testimonials = data;
        this.loading = false;
        if (data.length > 0) this.startAutoSlide();
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

  private startAutoSlide(): void {
    this.autoSlideInterval = setInterval(() => {
      this.next();
    }, 5000);
  }

  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.testimonials.length;
  }

  prev(): void {
    this.currentIndex = (this.currentIndex - 1 + this.testimonials.length) % this.testimonials.length;
  }

  goTo(index: number): void {
    this.currentIndex = index;
    this.resetAutoSlide();
  }

  private resetAutoSlide(): void {
    clearInterval(this.autoSlideInterval);
    this.startAutoSlide();
  }

  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }

  ngOnDestroy(): void {
    if (this.autoSlideInterval) clearInterval(this.autoSlideInterval);
  }
}
