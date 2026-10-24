import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './guards/auth-guard';
import { LayoutComponent } from './layout/layout.component';
import { CartPage } from './pages/cart-page/cart-page';
import { HomePage } from './pages/home-page/home-page';
import { LoginPage } from './pages/login-page/login-page';
import { ProductsPage } from './pages/products-page/products-page';
import { SalesHistoryPage } from './pages/sales-history-page/sales-history-page';
import { SalesPage } from './pages/sales-page/sales-page';
import { UsersPage } from './pages/users-page/users-page';

export const routes: Routes = [
  { path: 'login', component: LoginPage, title: 'Login' },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard], 
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      // Admin y SalesPerson
      { path: 'home', component: HomePage, title: 'Home' },
      { path: 'sales', component: SalesPage, title: 'Sales' },
      { path: 'cart', component: CartPage, title: 'Cart' },

      // Solo Admin
      {
        path: '',
        canActivate: [adminGuard],
        children: [
          { path: 'users', component: UsersPage, title: 'Users' },
          { path: 'products', component: ProductsPage, title: 'Products' },
          { path: 'sales-history', component: SalesHistoryPage, title: 'Sales History' },
        ],
      },
    ],
  },
  { path: '**', redirectTo: 'home' },

];
