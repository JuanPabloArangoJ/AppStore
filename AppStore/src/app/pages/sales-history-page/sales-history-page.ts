import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import Swal from 'sweetalert2';
import { GetSaleDetailResponse, GetSaleResponse } from '../../interfaces/sale-dtos';
import { SaleService } from '../../services/sale-service';

@Component({
  selector: 'app-sales-history-page',
  imports: [
    DecimalPipe,
    MatButtonModule,
    MatDatepickerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'es-CO' }, // formato dd/mm/aaaa
  ],
  templateUrl: './sales-history-page.html',
  styleUrl: './sales-history-page.scss',
})
export class SalesHistoryPage implements OnInit {

  private saleService = inject(SaleService);

  protected sales = signal<GetSaleResponse[]>([]);
  // Detalles ya cargados, por id de venta (GetAll no los trae)
  protected details = signal<Record<number, GetSaleDetailResponse[]>>({});

  protected startDate = signal<Date | null>(null);
  protected endDate = signal<Date | null>(null);
  protected keyword = signal('');

  protected pageIndex = signal(0);
  protected pageSize = signal(5);

  protected filteredSales = computed(() => {
    const k = this.keyword().trim().toLowerCase();
    if (!k) return this.sales();

    return this.sales().filter((s) =>
      `${s.saleId} ${s.userName} ${s.saleDate}`.toLowerCase().includes(k)
    );
  });

  protected pagedSales = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filteredSales().slice(start, start + this.pageSize());
  });

  ngOnInit(): void {
    this.search();
  }

  protected search(): void {
    const start = this.startDate();
    const end = this.endDate();

    if (start && end && start > end) {
      Swal.fire({
        title: 'Fechas inválidas',
        text: 'La fecha inicial no puede ser mayor que la final.',
        icon: 'warning',
        theme: 'dark',
      });
      return;
    }

    this.saleService.getAll(start, end).subscribe({
      next: (data) => {
        this.sales.set(data);
        this.details.set({});
        this.pageIndex.set(0);
      },
      error: (e) => {
        this.sales.set([]);
        this.showError(e);
      },
    });
  }

  // Se llama al abrir un panel; el detalle se pide una sola vez por venta
  protected loadDetail(saleId: number): void {
    if (this.details()[saleId]) return;

    this.saleService.getById(saleId).subscribe({
      next: (sale) =>
        this.details.update((d) => ({ ...d, [saleId]: sale.saleDetail ?? [] })),
      error: (e) => this.showError(e),
    });
  }

  protected onKeyword(event: Event): void {
    this.keyword.set((event.target as HTMLInputElement).value);
    this.pageIndex.set(0);
  }

  protected onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  private showError(e: any): void {
    Swal.fire({
      title: 'Error',
      text: e.error?.message ?? 'Unexpected error',
      icon: 'error',
      theme: 'dark',
    });
  }
}