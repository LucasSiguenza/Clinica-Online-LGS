import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthSupabase } from '../services/auth-supabase';
import { Utils } from '../services/util';
import { SupabaseUtils } from '../services/supabase-utils';
import { Usuario } from '../models/Usuario';

export const sesionUsuarioGuard: CanActivateFn = async (route, state) => {
  const authSvc = inject(AuthSupabase);
  const utilSvc = inject(Utils);
  const sbUtils = inject(SupabaseUtils);

  try {
    utilSvc.mostrarLoading()
    const id = await authSvc.recuperarSesion();
    if(authSvc.usuarioActual() === null){
      const usr:Usuario = await sbUtils.adquirirFila('usuarios', 'uid', id!) as Usuario
      authSvc.usuarioActual.set(usr);
    }

    if(authSvc.usuarioActual()?.estado === 'false'){
      utilSvc.mostrarAlert({
        text: 'Usted está en espera de aprobación.',
        title: 'Lo sentimos',
        icon: 'warning',
        theme: 'dark'
      })
      authSvc.cerrarSesion();
      utilSvc.ocultarLoading()
      return false
    }

    // Si es el primer ingreso
    if (authSvc.isPrimerIngreso()) {
      utilSvc.mostrarAlert({
        text: `¡Bienvenido de nuevo, ${authSvc.usuarioActual()?.nombre} ${authSvc.usuarioActual()?.apellido}!`,
        title: 'Nos alegra verte de nuevo',
        icon: 'success',
        theme: 'dark',
      });
      
      authSvc.isPrimerIngreso.set(false);
      if (state.url !== '/home' && !(state.url.includes('home'))) {
        utilSvc.ocultarLoading();
        return utilSvc.crearUrlTree('/home');
      }

      utilSvc.ocultarLoading();
      return true;

    }
    utilSvc.ocultarLoading();
    return true;

  } catch {
    if (state.url !== '/auth/login') {
      utilSvc.mostrarAlert({
        text: 'Tu sesión ha expirado',
        title: 'Lo sentimos :(',
        icon: 'error',
        theme: 'dark'
      });
      utilSvc.ocultarLoading();
      return utilSvc.crearUrlTree('/auth/login');
    }
    utilSvc.ocultarLoading();
    return true;
  }

};
