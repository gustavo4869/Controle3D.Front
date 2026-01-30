import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h1>Entrar no sistema</h1>
        <p>ERP de Impressão 3D</p>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <!-- Email Field -->
          <div class="form-group">
            <label for="email">E-mail</label>
            <input 
              type="email" 
              id="email" 
              formControlName="email" 
              placeholder="seu@email.com"
              [class.invalid]="email?.invalid && email?.touched"
            >
            <div class="error-message" *ngIf="email?.invalid && email?.touched">
              <small *ngIf="email?.errors?.['required']">E-mail é obrigatório</small>
              <small *ngIf="email?.errors?.['email']">E-mail inválido</small>
            </div>
          </div>
          
          <!-- Password Field -->
          <div class="form-group">
            <label for="password">Senha</label>
            <input 
              type="password" 
              id="password" 
              formControlName="password" 
              placeholder="******"
              [class.invalid]="password?.invalid && password?.touched"
            >
            <div class="error-message" *ngIf="password?.invalid && password?.touched">
              <small *ngIf="password?.errors?.['required']">Senha é obrigatória</small>
              <small *ngIf="password?.errors?.['minlength']">Senha deve ter no mínimo 6 caracteres</small>
            </div>
          </div>

          <!-- Remember Me -->
          <div class="form-group-checkbox">
            <label>
              <input type="checkbox" formControlName="rememberMe">
              <span>Lembrar-me</span>
            </label>
          </div>

          <!-- Error Message from API -->
          <div class="alert alert-error" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <!-- Submit Button -->
          <button 
            type="submit" 
            class="btn-login" 
            [disabled]="loginForm.invalid || isLoading"
          >
            <span *ngIf="!isLoading">Entrar</span>
            <span *ngIf="isLoading">Entrando...</span>
          </button>
        </form>
        
        <p class="info-text">
          <strong>Desenvolvimento:</strong> Use qualquer email/senha para simular login (API mock).
        </p>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 2rem;
    }
    .login-card {
      background: white;
      padding: 2.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 400px;
    }
    h1 { 
      margin-bottom: 0.5rem; 
      color: #2c3e50; 
      font-size: 1.8rem;
    }
    p { 
      margin-bottom: 2rem; 
      color: #7f8c8d; 
    }
    .form-group { 
      margin-bottom: 1.5rem; 
    }
    label { 
      display: block; 
      margin-bottom: 0.5rem; 
      font-weight: bold; 
      color: #34495e; 
    }
    input[type="email"],
    input[type="password"] { 
      width: 100%; 
      padding: 0.75rem; 
      border: 1px solid #ddd; 
      border-radius: 4px; 
      box-sizing: border-box;
      font-size: 1rem;
      transition: border-color 0.3s;
    }
    input:focus {
      outline: none;
      border-color: #3498db;
    }
    input.invalid {
      border-color: #e74c3c;
    }
    .error-message {
      margin-top: 0.25rem;
    }
    .error-message small {
      color: #e74c3c;
      font-size: 0.85rem;
    }
    .form-group-checkbox {
      margin-bottom: 1.5rem;
    }
    .form-group-checkbox label {
      display: flex;
      align-items: center;
      font-weight: normal;
      cursor: pointer;
    }
    .form-group-checkbox input[type="checkbox"] {
      margin-right: 0.5rem;
      cursor: pointer;
    }
    .alert {
      padding: 0.75rem;
      border-radius: 4px;
      margin-bottom: 1rem;
    }
    .alert-error {
      background-color: #fee;
      color: #c33;
      border: 1px solid #fcc;
    }
    .btn-login { 
      width: 100%; 
      padding: 0.75rem; 
      background-color: #3498db; 
      color: white; 
      border: none; 
      border-radius: 4px; 
      font-size: 1rem; 
      cursor: pointer; 
      transition: background 0.3s;
      font-weight: bold;
    }
    .btn-login:hover:not(:disabled) { 
      background-color: #2980b9; 
    }
    .btn-login:disabled {
      background-color: #95a5a6;
      cursor: not-allowed;
    }
    .info-text { 
      margin-top: 1.5rem; 
      font-size: 0.85rem; 
      color: #7f8c8d;
      text-align: center;
    }
  `]
})
export class LoginComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  loginForm!: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  returnUrl: string = '/dashboard';

  ngOnInit(): void {
    // Initialize form
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    // Get return URL from route parameters
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    // Subscribe to auth errors
    this.authService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        this.errorMessage = error;
        this.isLoading = false;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const { email, password, rememberMe } = this.loginForm.value;

    this.authService.login({ email, password }, rememberMe)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Success - AuthService handles navigation
          this.isLoading = false;
        },
        error: () => {
          // Error is handled by AuthService error$ observable
          this.isLoading = false;
        }
      });
  }

  // Getters for template
  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
