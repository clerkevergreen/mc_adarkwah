import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';

@Component({
  selector: 'app-sponsors',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  templateUrl: './sponsors.component.html',
  styleUrls: ['./sponsors.component.scss'],
})
export class SponsorsComponent implements OnInit {
  sponsors: any[] = [];
  loading = true;
  error: string | null = null;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;
    this.dataService.getSponsors().subscribe({
      next: (data) => { this.sponsors = data; this.loading = false; },
      error: (err) => { this.error = err.error?.message || err.message || 'Failed to load'; this.loading = false; }
    });
  }

  retry(): void {
    this.loadData();
  }
}
