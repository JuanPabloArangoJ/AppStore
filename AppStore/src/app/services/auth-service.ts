import { computed, Injectable, signal } from '@angular/core';
import { GetUserResponse } from '../interfaces/user-dtos';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private readonly key = 'appstore_user';

  private _user = signal<GetUserResponse | null>(this.read());

  readonly user = this._user.asReadonly();
  readonly token = computed(() => this._user()?.token ?? null);
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly isAdmin = computed(() => this._user()?.type === 'Admin');

  login(user: GetUserResponse, remember: boolean): void {
    this.clearStorage();
    (remember ? localStorage : sessionStorage).setItem(this.key, JSON.stringify(user));
    this._user.set(user);
  }

  updateCurrentUser(updated: Partial<GetUserResponse>): void {
    const current = this._user();
    if (!current) return;

    const merged: GetUserResponse = { ...current, ...updated };
    const useLocal = localStorage.getItem(this.key) !== null;
    (useLocal ? localStorage : sessionStorage).setItem(this.key, JSON.stringify(merged));
    this._user.set(merged);
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