import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MachinesService } from '@core/services/machines.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-machine-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="form-container">
      <header class="form-header">
        <div class="title-group">
          <h1>{{ isEditMode ? 'Editar Máquina' : 'Nova Máquina' }}</h1>
          <p>Preencha os dados da máquina para cadastrá-la ou atualizá-la.</p>
        </div>
      </header>

      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <span>Carregando dados da máquina...</span>
      </div>

      <div *ngIf="error" class="error-banner">
        <span class="icon">⚠</span>
        {{ error }}
      </div>

      <form [formGroup]="machineForm" (ngSubmit)="saveMachine()" *ngIf="!loading">
        <div class="form-grid">
          <div class="form-group">
            <label for="name">Nome da Máquina</label>
            <input id="name" type="text" formControlName="name" class="form-control" placeholder="Ex: Impressora 01">
            <small *ngIf="machineForm.get('name')?.invalid && machineForm.get('name')?.touched" class="error-text">
              O nome é obrigatório.
            </small>
          </div>

          <div class="form-group">
            <label for="model">Modelo</label>
            <input id="model" type="text" formControlName="model" class="form-control" placeholder="Ex: Ender 3 V3">
          </div>

          <div class="form-group">
            <label for="manufacturer">Fabricante</label>
            <input id="manufacturer" type="text" formControlName="manufacturer" class="form-control" placeholder="Ex: Creality">
          </div>

          <div class="form-group">
            <label for="serialNumber">Número de Série</label>
            <input id="serialNumber" type="text" formControlName="serialNumber" class="form-control" placeholder="Ex: SN123456789">
          </div>

          <div class="form-group">
            <label for="costPerHour">Custo por Hora (BRL)</label>
            <div class="input-with-symbol">
              <span class="symbol">R$</span>
              <input id="costPerHour" type="number" step="0.01" formControlName="costPerHour" class="form-control with-symbol" placeholder="0,00">
            </div>
            <small *ngIf="machineForm.get('costPerHour')?.invalid && machineForm.get('costPerHour')?.touched" class="error-text">
              O custo por hora é obrigatório.
            </small>
          </div>

          <div class="form-group full-width">
            <label for="notes">Observações Técnicas</label>
            <textarea id="notes" formControlName="notes" class="form-control" rows="4" placeholder="Algum detalhe técnico ou observação sobre esta máquina?"></textarea>
          </div>
        </div>

        <div class="form-actions">
          <a routerLink="/machines" class="btn-secondary">Voltar para listagem</a>
          <button type="submit" class="btn-primary" [disabled]="machineForm.invalid || saving">
            {{ saving ? 'Salvando...' : (isEditMode ? 'Atualizar Máquina' : 'Cadastrar Máquina') }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 2.5rem;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.05);
    }
    .form-header { margin-bottom: 2.5rem; border-bottom: 1px solid #f1f2f6; padding-bottom: 1rem; }
    .form-header h1 { margin: 0; color: #2c3e50; font-size: 1.8rem; }
    .form-header p { margin: 0.5rem 0 0; color: #7f8c8d; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .full-width { grid-column: span 2; }
    .form-group { margin-bottom: 1rem; }
    label { display: block; margin-bottom: 0.4rem; font-weight: 600; color: #34495e; font-size: 0.9rem; }
    .form-control {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid #dcdde1;
      border-radius: 8px;
      font-size: 0.95rem;
      transition: all 0.2s;
    }
    .form-control:focus {
      outline: none;
      border-color: #3498db;
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
    }
    .input-with-symbol { position: relative; display: flex; align-items: center; }
    .symbol { position: absolute; left: 1rem; color: #7f8c8d; font-weight: 600; }
    .with-symbol { padding-left: 3rem; }
    .form-actions {
      margin-top: 2rem;
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding-top: 1.5rem;
      border-top: 1px solid #f1f2f6;
    }
    .btn-primary {
      background: #3498db;
      color: white;
      border: none;
      padding: 0.8rem 2rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary:hover:not(:disabled) { background: #2980b9; transform: translateY(-1px); }
    .btn-secondary {
      background: #f8f9fa;
      color: #7f8c8d;
      border: 1px solid #dcdde1;
      padding: 0.8rem 2rem;
      border-radius: 8px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s;
    }
    .btn-secondary:hover { background: #e2e6ea; color: #2c3e50; }
    .btn-primary:disabled { background: #bdc3c7; cursor: not-allowed; }
    .error-text { color: #e74c3c; font-size: 0.8rem; margin-top: 0.4rem; display: block; }
    .error-banner { background: #fee2e2; color: #dc2626; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; }
    .loading-state { display: flex; flex-direction: column; align-items: center; padding: 4rem; gap: 1rem; color: #7f8c8d; }
    .spinner { border: 3px solid #f3f3f3; border-top: 3px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  `]
})
export class MachineFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private machinesService = inject(MachinesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  machineForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    model: ['', Validators.maxLength(100)],
    manufacturer: ['', Validators.maxLength(100)],
    serialNumber: ['', Validators.maxLength(100)],
    costPerHour: [0, [Validators.required, Validators.min(0)]],
    notes: ['', Validators.maxLength(1000)]
  });

  isEditMode = false;
  machineId: string | null = null;
  loading = false;
  saving = false;
  error: string | null = null;

  ngOnInit() {
    this.machineId = this.route.snapshot.paramMap.get('id');
    if (this.machineId) {
      this.isEditMode = true;
      this.loadMachine();
    }
  }

  loadMachine() {
    this.loading = true;
    this.error = null;
    this.machinesService.getById(this.machineId!)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (machine) => this.machineForm.patchValue(machine),
        error: () => this.error = 'Não foi possível carregar os dados da máquina.'
      });
  }

  saveMachine() {
    if (this.machineForm.invalid) return;

    this.saving = true;
    this.error = null;

    const request = this.isEditMode
      ? this.machinesService.update(this.machineId!, this.machineForm.value)
      : this.machinesService.create(this.machineForm.value);

    request.pipe(finalize(() => this.saving = false))
      .subscribe({
        next: () => this.router.navigate(['/machines']),
        error: () => this.error = 'Ocorreu um erro ao salvar os dados.'
      });
  }
}
