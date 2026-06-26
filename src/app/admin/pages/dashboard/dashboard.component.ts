import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { TopbarComponent } from '../../components/topbar/topbar.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { DashboardService, DashboardStats } from '../../services/dashboard.service';
import { EventsService } from '../../services/events.service';
import { BookingsService, Booking } from '../../services/bookings.service';
import { Event } from '../../../models/event.model';
import { ProfileService, Profile } from '../../services/profile.service';
import { ToastService } from '../../components/toast/toast.service';
import { CurrencyService } from '../../../services/currency.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, BaseChartDirective, SidebarComponent, TopbarComponent, ModalComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private eventsService = inject(EventsService);
  private bookingsService = inject(BookingsService);
  private profileService = inject(ProfileService);
  private currencyService = inject(CurrencyService);
  private toast = inject(ToastService);
  private router = inject(Router);

  stats: DashboardStats | null = null;
  recentBookings: Booking[] = [];
  recentEvents: Event[] = [];

  showSettings = false;
  settingsForm: Partial<Profile> = {};
  budgetRangeList: { min: number; max: number; label: string }[] = [];
  settingsLoading = false;

  lineChartType: ChartType = 'line';

  lineChartData: ChartData<'line'> = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        borderColor: '#C9A84C',
        backgroundColor: 'rgba(201, 168, 76, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: '#C9A84C',
        pointBorderColor: '#C9A84C',
        pointRadius: 3,
        pointHoverRadius: 5,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        ticks: { color: 'rgba(255,255,255,0.6)' },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
      y: {
        ticks: { color: 'rgba(255,255,255,0.6)' },
        grid: { color: 'rgba(255,255,255,0.05)' },
        beginAtZero: true,
      },
    },
  };

  ngOnInit(): void {
    this.loadStats();
    this.loadRecentBookings();
    this.loadRecentEvents();
  }

  private loadStats(): void {
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.updateChartData(data);
      },
    });
  }

  private loadRecentBookings(): void {
    this.bookingsService.getBookings({ limit: 5 }).subscribe({
      next: (data) => {
        this.recentBookings = data;
      },
    });
  }

  private loadRecentEvents(): void {
    this.eventsService.getEvents({ limit: 5 }).subscribe({
      next: (data) => {
        this.recentEvents = data;
      },
    });
  }

  private updateChartData(stats: DashboardStats): void {
    const months = this.generateMonthlyDistribution(stats.totalBookings);
    this.lineChartData = {
      ...this.lineChartData,
      datasets: [
        {
          ...this.lineChartData.datasets[0],
          data: months,
        },
      ],
    };
  }

  private generateMonthlyDistribution(total: number): number[] {
    const months = Array(12).fill(0);
    if (total === 0) return months;
    let remaining = total;
    for (let i = 0; i < 12; i++) {
      const portion = Math.round(total * (0.05 + Math.random() * 0.12));
      months[i] = Math.min(portion, remaining);
      remaining -= months[i];
    }
    if (remaining > 0) months[11] += remaining;
    return months;
  }

  timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
  }

  statusColor(status: string): string {
    switch (status) {
      case 'confirmed':
        return 'status--confirmed';
      case 'cancelled':
        return 'status--cancelled';
      case 'pending':
      default:
        return 'status--pending';
    }
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  openSettings(): void {
    this.showSettings = true;
    this.settingsLoading = true;
    this.profileService.get().subscribe({
      next: (data) => {
        this.settingsForm = { exchangeRate: data.exchangeRate };
        this.budgetRangeList = (data.budgetRanges || []).map(r => ({ ...r }));
        this.settingsLoading = false;
      },
      error: () => {
        this.toast.show('Failed to load settings', 'error');
        this.settingsLoading = false;
      },
    });
  }

  closeSettings(): void {
    this.showSettings = false;
  }

  addRange(): void {
    this.budgetRangeList.push({ min: 0, max: 0, label: '' });
  }

  removeRange(index: number): void {
    this.budgetRangeList.splice(index, 1);
  }

  saveSettings(): void {
    const data: Partial<Profile> = {
      exchangeRate: this.settingsForm.exchangeRate,
      budgetRanges: this.budgetRangeList.filter(r => r.min >= 0 || r.max > 0),
    };
    this.profileService.update(data).subscribe({
      next: () => {
        this.currencyService.refresh();
        this.toast.show('Settings saved', 'success');
        this.showSettings = false;
      },
      error: () => this.toast.show('Failed to save settings', 'error'),
    });
  }
}
