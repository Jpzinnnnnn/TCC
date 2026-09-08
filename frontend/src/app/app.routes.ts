import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Cardapio } from './cardapio/cardapio';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'cardapio', component: Cardapio },
];