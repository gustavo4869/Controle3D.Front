import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '@shared/components/navbar/navbar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <div class="layout-wrapper">
      <app-navbar></app-navbar>
      <main class="content">
        <router-outlet></router-outlet>
      </main>
      <footer class="footer">
        <p>&copy; 2026 Controle 3D - PrintFlow ERP. Todos os direitos reservados.</p>
      </footer>
    </div>
  `,
  styles: [`
    .layout-wrapper {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .content {
      flex: 1;
      padding: 2rem;
      background-color: #f4f7f6;
    }
    .footer {
      text-align: center;
      padding: 1rem;
      background-color: #2c3e50;
      color: #bdc3c7;
      font-size: 0.8rem;
    }
  `]
})
export class MainLayoutComponent { }
