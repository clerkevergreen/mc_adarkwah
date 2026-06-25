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
import { QuotesService, Quote } from '../../../services/quotes.service';

type QuoteStatus = 'pending' | 'contacted' | 'closed';

@Component({
  selector: 'app-quotes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    SidebarComponent,
    TopbarComponent,
    DataTableComponent,
    ModalComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './quotes.component.html',
  styleUrls: ['./quotes.component.scss'],
})
export class QuotesComponent implements OnInit {
  private quotesService = inject(QuotesService);
  private toast = inject(ToastService);

  quotes: Quote[] = [];
  loading = false;
  sidebarCollapsed = false;

  search = '';
  statusFilter: 'all' | QuoteStatus = 'all';

  showViewModal = false;
  viewingQuote: Quote | null = null;
  selectedStatus: QuoteStatus = 'pending';

  showDeleteConfirm = false;
  deletingQuote: Quote | null = null;

  statusOptions: QuoteStatus[] = ['pending', 'contacted', 'closed'];

  columns: ColumnDef[] = [
    { key: 'createdAt', label: 'Date', type: 'date', sortable: true },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'eventType', label: 'Event Type' },
    { key: 'status', label: 'Status', type: 'badge' },
    { key: 'actions', label: 'Actions', type: 'action' },
  ];

  ngOnInit(): void {
    this.loadQuotes();
  }

  loadQuotes(): void {
    this.loading = true;
    this.quotesService.getQuotes().subscribe({
      next: (data) => {
        this.quotes = data;
        this.loading = false;
      },
      error: () => {
        this.toast.show('Failed to load quotes', 'error');
        this.loading = false;
      },
    });
  }

  get filteredQuotes(): Quote[] {
    let list = this.quotes;
    if (this.search) {
      const q = this.search.toLowerCase();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.email.toLowerCase().includes(q) ||
          item.eventType.toLowerCase().includes(q)
      );
    }
    if (this.statusFilter !== 'all') {
      list = list.filter((item) => item.status === this.statusFilter);
    }
    return list;
  }

  onView(quote: Quote): void {
    this.viewingQuote = quote;
    this.selectedStatus = quote.status as QuoteStatus;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.viewingQuote = null;
  }

  updateStatus(): void {
    if (!this.viewingQuote) return;
    const id = this.viewingQuote.id;
    this.quotesService.updateStatus(id, this.selectedStatus).subscribe({
      next: () => {
        this.toast.show('Quote status updated', 'success');
        this.closeViewModal();
        this.loadQuotes();
      },
      error: () => {
        this.toast.show('Failed to update status', 'error');
      },
    });
  }

  onDelete(quote: Quote): void {
    this.deletingQuote = quote;
    this.showDeleteConfirm = true;
  }

  confirmDelete(): void {
    if (!this.deletingQuote) return;
    this.quotesService.deleteQuote(this.deletingQuote.id).subscribe({
      next: () => {
        this.toast.show('Quote deleted successfully', 'success');
        this.showDeleteConfirm = false;
        this.deletingQuote = null;
        this.loadQuotes();
      },
      error: () => {
        this.toast.show('Failed to delete quote', 'error');
        this.showDeleteConfirm = false;
      },
    });
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.deletingQuote = null;
  }

  onEdit(quote: Quote): void {
    this.onView(quote);
  }

  trackById(_index: number, item: Quote): string {
    return item.id;
  }
}
