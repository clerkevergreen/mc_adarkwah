import { Directive, ElementRef, Input, AfterViewInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appScrollReveal]',
  standalone: true,
})
export class ScrollRevealDirective implements AfterViewInit, OnDestroy {
  @Input() animation: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'zoom-in' | 'flip' = 'fade-up';
  @Input() delay: number = 0;
  @Input() duration: number = 600;
  @Input() threshold: number = 0.15;

  private observer: IntersectionObserver | null = null;

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    this.setupObserver();
  }

  private setupObserver(): void {
    const options: IntersectionObserverInit = {
      root: null,
      rootMargin: '0px',
      threshold: this.threshold,
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('scroll-reveal-visible');
          this.observer?.unobserve(entry.target);
        }
      });
    }, options);

    this.el.nativeElement.classList.add('scroll-reveal', `scroll-reveal--${this.animation}`);
    this.el.nativeElement.style.transitionDuration = `${this.duration}ms`;
    this.el.nativeElement.style.transitionDelay = `${this.delay}ms`;
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
