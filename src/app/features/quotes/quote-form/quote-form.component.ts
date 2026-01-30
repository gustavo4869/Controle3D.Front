import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { QuotesService } from '@core/services/quotes.service';
import { CustomersService } from '@core/services/customers.service';
import { MachinesService } from '@core/services/machines.service';
import { FilamentsService } from '@core/services/filaments.service';
import { OrdersService } from '@core/services/orders.service';
import { AdjustmentType, QuoteStatus, QuoteRecalculateResponse } from '@core/models/quote.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-quote-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="form-container">
      <header class="form-header">
        <div class="header-left">
          <a routerLink="/quotes" class="btn-back">← Voltar</a>
          <div>
            <h1>{{ isEditMode ? 'Editar Orçamento' : 'Novo Orçamento' }}</h1>
            <p>Estado: <span class="badge">{{ currentStatus() }}</span></p>
          </div>
        </div>
        <div class="header-actions">
          <button *ngIf="currentStatus() === 'Approved'" (click)="generateOrder()" class="btn-success">Gerar Pedido</button>
          <button (click)="recalculate()" class="btn-secondary" [disabled]="loading || saving || recalculating">
            {{ recalculating ? 'Calculando...' : 'Recalcular Totais' }}
          </button>
          <button (click)="saveAsDraft()" class="btn-primary" [disabled]="loading || saving || recalculating">Salvar como Rascunho</button>
        </div>
      </header>

      <form [formGroup]="quoteForm">
        <!-- Customer & General Info -->
        <section class="form-section card">
          <h3>Informações Gerais</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Cliente</label>
              <select formControlName="customerId" class="form-control">
                <option value="">Selecione um cliente...</option>
                <option *ngFor="let c of customers()" [value]="c.id">{{ c.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Margem de Lucro (%)</label>
              <input type="number" formControlName="marginPercent" class="form-control">
            </div>
          </div>
        </section>

        <!-- Items Section -->
        <section class="form-section">
          <div class="section-header">
            <h3>Itens do Orçamento</h3>
            <button type="button" (click)="addItem()" class="btn-add">+ Adicionar Item</button>
          </div>

          <div formArrayName="items">
            <div *ngFor="let item of items.controls; let i = index" [formGroupName]="i" class="item-card card">
              <header class="item-header">
                <h4>Item #{{ i + 1 }}</h4>
                <button type="button" (click)="removeItem(i)" class="btn-remove">Remover</button>
              </header>

              <div class="item-grid">
                <div class="form-group full-width">
                  <label>Descrição da Peça</label>
                  <input formControlName="description" class="form-control" placeholder="Ex: Engrenagem de Redução">
                </div>
                <div class="form-group">
                  <label>Máquina</label>
                  <select formControlName="machineId" class="form-control">
                    <option value="">Selecione...</option>
                    <option *ngFor="let m of machines()" [value]="m.id">{{ m.name }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Qtd</label>
                  <input type="number" formControlName="quantity" class="form-control">
                </div>
                <div class="form-group">
                  <label>Tempo Impressão (min)</label>
                  <input type="number" formControlName="printMinutes" class="form-control">
                </div>
                <div class="form-group">
                  <label>Pós-Processamento (min)</label>
                  <input type="number" formControlName="postMinutes" class="form-control">
                </div>
                <div class="form-group">
                  <label>Risco (%)</label>
                  <input type="number" formControlName="riskPercent" class="form-control">
                </div>
                <div class="form-group">
                  <label>Embalagem (R$)</label>
                  <input type="number" formControlName="packagingCost" class="form-control">
                </div>
              </div>

              <!-- Materials Subsection -->
              <div class="materials-section">
                <h5>Materiais / Cores</h5>
                <div formArrayName="materials">
                  <div *ngFor="let mat of getMaterials(i).controls; let j = index" [formGroupName]="j" class="material-row">
                    <select formControlName="filamentId" class="form-control">
                      <option value="">Filamento...</option>
                      <option *ngFor="let f of filaments()" [value]="f.id">{{ f.material }} - {{ f.color }} ({{ f.brand }})</option>
                    </select>
                    <div class="input-with-label">
                      <input type="number" formControlName="weightG" class="form-control" placeholder="Grams">
                      <span>g</span>
                    </div>
                    <button type="button" (click)="removeMaterial(i, j)" class="btn-icon">×</button>
                  </div>
                </div>
                <button type="button" (click)="addMaterial(i)" class="btn-text">+ Adicionar Material</button>
              </div>
            </div>
          </div>
        </section>

        <!-- Totals & Adjustment -->
        <section class="totals-section card" *ngIf="summary()">
          <div class="summary-grid">
            <div class="summary-item">
              <label>Custo Total</label>
              <div class="value">{{ summary()?.totalCost | currency:'BRL' }}</div>
            </div>
            <div class="summary-item">
              <label>Sugerido (+Margem)</label>
              <div class="value">{{ summary()?.suggestedPrice | currency:'BRL' }}</div>
            </div>
            <div class="summary-item featured">
              <label>Preço Final</label>
              <div class="value">{{ summary()?.finalPrice | currency:'BRL' }}</div>
            </div>
          </div>

          <div class="adjustment-controls">
            <div class="form-group">
              <label>Tipo de Ajuste</label>
              <select formControlName="adjustmentType" class="form-control">
                <option value="None">Sem Ajuste</option>
                <option value="Value">Ajuste de Valor (R$)</option>
                <option value="Percent">Ajuste Percentual (%)</option>
              </select>
            </div>
            <div class="form-group" *ngIf="quoteForm.get('adjustmentType')?.value !== 'None'">
              <label>Valor do Ajuste</label>
              <input type="number" formControlName="adjustmentValue" class="form-control">
            </div>
          </div>
        </section>
        
        <div class="actions-footer" *ngIf="isEditMode">
             <button type="button" class="btn-secondary" (click)="updateStatus('Sent')">Marcar como Enviado</button>
             <button type="button" class="btn-success" (click)="updateStatus('Approved')">Aprovar Orçamento</button>
             <button type="button" class="btn-danger" (click)="updateStatus('Rejected')">Reprovar</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-container { max-width: 1000px; margin: 0 auto; padding-bottom: 5rem; }
    .form-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
    .header-left { display: flex; align-items: flex-start; gap: 1.5rem; }
    .btn-back { text-decoration: none; color: #7f8c8d; font-weight: 600; margin-top: 0.5rem; }
    .form-header h1 { margin: 0; color: #2c3e50; }
    .header-actions { display: flex; gap: 1rem; }
    
    .card { background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #f1f2f6; box-shadow: 0 4px 6px rgba(0,0,0,0.02); margin-bottom: 1.5rem; }
    .form-section h3 { margin-bottom: 1.5rem; color: #34495e; font-size: 1.1rem; }
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.85rem; color: #7f8c8d; }
    .form-control { width: 100%; padding: 0.75rem; border: 1px solid #dcdde1; border-radius: 8px; }
    .full-width { grid-column: span 2; }
    
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .item-card { border-left: 4px solid #3498db; }
    .item-header { display: flex; justify-content: space-between; margin-bottom: 1.5rem; }
    .item-header h4 { margin: 0; }
    .item-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
    
    .materials-section { margin-top: 1.5rem; background: #f8f9fa; padding: 1rem; border-radius: 8px; }
    .material-row { display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem; }
    .input-with-label { display: flex; align-items: center; gap: 0.25rem; }
    
    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; text-align: center; }
    .summary-item label { color: #95a5a6; font-size: 0.75rem; text-transform: uppercase; font-weight: 700; }
    .summary-item .value { font-size: 1.25rem; font-weight: 700; }
    .summary-item.featured .value { font-size: 1.8rem; color: #2ecc71; }
    
    .adjustment-controls { border-top: 1px solid #f1f2f6; padding-top: 1.5rem; display: flex; gap: 1.5rem; }
    .actions-footer { margin-top: 2rem; display: flex; justify-content: center; gap: 1rem; }
    
    .btn-add { background: #3498db; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; }
    .btn-remove { color: #e74c3c; background: none; border: none; cursor: pointer; font-size: 0.85rem; }
    .btn-text { background: none; border: none; color: #3498db; cursor: pointer; font-weight: 600; margin-top: 0.5rem; }
    .btn-primary { background: #2ecc71; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .btn-secondary { background: #3498db; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .btn-success { background: #2ecc71; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .btn-danger { background: #e74c3c; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .btn-icon { background: none; border: none; font-size: 1.2rem; color: #e74c3c; cursor: pointer; }
  `]
})
export class QuoteFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private quotesService = inject(QuotesService);
  private customersService = inject(CustomersService);
  private machinesService = inject(MachinesService);
  private filamentsService = inject(FilamentsService);
  private ordersService = inject(OrdersService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEditMode = false;
  loading = false;
  saving = false;
  recalculating = false;

  customers = signal<any[]>([]);
  machines = signal<any[]>([]);
  filaments = signal<any[]>([]);
  summary = signal<QuoteRecalculateResponse | null>(null);
  currentStatus = signal<string>('Draft');

  quoteForm: FormGroup = this.fb.group({
    customerId: ['', Validators.required],
    marginPercent: [25, [Validators.required, Validators.min(0)]],
    adjustmentType: ['None'],
    adjustmentValue: [0],
    notes: [''],
    items: this.fb.array([])
  });

  get items() { return this.quoteForm.get('items') as FormArray; }

  ngOnInit() {
    this.loadInitialData();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.loadQuote(id);
    } else {
      this.addItem(); // Start with one item
    }
  }

  loadInitialData() {
    this.customersService.getAll().subscribe(data => this.customers.set(data));
    this.machinesService.getAll().subscribe(data => this.machines.set(data));
    this.filamentsService.getAll().subscribe(data => this.filaments.set(data));
  }

  loadQuote(id: string) {
    this.loading = true;
    this.quotesService.getById(id).subscribe(quote => {
      this.currentStatus.set(quote.status);

      // Clear items
      while (this.items.length) { this.items.removeAt(0); }

      // Patch root fields
      this.quoteForm.patchValue({
        customerId: quote.customerId,
        marginPercent: quote.marginPercent,
        adjustmentType: quote.adjustmentType,
        adjustmentValue: quote.adjustmentValue,
        notes: quote.notes
      });

      // Patch items
      quote.items.forEach(item => {
        const itemGroup = this.createItemFormGroup();
        itemGroup.patchValue(item);

        // Patch materials
        const matArray = itemGroup.get('materials') as FormArray;
        while (matArray.length) matArray.removeAt(0);
        item.materials.forEach(m => {
          const matGroup = this.fb.group({
            filamentId: [m.filamentId, Validators.required],
            weightG: [m.weightG, [Validators.required, Validators.min(0.1)]]
          });
          matArray.push(matGroup);
        });

        this.items.push(itemGroup);
      });

      this.loading = false;
      this.recalculate();
    });
  }

  createItemFormGroup() {
    return this.fb.group({
      description: ['', Validators.required],
      machineId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      printMinutes: [0, [Validators.required, Validators.min(0)]],
      postMinutes: [0, [Validators.required, Validators.min(0)]],
      riskPercent: [5, [Validators.required, Validators.min(0)]],
      packagingCost: [0, [Validators.required, Validators.min(0)]],
      materials: this.fb.array([])
    });
  }

  addItem() {
    const item = this.createItemFormGroup();
    this.addMaterialToItem(item); // One material by default
    this.items.push(item);
  }

  removeItem(index: number) { this.items.removeAt(index); }

  getMaterials(itemIndex: number) {
    return (this.items.at(itemIndex).get('materials') as FormArray);
  }

  addMaterial(itemIndex: number) {
    const matArray = this.getMaterials(itemIndex);
    matArray.push(this.fb.group({
      filamentId: ['', Validators.required],
      weightG: [10, [Validators.required, Validators.min(0.1)]]
    }));
  }

  private addMaterialToItem(item: FormGroup) {
    const matArray = item.get('materials') as FormArray;
    matArray.push(this.fb.group({
      filamentId: ['', Validators.required],
      weightG: [10, [Validators.required, Validators.min(0.1)]]
    }));
  }

  removeMaterial(itemIndex: number, matIndex: number) {
    this.getMaterials(itemIndex).removeAt(matIndex);
  }

  recalculate() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.recalculating = true;
    this.quotesService.recalculate(id, this.quoteForm.getRawValue())
      .pipe(finalize(() => this.recalculating = false))
      .subscribe({
        next: (res) => this.summary.set(res),
        error: () => alert('Ocorreu um erro ao calcular os totais.')
      });
  }

  saveAsDraft() {
    if (this.quoteForm.invalid) return;
    this.saving = true;
    const data = this.quoteForm.getRawValue();

    const obs = this.isEditMode
      ? this.quotesService.update(this.route.snapshot.paramMap.get('id')!, data)
      : this.quotesService.create(data);

    obs.pipe(finalize(() => this.saving = false))
      .subscribe(() => this.router.navigate(['/quotes']));
  }

  updateStatus(status: string) {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.quotesService.changeStatus(id, status as any).subscribe(q => {
      this.currentStatus.set(q.status);
    });
  }

  generateOrder() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.loading = true;
    this.ordersService.createFromQuote(id)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (order) => this.router.navigate(['/orders', order.id]),
        error: () => alert('Erro ao gerar pedido. Verifique se o orçamento está aprovado.')
      });
  }
}
