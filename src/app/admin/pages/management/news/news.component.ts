import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../components/topbar/topbar.component';
import { NewsService } from '../../../services/news.service';
import { ToastService } from '../../../components/toast/toast.service';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';
import { NewsItem } from '../../../../models/news.model';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, TopbarComponent, ModalComponent, ConfirmDialogComponent],
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss'],
})
export class NewsComponent implements OnInit {
  private newsService = inject(NewsService);
  private toast = inject(ToastService);

  loading = signal(true);
  news = signal<NewsItem[]>([]);
  searchQuery = '';
  selectedCategory = '';
  showModal = false;
  editingNews: NewsItem | null = null;
  formData: Partial<NewsItem> = {
    title: '', excerpt: '', content: '', imageUrl: '', category: '', tags: [], featured: false,
  };
  tagsString = '';
  categories = ['General', 'Event', 'Announcement', 'Update', 'Press'];
  showConfirm = false;
  deletingId: string | null = null;

  ngOnInit(): void {
    this.loadNews();
  }

  get filteredNews(): NewsItem[] {
    return this.news().filter(item => {
      const matchesSearch = !this.searchQuery ||
        item.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.excerpt?.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesCategory = !this.selectedCategory || item.category === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }

  loadNews(): void {
    this.loading.set(true);
    this.newsService.getNews().subscribe({
      next: (data) => {
        this.news.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.toast.show('Failed to load news', 'error');
        this.loading.set(false);
      },
    });
  }

  truncate(text: string, max: number): string {
    return text?.length > max ? text.slice(0, max) + '…' : text;
  }

  openCreate(): void {
    this.editingNews = null;
    this.formData = { title: '', excerpt: '', content: '', imageUrl: '', category: 'General', tags: [], featured: false };
    this.tagsString = '';
    this.showModal = true;
  }

  openEdit(item: NewsItem): void {
    this.editingNews = item;
    this.formData = { ...item };
    this.tagsString = (item.tags || []).join(', ');
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingNews = null;
  }

  save(): void {
    if (!this.formData.title) {
      this.toast.show('Title is required', 'warning');
      return;
    }

    const payload = {
      ...this.formData,
      tags: this.tagsString.split(',').map(t => t.trim()).filter(Boolean),
      date: this.formData.date || new Date(),
    };

    if (this.editingNews) {
      this.newsService.updateNews(this.editingNews.id, payload).subscribe({
        next: () => {
          this.toast.show('News updated successfully', 'success');
          this.closeModal();
          this.loadNews();
        },
        error: () => this.toast.show('Failed to update news', 'error'),
      });
    } else {
      this.newsService.createNews(payload).subscribe({
        next: () => {
          this.toast.show('News created successfully', 'success');
          this.closeModal();
          this.loadNews();
        },
        error: () => this.toast.show('Failed to create news', 'error'),
      });
    }
  }

  toggleFeatured(item: NewsItem): void {
    const updated = { ...item, featured: !item.featured };
    this.newsService.updateNews(item.id, { featured: updated.featured }).subscribe({
      next: () => {
        this.toast.show(`News ${updated.featured ? 'featured' : 'unfeatured'}`, 'success');
        this.loadNews();
      },
      error: () => this.toast.show('Failed to toggle featured', 'error'),
    });
  }

  confirmDelete(id: string): void {
    this.deletingId = id;
    this.showConfirm = true;
  }

  deleteNews(): void {
    if (!this.deletingId) return;
    this.newsService.deleteNews(this.deletingId).subscribe({
      next: () => {
        this.toast.show('News deleted', 'success');
        this.showConfirm = false;
        this.deletingId = null;
        this.loadNews();
      },
      error: () => this.toast.show('Failed to delete news', 'error'),
    });
  }

  cancelDelete(): void {
    this.showConfirm = false;
    this.deletingId = null;
  }
}
