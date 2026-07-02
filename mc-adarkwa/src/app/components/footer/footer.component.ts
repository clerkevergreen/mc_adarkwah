import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { ApiService } from '../../services/api.service';
import { CurrencyService, CurrencyCode } from '../../services/currency.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  aboutInfo: any = {};
  currentYear = new Date().getFullYear();
  subscribeEmail = '';
  subscribeMessage = '';
  isSubscribing = false;
  currency: CurrencyCode = 'GHS';

  constructor(
    private dataService: DataService,
    private api: ApiService,
    public currencyService: CurrencyService,
  ) {
    this.currencyService.currency$.subscribe(c => this.currency = c);
  }

  ngOnInit(): void {
    this.dataService.getAboutInfo().subscribe(data => {
      if (data) this.aboutInfo = data;
    });
  }

  subscribe(): void {
    if (!this.subscribeEmail) return;
    this.isSubscribing = true;
    this.subscribeMessage = '';
    this.api.subscribeEmail(this.subscribeEmail).subscribe({
      next: (res) => {
        this.subscribeMessage = res.message;
        this.subscribeEmail = '';
        this.isSubscribing = false;
      },
      error: () => {
        this.subscribeMessage = 'Subscription failed. Try again.';
        this.isSubscribing = false;
      },
    });
  }
}
