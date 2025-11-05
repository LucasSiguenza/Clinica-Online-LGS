import { Component, inject } from '@angular/core';
import { Utils } from '../../services/util';
import { AuthSupabase } from '../../services/auth-supabase';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  //! ====================== Variables y servicios ======================
  protected utilSvc = inject(Utils);
  protected authSvc = inject(AuthSupabase);


  //! ====================== Métodos de botones ======================

  async cerrarSesion(){
    try{
      this.utilSvc.mostrarLoading();
      await this.authSvc.cerrarSesion();
      this.utilSvc.mostrarToast("Sesión cerrada con éxito", 'success','center',1500)
      this.utilSvc.redirigir('');
      this.utilSvc.ocultarLoading();
    } catch(e){
      this.utilSvc.mostrarToast("Hubo un error", 'error','center',1500);
      console.error(e);
      this.utilSvc.ocultarLoading();
    }
  }

  irPanelUsuarios(){
    this.utilSvc.mostrarLoading();
    this.utilSvc.redirigir('/home/control/panel-usuarios');
    this.utilSvc.ocultarLoading();

  }

}
