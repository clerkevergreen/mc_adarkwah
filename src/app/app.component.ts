import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastContainerComponent } from './shared/components/toast/toast-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ToastContainerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'MC Adarkwah - Professional Master of Ceremonies';
  isOffline = !navigator.onLine;

  @HostListener('window:online')
  onOnline(): void {
    this.isOffline = false;
  }

  @HostListener('window:offline')
  onOffline(): void {
    this.isOffline = true;
  }
}
