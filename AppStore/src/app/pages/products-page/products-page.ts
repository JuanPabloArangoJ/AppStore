import { CurrencyPipe } from '@angular/common';
import { Component, effect, inject, OnInit, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import Swal from 'sweetalert2';
import { ProductAddEdit } from '../../components/product-add-edit/product-add-edit';
import { GetProductResponse } from '../../interfaces/product-dtos';
import { ProductService } from '../../services/product-service';

@Component({
  imports: [CurrencyPipe,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,],
  selector: 'app-products-page',
  styleUrl: './products-page.scss',
  templateUrl: './products-page.html',
})
export class ProductsPage implements OnInit {

  private productService = inject(ProductService);
  private dialog = inject(MatDialog);

  protected displayedColumns: string[] = ['image', 'sku', 'name', 'price', 'stock', 'actions'];
  protected dataSource = new MatTableDataSource<GetProductResponse>([]);
  protected paginator = viewChild(MatPaginator);
  protected sort = viewChild(MatSort);
  protected products = signal<GetProductResponse[]>([]);

  // Por debajo de este stock, el número se muestra en rojo
  protected lowStockLimit = 5;

  constructor() {
    // El filtro solo busca en SKU y nombre
    this.dataSource.filterPredicate = (product, filter) =>
      `${product.sku} ${product.name}`.toLowerCase().includes(filter);

    effect(() => {
      this.dataSource.data = this.products();

      const paginator = this.paginator();
      const sort = this.sort();

      if (paginator) this.dataSource.paginator = paginator;
      if (sort) this.dataSource.sort = sort;
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.productService.getAll().subscribe({
      next: (data) => this.products.set(data),
      error: (e) => {
        console.log(e.error);
        this.products.set([]);
      },
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openCreateModal(): void {
  const dialogRef = this.dialog.open(ProductAddEdit, {
    width: '450px',
    height: 'auto',
    disableClose: true,
  });

  dialogRef.afterClosed().subscribe((result) => {
    if (result) this.loadProducts();
  });
}

  openEditModal(productId: number): void {
  const dialogRef = this.dialog.open(ProductAddEdit, {
    width: '450px',
    height: 'auto',
    disableClose: true,
    data: { productId },
  });

  dialogRef.afterClosed().subscribe((result) => {
    if (result) this.loadProducts();
  });
}

  deleteProduct(productId: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      theme: 'dark',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.productService.delete(productId).subscribe({
        next: () => {
          this.loadProducts();
          Swal.fire({
            title: 'Deleted!',
            text: 'Product has been deleted.',
            icon: 'success',
            theme: 'dark',
          });
        },
        error: (e) =>
          Swal.fire({
            title: 'Error',
            text: e.error?.message ?? 'Unexpected error',
            icon: 'error',
            theme: 'dark',
          }),
      });
    });
  }
}
