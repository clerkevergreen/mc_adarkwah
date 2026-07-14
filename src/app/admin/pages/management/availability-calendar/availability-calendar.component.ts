import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../components/topbar/topbar.component';
import { AvailabilityService, AvailabilityEntry } from '../../../services/availability.service';
import { ToastService } from '../../../components/toast/toast.service';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-availability-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, TopbarComponent, ConfirmDialogComponent],
  templateUrl: './availability-calendar.component.html',
  styleUrls: ['./availability-calendar.component.scss'],
})
export class AvailabilityCalendarComponent implements OnInit {
  private availabilityService = inject(AvailabilityService);
  private toast = inject(ToastService);

  loading = signal(true);
  entries = signal<AvailabilityEntry[]>([]);
  today = new Date();
  viewYear = this.today.getFullYear();
  viewMonth = this.today.getMonth();
  daysInMonth: (number | null)[] = [];
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  selectedDate: string | null = null;
  blockReason = '';
  showBlockForm = false;
  showConfirm = false;
  deletingId: string | null = null;

  ngOnInit(): void {
    this.loadMonth();
  }

  loadMonth(): void {
    this.loading.set(true);
    this.buildDays();
    const start = new Date(this.viewYear, this.viewMonth, 1).toISOString().split('T')[0];
    const end = new Date(this.viewYear, this.viewMonth + 1, 0).toISOString().split('T')[0];
    this.availabilityService.getAvailability(start, end).subscribe({
      next: (data) => {
        this.entries.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.toast.show('Failed to load availability', 'error');
        this.loading.set(false);
      },
    });
  }

  buildDays(): void {
    const firstDay = new Date(this.viewYear, this.viewMonth, 1).getDay();
    const daysCount = new Date(this.viewYear, this.viewMonth + 1, 0).getDate();
    this.daysInMonth = [];
    for (let i = 0; i < firstDay; i++) this.daysInMonth.push(null);
    for (let d = 1; d <= daysCount; d++) this.daysInMonth.push(d);
  }

  prevMonth(): void {
    if (this.viewMonth === 0) { this.viewYear--; this.viewMonth = 11; }
    else this.viewMonth--;
    this.loadMonth();
  }

  nextMonth(): void {
    if (this.viewMonth === 11) { this.viewYear++; this.viewMonth = 0; }
    else this.viewMonth++;
    this.loadMonth();
  }

  getEntryForDay(day: number): AvailabilityEntry | undefined {
    const dateStr = `${this.viewYear}-${String(this.viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return this.entries().find(e => e.date.startsWith(dateStr.split('T')[0]));
  }

  isPast(day: number): boolean {
    const d = new Date(this.viewYear, this.viewMonth, day);
    const todayStart = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate());
    return d < todayStart;
  }

  isToday(day: number): boolean {
    return this.viewYear === this.today.getFullYear() &&
           this.viewMonth === this.today.getMonth() &&
           day === this.today.getDate();
  }

  selectDay(day: number): void {
    if (this.isPast(day)) return;
    const entry = this.getEntryForDay(day);
    const dateStr = `${this.viewYear}-${String(this.viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    if (entry?.status === 'blocked') {
      this.deletingId = entry.id;
      this.showConfirm = true;
    } else if (entry?.status === 'booked') {
      this.toast.show('This date is booked from a confirmed booking', 'warning');
    } else {
      this.selectedDate = dateStr;
      this.blockReason = '';
      this.showBlockForm = true;
    }
  }

  blockDate(): void {
    if (!this.selectedDate) return;
    this.availabilityService.blockDates([this.selectedDate], this.blockReason).subscribe({
      next: () => {
        this.toast.show('Date blocked successfully', 'success');
        this.showBlockForm = false;
        this.selectedDate = null;
        this.loadMonth();
      },
      error: () => this.toast.show('Failed to block date', 'error'),
    });
  }

  cancelBlock(): void {
    this.showBlockForm = false;
    this.selectedDate = null;
  }

  confirmUnblock(): void {
    if (!this.deletingId) return;
    this.availabilityService.unblockDate(this.deletingId).subscribe({
      next: () => {
        this.toast.show('Date unblocked', 'success');
        this.showConfirm = false;
        this.deletingId = null;
        this.loadMonth();
      },
      error: () => this.toast.show('Failed to unblock date', 'error'),
    });
  }

  cancelDelete(): void {
    this.showConfirm = false;
    this.deletingId = null;
  }

  syncBookings(): void {
    this.availabilityService.syncBookings().subscribe({
      next: () => {
        this.toast.show('Bookings synced to calendar', 'success');
        this.loadMonth();
      },
      error: () => this.toast.show('Failed to sync bookings', 'error'),
    });
  }
}
