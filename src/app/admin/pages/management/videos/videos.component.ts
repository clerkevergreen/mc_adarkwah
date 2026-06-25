import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../components/topbar/topbar.component';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ToastService } from '../../../components/toast/toast.service';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';
import { VideosService, VideoHighlight } from '../../../services/videos.service';

@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, TopbarComponent, ModalComponent, ConfirmDialogComponent],
  templateUrl: './videos.component.html',
  styleUrls: ['./videos.component.scss'],
})
export class VideosComponent implements OnInit {
  private service = inject(VideosService);
  private toast = inject(ToastService);

  items: VideoHighlight[] = [];
  showFormModal = false;
  isEdit = false;
  editingId: string | null = null;
  form: Partial<VideoHighlight> = { title: '', thumbnail: '', url: '', order: 0, isActive: true };
  showConfirm = false;
  deleteId: string | null = null;

  ngOnInit(): void {
    this.loadItems();
  }

  private loadItems(): void {
    this.service.getAll().subscribe({
      next: (data) => this.items = data || [],
      error: () => this.toast.show('Failed to load videos', 'error'),
    });
  }

  openCreate(): void {
    this.isEdit = false;
    this.editingId = null;
    this.form = { title: '', thumbnail: '', url: '', order: 0, isActive: true };
    this.showFormModal = true;
  }

  openEdit(item: VideoHighlight): void {
    this.isEdit = true;
    this.editingId = item.id;
    this.form = { ...item };
    this.showFormModal = true;
  }

  saveItem(): void {
    if (!this.form.title) return;
    const obs = this.isEdit && this.editingId
      ? this.service.update(this.editingId, this.form)
      : this.service.create(this.form);
    obs.subscribe({
      next: (saved) => {
        if (this.isEdit && this.editingId) {
          const idx = this.items.findIndex(i => i.id === this.editingId);
          if (idx !== -1) this.items[idx] = saved;
          this.toast.show('Video updated', 'success');
        } else {
          this.items.push(saved);
          this.toast.show('Video created', 'success');
        }
        this.closeForm();
      },
      error: () => this.toast.show(`Failed to ${this.isEdit ? 'update' : 'create'} video`, 'error'),
    });
  }

  toggleActive(item: VideoHighlight): void {
    this.service.update(item.id, { isActive: !item.isActive }).subscribe({
      next: () => {
        item.isActive = !item.isActive;
        this.toast.show(item.isActive ? 'Video activated' : 'Video deactivated', 'success');
      },
      error: () => this.toast.show('Failed to toggle', 'error'),
    });
  }

  closeForm(): void {
    this.showFormModal = false;
    this.isEdit = false;
    this.editingId = null;
    this.form = { title: '', thumbnail: '', url: '', order: 0, isActive: true };
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
        this.toast.show('Video deleted', 'success');
        this.showConfirm = false;
        this.deleteId = null;
      },
      error: () => this.toast.show('Failed to delete video', 'error'),
    });
  }

  cancelDelete(): void {
    this.showConfirm = false;
    this.deleteId = null;
  }
}
