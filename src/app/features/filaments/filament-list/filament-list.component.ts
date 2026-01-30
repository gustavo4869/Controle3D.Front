import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilamentsService } from '@core/services/filaments.service';
import { Filament } from '@core/models/filament.model';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-filament-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="list-container">
      <header class="list-header">
        <div class="title-group">
          <h1>Filamentos</h1>
          <p>Gerencie seu estoque de rolos e materiais.</p>
        </div>
        <div class="header-actions">
          <div class="search-wrapper">
            <input 
              type="text" 
              [ngModel]="searchQuery()" 
              (ngModelChange)="searchQuery.set($event)"
              placeholder="Buscar material, cor ou marca..." 
              class="search-input"
            >
          </div>
          <a routerLink="/filaments/new" class="btn-primary">Novo Rolo</a>
        </div>
      </header>

      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <span>Carregando filamentos...</span>
      </div>

      <div *ngIf="error" class="error-banner">
        {{ error }}
      </div>

      <div class="table-responsive" *ngIf="!loading && !error">
        <table class="data-table">
          <thead>
            <tr>
              <th>Material / Cor</th>
              <th>Marca</th>
              <th class="numeric-head">Saldo (g)</th>
              <th class="numeric-head">Custo (/kg)</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let filament of filteredFilaments()">
              <td>
                <div class="filament-info">
                  <span class="filament-type">{{ filament.material }}</span>
                  <span class="filament-color">{{ filament.color }}</span>
                </div>
              </td>
              <td>{{ filament.brand }}</td>
              <td class="numeric">
                <span [class.text-danger]="filament.weightG <= 50">
                  {{ filament.weightG | number:'1.0-1' }}g
                </span>
              </td>
              <td class="numeric">{{ filament.costPerKg | currency:'BRL' }}</td>
              <td>
                <span [class]="'badge ' + (filament.isActive ? 'badge-success' : 'badge-danger')">
                  {{ filament.isActive ? 'Ativo' : 'Inativo' }}
                </span>
              </td>
              <td class="actions">
                <a [routerLink]="['/filaments', filament.id]" class="btn-icon" title="Ver Detalhes">
                  <span class="icon">👁</span>
                </a>
                <a [routerLink]="['/filaments/adjust', filament.id]" class="btn-icon" title="Editar">
                   <span class="icon">✎</span>
                </a>
              </td>
            </tr>
            <tr *ngIf="filteredFilaments().length === 0">
              <td colspan="6" class="empty-msg">Nenhum filamento encontrado.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .list-container { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
    .list-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; flex-wrap: wrap; gap: 1.5rem; }
    .title-group h1 { margin: 0; color: #2c3e50; font-size: 1.8rem; }
    .title-group p { margin: 0.25rem 0 0; color: #7f8c8d; }
    .header-actions { display: flex; gap: 1rem; align-items: center; }
    .search-input { padding: 0.75rem 1rem; border: 1px solid #dcdde1; border-radius: 8px; min-width: 300px; font-size: 0.9rem; }
    .btn-primary { background: #3498db; color: white; padding: 0.75rem 1.5rem; border-radius: 8px; text-decoration: none; font-weight: 600; white-space: nowrap; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { padding: 1.25rem 1rem; text-align: left; border-bottom: 1px solid #f1f2f6; }
    .data-table th { background: #f8f9fa; color: #95a5a6; font-weight: 600; font-size: 0.75rem; text-transform: uppercase; }
    .numeric-head, .numeric { text-align: right !important; }
    .numeric { font-weight: 600; color: #2c3e50; }
    .filament-type { display: block; font-weight: 600; color: #2c3e50; }
    .filament-color { font-size: 0.8rem; color: #95a5a6; }
    .badge { padding: 0.35rem 0.75rem; border-radius: 50px; font-size: 0.75rem; font-weight: 700; }
    .badge-success { background: #eafaf1; color: #2ecc71; }
    .badge-danger { background: #fdeaea; color: #e74c3c; }
    .text-danger { color: #e74c3c; }
    .btn-icon { background: #f8f9fa; border: none; cursor: pointer; width: 35px; height: 35px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; margin-right: 0.5rem; text-decoration: none; color: #7f8c8d; }
    .btn-icon:hover { background: #3498db; color: white; }
    .empty-msg { text-align: center; color: #bdc3c7; padding: 4rem 2rem; }
    .loading-state { display: flex; flex-direction: column; align-items: center; padding: 4rem; gap: 1rem; color: #7f8c8d; }
    .spinner { border: 3px solid #f3f3f3; border-top: 3px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .error-banner { background: #fee2e2; color: #dc2626; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; }
  `]
})
export class FilamentListComponent implements OnInit {
  private filamentsService = inject(FilamentsService);

  filaments = signal<Filament[]>([]);
  searchQuery = signal<string>('');
  loading = true;
  error: string | null = null;

  filteredFilaments = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.filaments();

    return this.filaments().filter(f =>
      f.material.toLowerCase().includes(query) ||
      f.color.toLowerCase().includes(query) ||
      f.brand.toLowerCase().includes(query)
    );
  });

  ngOnInit() {
    this.loadFilaments();
  }

  loadFilaments() {
    this.loading = true;
    this.error = null;
    this.filamentsService.getAll()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => this.filaments.set(data),
        error: () => this.error = 'Ocorreu um erro ao carregar os filamentos.'
      });
  }
}
