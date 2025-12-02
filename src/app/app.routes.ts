import { Routes } from '@angular/router';
import { Login } from './pages/auth/login/login';
import { Home } from './pages/home/home';
import { Register } from './pages/auth/register/register';
import { PanelDeUsuario } from './pages/home/control/panel-de-usuario/panel-de-usuario';
import { PanelDeTurnos } from './pages/home/control/panel-de-turnos/panel-de-turnos';
import { PanelEncuesta } from './pages/home/control/panel-encuesta/panel-encuesta';
import { FormTurno } from './components/form-turno/form-turno';
import { sesionUsuarioGuard } from './guards/sesion-usuario-guard';
import { adminGuard } from './guards/admin-guard';

export const routes: Routes = [
    { path: '', redirectTo: 'auth/login',  pathMatch: 'full' },
    { path: 'auth/register', component: Register},
    { path: 'auth/login', component: Login, canActivate: [sesionUsuarioGuard] },
    { path: 'home', component: Home, canActivate: [sesionUsuarioGuard] },
    { path: 'home/control/panel-usuarios', component:PanelDeUsuario, canActivate: [sesionUsuarioGuard,adminGuard]},
    { path: 'home/control/panel-turnos', component:PanelDeTurnos, canActivate: [sesionUsuarioGuard]},
    { path: 'home/control/panel-encuestas', component:PanelEncuesta, canActivate: [sesionUsuarioGuard]},
    { path: 'test', component:FormTurno, canActivate: [sesionUsuarioGuard]}
];
