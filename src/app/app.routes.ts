import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'lovee-me',
    loadComponent: () => import('./lovee-me/lovee-me.component').then(m => m.LoveeMeComponent)
  },
  {
    path: '',
    redirectTo: 'lovee-me',
    pathMatch: 'full'
  }
];