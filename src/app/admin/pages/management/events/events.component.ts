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
import { EventsService } from '../../../services/events.service';
import { Event, EventCategory } from '../../../../models/event.model';

@Component({
  selector: 'app-events',
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
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
})
export class EventsComponent implements OnInit {
  private eventsService = inject(EventsService);
  private toast = inject(ToastService);

  events: Event[] = [];
  loading = false;
  sidebarCollapsed = false;

  search = '';
  selectedCategory = '';
  statusFilter: 'all' | 'upcoming' | 'featured' = 'all';

  showModal = false;
  editingEvent: Event | null = null;
  formData: Partial<Event> = {};
  saving = false;

  bannerFile: File | null = null;
  thumbnailFile: File | null = null;
  bannerPreview: string | null = null;
  thumbnailPreview: string | null = null;
  uploadingBanner = false;
  uploadingThumbnail = false;

  showDeleteConfirm = false;
  deletingEvent: Event | null = null;

  categories: EventCategory[] = [
    'corporate',
    'wedding',
    'conference',
    'concert',
    'product-launch',
    'awards-night',
    'church-program',
    'private-event',
    'special-ceremony',
  ];

  columns: ColumnDef[] = [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'category', label: 'Category', type: 'badge' },
    { key: 'date', label: 'Date', type: 'date', sortable: true },
    { key: 'location', label: 'Location' },
    { key: 'attendeeCount', label: 'Attendees' },
    { key: 'isFeatured', label: 'Featured', type: 'toggle' },
    { key: 'actions', label: 'Actions', type: 'action' },
  ];

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    this.eventsService.getEvents().subscribe({
      next: (data) => {
        this.events = data;
        this.loading = false;
      },
      error: () => {
        this.toast.show('Failed to load events', 'error');
        this.loading = false;
      },
    });
  }

  get filteredEvents(): Event[] {
    let list = this.events;
    if (this.search) {
      const q = this.search.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.location?.toLowerCase().includes(q) ||
          e.city?.toLowerCase().includes(q)
      );
    }
    if (this.selectedCategory) {
      list = list.filter((e) => e.category === this.selectedCategory);
    }
    if (this.statusFilter === 'upcoming') {
      list = list.filter((e) => e.isUpcoming);
    } else if (this.statusFilter === 'featured') {
      list = list.filter((e) => e.isFeatured);
    }
    return list;
  }

  openCreateModal(): void {
    this.editingEvent = null;
    this.formData = {
      title: '',
      category: undefined,
      description: '',
      shortDescription: '',
      date: undefined,
      venue: '',
      location: '',
      city: '',
      country: '',
      attendeeCount: 0,
      bannerImage: '',
      thumbnailImage: '',
      highlights: [],
      tags: [],
      isUpcoming: false,
      isFeatured: false,
      registrationUrl: '',
      ticketUrl: '',
    };
    this.bannerFile = null;
    this.thumbnailFile = null;
    this.bannerPreview = null;
    this.thumbnailPreview = null;
    this.showModal = true;
  }

  openEditModal(event: Event): void {
    this.editingEvent = event;
    this.formData = {
      title: event.title,
      category: event.category,
      description: event.description,
      shortDescription: event.shortDescription,
      date: event.date,
      venue: event.venue,
      location: event.location,
      city: event.city,
      country: event.country,
      attendeeCount: event.attendeeCount,
      bannerImage: event.bannerImage,
      thumbnailImage: event.thumbnailImage,
      highlights: event.highlights,
      tags: event.tags,
      isUpcoming: event.isUpcoming,
      isFeatured: event.isFeatured,
      registrationUrl: event.registrationUrl || '',
      ticketUrl: event.ticketUrl || '',
    };
    this.bannerFile = null;
    this.thumbnailFile = null;
    this.bannerPreview = event.bannerImage || null;
    this.thumbnailPreview = event.thumbnailImage || null;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingEvent = null;
    this.bannerFile = null;
    this.thumbnailFile = null;
    this.bannerPreview = null;
    this.thumbnailPreview = null;
  }

  onBannerSelected(e: any): void {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.bannerFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.bannerPreview = e.target?.result as string;
      };
      reader.readAsDataURL(this.bannerFile);
    }
  }

  onThumbnailSelected(e: any): void {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.thumbnailFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.thumbnailPreview = e.target?.result as string;
      };
      reader.readAsDataURL(this.thumbnailFile);
    }
  }

  saveEvent(): void {
    this.saving = true;

    const uploadTasks: Promise<void>[] = [];

    if (this.bannerFile) {
      this.uploadingBanner = true;
      uploadTasks.push(new Promise((resolve, reject) => {
        this.eventsService.uploadImage(this.bannerFile!).subscribe({
          next: (result) => {
            this.formData.bannerImage = result.url;
            this.uploadingBanner = false;
            resolve();
          },
          error: reject,
        });
      }));
    }

    if (this.thumbnailFile) {
      this.uploadingThumbnail = true;
      uploadTasks.push(new Promise((resolve, reject) => {
        this.eventsService.uploadImage(this.thumbnailFile!).subscribe({
          next: (result) => {
            this.formData.thumbnailImage = result.url;
            this.uploadingThumbnail = false;
            resolve();
          },
          error: reject,
        });
      }));
    }

    Promise.all(uploadTasks)
      .then(() => this.submitEvent())
      .catch(() => {
        this.toast.show('Failed to upload image', 'error');
        this.saving = false;
        this.uploadingBanner = false;
        this.uploadingThumbnail = false;
      });
  }

  private submitEvent(): void {
    const payload = {
      ...this.formData,
      highlights:
        typeof this.formData.highlights === 'string'
          ? (this.formData.highlights as string).split(',').map((s: string) => s.trim()).filter(Boolean)
          : this.formData.highlights,
      tags:
        typeof this.formData.tags === 'string'
          ? (this.formData.tags as string).split(',').map((s: string) => s.trim()).filter(Boolean)
          : this.formData.tags,
    };

    const request = this.editingEvent
      ? this.eventsService.updateEvent(this.editingEvent.id, payload)
      : this.eventsService.createEvent(payload);

    request.subscribe({
      next: () => {
        this.toast.show(
          this.editingEvent ? 'Event updated successfully' : 'Event created successfully',
          'success'
        );
        this.closeModal();
        this.loadEvents();
        this.saving = false;
      },
      error: () => {
        this.toast.show('Failed to save event', 'error');
        this.saving = false;
      },
    });
  }

  onEdit(event: Event): void {
    this.openEditModal(event);
  }

  onDelete(event: Event): void {
    this.deletingEvent = event;
    this.showDeleteConfirm = true;
  }

  confirmDelete(): void {
    if (!this.deletingEvent) return;
    this.eventsService.deleteEvent(this.deletingEvent.id).subscribe({
      next: () => {
        this.toast.show('Event deleted successfully', 'success');
        this.showDeleteConfirm = false;
        this.deletingEvent = null;
        this.loadEvents();
      },
      error: () => {
        this.toast.show('Failed to delete event', 'error');
        this.showDeleteConfirm = false;
      },
    });
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.deletingEvent = null;
  }

  onToggleFeature(event: { id: string; value: boolean }): void {
    this.eventsService.toggleFeature(event.id).subscribe({
      next: () => {
        this.toast.show('Featured status updated', 'success');
        this.loadEvents();
      },
      error: () => {
        this.toast.show('Failed to update featured status', 'error');
        this.loadEvents();
      },
    });
  }

  onView(_event: Event): void {}

  trackById(_index: number, item: Event): string {
    return item.id;
  }

  get highlightsStr(): string {
    return Array.isArray(this.formData.highlights) ? this.formData.highlights.join(', ') : '';
  }

  set highlightsStr(val: string) {
    this.formData.highlights = val ? val.split(',').map(s => s.trim()) : [];
  }

  get tagsStr(): string {
    return Array.isArray(this.formData.tags) ? this.formData.tags.join(', ') : '';
  }

  set tagsStr(val: string) {
    this.formData.tags = val ? val.split(',').map(s => s.trim()) : [];
  }

  get eventDateStr(): string {
    if (!this.formData.date) return '';
    const d = new Date(this.formData.date);
    return d.toISOString().split('T')[0];
  }

  set eventDateStr(val: string) {
    if (val) {
      this.formData.date = new Date(val) as any;
    }
  }
}
