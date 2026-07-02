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
    { id: 'v1', title: 'Corporate Awards Night 2025 Highlights', thumbnail: 'https://placehold.co/480x270/d4a84b/0a0a0a?text=Corporate+Awards', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    { id: 'v2', title: 'Wedding MC Moments - Best of 2025', thumbnail: 'https://placehold.co/480x270/d4a84b/0a0a0a?text=Wedding+MC', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    { id: 'v3', title: 'Conference Moderation Excellence', thumbnail: 'https://placehold.co/480x270/d4a84b/0a0a0a?text=Conference', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    { id: 'v4', title: 'Concert Hosting Highlights', thumbnail: 'https://placehold.co/480x270/d4a84b/0a0a0a?text=Concert+Hosting', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
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
        `https://www.youtube.com/embed/${youtubeId}?rel=0&playsinline=1&enablejsapi=1`
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
