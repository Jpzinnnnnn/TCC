import { Routes } from '@angular/router';

import { Home } from './home/home';
import { Cardapio } from './cardapio/cardapio';
import { Avisos } from './avisos/avisos';
import { Calendario } from './calendario/calendario';
import { Sobre } from './sobre/sobre';
import { Login } from './login/login';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'cardapio', component: Cardapio },
  { path: 'avisos', component: Avisos },
  { path: 'calendario', component: Calendario },
  { path: 'sobre', component: Sobre },
  { path: 'admin', component: Login },
];