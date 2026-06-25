import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ColumnDef {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'badge' | 'action' | 'date' | 'toggle' | 'stars';
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
})
export class DataTableComponent {
  @Input() columns: ColumnDef[] = [];
  @Input() rows: any[] = [];
  @Input() loading = false;
  @Input() pagination: PaginationInfo = { page: 1, limit: 10, total: 0, pages: 1 };

  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() view = new EventEmitter<any>();
  @Output() statusChange = new EventEmitter<{ id: string; value: boolean }>();
  @Output() sort = new EventEmitter<{ key: string; direction: 'asc' | 'desc' }>();
  @Output() pageChange = new EventEmitter<'prev' | 'next' | number>();

  skeletonRows = Array.from({ length: 5 }, (_, i) => i);
  skeletonColumns = Array.from({ length: 4 }, (_, i) => i);
  sortState: Record<string, 'asc' | 'desc'> = {};

  get pageNumbers(): number[] {
    const { page, pages } = this.pagination;
    const range: number[] = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(pages, page + 2);
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  }

  toggleSort(key: string): void {
    const current = this.sortState[key];
    const next = !current ? 'asc' : current === 'asc' ? 'desc' : 'asc';
    this.sortState = { [key]: next };
    this.sort.emit({ key, direction: next });
  }

  getSortIcon(key: string): string {
    const state = this.sortState[key];
    if (!state) return 'M7 10l5 5 5-5';
    if (state === 'asc') return 'M7 13l5-5 5 5';
    return 'M7 10l5 5 5-5';
  }

  onToggleChange(id: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.statusChange.emit({ id, value: checked });
  }

  formatDate(val: string): string {
    if (!val) return '-';
    const d = new Date(val);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  badgeClass(val: string): string {
    const map: Record<string, string> = {
      pending: 'app-data-table__badge--pending',
      confirmed: 'app-data-table__badge--confirmed',
      approved: 'app-data-table__badge--approved',
      cancelled: 'app-data-table__badge--cancelled',
      completed: 'app-data-table__badge--completed',
      contacted: 'app-data-table__badge--contacted',
      closed: 'app-data-table__badge--closed',
    };
    return map[val?.toLowerCase()] || '';
  }

  starArray(rating: number): number[] {
    return Array.from({ length: Math.min(5, Math.max(0, rating)) }, (_, i) => i);
  }

  emptyStarArray(rating: number): number[] {
    return Array.from({ length: Math.max(0, 5 - Math.min(5, Math.max(0, rating))) }, (_, i) => i);
  }
}
