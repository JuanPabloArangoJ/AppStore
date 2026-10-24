import { Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme-service';

@Component({
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.html',
  styleUrl: './theme-toggle.scss',
})
export class ThemeToggle {

  protected theme = inject(ThemeService);

  protected birds = [1, 2, 3];
  protected clouds = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    light: '/images/cloud.png',
    dark: '/images/cloud2.png'
  }));



  // Posiciones aleatorias de las estrellas del interruptor
  protected stars = Array.from({ length: 14 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
  }));
}