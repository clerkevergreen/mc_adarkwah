import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';

@Component({
  selector: 'app-video-highlights',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  templateUrl: './video-highlights.component.html',
  styleUrls: ['./video-highlights.component.scss'],
})
export class VideoHighlightsComponent {
  videos = [
    { id: 'v1', title: 'Corporate Awards Night 2025 Highlights', thumbnail: 'assets/images/videos/video1-thumb.jpg', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    { id: 'v2', title: 'Wedding MC Moments - Best of 2025', thumbnail: 'assets/images/videos/video2-thumb.jpg', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    { id: 'v3', title: 'Conference Moderation Excellence', thumbnail: 'assets/images/videos/video3-thumb.jpg', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    { id: 'v4', title: 'Concert Hosting Highlights', thumbnail: 'assets/images/videos/video4-thumb.jpg', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  ];

  activeVideo: any = null;
  activeVideoUrl: SafeResourceUrl | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  private getYoutubeId(url: string): string {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : '';
  }

  openVideo(video: any): void {
    this.activeVideo = video;
    const youtubeId = this.getYoutubeId(video.url);
    if (youtubeId) {
      this.activeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`
      );
    }
    document.body.style.overflow = 'hidden';
  }

  closeVideo(): void {
    this.activeVideo = null;
    this.activeVideoUrl = null;
    document.body.style.overflow = '';
  }
}
