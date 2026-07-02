import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
})
export class HeroComponent implements OnInit, AfterViewInit {
  @ViewChild('heroVideo') heroVideo!: ElementRef<HTMLVideoElement>;
  socialMedia: any;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.socialMedia = this.dataService.getAboutInfo().socialMedia;
  }

  ngAfterViewInit(): void {
    const video = this.heroVideo?.nativeElement ?? document.querySelector<HTMLVideoElement>('.hero__video');
    if (!video) return;
    video.load();
    this.attemptPlay(video);
  }

  private attemptPlay(video: HTMLVideoElement, retries = 5): void {
    if (!video.paused) return;
    video.play().catch(() => {
      if (retries <= 0) {
        const resume = () => { video.play(); };
        document.addEventListener('click', resume, { once: true });
        document.addEventListener('touchstart', resume, { once: true });
        document.addEventListener('scroll', resume, { once: true });
        return;
      }
      setTimeout(() => this.attemptPlay(video, retries - 1), 1000);
    });
  }

  scrollTo(section: string): void {
    const el = document.getElementById(section);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
