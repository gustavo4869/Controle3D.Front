import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '@core/services/dashboard.service';
import { DashboardStats } from '@core/models/dashboard.model';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <div class="title-group">
          <h1>Dashboard</h1>
          <p>Visão geral da sua operação de impressão 3D.</p>
        </div>
        <div class="header-filters">
          <select [ngModel]="selectedMonth()" (ngModelChange)="onFilterChange($event, selectedYear())" class="filter-select">
            <option *ngFor="let m of months; let i = index" [value]="i + 1">{{ m }}</option>
          </select>
          <select [ngModel]="selectedYear()" (ngModelChange)="onFilterChange(selectedMonth(), $event)" class="filter-select">
            <option [value]="2024">2024</option>
            <option [value]="2025">2025</option>
          </select>
        </div>
      </header>

      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
      </div>

      <div class="dashboard-content" *ngIf="!loading && stats()">
        <!-- Financial Summary -->
        <div class="stats-grid main-stats">
          <div class="stat-card billing">
            <label>Faturamento Mensal</label>
            <div class="value">{{ stats()?.financials?.monthlyBilling | currency:'BRL' }}</div>
            <div class="growth" [class.positive]="(stats()?.financials?.billingGrowthPercent || 0) > 0">
               {{ (stats()?.financials?.billingGrowthPercent || 0) > 0 ? '↑' : '↓' }} 
               {{ stats()?.financials?.billingGrowthPercent }}% vs mês anterior
            </div>
          </div>
          <div class="stat-card margin">
            <label>Margem Estimada</label>
            <div class="value">{{ stats()?.financials?.monthlyMargin | currency:'BRL' }}</div>
            <p class="description">Lucro bruto sobre pedidos do período.</p>
          </div>
        </div>

        <!-- Status Breakdown -->
        <h3 class="section-title">Status dos Pedidos</h3>
        <div class="stats-grid status-counts">
          <div class="count-card new">
            <span class="count">{{ stats()?.counts?.new }}</span>
            <label>Novos</label>
          </div>
          <div class="count-card production">
            <span class="count">{{ stats()?.counts?.inProduction }}</span>
            <label>Em Produção</label>
          </div>
          <div class="count-card ready">
            <span class="count">{{ stats()?.counts?.ready }}</span>
            <label>Prontos</label>
          </div>
          <div class="count-card delivered">
            <span class="count">{{ stats()?.counts?.delivered }}</span>
            <label>Entregues</label>
          </div>
        </div>

        <!-- Lists Wrapper -->
        <div class="lists-grid">
          <section class="list-section">
            <div class="section-header">
               <h3>Em Produção</h3>
               <span class="badge">{{ stats()?.activeOrders?.inProduction?.length }}</span>
            </div>
            <div class="quick-list">
              <div *ngFor="let order of stats()?.activeOrders?.inProduction" class="list-item">
                <div class="item-info">
                  <span class="item-number">{{ order.orderNumber }}</span>
                  <span class="item-customer">{{ order.customerName }}</span>
                </div>
                <a [routerLink]="['/orders', order.id]" class="btn-view">Ver</a>
              </div>
              <div *ngIf="stats()?.activeOrders?.inProduction?.length === 0" class="empty-list">Nenhum pedido em produção.</div>
            </div>
          </section>

          <section class="list-section">
            <div class="section-header">
               <h3>Prontos / Retirada</h3>
               <span class="badge badge-success">{{ stats()?.activeOrders?.ready?.length }}</span>
            </div>
            <div class="quick-list">
              <div *ngFor="let order of stats()?.activeOrders?.ready" class="list-item">
                <div class="item-info">
                  <span class="item-number">{{ order.orderNumber }}</span>
                  <span class="item-customer">{{ order.customerName }}</span>
                </div>
                <a [routerLink]="['/orders', order.id]" class="btn-view">Ver</a>
              </div>
              <div *ngIf="stats()?.activeOrders?.ready?.length === 0" class="empty-list">Nenhum pedido pronto para retirada.</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { max-width: 1200px; margin: 0 auto; padding-bottom: 2rem; }
    .dashboard-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
    .title-group h1 { margin: 0; color: #2c3e50; font-size: 1.8rem; }
    .title-group p { margin: 0.25rem 0 0; color: #7f8c8d; }
    
    .header-filters { display: flex; gap: 0.5rem; }
    .filter-select { padding: 0.6rem; border: 1px solid #dcdde1; border-radius: 8px; font-size: 0.9rem; background: white; }

    .stats-grid { display: grid; gap: 1.5rem; margin-bottom: 2rem; }
    .main-stats { grid-template-columns: repeat(2, 1fr); }
    .status-counts { grid-template-columns: repeat(4, 1fr); }
    
    .stat-card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); border: 1px solid #f1f2f6; }
    .stat-card label { display: block; color: #95a5a6; font-size: 0.8rem; text-transform: uppercase; font-weight: 700; margin-bottom: 0.5rem; }
    .stat-card .value { font-size: 2.2rem; font-weight: 800; color: #2c3e50; }
    .stat-card .growth { font-size: 0.85rem; margin-top: 0.5rem; font-weight: 600; color: #e74c3c; }
    .stat-card .growth.positive { color: #2ecc71; }
    .stat-card .description { font-size: 0.8rem; color: #7f8c8d; margin-top: 0.5rem; }

    .count-card { background: white; padding: 1.5rem; border-radius: 12px; text-align: center; border: 1px solid #f1f2f6; }
    .count-card .count { display: block; font-size: 1.8rem; font-weight: 800; margin-bottom: 0.25rem; }
    .count-card label { color: #7f8c8d; font-size: 0.8rem; font-weight: 600; }
    .count-card.new .count { color: #3498db; }
    .count-card.production .count { color: #f39c12; }
    .count-card.ready .count { color: #2ecc71; }
    .count-card.delivered .count { color: #12cbc4; }

    .section-title { color: #2c3e50; font-size: 1.1rem; margin-bottom: 1rem; }
    
    .lists-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
    .list-section { background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #f1f2f6; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem; }
    .section-header h3 { margin: 0; font-size: 1rem; color: #34495e; }
    .badge { background: #f1f2f6; color: #7f8c8d; padding: 0.25rem 0.6rem; border-radius: 4px; font-size: 0.8rem; font-weight: 700; }
    .badge-success { background: #eafaf1; color: #2ecc71; }

    .quick-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .list-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: #f8f9fa; border-radius: 8px; }
    .item-number { display: block; font-weight: 700; font-size: 0.9rem; color: #2c3e50; }
    .item-customer { font-size: 0.8rem; color: #7f8c8d; }
    .btn-view { text-decoration: none; color: #3498db; font-size: 0.85rem; font-weight: 600; }
    .empty-list { color: #bdc3c7; font-size: 0.85rem; text-align: center; padding: 1rem; }

    .loading-state { display: flex; justify-content: center; padding: 5rem; }
    .spinner { border: 3px solid #f3f3f3; border-top: 3px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  `]
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  stats = signal<DashboardStats | null>(null);
  loading = true;

  months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  selectedMonth = signal<number>(new Date().getMonth() + 1);
  selectedYear = signal<number>(new Date().getFullYear());

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.loading = true;
    this.dashboardService.getSummary(this.selectedMonth())
      .pipe(finalize(() => this.loading = false))
      .subscribe(data => this.stats.set(data));
  }

  onFilterChange(month: number, year: number) {
    this.selectedMonth.set(month);
    this.selectedYear.set(year);
    this.loadStats();
  }
}
