import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../components/topbar/topbar.component';
import { StatsCardComponent } from '../../../components/stats-card/stats-card.component';
import { DataTableComponent, ColumnDef } from '../../../components/data-table/data-table.component';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ToastService } from '../../../components/toast/toast.service';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';
import { BookingsService, Booking } from '../../../services/bookings.service';

type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    SidebarComponent,
    TopbarComponent,
    StatsCardComponent,
    DataTableComponent,
    ModalComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.scss'],
})
export class BookingsComponent implements OnInit {
  private bookingsService = inject(BookingsService);
  private toast = inject(ToastService);

  bookings: Booking[] = [];
  loading = false;
  sidebarCollapsed = false;

  search = '';
  statusFilter: 'all' | BookingStatus = 'all';

  showViewModal = false;
  viewingBooking: Booking | null = null;
  selectedStatus: BookingStatus = 'pending';

  showDeleteConfirm = false;
  deletingBooking: Booking | null = null;

  statusOptions: BookingStatus[] = ['pending', 'confirmed', 'cancelled', 'completed'];

  columns: ColumnDef[] = [
    { key: 'eventDate', label: 'Date', type: 'date', sortable: true },
    { key: 'fullName', label: 'Customer' },
    { key: 'email', label: 'Email' },
    { key: 'eventType', label: 'Event Type' },
    { key: 'guestCount', label: 'Guests' },
    { key: 'budgetRange', label: 'Amount' },
    { key: 'status', label: 'Status', type: 'badge' },
    { key: 'actions', label: 'Actions', type: 'action' },
  ];

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.loading = true;
    this.bookingsService.getBookings().subscribe({
      next: (data) => {
        this.bookings = data;
        this.loading = false;
      },
      error: () => {
        this.toast.show('Failed to load bookings', 'error');
        this.loading = false;
      },
    });
  }

  get filteredBookings(): Booking[] {
    let list = this.bookings;
    if (this.search) {
      const q = this.search.toLowerCase();
      list = list.filter(
        (b) =>
          b.fullName.toLowerCase().includes(q) ||
          b.email.toLowerCase().includes(q) ||
          b.eventType.toLowerCase().includes(q)
      );
    }
    if (this.statusFilter !== 'all') {
      list = list.filter((b) => b.status === this.statusFilter);
    }
    return list;
  }

  onView(booking: Booking): void {
    this.viewingBooking = booking;
    this.selectedStatus = booking.status as BookingStatus;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.viewingBooking = null;
  }

  updateStatus(): void {
    if (!this.viewingBooking) return;
    const id = this.viewingBooking.id;
    this.bookingsService.updateStatus(id, this.selectedStatus).subscribe({
      next: () => {
        this.toast.show('Booking status updated', 'success');
        this.closeViewModal();
        this.loadBookings();
      },
      error: () => {
        this.toast.show('Failed to update status', 'error');
      },
    });
  }

  onDelete(booking: Booking): void {
    this.deletingBooking = booking;
    this.showDeleteConfirm = true;
  }

  confirmDelete(): void {
    if (!this.deletingBooking) return;
    this.bookingsService.deleteBooking(this.deletingBooking.id).subscribe({
      next: () => {
        this.toast.show('Booking deleted successfully', 'success');
        this.showDeleteConfirm = false;
        this.deletingBooking = null;
        this.loadBookings();
      },
      error: () => {
        this.toast.show('Failed to delete booking', 'error');
        this.showDeleteConfirm = false;
      },
    });
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.deletingBooking = null;
  }

  onEdit(booking: Booking): void {
    this.onView(booking);
  }

  downloadContract(booking: Booking): void {
    this.bookingsService.downloadContract(booking.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contract-${booking.fullName.replace(/\s+/g, '-').toLowerCase()}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.toast.show('Contract downloaded', 'success');
      },
      error: () => this.toast.show('Failed to download contract', 'error'),
    });
  }

  trackById(_index: number, item: Booking): string {
    return item.id;
  }
}
