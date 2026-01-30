import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomersService } from '@core/services/customers.service';
import { Customer } from '@core/models/customer.model';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="list-container">
      <header class="list-header">
        <div class="title-group">
          <h1>Clientes</h1>
          <p>Gerencie sua base de clientes e contatos.</p>
        </div>
        <div class="header-actions">
          <div class="search-wrapper">
            <input 
              type="text" 
              [ngModel]="searchQuery()" 
              (ngModelChange)="searchQuery.set($event)"
              placeholder="Buscar por nome ou e-mail..." 
              class="search-input"
            >
          </div>
          <a routerLink="/customers/new" class="btn-primary">Novo Cliente</a>
        </div>
      </header>

      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <span>Carregando clientes...</span>
      </div>

      <div *ngIf="error" class="error-banner">
        {{ error }}
      </div>

      <div class="table-responsive" *ngIf="!loading && !error">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Telefone</th>
              <th>Localidade</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let customer of filteredCustomers()">
              <td>
                <div class="customer-info">
                  <span class="customer-name">{{ customer.name }}</span>
                </div>
              </td>
              <td>{{ customer.email }}</td>
              <td>{{ customer.phone }}</td>
              <td>{{ customer.city ? customer.city + ' - ' + customer.state : '-' }}</td>
              <td class="actions">
                <a [routerLink]="['/customers/edit', customer.id]" class="btn-icon" title="Editar">
                  <span class="icon">✎</span>
                </a>
                <button (click)="deleteCustomer(customer)" class="btn-icon btn-delete" title="Excluir">
                  <span class="icon">🗑</span>
                </button>
              </td>
            </tr>
            <tr *ngIf="filteredCustomers().length === 0">
              <td colspan="5" class="empty-msg">Nenhum cliente encontrado.</td>
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
      flex-wrap: wrap;
      gap: 1.5rem;
    }
    .title-group h1 { margin: 0; color: #2c3e50; font-size: 1.8rem; }
    .title-group p { margin: 0.25rem 0 0; color: #7f8c8d; }
    .header-actions { display: flex; gap: 1rem; align-items: center; }
    .search-wrapper { position: relative; }
    .search-input {
      padding: 0.75rem 1rem;
      border: 1px solid #dcdde1;
      border-radius: 8px;
      min-width: 300px;
      font-size: 0.9rem;
      transition: all 0.2s;
    }
    .search-input:focus {
      outline: none;
      border-color: #3498db;
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
    }
    .btn-primary {
      background: #3498db;
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .btn-primary:hover { background: #2980b9; transform: translateY(-1px); }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { padding: 1.25rem 1rem; text-align: left; border-bottom: 1px solid #f1f2f6; }
    .data-table th { background: #f8f9fa; color: #95a5a6; font-weight: 600; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; }
    .customer-name { font-weight: 600; color: #2c3e50; }
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
    .error-banner { background: #fee2e2; color: #dc2626; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; }
  `]
})
export class CustomerListComponent implements OnInit {
  private customersService = inject(CustomersService);

  customers = signal<Customer[]>([]);
  searchQuery = signal<string>('');
  loading = true;
  error: string | null = null;

  filteredCustomers = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.customers();

    return this.customers().filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query)
    );
  });

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.loading = true;
    this.error = null;
    this.customersService.getAll()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => this.customers.set(data),
        error: () => this.error = 'Ocorreu um erro ao carregar a lista de clientes. Por favor, tente novamente.'
      });
  }

  deleteCustomer(customer: Customer) {
    if (confirm(`Deseja realmente excluir o cliente "${customer.name}"?`)) {
      this.customersService.inactivate(customer.id).subscribe({
        next: () => {
          this.customers.update(list => list.filter(c => c.id !== customer.id));
        },
        error: () => alert('Erro ao excluir cliente. Tente novamente mais tarde.')
      });
    }
  }
}
