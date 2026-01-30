import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { NotFoundComponent } from './features/not-found/not-found.component';
import { authGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './shared/layouts/main-layout/main-layout.component';
import { SettingsComponent } from './features/settings/settings.component';
import { CustomerListComponent } from './features/customers/customer-list/customer-list.component';
import { CustomerFormComponent } from './features/customers/customer-form/customer-form.component';
import { MachineListComponent } from './features/machines/machine-list/machine-list.component';
import { MachineFormComponent } from './features/machines/machine-form/machine-form.component';
import { FilamentListComponent } from './features/filaments/filament-list/filament-list.component';
import { FilamentFormComponent } from './features/filaments/filament-form/filament-form.component';
import { FilamentDetailComponent } from './features/filaments/filament-detail/filament-detail.component';
import { QuoteListComponent } from './features/quotes/quote-list/quote-list.component';
import { QuoteFormComponent } from './features/quotes/quote-form/quote-form.component';
import { OrderListComponent } from './features/orders/order-list/order-list.component';
import { OrderDetailComponent } from './features/orders/order-detail/order-detail.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'dashboard',
                component: DashboardComponent,
                canActivate: [authGuard]
            },
            {
                path: 'settings',
                component: SettingsComponent,
                canActivate: [authGuard]
            },
            {
                path: 'customers',
                children: [
                    { path: '', component: CustomerListComponent },
                    { path: 'new', component: CustomerFormComponent },
                    { path: 'edit/:id', component: CustomerFormComponent }
                ],
                canActivate: [authGuard]
            },
            {
                path: 'machines',
                children: [
                    { path: '', component: MachineListComponent },
                    { path: 'new', component: MachineFormComponent },
                    { path: 'edit/:id', component: MachineFormComponent }
                ],
                canActivate: [authGuard]
            },
            {
                path: 'filaments',
                canActivate: [authGuard],
                children: [
                    { path: '', component: FilamentListComponent },
                    { path: 'new', component: FilamentFormComponent },
                    { path: 'edit/:id', component: FilamentFormComponent },
                    { path: ':id', component: FilamentDetailComponent }
                ]
            },
            {
                path: 'quotes',
                canActivate: [authGuard],
                children: [
                    { path: '', component: QuoteListComponent },
                    { path: 'new', component: QuoteFormComponent },
                    { path: ':id', component: QuoteFormComponent }
                ]
            },
            {
                path: 'orders',
                canActivate: [authGuard],
                children: [
                    { path: '', component: OrderListComponent },
                    { path: ':id', component: OrderDetailComponent }
                ]
            }
        ]
    },
    { path: '**', component: NotFoundComponent }
];
