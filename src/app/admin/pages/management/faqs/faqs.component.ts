import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../components/topbar/topbar.component';
import { FaqsService } from '../../../services/faqs.service';
import { ToastService } from '../../../components/toast/toast.service';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';
import { FAQ } from '../../../../models/faq.model';

@Component({
  selector: 'app-faqs',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, TopbarComponent, ModalComponent, ConfirmDialogComponent],
  templateUrl: './faqs.component.html',
  styleUrls: ['./faqs.component.scss'],
})
export class FaqsComponent implements OnInit {
  private faqsService = inject(FaqsService);
  private toast = inject(ToastService);

  loading = signal(true);
  faqs = signal<FAQ[]>([]);
  showModal = false;
  editingFaq: FAQ | null = null;
  formData: Partial<FAQ> = { question: '', answer: '', category: '', order: 0 };
  categories = ['General', 'Service', 'Booking', 'Event', 'Payment'];
  showConfirm = false;
  deletingId: string | null = null;

  ngOnInit(): void {
    this.loadFAQs();
  }

  loadFAQs(): void {
    this.loading.set(true);
    this.faqsService.getFAQs().subscribe({
      next: (data) => {
        this.faqs.set(data.sort((a, b) => a.order - b.order));
        this.loading.set(false);
      },
      error: () => {
        this.toast.show('Failed to load FAQs', 'error');
        this.loading.set(false);
      },
    });
  }

  openCreate(): void {
    this.editingFaq = null;
    this.formData = { question: '', answer: '', category: 'General', order: (this.faqs().length + 1) * 10 };
    this.showModal = true;
  }

  openEdit(faq: FAQ): void {
    this.editingFaq = faq;
    this.formData = { ...faq };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingFaq = null;
  }

  save(): void {
    if (!this.formData.question || !this.formData.answer) {
      this.toast.show('Question and answer are required', 'warning');
      return;
    }

    if (this.editingFaq) {
      this.faqsService.updateFAQ(this.editingFaq.id, this.formData).subscribe({
        next: () => {
          this.toast.show('FAQ updated successfully', 'success');
          this.closeModal();
          this.loadFAQs();
        },
        error: () => this.toast.show('Failed to update FAQ', 'error'),
      });
    } else {
      this.faqsService.createFAQ(this.formData).subscribe({
        next: () => {
          this.toast.show('FAQ created successfully', 'success');
          this.closeModal();
          this.loadFAQs();
        },
        error: () => this.toast.show('Failed to create FAQ', 'error'),
      });
    }
  }

  confirmDelete(id: string): void {
    this.deletingId = id;
    this.showConfirm = true;
  }

  deleteFAQs(): void {
    if (!this.deletingId) return;
    this.faqsService.deleteFAQ(this.deletingId).subscribe({
      next: () => {
        this.toast.show('FAQ deleted', 'success');
        this.showConfirm = false;
        this.deletingId = null;
        this.loadFAQs();
      },
      error: () => this.toast.show('Failed to delete FAQ', 'error'),
    });
  }

  cancelDelete(): void {
    this.showConfirm = false;
    this.deletingId = null;
  }

  moveUp(index: number): void {
    if (index === 0) return;
    const items = [...this.faqs()];
    [items[index - 1], items[index]] = [items[index], items[index - 1]];
    items.forEach((item, i) => (item.order = (i + 1) * 10));
    this.faqs.set(items);
    this.faqsService.reorderFAQs(items).subscribe({
      error: () => this.toast.show('Failed to save order', 'error'),
    });
  }

  moveDown(index: number): void {
    if (index === this.faqs().length - 1) return;
    const items = [...this.faqs()];
    [items[index], items[index + 1]] = [items[index + 1], items[index]];
    items.forEach((item, i) => (item.order = (i + 1) * 10));
    this.faqs.set(items);
    this.faqsService.reorderFAQs(items).subscribe({
      error: () => this.toast.show('Failed to save order', 'error'),
    });
  }
}
