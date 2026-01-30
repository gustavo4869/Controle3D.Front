import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersService } from '@core/services/orders.service';
import { Order, OrderStatus } from '@core/models/order.model';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-order-list',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    template: `
    <div class="list-container">
      <header class="list-header">
        <div class="title-group">
          <h1>Pedidos de Produção</h1>
          <p>Acompanhe o status da fabricação e entregas.</p>
        </div>
        <div class="header-actions">
          <select [ngModel]="statusFilter()" (ngModelChange)="statusFilter.set($event); loadOrders()" class="status-select">
            <option [value]="undefined">Todos os Status</option>
            <option value="New">Novo</option>
            <option value="InProduction">Em Produção</option>
            <option value="Ready">Pronto</option>
            <option value="Shipped">Enviado</option>
            <option value="Delivered">Entregue</option>
            <option value="Cancelled">Cancelado</option>
          </select>
        </div>
      </header>

      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <span>Carregando pedidos...</span>
      </div>

      <div class="table-responsive" *ngIf="!loading">
        <table class="data-table">
          <thead>
            <tr>
              <th>Pedido / Cliente</th>
              <th>Status</th>
              <th class="numeric-head">Valor Total</th>
              <th>Data Criação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let order of orders()">
              <td>
                <div class="order-info">
                  <span class="order-number">{{ order.orderNumber }}</span>
                  <span class="customer-name">{{ order.customerName }}</span>
                </div>
              </td>
              <td>
                <span [class]="'badge status-' + order.status.toLowerCase()">{{ getStatusLabel(order.status) }}</span>
              </td>
              <td class="numeric">{{ order.finalPrice | currency:'BRL' }}</td>
              <td>{{ order.createdAt | date:'shortDate' }}</td>
              <td class="actions">
                <a [routerLink]="['/orders', order.id]" class="btn-icon" title="Ver Detalhes">
                  <span class="icon">👁</span>
                </a>
              </td>
            </tr>
            <tr *ngIf="orders().length === 0">
               <td colspan="5" class="empty-msg">Nenhum pedido encontrado.</td>
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
    .status-select { padding: 0.75rem; border: 1px solid #dcdde1; border-radius: 8px; min-width: 180px; }
    
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { padding: 1.25rem 1rem; text-align: left; border-bottom: 1px solid #f1f2f6; }
    .numeric-head, .numeric { text-align: right !important; }
    .order-number { display: block; font-weight: 700; color: #e67e22; }
    .customer-name { font-size: 0.85rem; color: #7f8c8d; }
    
    .badge { padding: 0.35rem 0.75rem; border-radius: 50px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
    .status-new { background: #eaf2f8; color: #3498db; }
    .status-inproduction { background: #fef9f3; color: #f39c12; }
    .status-ready { background: #eafaf1; color: #2ecc71; }
    .status-shipped { background: #f4f4f9; color: #6c5ce7; }
    .status-delivered { background: #dff9fb; color: #12cbc4; }
    .status-cancelled { background: #fdeaea; color: #e74c3c; }

    .btn-icon { background: #f8f9fa; border: none; cursor: pointer; width: 35px; height: 35px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; text-decoration: none; color: #7f8c8d; }
    .loading-state { display: flex; flex-direction: column; align-items: center; padding: 4rem; gap: 1rem; color: #7f8c8d; }
    .spinner { border: 3px solid #f3f3f3; border-top: 3px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .empty-msg { text-align: center; color: #bdc3c7; padding: 4rem; }
  `]
})
export class OrderListComponent implements OnInit {
    private ordersService = inject(OrdersService);

    orders = signal<Order[]>([]);
    statusFilter = signal<OrderStatus | undefined>(undefined);
    loading = true;

    ngOnInit() {
        this.loadOrders();
    }

    loadOrders() {
        this.loading = true;
        this.ordersService.getAll(this.statusFilter())
            .pipe(finalize(() => this.loading = false))
            .subscribe(data => this.orders.set(data));
    }

    getStatusLabel(status: OrderStatus): string {
        const labels: Record<OrderStatus, string> = {
            [OrderStatus.New]: 'Novo',
            [OrderStatus.InProduction]: 'Em Produção',
            [OrderStatus.Ready]: 'Pronto',
            [OrderStatus.Shipped]: 'Enviado',
            [OrderStatus.Delivered]: 'Entregue',
            [OrderStatus.Cancelled]: 'Cancelado'
        };
        return labels[status];
    }
}
