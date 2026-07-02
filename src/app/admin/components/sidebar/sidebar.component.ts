import { Component, EventEmitter, HostListener, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  private authService = inject(AuthService);
  router = inject(Router);

  @Output() toggle = new EventEmitter<void>();

  isCollapsed = false;
  isMobileOpen = false;

  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: 'grid' },
    { label: 'Profile', route: '/admin/profile', icon: 'user' },
    { label: 'Events', route: '/admin/events', icon: 'calendar' },
    { label: 'Bookings', route: '/admin/bookings', icon: 'clipboard' },
    { label: 'Registrations', route: '/admin/registrations', icon: 'calendar' },
    { label: 'Services', route: '/admin/services', icon: 'star' },
    { label: 'Testimonials', route: '/admin/testimonials', icon: 'message-circle' },
    { label: 'Gallery', route: '/admin/gallery', icon: 'image' },
    { label: 'FAQs', route: '/admin/faqs', icon: 'help-circle' },
    { label: 'News', route: '/admin/news', icon: 'file-text' },
    { label: 'Sponsors', route: '/admin/sponsors', icon: 'users' },

    { label: 'Quotes', route: '/admin/quotes', icon: 'dollar-sign' },
    { label: 'Subscribers', route: '/admin/subscribers', icon: 'mail' },
    { label: 'Contact', route: '/admin/contact', icon: 'message-square' },
  ];

  @HostListener('window:resize', [])
  onResize(): void {
    const width = window.innerWidth;
    this.isCollapsed = width < 1024 && width >= 768;
    if (width >= 768) this.isMobileOpen = false;
  }

  toggleMobile(): void {
    this.isMobileOpen = !this.isMobileOpen;
    this.toggle.emit();
  }

  closeMobile(): void {
    this.isMobileOpen = false;
    this.toggle.emit();
  }

  logout(): void {
    this.authService.logout();
  }

  getIcon(name: string): string {
    const icons: Record<string, string> = {
      grid: 'M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z',
      calendar: 'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
      clipboard: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
      star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
      image: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
      'message-circle': 'M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z',
      'help-circle': 'M9.5 11a2.5 2.5 0 115 0 2.5 2.5 0 01-5 0zM12 11v3m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      'file-text': 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM6 20V4h6v4h4v12H6zm2-6h8v2H8v-2zm0-4h8v2H8v-2zm0-4h4v2H8V6z',
      users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      mail: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      'dollar-sign': 'M12 1v22m-6.5-16.5A4.5 4.5 0 0112 4.5c2 0 3.5 1 3.5 3s-1.5 3-3.5 3-3.5 1-3.5 3 1.5 3 3.5 3a4.5 4.5 0 006.5-2',
      'message-square': 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z',
      'user': 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 7a4 4 0 100-8 4 4 0 000 8z',

      'log-out': 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4m7 14l5-5-5-5m5 5H9',
    };
    return icons[name] || '';
  }
}
