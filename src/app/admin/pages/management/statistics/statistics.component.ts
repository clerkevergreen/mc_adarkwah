import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../components/topbar/topbar.component';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ToastService } from '../../../components/toast/toast.service';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';
import { StatisticsService, Statistic } from '../../../services/statistics.service';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, TopbarComponent, ModalComponent, ConfirmDialogComponent],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
})
export class StatisticsComponent implements OnInit {
  private service = inject(StatisticsService);
  private toast = inject(ToastService);

  items: Statistic[] = [];
  showFormModal = false;
  isEdit = false;
  editingId: string | null = null;
  form: Partial<Statistic> = { value: 0, suffix: '+', label: '', icon: 'star', order: 0 };
  showConfirm = false;
  deleteId: string | null = null;

  ngOnInit(): void {
    this.loadItems();
  }

  private loadItems(): void {
    this.service.get().subscribe({
      next: (data) => this.items = data || [],
      error: () => this.toast.show('Failed to load statistics', 'error'),
    });
  }

  openCreate(): void {
    this.isEdit = false;
    this.editingId = null;
    this.form = { value: 0, suffix: '+', label: '', icon: 'star', order: 0 };
    this.showFormModal = true;
  }

  openEdit(item: Statistic): void {
    this.isEdit = true;
    this.editingId = item.id;
    this.form = { ...item };
    this.showFormModal = true;
  }

  saveItem(): void {
    if (!this.form.label) return;
    const obs = this.isEdit && this.editingId
      ? this.service.update(this.editingId, this.form)
      : this.service.create(this.form);
    obs.subscribe({
      next: (saved) => {
        if (this.isEdit && this.editingId) {
          const idx = this.items.findIndex(i => i.id === this.editingId);
          if (idx !== -1) this.items[idx] = saved;
          this.toast.show('Statistic updated', 'success');
        } else {
          this.items.push(saved);
          this.toast.show('Statistic created', 'success');
        }
        this.closeForm();
      },
      error: () => this.toast.show(`Failed to ${this.isEdit ? 'update' : 'create'} statistic`, 'error'),
    });
  }

  closeForm(): void {
    this.showFormModal = false;
    this.isEdit = false;
    this.editingId = null;
    this.form = { value: 0, suffix: '+', label: '', icon: 'star', order: 0 };
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
        this.toast.show('Statistic deleted', 'success');
        this.showConfirm = false;
        this.deleteId = null;
      },
      error: () => this.toast.show('Failed to delete statistic', 'error'),
    });
  }

  cancelDelete(): void {
    this.showConfirm = false;
    this.deleteId = null;
  }
}
