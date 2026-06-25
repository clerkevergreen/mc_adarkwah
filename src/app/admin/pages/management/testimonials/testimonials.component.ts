import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../components/topbar/topbar.component';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ToastService } from '../../../components/toast/toast.service';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';
import { TestimonialsService } from '../../../services/testimonials.service';
import { Testimonial } from '../../../../models/event.model';

interface TestimonialRow extends Testimonial {
  isApproved: boolean;
}

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarComponent, TopbarComponent, ModalComponent, ConfirmDialogComponent],
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.scss'],
})
export class TestimonialsComponent implements OnInit {
  private testimonialsService = inject(TestimonialsService);
  private toast = inject(ToastService);

  testimonials: TestimonialRow[] = [];
  filteredTestimonials: TestimonialRow[] = [];
  searchTerm = '';
  statusFilter: 'all' | 'approved' | 'pending' = 'all';

  showEditModal = false;
  editForm: Partial<TestimonialRow> = {};
  editingId: string | null = null;

  showConfirm = false;
  deleteId: string | null = null;

  ratings = [1, 2, 3, 4, 5];

  ngOnInit(): void {
    this.loadTestimonials();
  }

  private loadTestimonials(): void {
    this.testimonialsService.getTestimonials().subscribe({
      next: (data) => {
        this.testimonials = (data || []).map(t => ({
          ...t,
          isApproved: (t as any).isApproved ?? false,
        }));
        this.applyFilters();
      },
      error: () => this.toast.show('Failed to load testimonials', 'error'),
    });
  }

  applyFilters(): void {
    let list = [...this.testimonials];
    if (this.searchTerm.trim()) {
      const q = this.searchTerm.toLowerCase();
      list = list.filter(t => t.name.toLowerCase().includes(q) || t.eventName.toLowerCase().includes(q) || t.review.toLowerCase().includes(q));
    }
    if (this.statusFilter === 'approved') {
      list = list.filter(t => t.isApproved);
    } else if (this.statusFilter === 'pending') {
      list = list.filter(t => !t.isApproved);
    }
    this.filteredTestimonials = list;
  }

  setStatusFilter(filter: 'all' | 'approved' | 'pending'): void {
    this.statusFilter = filter;
    this.applyFilters();
  }

  toggleApproval(t: TestimonialRow): void {
    const newStatus = !t.isApproved;
    this.testimonialsService.approveTestimonial(t.id).subscribe({
      next: () => {
        t.isApproved = newStatus;
        this.toast.show(`Testimonial ${newStatus ? 'approved' : 'unapproved'}`, 'success');
        this.applyFilters();
      },
      error: () => this.toast.show('Failed to update status', 'error'),
    });
  }

  openEdit(t: TestimonialRow): void {
    this.editingId = t.id;
    this.editForm = { ...t };
    this.showEditModal = true;
  }

  saveEdit(): void {
    if (!this.editingId || !this.editForm.name || !this.editForm.review) return;
    this.testimonialsService.updateTestimonial(this.editingId, this.editForm).subscribe({
      next: (updated) => {
        const idx = this.testimonials.findIndex(t => t.id === this.editingId);
        if (idx !== -1) {
          this.testimonials[idx] = { ...this.testimonials[idx], ...updated, isApproved: this.testimonials[idx].isApproved };
        }
        this.toast.show('Testimonial updated', 'success');
        this.closeEdit();
        this.applyFilters();
      },
      error: () => this.toast.show('Failed to update testimonial', 'error'),
    });
  }

  closeEdit(): void {
    this.showEditModal = false;
    this.editingId = null;
    this.editForm = {};
  }

  confirmDelete(id: string): void {
    this.deleteId = id;
    this.showConfirm = true;
  }

  deleteTestimonial(): void {
    if (!this.deleteId) return;
    this.testimonialsService.deleteTestimonial(this.deleteId).subscribe({
      next: () => {
        this.testimonials = this.testimonials.filter(t => t.id !== this.deleteId);
        this.toast.show('Testimonial deleted', 'success');
        this.showConfirm = false;
        this.deleteId = null;
        this.applyFilters();
      },
      error: () => this.toast.show('Failed to delete testimonial', 'error'),
    });
  }

  cancelDelete(): void {
    this.showConfirm = false;
    this.deleteId = null;
  }

  truncate(text: string, max = 80): string {
    return text.length > max ? text.slice(0, max) + '...' : text;
  }
}
