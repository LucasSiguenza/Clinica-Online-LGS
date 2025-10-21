import { Routes } from '@angular/router';
import { Login } from './pages/auth/login/login';
import { Home } from './pages/home/home';
import { Register } from './pages/auth/register/register';

export const routes: Routes = [
    { path: '', redirectTo: 'auth/login',  pathMatch: 'full' },
    { path: 'auth/register', component: Register},
    { path: 'auth/login', component: Login },
    { path: 'home', component: Home },
];
