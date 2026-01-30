import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FilamentsService } from '@core/services/filaments.service';
import { Filament } from '@core/models/filament.model';
import { FilamentMovement } from '@core/models/movement.model';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-filament-detail',
    standalone: true,
    imports: [CommonModule, RouterLink, ReactiveFormsModule],
    template: `
    <div class="detail-container">
      <header class="detail-header">
        <div class="header-left">
          <a routerLink="/filaments" class="btn-back">← Voltar</a>
          <div class="title-meta">
            <h1>{{ filament()?.material }} - {{ filament()?.color }}</h1>
            <span class="brand-badge">{{ filament()?.brand }}</span>
          </div>
        </div>
        <div class="header-actions">
           <button (click)="openAdjustment()" class="btn-secondary">Ajustar Peso (Saldo)</button>
           <a [routerLink]="['/filaments/adjust', filament()?.id]" class="btn-primary">Editar Rolo</a>
        </div>
      </header>

      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <span>Carregando detalhes...</span>
      </div>

      <div class="detail-grid" *ngIf="!loading && filament()">
        <!-- Summary Cards -->
        <div class="info-card balance-card">
          <label>Saldo Atual</label>
          <div class="value">{{ filament()?.weightG | number:'1.0-1' }}g</div>
          <div class="status-indicator" [class.low]="(filament()?.weightG || 0) < 100">
            {{ (filament()?.weightG || 0) < 100 ? 'Estoque Baixo' : 'Em estoque' }}
          </div>
        </div>

        <div class="info-card">
          <label>Custo Estimado</label>
          <div class="value">{{ filament()?.costPerKg | currency:'BRL' }} <small>/kg</small></div>
          <p class="description">Valor do saldo: {{ (((filament()?.weightG || 0) / 1000) * (filament()?.costPerKg || 0)) | currency:'BRL' }}</p>
        </div>

        <div class="info-card notes-card">
          <label>Observações</label>
          <p>{{ filament()?.notes || 'Nenhuma observação cadastrada.' }}</p>
        </div>

        <!-- History Section -->
        <div class="history-section">
          <h2>Histórico de Movimentações</h2>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th class="numeric-head">Qtd (g)</th>
                  <th>Motivo / Origem</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let m of movements()">
                  <td>{{ m.createdAt | date:'short' }}</td>
                  <td>
                    <span [class]="'type-badge ' + m.type.toLowerCase()">{{ m.type }}</span>
                  </td>
                  <td class="numeric" [class.positive]="m.quantityG > 0" [class.negative]="m.quantityG < 0">
                    {{ m.quantityG > 0 ? '+' : '' }}{{ m.quantityG | number:'1.0-1' }}g
                  </td>
                  <td>{{ m.reason }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Adjustment Modal -->
      <div class="modal-overlay" *ngIf="showAdjustModal">
        <div class="modal-content">
          <header>
            <h3>Ajustar Peso do Rolo</h3>
            <button (click)="showAdjustModal = false" class="btn-close">×</button>
          </header>
          <form [formGroup]="adjustForm" (ngSubmit)="confirmAdjustment()">
            <div class="form-group">
              <label>Saldo Atual: <strong>{{ filament()?.weightG }}g</strong></label>
              <label for="newWeightG">Novo Peso (g):</label>
              <input id="newWeightG" type="number" formControlName="newWeightG" class="form-control" placeholder="Peso real pesado na balança">
            </div>
            <div class="form-group">
              <label for="reason">Motivo do Ajuste:</label>
              <select id="reason" formControlName="reason" class="form-control">
                <option value="Correção de pesagem">Correção de pesagem</option>
                <option value="Perda / Descarte">Perda / Descarte</option>
                <option value="Ajuste manual">Ajuste manual</option>
                <option value="Outro">Outro...</option>
              </select>
            </div>
            <div class="modal-actions">
              <button type="button" (click)="showAdjustModal = false" class="btn-text">Cancelar</button>
              <button type="submit" class="btn-primary" [disabled]="adjustForm.invalid || savingAdjust">
                {{ savingAdjust ? 'Salvando...' : 'Confirmar Ajuste' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .detail-container { max-width: 1000px; margin: 0 auto; }
    .detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .header-left { display: flex; align-items: center; gap: 1.5rem; }
    .btn-back { text-decoration: none; color: #7f8c8d; font-weight: 600; }
    .title-meta h1 { margin: 0; font-size: 1.8rem; color: #2c3e50; }
    .brand-badge { background: #ebf5fb; color: #2e86c1; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.85rem; font-weight: 600; }
    .header-actions { display: flex; gap: 1rem; }
    
    .detail-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
    .history-section { grid-column: span 3; background: white; padding: 2rem; border-radius: 12px; margin-top: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.03); }
    .info-card { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.03); border: 1px solid #f1f2f6; }
    .info-card label { display: block; color: #95a5a6; font-size: 0.75rem; text-transform: uppercase; font-weight: 700; margin-bottom: 0.5rem; }
    .info-card .value { font-size: 1.5rem; font-weight: 800; color: #2c3e50; }
    .status-indicator { display: inline-block; margin-top: 0.5rem; font-size: 0.75rem; color: #27ae60; font-weight: 700; }
    .status-indicator.low { color: #e67e22; }

    .data-table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    .data-table th, .data-table td { padding: 1rem; border-bottom: 1px solid #f1f2f6; text-align: left; }
    .numeric-head { text-align: right; }
    .numeric { text-align: right; font-weight: 600; }
    .positive { color: #27ae60; }
    .negative { color: #e74c3c; }
    .type-badge { padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
    .type-badge.consumption { background: #fef5f5; color: #e74c3c; }
    .type-badge.entry { background: #f4fdf9; color: #2ecc71; }
    .type-badge.adjustment { background: #fef9f3; color: #f39c12; }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; width: 400px; padding: 2rem; border-radius: 12px; box-shadow: 0 20px 25px rgba(0,0,0,0.1); }
    .modal-content header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .btn-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #95a5a6; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
    .btn-primary { background: #3498db; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .btn-secondary { background: white; color: #3498db; border: 1px solid #3498db; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .btn-text { background: none; border: none; color: #7f8c8d; cursor: pointer; font-weight: 600; }
    .form-group { margin-bottom: 1.2rem; }
    .form-control { width: 100%; padding: 0.7rem; border: 1px solid #dcdde1; border-radius: 8px; }
  `]
})
export class FilamentDetailComponent implements OnInit {
    private filamentsService = inject(FilamentsService);
    private route = inject(ActivatedRoute);
    private fb = inject(FormBuilder);

