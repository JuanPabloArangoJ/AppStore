import { computed, Service, signal } from '@angular/core';
import { CartItem } from '../interfaces/product-dtos';

@Service()
export class CartService {

  private _items = signal<CartItem[]>([]);

  readonly items = this._items.asReadonly();
  readonly totalItems = computed(() =>
    this._items().reduce((sum, i) => sum + i.quantity, 0));
  readonly totalAmount = computed(() =>
    this._items().reduce((sum, i) => sum + i.price * i.quantity, 0));

  increaseQuantity(productId: number): void {
  this._items.update(items =>
    items.map(i =>
      i.productId === productId && i.quantity < i.stock
        ? { ...i, quantity: i.quantity + 1 }
        : i));
}

decreaseQuantity(productId: number): void {
  this._items.update(items =>
    items.map(i =>
      i.productId === productId && i.quantity > 1
        ? { ...i, quantity: i.quantity - 1 }
        : i));
}

removeItem(productId: number): void {
  this._items.update(items => items.filter(i => i.productId !== productId));
}

  // Devuelve false si no se pudo agregar (sin stock o ya está el máximo en el carrito)
  addToCart(item: Omit<CartItem, 'quantity'>): boolean {
    const current = this._items();
    const existing = current.find(i => i.productId === item.productId);

    if (existing) {
      if (existing.quantity >= existing.stock) return false;

      this._items.set(current.map(i =>
        i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i));
      return true;
    }

    if (item.stock < 1) return false;

    this._items.set([...current, { ...item, quantity: 1 }]);
    return true;
  }

  clear(): void {
    this._items.set([]);
  }
}