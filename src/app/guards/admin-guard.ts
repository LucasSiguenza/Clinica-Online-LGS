import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Utils } from '../services/util';
import { AuthSupabase } from '../services/auth-supabase';

export const adminGuard: CanActivateFn = (route, state) => {
  
  //! ======================== Servicios y variables ========================
  const utilSvc = inject(Utils);
  const authSvc = inject(AuthSupabase);
  
  //! ======================== Módulo de control ========================

  if(authSvc.usuarioActual()?.perfil === 'admin') return true
  else{
    utilSvc.mostrarAlert({
      text: 'Sólo el administrador puede ingresar',
      icon: 'error',
      title: 'Error de autenticacón',
      theme: 'dark'
    })
    return false
  }

};
