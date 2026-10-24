import { DecimalPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { CreateSaleRequest } from '../../interfaces/sale-dtos';
import { AuthService } from '../../services/auth-service';
import { CartService } from '../../services/cart-service';
import { SaleService } from '../../services/sale-service';

// TEMPORAL: reemplazar por el id del usuario logueado cuando exista el login

@Component({
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatDividerModule, RouterLink, DecimalPipe],
  selector: 'app-cart-page',
  styleUrl: './cart-page.scss',
  templateUrl: './cart-page.html',
})
export class CartPage {

  protected cartService = inject(CartService);
  private saleService = inject(SaleService);
  private authService = inject(AuthService);
  private router = inject(Router);

  protected total = computed(() => this.cartService.totalAmount());
  protected subtotal = computed(() => this.total() / 1.19);
  protected taxes = computed(() => this.total() - this.subtotal());

  protected increaseQuantity(productId: number): void {
    this.cartService.increaseQuantity(productId);
  }

  protected decreaseQuantity(productId: number): void {
    this.cartService.decreaseQuantity(productId);
  }

  protected removeItem(productId: number): void {
    this.cartService.removeItem(productId);
  }

  protected finishPurchase(): void {
  const user = this.authService.user();

  if (!user) {
    this.router.navigate(['/login']);
    return;
  }

  const request: CreateSaleRequest = {
    userId: user.userId,
    totalAmount: this.total(),
    saleDetails: this.cartService.items().map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      subTotal: item.price * item.quantity,
    })),
  };

    this.saleService.create(request).subscribe({
      next: () => {
        Swal.fire({
          title: '¡Compra realizada!',
          text: 'La venta se registró correctamente.',
          icon: 'success',
          theme: 'dark',
        });
        this.cartService.clear();
      },
      error: (e) =>
        Swal.fire({
          title: 'Error',
          text: e.error?.message ?? 'Unexpected error',
          icon: 'error',
          theme: 'dark',
        }),
    });
  }
}