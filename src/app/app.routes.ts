import { Routes } from '@angular/router';
import { Login } from './pages/auth/login/login';
import { Home } from './pages/home/home';
import { Register } from './pages/auth/register/register';
import { PanelDeUsuario } from './pages/home/control/panel-de-usuario/panel-de-usuario';
import { PanelDeTurnos } from './pages/home/control/panel-de-turnos/panel-de-turnos';

export const routes: Routes = [
    { path: '', redirectTo: 'auth/login',  pathMatch: 'full' },
    { path: 'auth/register', component: Register},
    { path: 'auth/login', component: Login },
    { path: 'home', component: Home },
    { path: 'home/control/panel-usuarios', component:PanelDeUsuario},
    { path: 'home/control/panel-turnos', component:PanelDeTurnos},
];
