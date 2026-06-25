import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../components/topbar/topbar.component';
import { DataTableComponent, ColumnDef } from '../../../components/data-table/data-table.component';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ToastService } from '../../../components/toast/toast.service';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';
import { RegistrationsService, EventRegistration } from '../../../services/registrations.service';

type RegStatus = 'pending' | 'confirmed' | 'cancelled';

@Component({
  selector: 'app-registrations',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    SidebarComponent, TopbarComponent, DataTableComponent,
    ModalComponent, ConfirmDialogComponent,
  ],
  template: `
    <div class="layout">
      <app-sidebar (toggle)="sidebarCollapsed = !sidebarCollapsed"></app-sidebar>
      @if (sidebarCollapsed) {
        <div class="layout__sidebar-backdrop" (click)="sidebarCollapsed = false"></div>
      }

      <div class="layout__main">
        <app-topbar pageTitle="Event Registrations"></app-topbar>

        <div class="layout__content">
          <div class="page">
            <div class="page__toolbar">
              <div class="page__filters">
                <div class="page__search">
                  <svg class="page__search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input class="page__input" type="text" placeholder="Search registrations..." [(ngModel)]="search" />
                </div>
              </div>

              <div class="page__chips">
                <button class="page__chip" [class.page__chip--active]="statusFilter === 'all'" (click)="statusFilter = 'all'">All</button>
                <button class="page__chip" [class.page__chip--active]="statusFilter === 'pending'" (click)="statusFilter = 'pending'">Pending</button>
                <button class="page__chip" [class.page__chip--active]="statusFilter === 'confirmed'" (click)="statusFilter = 'confirmed'">Confirmed</button>
                <button class="page__chip" [class.page__chip--active]="statusFilter === 'cancelled'" (click)="statusFilter = 'cancelled'">Cancelled</button>
              </div>
            </div>

            <app-data-table
              [columns]="columns"
              [rows]="filteredRegistrations"
              [loading]="loading"
              (view)="onView($event)"
              (edit)="onView($event)"
              (delete)="onDelete($event)"
            ></app-data-table>
          </div>
        </div>
      </div>
    </div>

    @if (showViewModal && viewingRegistration) {
      <app-modal title="Registration Details" size="md" (close)="closeViewModal()">
        <div class="detail">
          <div class="detail__grid">
            <div class="detail__item">
              <span class="detail__label">Full Name</span>
              <span class="detail__value">{{ viewingRegistration.fullName }}</span>
            </div>
            <div class="detail__item">
              <span class="detail__label">Email</span>
              <span class="detail__value">{{ viewingRegistration.email }}</span>
            </div>
            <div class="detail__item">
              <span class="detail__label">Phone</span>
              <span class="detail__value">{{ viewingRegistration.phone || '-' }}</span>
            </div>
            <div class="detail__item">
              <span class="detail__label">Event</span>
              <span class="detail__value">{{ viewingRegistration.event?.title || '-' }}</span>
            </div>
            <div class="detail__item">
              <span class="detail__label">Event Date</span>
              <span class="detail__value">{{ (viewingRegistration.event?.date | date:'mediumDate') || '-' }}</span>
            </div>
            <div class="detail__item">
              <span class="detail__label">Venue</span>
              <span class="detail__value">{{ viewingRegistration.event?.venue || '-' }}</span>
            </div>
            <div class="detail__item detail__item--full">
              <span class="detail__label">Message</span>
              <span class="detail__value">{{ viewingRegistration.message || '-' }}</span>
            </div>
            <div class="detail__item detail__item--full">
              <span class="detail__label">Registered</span>
              <span class="detail__value">{{ viewingRegistration.createdAt | date:'medium' }}</span>
            </div>
          </div>

          <div class="detail__status">
            <label class="detail__status-label">Update Status</label>
            <div class="detail__status-row">
              <select class="detail__select" [(ngModel)]="selectedStatus">
                @for (opt of statusOptions; track opt) {
                  <option [value]="opt">{{ opt | titlecase }}</option>
                }
              </select>
              <button class="detail__btn" (click)="updateStatus()">Update</button>
            </div>
          </div>
        </div>

        <div slot="footer">
          <button class="detail__close-btn" (click)="closeViewModal()">Close</button>
        </div>
      </app-modal>
    }

    @if (showDeleteConfirm) {
      <app-confirm-dialog
        title="Delete Registration"
        [message]="deleteMessage"
        (confirm)="confirmDelete()"
        (cancel)="cancelDelete()"
        ></app-confirm-dialog>
    }
  `,
  styles: [`
    .detail { padding: 0.5rem 0; }
    .detail__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .detail__item--full { grid-column: span 2; }
    .detail__label { display: block; color: rgba(255,255,255,0.4); font-size: 0.75rem; margin-bottom: 0.25rem; text-transform: uppercase; letter-spacing: 0.5px; }
    .detail__value { color: rgba(255,255,255,0.85); font-size: 0.9rem; }
    .detail__status { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.08); }
    .detail__status-label { display: block; color: rgba(255,255,255,0.4); font-size: 0.75rem; margin-bottom: 0.5rem; text-transform: uppercase; }
    .detail__status-row { display: flex; gap: 0.75rem; align-items: center; }
    .detail__select { padding: 0.6rem 0.8rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(201,168,76,0.15); border-radius: 6px; color: #fff; font-size: 0.85rem; }
    .detail__btn { padding: 0.6rem 1.2rem; background: #C9A84C; color: #1a1a1a; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.85rem; }
    .detail__btn:hover { background: #b8953a; }
    .detail__close-btn { padding: 0.5rem 1.5rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.6); border-radius: 6px; cursor: pointer; }
    .detail__close-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
  `],
})
export class RegistrationsComponent implements OnInit {
  private registrationsService = inject(RegistrationsService);
  private toast = inject(ToastService);

