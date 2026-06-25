import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../components/topbar/topbar.component';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ToastService } from '../../../components/toast/toast.service';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';
import { ServicesService } from '../../../services/services.service';
import { Service } from '../../../../models/service.model';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, TopbarComponent, ModalComponent, ConfirmDialogComponent],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss'],
})
export class ServicesComponent implements OnInit {
  private service = inject(ServicesService);
  private toast = inject(ToastService);

  items: Service[] = [];
  search = '';
  sidebarCollapsed = false;

  showFormModal = false;
  isEdit = false;
  editingId: string | null = null;
  form: Partial<Service> = { icon: '', title: '', shortDescription: '', description: '', features: [], imageUrl: '', priceRange: '', order: 0 };
  featuresText = '';
  showConfirm = false;
  deleteId: string | null = null;

  private iconColorMap: Record<string, string> = {
    '❤️': '#E74C3C',
    '💼': '#2E86DE',
    '👥': '#2ECC71',
    '🎤': '#9B59B6',
    '🎵': '#F39C12',
    '📸': '#1ABC9C',
    '🎨': '#E67E22',
    '📋': '#34495E',
    '🎯': '#E91E63',
    '⭐': '#FFD700',
    '💡': '#FF9800',
    '🔧': '#607D8B',
    '📊': '#3F51B5',
  };

  ngOnInit(): void {
    this.loadItems();
  }

  private loadItems(): void {
    this.service.getAll().subscribe({
      next: (data) => this.items = data || [],
      error: () => this.toast.show('Failed to load services', 'error'),
    });
  }

  get filteredItems(): Service[] {
    if (!this.search.trim()) return this.items;
    const q = this.search.toLowerCase();
    return this.items.filter(i =>
      i.title?.toLowerCase().includes(q) ||
      i.shortDescription?.toLowerCase().includes(q) ||
      i.priceRange?.toLowerCase().includes(q)
    );
  }

  serviceColor(icon: string): string {
    return this.iconColorMap[icon] || '#C9A84C';
  }

  openCreate(): void {
    this.isEdit = false;
    this.editingId = null;
    this.form = { icon: '', title: '', shortDescription: '', description: '', features: [], imageUrl: '', priceRange: '', order: 0 };
    this.featuresText = '';
    this.showFormModal = true;
  }

  openEdit(item: Service): void {
    this.isEdit = true;
    this.editingId = item.id;
    this.form = { ...item };
    this.featuresText = (item.features || []).join('\n');
    this.showFormModal = true;
  }

  saveItem(): void {
    if (!this.form.title) return;
    const data = { ...this.form, features: this.featuresText.split('\n').map(s => s.trim()).filter(Boolean) };
    const obs = this.isEdit && this.editingId
      ? this.service.update(this.editingId, data)
      : this.service.create(data);
    obs.subscribe({
      next: (saved) => {
        if (this.isEdit && this.editingId) {
          const idx = this.items.findIndex(i => i.id === this.editingId);
          if (idx !== -1) this.items[idx] = saved;
          this.toast.show('Service updated', 'success');
        } else {
          this.items.push(saved);
          this.toast.show('Service created', 'success');
        }
        this.closeForm();
      },
      error: () => this.toast.show(`Failed to ${this.isEdit ? 'update' : 'create'} service`, 'error'),
    });
  }

  closeForm(): void {
    this.showFormModal = false;
    this.isEdit = false;
    this.editingId = null;
    this.form = { icon: '', title: '', shortDescription: '', description: '', features: [], imageUrl: '', priceRange: '', order: 0 };
    this.featuresText = '';
  }

  confirmDelete(id: string): void {
    this.deleteId = id;
    this.showConfirm = true;
  }

  deleteItem(): void {
    if (!this.deleteId) return;
    this.service.delete(this.deleteId).subscribe({
      next: () => {
        this.items = this.items.filter(i => i.id !== this.deleteId);
        this.toast.show('Service deleted', 'success');
        this.showConfirm = false;
        this.deleteId = null;
      },
      error: () => this.toast.show('Failed to delete service', 'error'),
    });
  }

  cancelDelete(): void {
    this.showConfirm = false;
    this.deleteId = null;
  }
}