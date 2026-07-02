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
    this.tryPlay();
  }

  private tryPlay(): void {
    const video = this.heroVideo?.nativeElement;
    if (!video) return;
    video.play().catch(() => {
      const playOnInteraction = () => {
        video.play();
        document.removeEventListener('click', playOnInteraction);
        document.removeEventListener('touchstart', playOnInteraction);
        document.removeEventListener('scroll', playOnInteraction);
      };
      document.addEventListener('click', playOnInteraction);
      document.addEventListener('touchstart', playOnInteraction);
      document.addEventListener('scroll', playOnInteraction);
    });
  }

  scrollTo(section: string): void {
    const el = document.getElementById(section);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
