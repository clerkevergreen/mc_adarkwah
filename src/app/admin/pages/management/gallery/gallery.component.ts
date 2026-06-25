import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../components/topbar/topbar.component';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ToastService } from '../../../components/toast/toast.service';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';
import { GalleryService } from '../../../services/gallery.service';
import { GalleryItem, GalleryCategory } from '../../../../models/gallery.model';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarComponent, TopbarComponent, ModalComponent, ConfirmDialogComponent],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
})
export class GalleryComponent implements OnInit {
  private galleryService = inject(GalleryService);
  private toast = inject(ToastService);

  items: GalleryItem[] = [];
  filteredItems: GalleryItem[] = [];
  categoryFilter: GalleryCategory | 'all' = 'all';

  categories: { label: string; value: GalleryCategory | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Corporate Events', value: 'corporate-events' },
    { label: 'Weddings', value: 'weddings' },
    { label: 'Conferences', value: 'conferences' },
    { label: 'Concerts', value: 'concerts' },
    { label: 'Awards Nights', value: 'awards-nights' },
    { label: 'Church Programs', value: 'church-programs' },
  ];

  typeOptions: ('image' | 'video')[] = ['image', 'video'];

  showFormModal = false;
  isEdit = false;
  form: Partial<GalleryItem> & { file?: File | null } = { category: 'corporate-events', type: 'image', featured: false, file: null };
  editingId: string | null = null;
  imagePreview: string | null = null;

  showConfirm = false;
  deleteId: string | null = null;

  ngOnInit(): void {
    this.loadItems();
  }

  private loadItems(): void {
    this.galleryService.getItems().subscribe({
      next: (data) => {
        this.items = data || [];
        this.applyFilter();
      },
      error: () => this.toast.show('Failed to load gallery', 'error'),
    });
  }

  applyFilter(): void {
    if (this.categoryFilter === 'all') {
      this.filteredItems = [...this.items];
    } else {
      this.filteredItems = this.items.filter(i => i.category === this.categoryFilter);
    }
  }

  setCategoryFilter(cat: GalleryCategory | 'all'): void {
    this.categoryFilter = cat;
    this.applyFilter();
  }

  toggleFeatured(item: GalleryItem): void {
    const updated = { ...item, featured: !item.featured };
    this.galleryService.updateItem(item.id, { featured: updated.featured }).subscribe({
      next: () => {
        const idx = this.items.findIndex(i => i.id === item.id);
        if (idx !== -1) {
          this.items[idx] = updated;
        }
        this.toast.show(updated.featured ? 'Item featured' : 'Feature removed', 'success');
        this.applyFilter();
      },
      error: () => this.toast.show('Failed to toggle feature', 'error'),
    });
  }

  openCreate(): void {
    this.isEdit = false;
    this.editingId = null;
    this.form = { category: 'corporate-events', type: 'image', featured: false, file: null };
    this.imagePreview = null;
    this.showFormModal = true;
  }

  openEdit(item: GalleryItem): void {
    this.isEdit = true;
    this.editingId = item.id;
    this.form = { ...item, file: null };
    this.imagePreview = item.imageUrl || item.thumbnailUrl || null;
    this.showFormModal = true;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.form.file = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  saveItem(): void {
    if (!this.form.title || !this.form.category) return;

    const payload: Partial<GalleryItem> = {
      title: this.form.title,
      description: this.form.description,
      category: this.form.category,
      type: this.form.type || 'image',
      featured: this.form.featured ?? false,
    };

    if (this.form.file) {
      (payload as any).file = this.form.file;
    }

    const obs = this.isEdit && this.editingId
      ? this.galleryService.updateItem(this.editingId, payload, this.form.file)
      : this.galleryService.createItem(payload, this.form.file);

    obs.subscribe({
      next: (saved) => {
        if (this.isEdit && this.editingId) {
          const idx = this.items.findIndex(i => i.id === this.editingId);
          if (idx !== -1) {
            this.items[idx] = { ...this.items[idx], ...saved };
          }
          this.toast.show('Gallery item updated', 'success');
        } else {
          this.items.unshift(saved);
          this.toast.show('Gallery item created', 'success');
        }
        this.closeForm();
        this.applyFilter();
      },
      error: () => this.toast.show(`Failed to ${this.isEdit ? 'update' : 'create'} item`, 'error'),
    });
  }

  closeForm(): void {
    this.showFormModal = false;
    this.isEdit = false;
    this.editingId = null;
    this.form = { category: 'corporate-events', type: 'image', featured: false, file: null };
    this.imagePreview = null;
  }

  confirmDelete(id: string): void {
    this.deleteId = id;
    this.showConfirm = true;
  }

  deleteItem(): void {
    if (!this.deleteId) return;
    this.galleryService.deleteItem(this.deleteId).subscribe({
      next: () => {
        this.items = this.items.filter(i => i.id !== this.deleteId);
        this.toast.show('Gallery item deleted', 'success');
        this.showConfirm = false;
        this.deleteId = null;
        this.applyFilter();
      },
      error: () => this.toast.show('Failed to delete item', 'error'),
    });
  }

  cancelDelete(): void {
    this.showConfirm = false;
    this.deleteId = null;
  }
}
