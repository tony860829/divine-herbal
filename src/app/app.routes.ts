import { Routes } from '@angular/router';
import { recipeAccessGuard } from './guards/recipe-access.guard';
import { paymentGuard } from './guards/payment.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((c) => c.Home),
    title: 'Divine Herbal Remedies - Nature Heals, Faith Restores',
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/auth').then((c) => c.Auth),
    title: 'Login - Divine Herbal Remedies',
  },
  {
    path: 'contact',
    loadComponent: () => import('./components/contact/contact').then((c) => c.Contact),
    title: 'Contact - Divine Herbal Remedies',
  },
  {
    path: 'payment',
    loadComponent: () => import('./components/payment/payment').then((c) => c.Payment),
    title: 'Payment - Divine Herbal Remedies',
    canActivate: [paymentGuard],
  },
  {
    path: 'remedies',
    loadComponent: () => import('./pages/remedies/remedies').then((c) => c.Remedies),
    title: 'Remedies - Divine Herbal Remedies',
    canActivate: [recipeAccessGuard],
  },
  {
    path: 'categories',
    loadComponent: () => import('./pages/categories/categories').then((c) => c.Categories),
    title: 'Categories - Divine Herbal Remedies',
    canActivate: [recipeAccessGuard],
  },
  { path: '**', redirectTo: '' },
];
