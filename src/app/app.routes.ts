import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'lovee-me',
    loadComponent: () => import('./lovee-me/lovee-me.component').then(m => m.LoveeMeComponent)
  },
  {
    // ID နဲ့ သွားချင်ရင် path parameter ကို အခုလို သုံးပေးပါ
    path: 'lovee-me/:id',
    loadComponent: () => import('./lovee-me/lovee-me.component').then(m => m.LoveeMeComponent)
  },
  {
    path: 'not-found',
    loadComponent: () => import('./sorry/sorry.component').then(m => m.SorryComponent)
  },
  {
    // localhost:4200 (path အလွတ်) နဲ့ ဝင်လာရင် not-found သို့ ညွှန်မည်
    path: '',
    redirectTo: 'not-found',
    pathMatch: 'full'
  },
  {
    // မရှိတဲ့ URL path တိုင်းကို not-found သို့ ညွှန်မည်
    path: '**',
    redirectTo: 'not-found'
  }
];