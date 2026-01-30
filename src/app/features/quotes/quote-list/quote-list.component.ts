import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuotesService } from '@core/services/quotes.service';
import { Quote, QuoteStatus } from '@core/models/quote.model';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-quote-list',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    template: `
    <div class="list-container">
      <header class="list-header">
        <div class="title-group">
          <h1>Orçamentos</h1>
          <p>Gerencie orçamentos e propostas comerciais.</p>
        </div>
        <div class="header-actions">
          <select [ngModel]="statusFilter()" (ngModelChange)="statusFilter.set($event)" class="status-select">
            <option [value]="undefined">Todos os Status</option>
            <option value="Draft">Rascunho</option>
            <option value="Sent">Enviado</option>
            <option value="Approved">Aprovado</option>
            <option value="Rejected">Reprovado</option>
          </select>
          <a routerLink="/quotes/new" class="btn-primary">Novo Orçamento</a>
        </div>
      </header>

      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <span>Carregando orçamentos...</span>
      </div>

      <div class="table-responsive" *ngIf="!loading">
        <table class="data-table">
          <thead>
            <tr>
              <th>Número / Cliente</th>
              <th>Status</th>
              <th class="numeric-head">Custo</th>
              <th class="numeric-head">Preço Final</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let quote of quotes()">
              <td>
                <div class="quote-info">
                  <span class="quote-number">#{{ quote.quoteNumber }}</span>
                  <span class="customer-name">{{ quote.customerName }}</span>
                </div>
              </td>
              <td>
                <span [class]="'badge badge-' + quote.status.toLowerCase()">{{ quote.status }}</span>
              </td>
              <td class="numeric">{{ quote.totalCost | currency:'BRL' }}</td>
              <td class="numeric final-price">{{ quote.finalPrice | currency:'BRL' }}</td>
              <td>{{ quote.createdAt | date:'shortDate' }}</td>
              <td class="actions">
                <a [routerLink]="['/quotes', quote.id]" class="btn-icon" title="Editar">
                  <span class="icon">✎</span>
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
    styles: [`
    .list-container { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
    .list-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
    .title-group h1 { margin: 0; color: #2c3e50; font-size: 1.8rem; }
    .title-group p { margin: 0.25rem 0 0; color: #7f8c8d; }
    .header-actions { display: flex; gap: 1rem; }
    .status-select { padding: 0.75rem; border: 1px solid #dcdde1; border-radius: 8px; }
    .btn-primary { background: #3498db; color: white; padding: 0.75rem 1.5rem; border-radius: 8px; text-decoration: none; font-weight: 600; }
    
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { padding: 1.25rem 1rem; text-align: left; border-bottom: 1px solid #f1f2f6; }
    .numeric-head, .numeric { text-align: right !important; }
    .quote-number { display: block; font-weight: 700; color: #3498db; }
    .customer-name { font-size: 0.85rem; color: #7f8c8d; }
    .final-price { font-weight: 700; color: #2c3e50; }
    
    .badge { padding: 0.35rem 0.75rem; border-radius: 50px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
    .badge-draft { background: #f1f2f6; color: #7f8c8d; }
    .badge-sent { background: #eaf2f8; color: #3498db; }
    .badge-approved { background: #eafaf1; color: #2ecc71; }
    .badge-rejected { background: #fdeaea; color: #e74c3c; }

    .loading-state { display: flex; flex-direction: column; align-items: center; padding: 4rem; gap: 1rem; color: #7f8c8d; }
    .spinner { border: 3px solid #f3f3f3; border-top: 3px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  `]
})
export class QuoteListComponent implements OnInit {
    private quotesService = inject(QuotesService);

    quotes = signal<Quote[]>([]);
    statusFilter = signal<QuoteStatus | undefined>(undefined);
    loading = true;

    ngOnInit() {
        this.loadQuotes();
    }

    loadQuotes() {
        this.loading = true;
        this.quotesService.getAll()
            .pipe(finalize(() => this.loading = false))
            .subscribe(data => this.quotes.set(data));
    }
}
