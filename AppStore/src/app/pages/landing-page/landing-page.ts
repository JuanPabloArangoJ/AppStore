import { DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth-service';

interface PublicProduct {
  productId: number;
  sku: string;
  name: string;
  stock: number;
  price: number;
  imageUrl: string;
}

@Component({
  selector: 'app-landing-page',
  imports: [DecimalPipe, MatIconModule, RouterLink],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
})
export class LandingPage implements OnInit, AfterViewInit, OnDestroy {
  private http = inject(HttpClient);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected authService = inject(AuthService);

  protected featuredProducts = signal<PublicProduct[]>([]);
  protected scrolled = signal(false);
  protected progress = signal(0);

  /** Categorías para la cinta animada (se duplican para el bucle infinito). */
  protected readonly categories = [
    'Teclados mecánicos',
    'Mouse gamer',
    'Monitores',
    'Audífonos',
    'Tarjetas gráficas',
    'Sillas gamer',
    'Streaming',
    'Almacenamiento',
  ];
  protected readonly marquee = [...this.categories, ...this.categories];

  private observer?: IntersectionObserver;

  ngOnInit(): void {
    this.http.get<PublicProduct[]>(`${environment.apiUrl}/product`).subscribe({
      next: (items) => {
        this.featuredProducts.set(items.slice(0, 6));
        // Los productos llegan después del primer render: volvemos a observar.
        setTimeout(() => this.observeReveals());
      },
      error: () => this.featuredProducts.set([]),
    });
  }

  ngAfterViewInit(): void {
    this.observeReveals();
    this.onScroll();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (typeof window === 'undefined') return;
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    this.scrolled.set(y > 24);
    this.progress.set(max > 0 ? Math.min(100, (y / max) * 100) : 0);
  }

  /** Marca con la clase "in" los elementos .reveal cuando entran al viewport. */
  private observeReveals(): void {
    if (typeof window === 'undefined') return;
    const els = this.host.nativeElement.querySelectorAll<HTMLElement>('.reveal:not(.in)');

    const reduceMotion =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion || typeof IntersectionObserver === 'undefined') {
      els.forEach((el) => el.classList.add('in'));
      return;
    }

    this.observer ??= new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            this.observer?.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );

    els.forEach((el) => this.observer!.observe(el));
  }
}