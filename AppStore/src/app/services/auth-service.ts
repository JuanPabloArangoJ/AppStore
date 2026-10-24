import { computed, Service, signal } from '@angular/core';
import { GetUserResponse } from '../interfaces/user-dtos';

@Service()
export class AuthService {

  private readonly key = 'appstore_user';

  private _user = signal<GetUserResponse | null>(this.read());

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly isAdmin = computed(() => this._user()?.type === 'Admin');

  // "Remember me" activo: localStorage (sobrevive al cerrar el navegador).
  // Inactivo: sessionStorage (se pierde al cerrar la pestaña).
  login(user: GetUserResponse, remember: boolean): void {
    this.clearStorage();
    (remember ? localStorage : sessionStorage).setItem(this.key, JSON.stringify(user));
    this._user.set(user);
  }

  logout(): void {
    this.clearStorage();
    this._user.set(null);
  }

  private clearStorage(): void {
    localStorage.removeItem(this.key);
    sessionStorage.removeItem(this.key);
  }

  private read(): GetUserResponse | null {
    try {
      const raw = localStorage.getItem(this.key) ?? sessionStorage.getItem(this.key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}