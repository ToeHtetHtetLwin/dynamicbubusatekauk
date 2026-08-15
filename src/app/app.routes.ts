import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'lovee-me',
    loadComponent: () => import('./lovee-me/lovee-me.component').then(m => m.LoveeMeComponent)
  },
  {
    path: 'not-found',
    loadComponent: () => import('./sorry/sorry.component').then(m => m.SorryComponent)
  },
  {
    path: '',
    redirectTo: 'lovee-me',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'not-found'
  }
];