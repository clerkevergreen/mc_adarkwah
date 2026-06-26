import { Directive, ElementRef, Input, AfterViewInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appLazyLoad]',
  standalone: true,
})
export class LazyLoadDirective implements AfterViewInit, OnDestroy {
  @Input() placeholderSrc: string = 'assets/images/placeholder.jpg';
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
