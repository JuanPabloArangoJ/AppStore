import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth-service';

Chart.register(...registerables);

/* =========================================================
   CONFIGURACIÓN — Endpoints reales del Backend
========================================================= */
const API = {
  products: `${environment.apiUrl}/product`,
  users: `${environment.apiUrl}/user/getall`,
  sales: `${environment.apiUrl}/sale`,
};
const LOW_STOCK = 5;

interface Product {
  productId: number;
  sku: string;
  name: string;
  stock: number;
  price: number;
  imageUrl: string;
}

interface UserItem {
  id: number | string;
  fullName: string;
  email: string;
  role: string;
}

interface SaleItem {
  id: number | string;
  date: Date | null;
  total: number;
  seller: string;
}

type Raw = Record<string, any>;

function parseBackendDate(raw: unknown): Date | null {
  if (!raw) return null;
  if (raw instanceof Date) return isNaN(raw.getTime()) ? null : raw;

  const str = String(raw).trim();

  // Formato del backend: "dd/MM/yyyy" o "dd/MM/yyyy HH:mm"
  const match = str.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?/);
  if (match) {
    const day = Number(match[1]);
    const month = Number(match[2]) - 1;
    const year = Number(match[3]);
    const hour = match[4] ? Number(match[4]) : 0;
    const minute = match[5] ? Number(match[5]) : 0;
    const d = new Date(year, month, day, hour, minute);
    return isNaN(d.getTime()) ? null : d;
  }

  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function toUser(u: Raw): UserItem {
  return {
    id: u['userId'] ?? u['id'] ?? '',
    fullName: u['fullName'] ?? u['name'] ?? u['email'] ?? 'Usuario',
    email: u['email'] ?? '',
    role: String(u['type'] ?? u['userType'] ?? u['role'] ?? ''),
  };
}

function toSale(s: Raw): SaleItem {
  const raw = s['saleDate'] ?? s['createdAt'] ?? s['date'] ?? null;
  return {
    id: s['saleId'] ?? s['id'] ?? '',
    date: parseBackendDate(raw),
    total: Number(s['totalAmount'] ?? s['total'] ?? s['amount'] ?? 0),
    seller: s['userName'] ?? s['sellerName'] ?? s['user']?.['fullName'] ?? '',
  };
}

