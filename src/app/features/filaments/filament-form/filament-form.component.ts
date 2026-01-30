import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FilamentsService } from '@core/services/filaments.service';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-filament-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    template: `
    <div class="form-container">
      <header class="form-header">
        <div class="title-group">
          <h1>{{ isEditMode ? 'Editar Rolo' : 'Novo Rolo de Filamento' }}</h1>
          <p>{{ isEditMode ? 'Atualize as informações do material.' : 'Cadastre um novo rolo no seu estoque.' }}</p>
        </div>
      </header>

      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <span>Carregando dados...</span>
      </div>

      <div *ngIf="error" class="error-banner">
        <span class="icon">⚠</span>
        {{ error }}
      </div>

      <form [formGroup]="filamentForm" (ngSubmit)="saveFilament()" *ngIf="!loading">
        <div class="form-grid">
          <div class="form-group">
            <label for="material">Material (Tipo)</label>
            <select id="material" formControlName="material" class="form-control">
              <option value="">Selecione...</option>
              <option value="PLA">PLA</option>
              <option value="ABS">ABS</option>
              <option value="PETG">PETG</option>
              <option value="TPU">TPU (Flex)</option>
              <option value="Nylon">Nylon</option>
            </select>
            <small *ngIf="filamentForm.get('material')?.invalid && filamentForm.get('material')?.touched" class="error-text">
              O tipo de material é obrigatório.
            </small>
          </div>

          <div class="form-group">
            <label for="color">Cor</label>
            <input id="color" type="text" formControlName="color" class="form-control" placeholder="Ex: Vermelho, Preto">
            <small *ngIf="filamentForm.get('color')?.invalid && filamentForm.get('color')?.touched" class="error-text">
              A cor é obrigatória.
            </small>
          </div>

          <div class="form-group">
            <label for="brand">Marca / Fabricante</label>
            <input id="brand" type="text" formControlName="brand" class="form-control" placeholder="Ex: 3D Lab, Esun">
            <small *ngIf="filamentForm.get('brand')?.invalid && filamentForm.get('brand')?.touched" class="error-text">
              A marca é obrigatória.
            </small>
          </div>

          <div class="form-group">
            <label for="costPerKg">Custo por Kg (BRL)</label>
            <div class="input-with-symbol">
              <span class="symbol">R$</span>
              <input id="costPerKg" type="number" step="0.01" formControlName="costPerKg" class="form-control with-symbol" placeholder="0,00">
            </div>
            <small *ngIf="filamentForm.get('costPerKg')?.invalid && filamentForm.get('costPerKg')?.touched" class="error-text">
              O custo por kg é obrigatório.
            </small>
          </div>

          <div class="form-group" *ngIf="!isEditMode">
            <label for="weightG">Peso Inicial / Saldo (g)</label>
            <input id="weightG" type="number" formControlName="weightG" class="form-control" placeholder="Ex: 1000">
            <small class="help-text">Peso líquido de filamento no rolo.</small>
          </div>

          <div class="form-group full-width">
            <label for="notes">Observações</label>
            <textarea id="notes" formControlName="notes" class="form-control" rows="3" placeholder="Lote, fornecedor, temperatura ideal..."></textarea>
          </div>
        </div>

        <div class="form-actions">
          <a routerLink="/filaments" class="btn-secondary">Cancelar</a>
          <button type="submit" class="btn-primary" [disabled]="filamentForm.invalid || saving">
            {{ saving ? 'Salvando...' : (isEditMode ? 'Atualizar Rolo' : 'Cadastrar Rolo') }}
          </button>
        </div>
      </form>
    </div>
  `,
    styles: [`
    .form-container { max-width: 800px; margin: 0 auto; background: white; padding: 2.5rem; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
    .form-header { margin-bottom: 2.5rem; border-bottom: 1px solid #f1f2f6; padding-bottom: 1rem; }
    .form-header h1 { margin: 0; color: #2c3e50; font-size: 1.8rem; }
    .form-header p { margin: 0.5rem 0 0; color: #7f8c8d; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .full-width { grid-column: span 2; }
    .form-group { margin-bottom: 1rem; }
    label { display: block; margin-bottom: 0.4rem; font-weight: 600; color: #34495e; font-size: 0.9rem; }
    .form-control { width: 100%; padding: 0.75rem 1rem; border: 1px solid #dcdde1; border-radius: 8px; font-size: 0.95rem; }
    .input-with-symbol { position: relative; display: flex; align-items: center; }
    .symbol { position: absolute; left: 1rem; color: #7f8c8d; font-weight: 600; }
    .with-symbol { padding-left: 3rem; }
    .form-actions { margin-top: 2rem; display: flex; justify-content: flex-end; gap: 1rem; padding-top: 1.5rem; border-top: 1px solid #f1f2f6; }
    .btn-primary { background: #3498db; color: white; border: none; padding: 0.8rem 2rem; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .btn-secondary { background: #f8f9fa; color: #7f8c8d; border: 1px solid #dcdde1; padding: 0.8rem 2rem; border-radius: 8px; font-weight: 600; text-decoration: none; }
    .error-text { color: #e74c3c; font-size: 0.8rem; margin-top: 0.4rem; display: block; }
    .help-text { color: #7f8c8d; font-size: 0.75rem; margin-top: 0.25rem; display: block; }
    .error-banner { background: #fee2e2; color: #dc2626; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; }
    .loading-state { display: flex; flex-direction: column; align-items: center; padding: 4rem; gap: 1rem; color: #7f8c8d; }
    .spinner { border: 3px solid #f3f3f3; border-top: 3px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  `]
})
export class FilamentFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private filamentsService = inject(FilamentsService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    filamentForm: FormGroup = this.fb.group({
        material: ['', Validators.required],
        color: ['', [Validators.required, Validators.maxLength(100)]],
        brand: ['', [Validators.required, Validators.maxLength(100)]],
        costPerKg: [0, [Validators.required, Validators.min(0)]],
        weightG: [1000, [Validators.required, Validators.min(0)]],
        notes: ['', Validators.maxLength(1000)],
        isActive: [true]
    });

    isEditMode = false;
    filamentId: string | null = null;
    loading = false;
    saving = false;
    error: string | null = null;

    ngOnInit() {
        this.filamentId = this.route.snapshot.paramMap.get('id');
        if (this.filamentId) {
            this.isEditMode = true;
            this.loadFilament();
            // WeightG should not be edited directly in Edit mode (use movements/adjust)
            this.filamentForm.get('weightG')?.disable();
        }
    }

    loadFilament() {
        this.loading = true;
        this.error = null;
        this.filamentsService.getById(this.filamentId!)
            .pipe(finalize(() => this.loading = false))
            .subscribe({
                next: (f) => this.filamentForm.patchValue(f),
                error: () => this.error = 'Não foi possível carregar os dados do filamento.'
            });
    }

    saveFilament() {
        if (this.filamentForm.invalid) return;

        this.saving = true;
        this.error = null;

        const request = this.isEditMode
            ? this.filamentsService.update(this.filamentId!, this.filamentForm.getRawValue())
            : this.filamentsService.create(this.filamentForm.getRawValue());

        request.pipe(finalize(() => this.saving = false))
            .subscribe({
                next: () => this.router.navigate(['/filaments']),
                error: () => this.error = 'Ocorreu um erro ao salvar os dados.'
            });
    }
}
