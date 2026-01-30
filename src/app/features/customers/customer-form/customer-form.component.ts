import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CustomersService } from '@core/services/customers.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="form-container">
      <header class="form-header">
        <div class="title-group">
          <h1>{{ isEditMode ? 'Editar Cliente' : 'Novo Cliente' }}</h1>
          <p>{{ isEditMode ? 'Atualize as informações do cliente abaixo.' : 'Preencha os dados para cadastrar um novo cliente.' }}</p>
        </div>
      </header>

      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <span>Carregando dados do cliente...</span>
      </div>

      <div *ngIf="error" class="error-banner">
        <span class="icon">⚠</span>
        {{ error }}
      </div>

      <form [formGroup]="customerForm" (ngSubmit)="saveCustomer()" *ngIf="!loading">
        <div class="form-grid">
          <div class="form-group full-width">
            <label for="name">Nome Completo / Razão Social</label>
            <input id="name" type="text" formControlName="name" class="form-control" placeholder="Ex: João da Silva ou Acme Corp">
            <small *ngIf="customerForm.get('name')?.invalid && customerForm.get('name')?.touched" class="error-text">
              O nome é obrigatório.
            </small>
          </div>

          <div class="form-group">
            <label for="email">E-mail</label>
            <input id="email" type="email" formControlName="email" class="form-control" placeholder="cliente@exemplo.com">
            <small *ngIf="customerForm.get('email')?.invalid && customerForm.get('email')?.touched" class="error-text">
              Insira um endereço de e-mail válido.
            </small>
          </div>

          <div class="form-group">
            <label for="phone">Telefone / WhatsApp</label>
            <input id="phone" type="text" formControlName="phone" class="form-control" placeholder="(00) 00000-0000">
          </div>

          <div class="form-group full-width">
            <label for="address">Endereço</label>
            <input id="address" type="text" formControlName="address" class="form-control" placeholder="Rua, Número, Complemento">
          </div>

          <div class="form-group">
            <label for="city">Cidade</label>
            <input id="city" type="text" formControlName="city" class="form-control" placeholder="Ex: São Paulo">
          </div>

          <div class="form-group">
            <label for="state">Estado / UF</label>
            <input id="state" type="text" formControlName="state" class="form-control" placeholder="Ex: SP">
          </div>

          <div class="form-group">
            <label for="zipCode">CEP</label>
            <input id="zipCode" type="text" formControlName="zipCode" class="form-control" placeholder="00000-000">
          </div>

          <div class="form-group">
            <label for="country">País</label>
            <input id="country" type="text" formControlName="country" class="form-control" placeholder="Ex: Brasil">
          </div>

          <div class="form-group full-width">
            <label for="notes">Observações</label>
            <textarea id="notes" formControlName="notes" class="form-control" rows="4" placeholder="Alguma nota importante sobre este cliente?"></textarea>
          </div>
        </div>

        <div class="form-actions">
          <a routerLink="/customers" class="btn-secondary">Voltar para listagem</a>
          <button type="submit" class="btn-primary" [disabled]="customerForm.invalid || saving">
            {{ saving ? 'Salvando...' : (isEditMode ? 'Atualizar Cliente' : 'Cadastrar Cliente') }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      padding: 2.5rem;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.05);
    }
    .form-header { margin-bottom: 2.5rem; border-bottom: 1px solid #f1f2f6; padding-bottom: 1rem; }
    .form-header h1 { margin: 0; color: #2c3e50; font-size: 1.8rem; }
    .form-header p { margin: 0.5rem 0 0; color: #7f8c8d; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem 1.5rem; }
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
export class CustomerFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private customersService = inject(CustomersService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  customerForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(256)]],
    phone: ['', Validators.maxLength(50)],
    address: ['', Validators.maxLength(500)],
    city: ['', Validators.maxLength(100)],
    state: ['', Validators.maxLength(100)],
    zipCode: ['', Validators.maxLength(20)],
    country: ['', Validators.maxLength(100)],
    notes: ['', Validators.maxLength(1000)]
  });

  isEditMode = false;
  customerId: string | null = null;
  loading = false;
  saving = false;
  error: string | null = null;

  ngOnInit() {
    this.customerId = this.route.snapshot.paramMap.get('id');
    if (this.customerId) {
      this.isEditMode = true;
      this.loadCustomer();
    }
  }

  loadCustomer() {
    this.loading = true;
    this.error = null;
    this.customersService.getById(this.customerId!)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (customer) => this.customerForm.patchValue(customer),
        error: () => this.error = 'Não foi possível carregar os dados do cliente.'
      });
  }

  saveCustomer() {
    if (this.customerForm.invalid) return;

    this.saving = true;
    this.error = null;

    const request = this.isEditMode
      ? this.customersService.update(this.customerId!, this.customerForm.value)
      : this.customersService.create(this.customerForm.value);

    request.pipe(finalize(() => this.saving = false))
      .subscribe({
        next: () => this.router.navigate(['/customers']),
        error: () => this.error = 'Ocorreu um erro ao salvar os dados.'
      });
  }
}
