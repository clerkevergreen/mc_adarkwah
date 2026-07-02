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
    this.initVideo();
  }

  private getVideo(): HTMLVideoElement | null {
    return this.heroVideo?.nativeElement ?? document.querySelector<HTMLVideoElement>('.hero__video');
  }

  private initVideo(): void {
    const video = this.getVideo();
    if (!video) return;

    video.addEventListener('canplay', () => this.playVideo(video), { once: true });
    video.addEventListener('loadeddata', () => this.playVideo(video), { once: true });

    this.playVideo(video);

    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (attempts > 10 || !video.paused) {
        clearInterval(interval);
        return;
      }
      this.playVideo(video);
    }, 1000);
  }

  private playVideo(video: HTMLVideoElement): void {
    if (!video.paused) return;
    video.play().catch(() => {
      const playOnInteraction = () => {
        video.play();
        document.removeEventListener('click', playOnInteraction);
        document.removeEventListener('touchstart', playOnInteraction);
        document.removeEventListener('scroll', playOnInteraction);
      };
      document.addEventListener('click', playOnInteraction, { once: true });
      document.addEventListener('touchstart', playOnInteraction, { once: true });
      document.addEventListener('scroll', playOnInteraction, { once: true });
    });
  }

  scrollTo(section: string): void {
    const el = document.getElementById(section);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
