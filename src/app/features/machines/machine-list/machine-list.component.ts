import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MachinesService } from '@core/services/machines.service';
import { Machine } from '@core/models/machine.model';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-machine-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="list-container">
      <header class="list-header">
        <div class="title-group">
          <h1>Máquinas</h1>
          <p>Gerencie o parque de impressoras e equipamentos.</p>
        </div>
        <div class="header-actions">
          <a routerLink="/machines/new" class="btn-primary">Nova Máquina</a>
        </div>
      </header>

      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <span>Carregando máquinas...</span>
      </div>

      <div *ngIf="error" class="error-banner">
        <span class="icon">⚠</span>
        {{ error }}
      </div>

      <div class="table-responsive" *ngIf="!loading && !error">
        <table class="data-table">
          <thead>
            <tr>
              <th>Máquina / Modelo</th>
              <th>Fabricante / S.N</th>
              <th class="numeric-head">Custo por Hora</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let machine of machines()">
              <td>
                <div class="machine-info">
                  <span class="machine-name">{{ machine.name }}</span>
                  <span class="machine-model">{{ machine.model }}</span>
                </div>
              </td>
              <td>
                <div class="machine-meta">
                  <span>{{ machine.manufacturer }}</span>
                  <small>{{ machine.serialNumber }}</small>
                </div>
              </td>
              <td class="numeric">{{ machine.costPerHour | currency:'BRL' }}</td>
              <td class="actions">
                <a [routerLink]="['/machines/edit', machine.id]" class="btn-icon" title="Editar">
                  <span class="icon">✎</span>
                </a>
                <button (click)="deleteMachine(machine)" class="btn-icon btn-delete" title="Excluir">
                  <span class="icon">🗑</span>
                </button>
              </td>
            </tr>
            <tr *ngIf="machines().length === 0">
              <td colspan="4" class="empty-msg">Nenhuma máquina cadastrada no sistema.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .list-container {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.05);
    }
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 2rem;
      gap: 1.5rem;
    }
    .title-group h1 { margin: 0; color: #2c3e50; font-size: 1.8rem; }
    .title-group p { margin: 0.25rem 0 0; color: #7f8c8d; }
    .btn-primary {
      background: #3498db;
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.2s;
    }
    .btn-primary:hover { background: #2980b9; transform: translateY(-1px); }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { padding: 1.25rem 1rem; text-align: left; border-bottom: 1px solid #f1f2f6; }
    .data-table th { background: #f8f9fa; color: #95a5a6; font-weight: 600; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; }
    .numeric-head { text-align: right !important; }
    .machine-name { display: block; font-weight: 600; color: #2c3e50; }
    .machine-model { font-size: 0.8rem; color: #95a5a6; }
    .machine-meta span { display: block; color: #34495e; font-weight: 500; font-size: 0.9rem; }
    .machine-meta small { color: #95a5a6; font-size: 0.75rem; }
    .numeric { text-align: right; font-weight: 600; color: #2c3e50; }
    .badge { padding: 0.35rem 0.75rem; border-radius: 50px; font-size: 0.75rem; font-weight: 700; }
    .badge-success { background: #eafaf1; color: #2ecc71; }
    .badge-danger { background: #fdeaea; color: #e74c3c; }
    .btn-icon {
      background: #f8f9fa;
      border: none;
      cursor: pointer;
      width: 35px;
      height: 35px;
      border-radius: 6px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-right: 0.5rem;
      text-decoration: none;
      color: #7f8c8d;
      transition: all 0.2s;
    }
    .btn-icon:hover { background: #3498db; color: white; }
    .btn-delete:hover { background: #e74c3c; color: white; }
    .empty-msg { text-align: center; color: #bdc3c7; padding: 4rem 2rem; }
    .loading-state { display: flex; flex-direction: column; align-items: center; padding: 4rem; gap: 1rem; color: #7f8c8d; }
    .spinner { border: 3px solid #f3f3f3; border-top: 3px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .error-banner { background: #fee2e2; color: #dc2626; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; }
  `]
})
export class MachineListComponent implements OnInit {
  private machinesService = inject(MachinesService);

  machines = signal<Machine[]>([]);
  loading = true;
  error: string | null = null;

  ngOnInit() {
    this.loadMachines();
  }

  loadMachines() {
    this.loading = true;
    this.error = null;
    this.machinesService.getAll()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => this.machines.set(data),
        error: () => this.error = 'Ocorreu um erro ao carregar as máquinas. Tente novamente mais tarde.'
      });
  }

  deleteMachine(machine: Machine) {
    if (confirm(`Deseja realmente excluir a máquina "${machine.name}"?`)) {
      this.machinesService.inactivate(machine.id).subscribe({
        next: () => {
          this.machines.update(list => list.filter(m => m.id !== machine.id));
        },
        error: () => alert('Erro ao excluir máquina. Verifique sua conexão.')
      });
    }
  }
}
