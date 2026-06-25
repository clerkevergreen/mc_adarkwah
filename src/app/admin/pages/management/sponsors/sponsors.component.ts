import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../components/topbar/topbar.component';
import { SponsorsService, Sponsor } from '../../../services/sponsors.service';
import { ToastService } from '../../../components/toast/toast.service';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-sponsors',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, TopbarComponent, ModalComponent, ConfirmDialogComponent],
  templateUrl: './sponsors.component.html',
  styleUrls: ['./sponsors.component.scss'],
})
export class SponsorsComponent implements OnInit {
  private sponsorsService = inject(SponsorsService);
  private toast = inject(ToastService);

  loading = signal(true);
  sponsors = signal<Sponsor[]>([]);
  showModal = false;
  editingSponsor: Sponsor | null = null;
  formData: Partial<Sponsor> = { name: '', logo: '', website: '' };
  showConfirm = false;
  deletingId: string | null = null;

  ngOnInit(): void {
    this.loadSponsors();
  }

  loadSponsors(): void {
    this.loading.set(true);
    this.sponsorsService.getSponsors().subscribe({
      next: (data) => {
        this.sponsors.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.toast.show('Failed to load sponsors', 'error');
        this.loading.set(false);
      },
    });
  }

  openCreate(): void {
    this.editingSponsor = null;
    this.formData = { name: '', logo: '', website: '' };
    this.showModal = true;
  }

  openEdit(sponsor: Sponsor): void {
    this.editingSponsor = sponsor;
    this.formData = { ...sponsor };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingSponsor = null;
  }

  save(): void {
    if (!this.formData.name) {
      this.toast.show('Name is required', 'warning');
      return;
    }

    if (this.editingSponsor) {
      this.sponsorsService.updateSponsor(this.editingSponsor.id, this.formData).subscribe({
        next: () => {
          this.toast.show('Sponsor updated successfully', 'success');
          this.closeModal();
          this.loadSponsors();
        },
        error: () => this.toast.show('Failed to update sponsor', 'error'),
      });
    } else {
      this.sponsorsService.createSponsor(this.formData).subscribe({
        next: () => {
          this.toast.show('Sponsor created successfully', 'success');
          this.closeModal();
          this.loadSponsors();
        },
        error: () => this.toast.show('Failed to create sponsor', 'error'),
      });
    }
  }

  confirmDelete(id: string): void {
    this.deletingId = id;
    this.showConfirm = true;
  }

  deleteSponsor(): void {
    if (!this.deletingId) return;
    this.sponsorsService.deleteSponsor(this.deletingId).subscribe({
      next: () => {
        this.toast.show('Sponsor deleted', 'success');
        this.showConfirm = false;
        this.deletingId = null;
        this.loadSponsors();
      },
      error: () => this.toast.show('Failed to delete sponsor', 'error'),
    });
  }

  cancelDelete(): void {
    this.showConfirm = false;
    this.deletingId = null;
  }
}