@Component({
  selector: 'app-home-page',
  imports: [DatePipe, DecimalPipe, MatIconModule, RouterLink],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage implements OnInit, OnDestroy {
  protected authService = inject(AuthService);
  private http = inject(HttpClient);

  private stockCanvas = viewChild<ElementRef<HTMLCanvasElement>>('stockChart');
  private salesCanvas = viewChild<ElementRef<HTMLCanvasElement>>('salesChart');
  private stockChart: Chart | null = null;
  private salesChart: Chart | null = null;

  protected readonly lowStockLimit = LOW_STOCK;

  /* ---------- Datos ---------- */
  protected products = signal<Product[]>([]);
  protected users = signal<UserItem[]>([]);
  protected sales = signal<SaleItem[]>([]);
  protected productsLoaded = signal(false);
  protected usersLoaded = signal(false);
  protected salesLoaded = signal(false);

  /* ---------- Saludo ---------- */
  protected firstName = computed(() => this.authService.user()?.fullName.split(' ')[0] ?? '');

  protected greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  })();

  /* ---------- Métricas de inventario ---------- */
  protected totalUnits = computed(() => this.products().reduce((acc, p) => acc + p.stock, 0));
  protected inventoryValue = computed(() =>
    this.products().reduce((acc, p) => acc + p.stock * p.price, 0),
  );
  protected lowStock = computed(() =>
    this.products()
      .filter((p) => p.stock <= LOW_STOCK)
      .sort((a, b) => a.stock - b.stock),
  );
  protected quickProducts = computed(() => this.products().slice(0, 6));

  /* ---------- Métricas de usuarios ---------- */
  protected userStats = computed(() => {
    const list = this.users();
    const admins = list.filter((u) => this.isAdminRole(u.role)).length;
    const total = list.length;
    return {
      total,
      admins,
      sellers: total - admins,
      adminPct: total ? (admins / total) * 100 : 0,
    };
  });
  protected recentUsers = computed(() => this.users().slice(-4).reverse());

  /* ---------- Métricas de ventas ---------- */
  protected salesTotal = computed(() => this.sales().reduce((acc, s) => acc + s.total, 0));
  protected recentSales = computed(() =>
    [...this.sales()]
      .sort((a, b) => Number(b.id) - Number(a.id))
      .slice(0, 5),
  );
  protected salesByDay = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days: { key: string; label: string; total: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push({
        key: this.dayKey(d),
        label: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`,
        total: 0,
      });
    }
    for (const s of this.sales()) {
      if (!s.date) continue;
      const day = days.find((d) => d.key === this.dayKey(s.date!));
      if (day) day.total += s.total;
    }
    return days;
  });

  constructor() {
    Chart.defaults.font.family = "'Poppins', sans-serif";
    Chart.defaults.color = '#5b6b86';

    effect(() => {
      const canvas = this.stockCanvas()?.nativeElement;
      const products = this.products();
      const loaded = this.productsLoaded();
      if (!canvas || !loaded) return;
      untracked(() => this.renderStock(canvas, products.slice(0, 8)));
    });

    effect(() => {
      const canvas = this.salesCanvas()?.nativeElement;
      const days = this.salesByDay();
      const loaded = this.salesLoaded();
      if (!canvas || !loaded) return;
      untracked(() => this.renderSales(canvas, days));
    });
  }

  ngOnInit(): void {
    this.http
      .get<Product[]>(API.products)
      .pipe(catchError(() => of([] as Product[])))
      .subscribe((items) => {
        this.products.set(items);
        this.productsLoaded.set(true);
      });

    if (this.authService.isAdmin()) {
      this.http
        .get<Raw[]>(API.users)
        .pipe(catchError(() => of([] as Raw[])))
        .subscribe((items) => {
          this.users.set(items.map(toUser));
          this.usersLoaded.set(true);
        });

      this.http
        .get<Raw[]>(API.sales)
        .pipe(catchError(() => of([] as Raw[])))
        .subscribe((items) => {
          this.sales.set(items.map(toSale));
          this.salesLoaded.set(true);
        });
    }
  }

  ngOnDestroy(): void {
    this.stockChart?.destroy();
    this.salesChart?.destroy();
  }

  /* ---------- Helpers de plantilla ---------- */
  protected isAdminRole(role: string): boolean {
    return /admin/i.test(role);
  }

  protected roleLabel(role: string): string {
    return this.isAdminRole(role) ? 'Admin' : 'Vendedor';
  }

  protected initials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('');
  }

  private dayKey(d: Date): string {
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }

  private get animation(): false | { duration: number; easing: 'easeOutQuart' } {
    const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    return reduce ? false : { duration: 1100, easing: 'easeOutQuart' };
  }

  /* ---------- Gráfico de inventario ---------- */
  private renderStock(canvas: HTMLCanvasElement, products: Product[]): void {
    this.stockChart?.destroy();

    this.stockChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: products.map((p) => p.name),
        datasets: [
          {
            label: 'Unidades en stock',
            data: products.map((p) => p.stock),
            borderRadius: 12,
            borderSkipped: false,
            maxBarThickness: 40,
            backgroundColor: (ctx) => {
              const area = ctx.chart.chartArea;
              const low = (products[ctx.dataIndex]?.stock ?? 99) <= LOW_STOCK;
              if (!area) return low ? '#f59e0b' : '#3b82f6';
              const g = ctx.chart.ctx.createLinearGradient(0, area.bottom, 0, area.top);
              if (low) {
                g.addColorStop(0, '#fde68a');
                g.addColorStop(1, '#f59e0b');
              } else {
                g.addColorStop(0, '#bfdbfe');
                g.addColorStop(1, '#1d4ed8');
              }
              return g;
            },
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: this.animation,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f1f3d',
            padding: 12,
            cornerRadius: 12,
            displayColors: false,
            titleFont: { weight: 600 },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              maxRotation: 0,
              callback(value) {
                const label = String(this.getLabelForValue(value as number));
                return label.length > 11 ? label.slice(0, 10) + '…' : label;
              },
            },
          },
          y: {
            beginAtZero: true,
            border: { display: false },
            grid: { color: 'rgba(15, 31, 61, 0.06)' },
            ticks: { precision: 0 },
          },
        },
      },
    });
  }

  /* ---------- Gráfico de ventas (últimos 7 días) ---------- */
  private renderSales(canvas: HTMLCanvasElement, days: { label: string; total: number }[]): void {
    this.salesChart?.destroy();

    this.salesChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: days.map((d) => d.label),
        datasets: [
          {
            label: 'Ventas (S/)',
            data: days.map((d) => d.total),
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            borderColor: '#1d4ed8',
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#1d4ed8',
            pointBorderWidth: 2,
            backgroundColor: (ctx) => {
              const area = ctx.chart.chartArea;
              if (!area) return 'rgba(59,130,246,.2)';
              const g = ctx.chart.ctx.createLinearGradient(0, area.top, 0, area.bottom);
              g.addColorStop(0, 'rgba(59,130,246,.40)');
              g.addColorStop(1, 'rgba(59,130,246,0)');
              return g;
            },
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: this.animation,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f1f3d',
            padding: 12,
            cornerRadius: 12,
            displayColors: false,
            callbacks: { label: (c) => `S/ ${Number(c.parsed.y).toFixed(2)}` },
          },
        },
        scales: {
          x: { grid: { display: false }, border: { display: false } },
          y: {
            beginAtZero: true,
            border: { display: false },
            grid: { color: 'rgba(15, 31, 61, 0.06)' },
          },
        },
      },
    });
  }
}