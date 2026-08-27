import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.Home),
    title: 'Divine Herbal Remedies - Nature Heals, Faith Restores'
  },
  {
    path: 'remedies',
    loadComponent: () => import('./pages/remedies/remedies').then(m => m.Remedies),
    title: 'Remedies - Divine Herbal Remedies'
  },
  {
    path: 'categories',
    loadComponent: () => import('./pages/categories/categories').then(m => m.Categories),
    title: 'Categories - Divine Herbal Remedies'
  },
  { path: '**', redirectTo: '' }
];