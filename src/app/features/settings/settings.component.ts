import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingsService } from '@core/services/settings.service';
import { TenantSettings } from '@core/models/tenant-settings.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="settings-container">
      <header class="page-header">
        <h1>Configurações do Tenant</h1>
        <p>Ajuste as preferências regionais e limites do sistema.</p>
      </header>

      <div *ngIf="loading" class="loading-overlay">
        <div class="spinner"></div>
        <span>Carregando configurações...</span>
      </div>

      <div *ngIf="error" class="error-banner">
        <i class="icon-error"></i>
        {{ error }}
      </div>

      <div *ngIf="successMessage" class="success-banner">
        <i class="icon-success"></i>
        {{ successMessage }}
      </div>

      <form [formGroup]="settingsForm" (ngSubmit)="saveSettings()" *ngIf="!loading">
        <div class="form-grid">
          <div class="form-group">
            <label for="timeZone">Fuso Horário</label>
            <select id="timeZone" formControlName="timeZone" class="form-control">
              <option value="UTC">UTC (Padrão)</option>
              <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
              <option value="America/New_York">New York (EST)</option>
              <option value="Europe/London">London (GMT)</option>
            </select>
          </div>

          <div class="form-group">
            <label for="currency">Moeda Padrão</label>
            <select id="currency" formControlName="currency" class="form-control">
              <option value="BRL">Real (R$)</option>
              <option value="USD">Dólar ($)</option>
              <option value="EUR">Euro (€)</option>
            </select>
          </div>

          <div class="form-group">
            <label for="dateFormat">Formato de Data</label>
            <select id="dateFormat" formControlName="dateFormat" class="form-control">
              <option value="dd/MM/yyyy">DD/MM/YYYY</option>
              <option value="yyyy-MM-dd">YYYY-MM-DD (ISO)</option>
              <option value="MM/dd/yyyy">MM/DD/YYYY</option>
            </select>
          </div>

          <div class="form-group">
            <label for="language">Idioma</label>
            <select id="language" formControlName="language" class="form-control">
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en-US">English (US)</option>
              <option value="es-ES">Español</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="maxUsers">Limite de Usuários</label>
          <input id="maxUsers" type="number" formControlName="maxUsers" class="form-control" readonly>
          <small class="help-text">O limite de usuários é definido pelo seu plano atual.</small>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-primary" [disabled]="settingsForm.invalid || saving">
            {{ saving ? 'Salvando...' : 'Salvar Alterações' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .help-text { color: #7f8c8d; font-size: 0.8rem; margin-top: 0.25rem; display: block; }
    .settings-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 2.5rem;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.05);
    }
    .page-header {
      margin-bottom: 2rem;
      border-bottom: 1px solid #eee;
      padding-bottom: 1rem;
    }
    .page-header h1 {
      margin: 0;
      color: #2c3e50;
      font-size: 1.8rem;
    }
    .page-header p {
      margin: 0.5rem 0 0;
      color: #7f8c8d;
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }
    @media (max-width: 600px) {
      .form-grid { grid-template-columns: 1fr; }
    }
    .form-group { margin-bottom: 1.25rem; }
    label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #34495e; font-size: 0.9rem; }
    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #dcdde1;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }
    .form-control:focus {
      outline: none;
      border-color: #3498db;
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
    }
    .btn-primary {
      background-color: #3498db;
      color: white;
      padding: 0.8rem 2rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      transition: all 0.2s;
    }
    .btn-primary:hover:not(:disabled) { background-color: #2980b9; transform: translateY(-1px); }
    .btn-primary:disabled { background-color: #bdc3c7; cursor: not-allowed; }
    .form-actions {
      margin-top: 2rem;
      display: flex;
      justify-content: flex-end;
    }
    .error-banner { background: #fee2e2; color: #dc2626; padding: 1rem; border-radius: 6px; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; }
    .success-banner { background: #dcfce7; color: #16a34a; padding: 1rem; border-radius: 6px; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; }
    .error-text { color: #dc2626; font-size: 0.8rem; margin-top: 0.25rem; display: block; }
    .loading-overlay { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem; gap: 1rem; color: #7f8c8d; }
    .spinner { border: 3px solid #f3f3f3; border-top: 3px solid #3498db; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  `]
})
export class SettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private settingsService = inject(SettingsService);

  settingsForm: FormGroup = this.fb.group({
    timeZone: ['', Validators.required],
    currency: ['', Validators.required],
    dateFormat: ['', Validators.required],
    language: ['', Validators.required],
    maxUsers: [{ value: 0, disabled: true }]
  });

  loading = true;
  saving = false;
  error: string | null = null;
  successMessage: string | null = null;

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    this.loading = true;
    this.error = null;
    this.settingsService.getSettings()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (settings) => {
          this.settingsForm.patchValue(settings);
        },
        error: (err) => {
          this.error = 'Não foi possível carregar as configurações.';
        }
      });
  }

  saveSettings() {
    if (this.settingsForm.invalid) return;

    this.saving = true;
    this.error = null;
    this.successMessage = null;

    // Use getRawValue because maxUsers is disabled
    this.settingsService.updateSettings(this.settingsForm.getRawValue())
      .pipe(finalize(() => this.saving = false))
      .subscribe({
        next: () => {
          this.successMessage = 'Configurações atualizadas com sucesso!';
          setTimeout(() => this.successMessage = null, 5000);
        },
        error: (err) => {
          this.error = 'Erro ao salvar alterações.';
        }
      });
  }
}
