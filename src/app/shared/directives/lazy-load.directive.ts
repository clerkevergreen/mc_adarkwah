import { Directive, ElementRef, Input, AfterViewInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appLazyLoad]',
  standalone: true,
})
export class LazyLoadDirective implements AfterViewInit, OnDestroy {
  @Input() placeholderSrc: string = 'data:image/svg+xml,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%22800%22 height%3D%22600%22 viewBox%3D%220 0 800 600%22%3E%3Crect fill%3D%22%231a1a2e%22 width%3D%22800%22 height%3D%22600%22%2F%3E%3Ccircle fill%3D%22%23d4a84b%22 opacity%3D%22.15%22 cx%3D%22400%22 cy%3D%22300%22 r%3D%2280%22%2F%3E%3Cpath fill%3D%22none%22 stroke%3D%22%23d4a84b%22 stroke-width%3D%222%22 opacity%3D%22.2%22 d%3D%22M320 300l40 40 80-80%22%2F%3E%3C%2Fsvg%3E';
  private observer: IntersectionObserver | null = null;

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    this.setupLazyLoading();
  }

  private setupLazyLoading(): void {
    const img = this.el.nativeElement as HTMLImageElement;
    if (img.tagName !== 'IMG') return;

    const originalSrc = img.src;
    img.src = this.placeholderSrc;
    img.classList.add('lazy-load');

    const options: IntersectionObserverInit = {
      rootMargin: '200px 0px',
      threshold: 0.01,
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          img.src = originalSrc;
          img.onload = () => img.classList.add('lazy-loaded');
          this.observer?.unobserve(img);
        }
      });
    }, options);

    this.observer.observe(img);
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
