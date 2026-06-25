import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { TopbarComponent } from '../../../components/topbar/topbar.component';
import { ToastService } from '../../../components/toast/toast.service';
import { HeroService, HeroContent } from '../../../services/hero.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, TopbarComponent],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
})
export class HeroComponent implements OnInit {
  private heroService = inject(HeroService);
  private toast = inject(ToastService);

  form: HeroContent = {
    badge: '', title: '', subtitle: '',
    primaryBtnText: '', primaryBtnAction: '',
    secondaryBtnText: '', secondaryBtnAction: '',
    stat1Value: '', stat1Label: '', stat1Icon: '',
    stat2Value: '', stat2Label: '', stat2Icon: '',
  };

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.heroService.get().subscribe({
      next: (data) => this.form = data,
      error: () => this.toast.show('Failed to load hero content', 'error'),
    });
  }

  save(): void {
    this.heroService.update(this.form).subscribe({
      next: () => this.toast.show('Hero content saved', 'success'),
      error: () => this.toast.show('Failed to save', 'error'),
    });
  }
}
