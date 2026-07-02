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
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.poster = 'video/hero_poster.jpg';
    const source = document.createElement('source');
    source.src = 'video/hero_vid.mp4';
    source.type = 'video/mp4';
    video.appendChild(source);
    bg.insertBefore(video, bg.firstChild);
    this.initVideo(video);
  }

  private initVideo(video: HTMLVideoElement): void {
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
      const playOnInteraction = () => { video.play(); };
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
