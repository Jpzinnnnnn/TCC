import { Routes } from '@angular/router';

import { Home } from './home/home';
import { Cardapio } from './cardapio/cardapio';
import { Avisos } from './avisos/avisos';
import { Calendario } from './calendario/calendario';
import { Sobre } from './sobre/sobre';
import { Login } from './login/login';

import { InicioAdmin } from './admin/inicio-admin/inicio-admin';
import { adminGuard } from './admin.guard';

import { CardapioAdmin } from './admin/cardapio-admin/cardapio-admin';
import { AvisosAdmin } from './admin/avisos-admin/avisos-admin';
import { CalendarioAdmin } from './admin/calendario-admin/calendario-admin';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  { path: 'home', component: Home },
  { path: 'cardapio', component: Cardapio },
  { path: 'avisos', component: Avisos },
  { path: 'calendario', component: Calendario },
  { path: 'sobre', component: Sobre },

  { path: 'admin', component: Login, pathMatch: 'full' },

  {
    path: 'admin/inicio',
    component: InicioAdmin,
    canActivate: [adminGuard],
  },
  {
    path: 'admin/cardapio',
    component: CardapioAdmin,
    canActivate: [adminGuard],
  },
  {
    path: 'admin/avisos',
    component: AvisosAdmin,
    canActivate: [adminGuard],
  },
  {
    path: 'admin/calendario',
    component: CalendarioAdmin,
    canActivate: [adminGuard],
  },

  {
    path: 'admin/sobre',
    component: Sobre,
    canActivate: [adminGuard],
    data: { administrativo: true },
  },
];