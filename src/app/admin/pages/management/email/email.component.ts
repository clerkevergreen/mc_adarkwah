import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../components/topbar/topbar.component';
import { DataTableComponent, ColumnDef } from '../../../components/data-table/data-table.component';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ToastService } from '../../../components/toast/toast.service';
import { EmailService, EmailLog } from '../../../services/email.service';

@Component({
  selector: 'app-email',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, TopbarComponent, DataTableComponent, ModalComponent],
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.scss'],
})
export class EmailComponent implements OnInit {
  private emailService = inject(EmailService);
  private toast = inject(ToastService);

  logs = signal<EmailLog[]>([]);
  stats = signal({ sent: 0, failed: 0, total: 0 });
  loading = true;
  sidebarCollapsed = false;
  showTestModal = false;
  testEmail = '';
  sendingTest = false;
  statusFilter: 'all' | 'sent' | 'failed' = 'all';

  columns: ColumnDef[] = [
    { key: 'createdAt', label: 'Time', type: 'date', sortable: true },
    { key: 'to', label: 'Recipient' },
    { key: 'subject', label: 'Subject' },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status', type: 'badge' },
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.emailService.getStats().subscribe(s => this.stats.set(s));

    const params: Record<string, any> = {};
    if (this.statusFilter !== 'all') params['status'] = this.statusFilter;

    this.emailService.getLogs(params).subscribe({
      next: (data) => { this.logs.set(data); this.loading = false; },
      error: () => { this.toast.show('Failed to load email logs', 'error'); this.loading = false; },
    });
  }

  filterChange(filter: 'all' | 'sent' | 'failed'): void {
    this.statusFilter = filter;
    this.loadData();
  }

  openTestModal(): void {
    this.testEmail = '';
    this.showTestModal = true;
  }

  sendTest(): void {
    if (!this.testEmail) return;
    this.sendingTest = true;
    this.emailService.sendTest(this.testEmail).subscribe({
      next: () => {
        this.toast.show('Test email sent', 'success');
        this.showTestModal = false;
        this.sendingTest = false;
        this.loadData();
      },
      error: (err) => {
        this.toast.show(err.error?.message || 'Failed to send test email', 'error');
        this.sendingTest = false;
      },
    });
  }

  getStatusClass(status: string): string {
    return status === 'sent' ? 'badge--success' : 'badge--danger';
  }
}
