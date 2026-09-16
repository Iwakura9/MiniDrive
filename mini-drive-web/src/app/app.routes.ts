import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./login/login').then((m) => m.Login) },
  { path: 'files', canActivate: [authGuard], loadComponent: () => import('./files/files').then((m) => m.Files) },
  { path: '', pathMatch: 'full', redirectTo: 'files' },
  { path: '**', redirectTo: 'files' },
];
