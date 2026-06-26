import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-screen.component.html',
  styleUrls: ['./loading-screen.component.scss'],
})
export class LoadingScreenComponent implements OnInit, OnDestroy {
  isLoading = true;

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      this.isLoading = false;
      document.body.style.overflow = '';
    }, 2000);
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }
}
