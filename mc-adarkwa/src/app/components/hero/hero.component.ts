import { Component, OnInit, AfterViewInit } from '@angular/core';
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
  socialMedia: any;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.socialMedia = this.dataService.getAboutInfo().socialMedia;
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.addVideo(), 2500);
  }

  private addVideo(): void {
    const bg = document.querySelector('.hero__bg');
    if (!bg || bg.querySelector('.hero__video')) return;
    const video = document.createElement('video');
    video.className = 'hero__video';
    video.src = 'video/hero_vid.mp4';
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'auto';
    bg.insertBefore(video, bg.firstChild);
    this.initVideo(video);
  }

  private initVideo(video: HTMLVideoElement): void {
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
