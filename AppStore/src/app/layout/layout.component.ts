import { Component, inject } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UserAddEdit } from '../components/user-add-edit/user-add-edit';
import { AuthService } from '../services/auth-service';
import { CartService } from '../services/cart-service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatBadgeModule,
    MatIconModule,
  ],
})
export class LayoutComponent {
  protected cartService = inject(CartService);
  protected authService = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  protected editProfile(): void {
    const userId = this.authService.user()?.userId;
    if (!userId) return;

    this.dialog.open(UserAddEdit, {
      width: '450px',
      height: 'auto',
      disableClose: true,
      data: { userId, isProfileMode: true },
    });
  }

  protected logout(): void {
    this.authService.logout();
    this.cartService.clear();
    this.router.navigate(['/login']);
  }
}