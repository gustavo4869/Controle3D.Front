import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrdersService } from '@core/services/orders.service';
import { Order, OrderStatus, InsufficientInventoryError } from '@core/models/order.model';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="detail-container" *ngIf="order()">
      <header class="detail-header">
        <div class="header-left">
          <a routerLink="/orders" class="btn-back">← Voltar</a>
          <div class="title-meta">
            <h1>Pedido: {{ order()?.orderNumber }}</h1>
            <p>Cliente: <strong>{{ order()?.customerName }}</strong></p>
          </div>
        </div>
        <div class="header-actions">
           <span [class]="'badge status-' + order()?.status?.toLowerCase()">{{ getStatusLabel(order()!.status) }}</span>
        </div>
      </header>

      <div class="detail-grid">
        <!-- Status Progression -->
        <section class="workflow-card card">
          <h3>Atualizar Status da Produção</h3>
          <div class="status-buttons">
            <button *ngIf="order()?.status === 'New'" (click)="updateStatus('InProduction')" class="btn-workflow production" [disabled]="updating">
              {{ updating ? 'Iniciando...' : 'Iniciar Produção' }}
            </button>
            <button *ngIf="order()?.status === 'InProduction'" (click)="updateStatus('Ready')" class="btn-workflow ready" [disabled]="updating">
              {{ updating ? 'Salvando...' : 'Peças Prontas' }}
            </button>
            <button *ngIf="order()?.status === 'Ready'" (click)="updateStatus('Shipped')" class="btn-workflow shipped" [disabled]="updating">
               {{ updating ? 'Enviando...' : 'Despachar Pedido' }}
            </button>
            <button *ngIf="order()?.status === 'Shipped'" (click)="updateStatus('Delivered')" class="btn-workflow delivered" [disabled]="updating">
               {{ updating ? 'Finalizando...' : 'Confirmar Entrega' }}
            </button>
            
            <button *ngIf="canCancel()" (click)="confirmCancel()" class="btn-workflow cancel" [disabled]="updating">Cancelar Pedido</button>
          </div>
          <p class="status-hint" *ngIf="order()?.status === 'Delivered'">Este pedido foi concluído com sucesso.</p>
        </section>

        <!-- Summary -->
        <div class="info-card card">
           <label>Financeiro</label>
           <div class="value">{{ order()?.finalPrice | currency:'BRL' }}</div>
           <p class="meta">Custo total estimado: {{ order()?.totalCost | currency:'BRL' }}</p>
        </div>

        <!-- Items -->
        <section class="items-section card">
          <h3>Itens e Materiais</h3>
          <div class="item-list">
             <div *ngFor="let item of order()?.items" class="order-item">
                <div class="item-main">
                  <span class="qty">{{ item.quantity }}x</span>
                  <span class="desc">{{ item.description }}</span>
                </div>
                <div class="materials-list">
                   <div *ngFor="let m of item.materials" class="mat-badge">
                      {{ m.filamentName }} - {{ m.filamentColor }} ({{ m.weightG }}g)
                   </div>
                </div>
             </div>
          </div>
        </section>
      </div>

      <!-- Inventory Alert Modal -->
      <div class="modal-overlay" *ngIf="missingMaterials().length > 0">
        <div class="modal-content alert-content">
          <header>
            <h3 class="text-danger">Saldo Insuficiente</h3>
            <button (click)="missingMaterials.set([])" class="btn-close">×</button>
          </header>
          <div class="alert-body">
            <p>Não há filamento suficiente para iniciar a produção deste pedido. Verifique os componentes abaixo:</p>
            <ul class="missing-list">
              <li *ngFor="let m of missingMaterials()">
                <strong>{{ m.material }} - {{ m.color }}</strong>: Falta {{ m.missingG }}g
              </li>
            </ul>
            <p class="help-text">Dica: Adicione entradas de estoque ou ajuste o saldo dos rolos antes de prosseguir.</p>
          </div>
          <div class="modal-actions">
            <button (click)="missingMaterials.set([])" class="btn-primary">Entendido</button>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="loading" class="loading-state">
       <div class="spinner"></div>
       <span>Carregando pedido...</span>
    </div>
  `,
  styles: [`
    .detail-container { max-width: 1000px; margin: 0 auto; padding-bottom: 5rem; }
    .detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .header-left { display: flex; align-items: center; gap: 1.5rem; }
    .btn-back { text-decoration: none; color: #7f8c8d; font-weight: 600; }
    .title-meta h1 { margin: 0; font-size: 1.8rem; color: #2c3e50; }
    
    .card { background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #f1f2f6; box-shadow: 0 4px 6px rgba(0,0,0,0.02); margin-bottom: 1.5rem; }
    .detail-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; }
    .workflow-card { grid-column: span 2; }
    
    .status-buttons { display: flex; gap: 1rem; margin-top: 1rem; flex-wrap: wrap; }
    .btn-workflow { padding: 0.75rem 1.5rem; border-radius: 8px; border: none; font-weight: 700; cursor: pointer; color: white; transition: opacity 0.2s; }
    .btn-workflow:hover { opacity: 0.9; }
    .production { background: #f39c12; }
    .ready { background: #2ecc71; }
    .shipped { background: #6c5ce7; }
    .delivered { background: #12cbc4; }
    .cancel { background: #f8f9fa; color: #e74c3c; border: 1px solid #fdeaea; }
    
    .info-card label { display: block; color: #95a5a6; font-size: 0.75rem; text-transform: uppercase; font-weight: 700; margin-bottom: 0.5rem; }
    .info-card .value { font-size: 2rem; font-weight: 800; color: #2c3e50; }
    
    .item-list { margin-top: 1rem; }
    .order-item { padding: 1rem 0; border-bottom: 1px solid #f1f2f6; }
    .item-main { display: flex; gap: 0.5rem; font-weight: 600; font-size: 1.1rem; }
    .qty { color: #3498db; }
    .materials-list { display: flex; gap: 0.5rem; margin-top: 0.5rem; flex-wrap: wrap; }
    .mat-badge { background: #f8f9fa; padding: 0.25rem 0.6rem; border-radius: 4px; font-size: 0.75rem; color: #7f8c8d; border: 1px solid #efeff4; }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; width: 450px; padding: 2.5rem; border-radius: 12px; box-shadow: 0 20px 25px rgba(0,0,0,0.1); }
    .alert-content { border-top: 5px solid #e74c3c; }
    .btn-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #95a5a6; }
    .missing-list { background: #fff5f5; padding: 1rem 2rem; border-radius: 8px; color: #c0392b; margin: 1.5rem 0; }
    .help-text { font-size: 0.85rem; color: #7f8c8d; font-style: italic; }

    .badge { padding: 0.35rem 0.75rem; border-radius: 50px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
    .status-new { background: #eaf2f8; color: #3498db; }
    .status-inproduction { background: #fef9f3; color: #f39c12; }
    .status-ready { background: #eafaf1; color: #2ecc71; }
    .status-shipped { background: #f4f4f9; color: #6c5ce7; }
    .status-delivered { background: #dff9fb; color: #12cbc4; }
    .status-cancelled { background: #fdeaea; color: #e74c3c; }

    .loading-state { display: flex; flex-direction: column; align-items: center; padding: 4rem; gap: 1rem; color: #7f8c8d; }
    .spinner { border: 3px solid #f3f3f3; border-top: 3px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  `]
})
export class OrderDetailComponent implements OnInit {
  private ordersService = inject(OrdersService);
  private route = inject(ActivatedRoute);

  order = signal<Order | null>(null);
  loading = true;
  updating = false;
  missingMaterials = signal<any[]>([]);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadOrder(id);
  }

  loadOrder(id: string) {
    this.loading = true;
    this.ordersService.getById(id)
      .pipe(finalize(() => this.loading = false))
      .subscribe(data => this.order.set(data));
  }

  updateStatus(status: string) {
    if (!this.order()) return;
    this.updating = true;
    this.ordersService.changeStatus(this.order()!.id, status as OrderStatus)
      .pipe(finalize(() => this.updating = false))
      .subscribe({
        next: (updated) => {
          // Success: partial update for status
          this.order.update(o => o ? ({ ...o, status: updated.status }) : null);
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 400 && err.error?.missingMaterials) {
            this.missingMaterials.set(err.error.missingMaterials);
          } else {
            alert('Erro ao atualizar status. Tente novamente.');
          }
        }
      });
  }

  canCancel(): boolean {
    const s = this.order()?.status;
    return s !== OrderStatus.Delivered && s !== OrderStatus.Cancelled;
  }

  confirmCancel() {
    if (confirm('Deseja realmente cancelar este pedido? Esta ação não pode ser desfeita.')) {
      this.updateStatus(OrderStatus.Cancelled);
    }
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
