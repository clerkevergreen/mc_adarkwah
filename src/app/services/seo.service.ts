import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class SeoService {
  constructor(
    private title: Title,
    private meta: Meta,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  setPageTitle(title: string): void {
    this.title.setTitle(`${title} | MC Adarkwah - Professional MC`);
  }

  setMetaTags(config: { title?: string; description?: string; image?: string; url?: string }): void {
    if (config.title) {
      this.meta.updateTag({ name: 'title', content: config.title });
      this.meta.updateTag({ property: 'og:title', content: config.title });
      this.meta.updateTag({ property: 'twitter:title', content: config.title });
    }
    if (config.description) {
      this.meta.updateTag({ name: 'description', content: config.description });
      this.meta.updateTag({ property: 'og:description', content: config.description });
      this.meta.updateTag({ property: 'twitter:description', content: config.description });
    }
    if (config.image) {
      this.meta.updateTag({ property: 'og:image', content: config.image });
      this.meta.updateTag({ property: 'twitter:image', content: config.image });
    }
    if (config.url) {
      this.meta.updateTag({ property: 'og:url', content: config.url });
    }
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
  }

  setStructuredData(data: object): void {
    if (isPlatformBrowser(this.platformId)) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(data);
      script.id = 'structured-data';
      const existing = document.getElementById('structured-data');
      if (existing) {
        existing.remove();
      }
      document.head.appendChild(script);
    }
  }
}
