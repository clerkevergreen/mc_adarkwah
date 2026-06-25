import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactService, ContactMessage } from '../../../services/contact.service';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../components/topbar/topbar.component';
import { ToastService } from '../../../components/toast/toast.service';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, SidebarComponent, TopbarComponent, ModalComponent, ConfirmDialogComponent],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent implements OnInit {
  private contactService = inject(ContactService);
  private toast = inject(ToastService);

  loading = signal(true);
  messages = signal<ContactMessage[]>([]);
  selectedMessage: ContactMessage | null = null;
  showViewModal = false;
  showConfirm = false;
  deletingId: string | null = null;

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages(): void {
    this.loading.set(true);
    this.contactService.getMessages().subscribe({
      next: (data) => {
        this.messages.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.toast.show('Failed to load messages', 'error');
        this.loading.set(false);
      },
    });
  }

  truncate(text: string, max: number): string {
    return text?.length > max ? text.slice(0, max) + '…' : text;
  }

  openView(msg: ContactMessage): void {
    this.selectedMessage = msg;
    this.showViewModal = true;
  }

  closeView(): void {
    this.showViewModal = false;
    this.selectedMessage = null;
  }

  confirmDelete(id: string): void {
    this.deletingId = id;
    this.showConfirm = true;
  }

  deleteMessage(): void {
    const id = this.deletingId;
    if (!id) return;
    this.contactService.deleteMessage(id).subscribe({
      next: () => {
        this.messages.set(this.messages().filter(m => m.id !== id));
        this.toast.show('Message deleted', 'success');
        this.showConfirm = false;
        this.deletingId = null;
      },
      error: () => {
        this.toast.show('Failed to delete message', 'error');
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