    filament = signal<Filament | null>(null);
    movements = signal<FilamentMovement[]>([]);
    loading = true;

    showAdjustModal = false;
    savingAdjust = false;
    adjustForm: FormGroup = this.fb.group({
        newWeightG: [0, [Validators.required, Validators.min(0)]],
        reason: ['Correção de pesagem', Validators.required]
    });

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadData(id);
        }
    }

    loadData(id: string) {
        this.loading = true;
        this.filamentsService.getById(id).subscribe(f => {
            this.filament.set(f);
            this.adjustForm.patchValue({ newWeightG: f.weightG });
            this.loading = false;
        });

        this.filamentsService.getMovements(id).subscribe(m => {
            this.movements.set(m);
        });
    }

    openAdjustment() {
        if (this.filament()) {
            this.adjustForm.patchValue({ newWeightG: this.filament()!.weightG });
            this.showAdjustModal = true;
        }
    }

    confirmAdjustment() {
        if (this.adjustForm.invalid || !this.filament()) return;

        this.savingAdjust = true;
        this.filamentsService.adjustWeight(this.filament()!.id, this.adjustForm.getRawValue())
            .pipe(finalize(() => this.savingAdjust = false))
            .subscribe({
                next: (updatedFilament) => {
                    this.filament.set(updatedFilament);
                    this.showAdjustModal = false;
                    // Refresh movements list to see the adjustment entry
                    this.filamentsService.getMovements(this.filament()!.id).subscribe(m => this.movements.set(m));
                },
                error: () => alert('Erro ao processar ajuste. Tente novamente.')
            });
    }
}
