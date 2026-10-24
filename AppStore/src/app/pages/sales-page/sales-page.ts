import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductCardComponent } from '../../components/product-card/product-card';
import { getSkuPrefix, PRODUCT_CATEGORIES } from '../../constants/product-categories';
import { GetProductResponse } from '../../interfaces/product-dtos';
import { CartService } from '../../services/cart-service';
import { ProductService } from '../../services/product-service';

@Component({
  imports: [MatIconModule, MatListModule, ProductCardComponent],
  selector: 'app-sales-page',
  styleUrl: './sales-page.scss',
  templateUrl: './sales-page.html',
})
export class SalesPage implements OnInit {

  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private snackBar = inject(MatSnackBar);

  protected categories = PRODUCT_CATEGORIES;
  protected products = signal<GetProductResponse[]>([]);
  protected categorySelected = signal<string>('ALL');

  // Se carga todo una vez y el filtro se hace en el front, sin llamar a la API al cambiar de categoría
  protected filteredProducts = computed(() => {
    const selected = this.categorySelected();
    if (selected === 'ALL') return this.products();

    return this.products().filter(p => getSkuPrefix(p.sku) === selected);
  });

  ngOnInit(): void {
    this.productService.getAll().subscribe({
      next: (data) => this.products.set(data),
      error: (e) => {
        console.log(e.error);
        this.products.set([]);
      },
    });
  }

  protected onAddToCart(product: GetProductResponse): void {
    const added = this.cartService.addToCart({
      productId: product.productId,
      name: product.name,
      price: product.price,
      image: product.imageUrl,
      stock: product.stock,
    });

    this.snackBar.open(
      added ? '¡Agregado al carrito!' : 'No hay más stock disponible',
      'ok',
      { horizontalPosition: 'center', verticalPosition: 'top', duration: 1500 }
    );
  }
}
