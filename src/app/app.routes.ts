import { Routes } from '@angular/router';
import { recipeAccessGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.Home),
    title: 'Divine Herbal Remedies - Nature Heals, Faith Restores'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/auth').then((c) => c.Auth),
    title: 'Login - Divine Herbal Remedies'
  },
  {
    path: 'remedies',
    loadComponent: () => import('./pages/remedies/remedies').then(m => m.Remedies),
    title: 'Remedies - Divine Herbal Remedies',
    canActivate: [recipeAccessGuard],
  },
  {
    path: 'categories',
    loadComponent: () => import('./pages/categories/categories').then(m => m.Categories),
    title: 'Categories - Divine Herbal Remedies',
    canActivate: [recipeAccessGuard],
  },
  { path: '**', redirectTo: '' }
];