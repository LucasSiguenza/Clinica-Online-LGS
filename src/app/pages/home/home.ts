import { Component, ElementRef, AfterViewInit, ViewChild, inject } from '@angular/core';
import { Utils } from '../../services/util';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements AfterViewInit {
  @ViewChild('slideshow', { static: true }) slideshowRef!: ElementRef<HTMLDivElement>;
  @ViewChild('bars', { static: true }) barsRef!: ElementRef<HTMLDivElement>;
  @ViewChild('dots', { static: true }) dotsRef!: ElementRef<HTMLUListElement>;

  private utilSvc = inject(Utils)

  private slides!: NodeListOf<HTMLElement>;
  private bars!: NodeListOf<HTMLElement>;
  private dots!: NodeListOf<HTMLElement>;
  private slideTitles!: NodeListOf<HTMLElement>;

  private readonly easeInOutQuart = 'cubic-bezier(0.77, 0, 0.175, 1)';
  private readonly easeOutCubic = 'cubic-bezier(0.215, 0.61, 0.355, 1)';

  ngAfterViewInit(): void {
    const slideshow = this.slideshowRef.nativeElement;
    this.slides = slideshow.querySelectorAll('.slide');
    this.bars = this.barsRef.nativeElement.querySelectorAll('.bar');
    this.dots = this.dotsRef.nativeElement.querySelectorAll('.dot button');
    this.slideTitles = slideshow.querySelectorAll('.slide-title');

    this.setActiveIndex(0);       // slide inicial
    this.dots[0].classList.add('active');

    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        const currentIndex = Number(slideshow.style.getPropertyValue('--active-index') || 0);
        if (currentIndex !== index) this.pageTransition(index);
      });
    });
  }

  private staggeredSlideIn(element: Element, delay: number) {
    return element.animate(
      [
        { transform: 'scaleY(0)', transformOrigin: 'top' },
        { transform: 'scaleY(1)', transformOrigin: 'top' },
      ],
      { duration: 800, easing: this.easeInOutQuart, fill: 'forwards', delay: 80 * delay }
    );
  }

  private staggeredSlideOut(element: Element, delay: number) {
    return element.animate(
      [
        { transform: 'scaleY(1)', transformOrigin: 'top' },
        { transformOrigin: 'bottom', offset: 0.001 },
        { transform: 'scaleY(0)', transformOrigin: 'bottom' },
      ],
      { duration: 800, easing: this.easeInOutQuart, fill: 'forwards', delay: 80 * delay }
    );
  }

  private fadeIn(element: Element) {
    return element.animate(
      [
        { opacity: 0, transform: 'translateY(100%)' },
        { opacity: 1, transform: 'translateY(0)' },
      ],
      { duration: 800, easing: this.easeOutCubic, fill: 'forwards', delay: 350 }
    );
  }

  private fadeOut(element: Element) {
    return element.animate(
      [
        { opacity: 1, transform: 'translateY(0)' },
        { opacity: 0, transform: 'translateY(-100%)' },
      ],
      { duration: 600, easing: this.easeOutCubic, fill: 'forwards' }
    );
  }

  private pageTransition(activeIndex: number) {
    this.slideTitles.forEach(title => this.fadeOut(title));

    Promise.all(Array.from(this.bars).map((bar, i) => this.staggeredSlideIn(bar, i).finished))
      .then(() => {
        this.setActiveIndex(activeIndex);
        this.bars.forEach((bar, i) => this.staggeredSlideOut(bar, i));
        this.slideTitles.forEach(title => this.fadeIn(title));
      });
  }

  private setActiveIndex(activeIndex: number) {
    this.dots.forEach(dot => dot.classList.remove('active'));
    this.dots[activeIndex].classList.add('active');

    const slideshow = this.slideshowRef.nativeElement;
    slideshow.style.setProperty('--active-index', `${activeIndex}`);

    this.slides.forEach(slide => (slide.style.zIndex = '-1'));
    this.slides[activeIndex].style.zIndex = '0';
  }

  cerrarSesion(){
    this.utilSvc.routerLink('');
  }
}
