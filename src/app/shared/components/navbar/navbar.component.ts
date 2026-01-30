import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="navbar-brand">
        <a routerLink="/">3D PrintFlow ERP</a>
      </div>
      <div class="navbar-menu" *ngIf="authService.isAuthenticated()">
        <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
        <a routerLink="/customers" routerLinkActive="active">Clientes</a>
        <a routerLink="/machines" routerLinkActive="active">Máquinas</a>
        <a routerLink="/filaments" routerLinkActive="active">Filamentos</a>
        <a routerLink="/quotes" routerLinkActive="active">Orçamentos</a>
        <a routerLink="/orders" routerLinkActive="active">Pedidos</a>
        <a routerLink="/settings" routerLinkActive="active">Configurações</a>
        <button (click)="logout()" class="btn-logout">Sair</button>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background-color: #2c3e50;
      color: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .navbar-brand a {
      font-size: 1.5rem;
      font-weight: bold;
      color: #3498db;
      text-decoration: none;
    }
    .navbar-menu {
      display: flex;
      gap: 1.5rem;
      align-items: center;
    }
    .navbar-menu a {
      color: white;
      text-decoration: none;
      transition: color 0.3s;
    }
    .navbar-menu a.active {
      color: #3498db;
      border-bottom: 2px solid #3498db;
    }
    .btn-logout {
      background: none;
      border: 1px solid #e74c3c;
      color: #e74c3c;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;
    }
    .btn-logout:hover {
      background-color: #e74c3c;
      color: white;
    }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }
}
