import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="home-container">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .home-container {
      width: 100%;
      height: 100vh;
    }
  `]
})
export class HomeComponent {}
