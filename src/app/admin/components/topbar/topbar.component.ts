import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
})
export class TopbarComponent {
  @Input() pageTitle = '';
  @Output() toggle = new EventEmitter<void>();

  get adminName(): string {
    const stored = localStorage.getItem('admin_name');
    if (stored) return stored;
    const email = this.adminEmail;
    return email ? email.split('@')[0] : 'Admin';
  }

  get adminEmail(): string {
    return localStorage.getItem('admin_email') || 'Admin';
  }
}
