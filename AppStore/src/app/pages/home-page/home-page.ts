import { Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import '@google/model-viewer';
import { ThemeToggle } from '../../components/theme-toggle/theme-toggle';
import { AuthService } from '../../services/auth-service';

interface Showcase {
  name: string;
  file: string;
}

@Component({
  selector: 'app-home-page',
  imports: [MatButtonModule, MatIconModule, RouterLink, ThemeToggle],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],   // permite usar <model-viewer>
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {

  protected authService = inject(AuthService);

  // Ajusta nombres y archivos a tus 4 modelos
  protected models: Showcase[] = [
  { name: 'Monitores', file: '/models/monitor.glb' },
  { name: 'Mouses',    file: '/models/mouse/scene.gltf' },
  { name: 'Headsets',  file: '/models/headphone.glb' },
  { name: 'Laptops',  file: '/models/Laptop/scene.gltf' },
];

  protected index = signal(0);
  protected current = computed(() => this.models[this.index()]);

  protected firstName = computed(
    () => this.authService.user()?.fullName.split(' ')[0] ?? ''
  );

  protected greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  })();

  protected next(): void {
    this.index.update((i) => (i + 1) % this.models.length);
  }

  protected prev(): void {
    this.index.update((i) => (i - 1 + this.models.length) % this.models.length);
  }
}