import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';
import { GalleryItem, GalleryCategory } from '../../models/gallery.model';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
})
export class GalleryComponent implements OnInit {
  galleryItems: GalleryItem[] = [];
  categories: { value: GalleryCategory; label: string }[] = [];
  activeCategory: GalleryCategory = 'all';
  filteredItems: GalleryItem[] = [];
  lightboxOpen = false;
  lightboxIndex = 0;
  loading = true;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getGalleryItems().subscribe(data => {
      this.galleryItems = data;
      this.filterItems('all');
      this.loading = false;
    });
    this.categories = this.dataService.getGalleryCategories();
  }

  filterItems(category: GalleryCategory): void {
    this.activeCategory = category;
    this.filteredItems = category === 'all'
      ? this.galleryItems
      : this.galleryItems.filter(item => item.category === category);
  }

  openLightbox(index: number): void {
    this.lightboxIndex = index;
    this.lightboxOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeLightbox(): void {
    this.lightboxOpen = false;
    document.body.style.overflow = '';
  }

  nextImage(): void {
    this.lightboxIndex = (this.lightboxIndex + 1) % this.filteredItems.length;
  }

  prevImage(): void {
    this.lightboxIndex = (this.lightboxIndex - 1 + this.filteredItems.length) % this.filteredItems.length;
  }
}
