import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-countdown-timer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './countdown-timer.component.html',
  styleUrls: ['./countdown-timer.component.scss'],
})
export class CountdownTimerComponent implements OnInit, OnDestroy {
  @Input() targetDate!: Date;
  @Input() size: 'sm' | 'md' = 'sm';

  days = 0;
  hours = 0;
  minutes = 0;
  seconds = 0;
  private interval: any;

  ngOnInit(): void {
    this.updateCountdown();
    this.interval = setInterval(() => this.updateCountdown(), 1000);
  }

  private updateCountdown(): void {
    const now = new Date().getTime();
    const target = new Date(this.targetDate).getTime();
    const diff = Math.max(0, target - now);

    this.days = Math.floor(diff / (1000 * 60 * 60 * 24));
    this.hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    this.minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    this.seconds = Math.floor((diff % (1000 * 60)) / 1000);
  }

  ngOnDestroy(): void {
    if (this.interval) clearInterval(this.interval);
  }
}
