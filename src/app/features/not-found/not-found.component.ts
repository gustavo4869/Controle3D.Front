import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-not-found',
    standalone: true,
    imports: [RouterLink],
    template: `
    <div class="not-found">
      <h1>404</h1>
      <h2>Página não encontrada</h2>
      <p>O caminho que você está tentando acessar não existe.</p>
      <a routerLink="/" class="btn-home">Voltar ao Início</a>
    </div>
  `,
    styles: [`
    .not-found {
      text-align: center;
      padding: 5rem 2rem;
    }
    h1 { font-size: 6rem; margin: 0; color: #e74c3c; }
    h2 { font-size: 2rem; color: #2c3e50; }
    p { color: #7f8c8d; margin-bottom: 2rem; }
    .btn-home {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      background-color: #3498db;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      transition: background 0.3s;
    }
    .btn-home:hover { background-color: #2980b9; }
  `]
})
export class NotFoundComponent { }
