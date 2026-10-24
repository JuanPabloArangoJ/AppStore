import { effect, Service, signal } from '@angular/core';

@Service()
export class ThemeService {

  private readonly key = 'appstore_theme';

  private _dark = signal(this.read());
  readonly isDark = this._dark.asReadonly();

  constructor() {
    effect(() => {
      const dark = this._dark();
      const root = document.documentElement;

      root.style.colorScheme = dark ? 'dark' : 'light';
      root.classList.toggle('dark', dark);

      try {
        localStorage.setItem(this.key, dark ? 'dark' : 'light');
      } catch { /* sin almacenamiento disponible */ }
    });
  }

  toggle(): void {
    this._dark.update((v) => !v);
  }

  private read(): boolean {
    try {
      const saved = localStorage.getItem(this.key);
      if (saved) return saved === 'dark';
    } catch { /* ignorar */ }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}