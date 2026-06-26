import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../components/topbar/topbar.component';
import { SubscribersService, Subscriber } from '../../../services/subscribers.service';
import { ToastService } from '../../../components/toast/toast.service';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-subscribers',
  standalone: true,
  imports: [CommonModule, SidebarComponent, TopbarComponent, ConfirmDialogComponent],
  templateUrl: './subscribers.component.html',
  styleUrls: ['./subscribers.component.scss'],
})
export class SubscribersComponent implements OnInit {
  private subscribersService = inject(SubscribersService);
  private toast = inject(ToastService);

  loading = signal(true);
  subscribers = signal<Subscriber[]>([]);
  showConfirm = false;
  deletingId: string | null = null;

  ngOnInit(): void {
    this.loadSubscribers();
  }

  loadSubscribers(): void {
    this.loading.set(true);
    this.subscribersService.getSubscribers().subscribe({
      next: (data) => {
        this.subscribers.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.toast.show('Failed to load subscribers', 'error');
        this.loading.set(false);
      },
    });
  }

  confirmDelete(id: string): void {
    this.deletingId = id;
    this.showConfirm = true;
  }

  deleteSubscriber(): void {
    const id = this.deletingId;
    if (!id) return;
    this.subscribersService.deleteSubscriber(id).subscribe({
      next: () => {
        this.subscribers.set(this.subscribers().filter(s => s.id !== id));
        this.toast.show('Subscriber deleted', 'success');
        this.showConfirm = false;
        this.deletingId = null;
      },
      error: () => {
        this.toast.show('Failed to delete subscriber', 'error');
        this.showConfirm = false;
        this.deletingId = null;
      },
    });
  }

  cancelDelete(): void {
    this.showConfirm = false;
    this.deletingId = null;
  }
}
