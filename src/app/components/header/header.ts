import { Component, inject } from '@angular/core';
import { Utils } from '../../services/util';
import { AuthSupabase } from '../../services/auth-supabase';
import { UserSupabase } from '../../services/user-supabase';
import { MatDialog } from '@angular/material/dialog';
import { FormularioAltaUsuario } from '../formulario-alta-usuario/formulario-alta-usuario';

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
  private userSvc = inject(UserSupabase);
  private matDialog = inject(MatDialog)
  menuAbierto = false;


  //! ====================== Métodos de botones ======================

  async cerrarSesion() {
    try {
      this.utilSvc.mostrarLoading();
      await new Promise(r => setTimeout(r, 1500)); // espera 1.5s reales
      await this.authSvc.cerrarSesion();
      this.utilSvc.mostrarToast("Sesión cerrada con éxito", 'success', 'center', 1500);
      this.utilSvc.redirigir('');
    } catch (e) {
      this.utilSvc.mostrarToast("Hubo un error", 'error', 'center', 1500);
      console.error(e);
    } finally {
      this.utilSvc.ocultarLoading();
    }
}

  async irPanelUsuarios(){
   try{
     this.utilSvc.mostrarLoading();
     await new Promise(r => setTimeout(r, 500)); // espera 1.5s reales
     this.utilSvc.redirigir('/home/control/panel-usuarios');
     this.utilSvc.ocultarLoading();
   }
  finally {
      this.utilSvc.ocultarLoading();
    }

  }

  async irPanelTurnos() {

    this.utilSvc.mostrarLoading();
    try {
      await new Promise(r => setTimeout(r, 700)); // espera 700 ms
      this.utilSvc.redirigir('/home/control/panel-turnos');
    } catch (e) {
      console.error(e);
      this.utilSvc.mostrarToast("No se pudo abrir el panel de turnos", 'error', 'center', 1500);
    } finally {
      this.utilSvc.ocultarLoading();
    }
  }

  async irPanelEncuestas() {
    this.utilSvc.mostrarLoading();

  try {
    await new Promise(r => setTimeout(r, 700)); // espera 700 ms

      // Se ejecuta en un microtask para evitar bloqueos en la navegación
      queueMicrotask(() => {
        this.utilSvc.redirigir('/home/control/panel-encuestas');
      });
    } catch (e) {
      console.error(e);
      this.utilSvc.mostrarToast("No se pudo abrir el panel de encuestas", 'error', 'center', 1500);
    } finally {
      // Garantiza que se oculte tras el frame siguiente, incluso si redirigir es síncrono
      setTimeout(() => this.utilSvc.ocultarLoading(), 300);
    }
  }

  async irMiPerfil() {
    this.userSvc.setUsuarioSeleccionado(this.authSvc.usuarioActual()!);
      this.matDialog.open(FormularioAltaUsuario, {
          width: '100%',
          height: '100%',
          maxWidth: '100vw',
          maxHeight: '100vh',
          panelClass: 'full-screen-dialog',
          disableClose: true,
          autoFocus: false,
        });
      }
}