  registrations: EventRegistration[] = [];
  loading = false;
  sidebarCollapsed = false;

  search = '';
  statusFilter: 'all' | RegStatus = 'all';
  statusOptions: RegStatus[] = ['pending', 'confirmed', 'cancelled'];

  showViewModal = false;
  viewingRegistration: EventRegistration | null = null;
  selectedStatus: RegStatus = 'pending';

  showDeleteConfirm = false;
  deletingRegistration: EventRegistration | null = null;

  columns: ColumnDef[] = [
    { key: 'fullName', label: 'Name', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'eventTitle', label: 'Event' },
    { key: 'status', label: 'Status', type: 'badge' },
    { key: 'createdAt', label: 'Registered', type: 'date', sortable: true },
    { key: 'actions', label: 'Actions', type: 'action' },
  ];

  ngOnInit(): void {
    this.loadRegistrations();
  }

  loadRegistrations(): void {
    this.loading = true;
    this.registrationsService.getRegistrations().subscribe({
      next: (data) => { this.registrations = data; this.loading = false; },
      error: () => { this.toast.show('Failed to load registrations', 'error'); this.loading = false; },
    });
  }

  get filteredRegistrations(): EventRegistration[] {
    let list = this.registrations;
    if (this.search) {
      const q = this.search.toLowerCase();
      list = list.filter(r =>
        r.fullName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        (r.event?.title || '').toLowerCase().includes(q)
      );
    }
    if (this.statusFilter !== 'all') {
      list = list.filter(r => r.status === this.statusFilter);
    }
    return list;
  }

  onView(reg: EventRegistration): void {
    this.viewingRegistration = reg;
    this.selectedStatus = reg.status as RegStatus;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.viewingRegistration = null;
  }

  updateStatus(): void {
    if (!this.viewingRegistration) return;
    this.registrationsService.updateStatus(this.viewingRegistration.id, this.selectedStatus).subscribe({
      next: () => {
        this.toast.show('Registration status updated', 'success');
        this.closeViewModal();
        this.loadRegistrations();
      },
      error: () => this.toast.show('Failed to update status', 'error'),
    });
  }

  onDelete(reg: EventRegistration): void {
    this.deletingRegistration = reg;
    this.showDeleteConfirm = true;
  }

  confirmDelete(): void {
    if (!this.deletingRegistration) return;
    this.registrationsService.deleteRegistration(this.deletingRegistration.id).subscribe({
      next: () => {
        this.toast.show('Registration deleted', 'success');
        this.showDeleteConfirm = false;
        this.deletingRegistration = null;
        this.loadRegistrations();
      },
      error: () => this.toast.show('Failed to delete registration', 'error'),
    });
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.deletingRegistration = null;
  }

  get deleteMessage(): string {
    const name = this.deletingRegistration?.fullName || '';
    return `Are you sure you want to delete the registration from '${name}'?`;
  }

  trackById(_index: number, item: EventRegistration): string {
    return item.id;
  }
}
