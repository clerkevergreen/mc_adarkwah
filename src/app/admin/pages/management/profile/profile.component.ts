import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../components/topbar/topbar.component';
import { ToastService } from '../../../components/toast/toast.service';
import { ProfileService, Profile } from '../../../services/profile.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, TopbarComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  private http = inject(HttpClient);
  private profileService = inject(ProfileService);
  private toast = inject(ToastService);

  form: Profile = {
    name: '', title: '', bio: '', fullBio: '', image: '', image2: '',
    yearsExperience: 0, achievements: [], milestones: [],
    socialMedia: {}, contact: {}, exchangeRate: 0.077, budgetRanges: [],
  };
  achievementsText = '';
  milestonesText = '';
  budgetRangesText = '';
  loading = false;

  ngOnInit(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    this.loading = true;
    this.profileService.get().subscribe({
      next: (data) => {
        this.form = data;
        this.achievementsText = (data.achievements || []).join('\n');
        this.milestonesText = (data.milestones || []).map(m => `${m.year}|${m.title}|${m.description}`).join('\n');
        this.budgetRangesText = (data.budgetRanges || []).map(r => `${r.min}|${r.max}|${r.label}`).join('\n');
        this.loading = false;
      },
      error: () => { this.toast.show('Failed to load profile', 'error'); this.loading = false; },
    });
  }

  onFileSelected(event: Event, field: 'image' | 'image2'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploadFile(file, field);
  }

  private uploadFile(file: File, field: 'image' | 'image2'): void {
    const formData = new FormData();
    formData.append('image', file);
    this.http.post<{ success: boolean; data: { url: string } }>(`${environment.apiUrl}/upload`, formData).subscribe({
      next: (res) => {
        this.form[field] = res.data.url;
        this.toast.show('Image uploaded', 'success');
      },
      error: () => this.toast.show('Upload failed', 'error'),
    });
  }

  save(): void {
    const data = {
      ...this.form,
      achievements: this.achievementsText.split('\n').map(s => s.trim()).filter(Boolean),
      milestones: this.milestonesText.split('\n').filter(Boolean).map(line => {
        const parts = line.split('|');
        return { year: parts[0] || '', title: parts[1] || '', description: parts[2] || '' };
      }),
      budgetRanges: this.budgetRangesText.split('\n').filter(Boolean).map(line => {
        const parts = line.split('|');
        return { min: Number(parts[0]) || 0, max: Number(parts[1]) || 0, label: parts[2] || '' };
      }),
    };
    this.profileService.update(data).subscribe({
      next: () => this.toast.show('Profile saved', 'success'),
      error: () => this.toast.show('Failed to save profile', 'error'),
    });
  }
}
