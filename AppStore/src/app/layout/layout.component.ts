import { Component, inject } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { CartService } from '../services/cart-service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  imports: [MatToolbarModule, MatButtonModule, RouterLink, RouterLinkActive, RouterOutlet, MatBadgeModule, MatIconModule],
})
export class LayoutComponent {

  protected cartService = inject(CartService);
  protected authService = inject(AuthService);
  private router = inject(Router);

  protected logout(): void {
    this.authService.logout();
    this.cartService.clear();   // el siguiente usuario no hereda el carrito
    this.router.navigate(['/login']);
  }
}
