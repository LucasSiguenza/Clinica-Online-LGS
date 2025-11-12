import { Component, inject, Input } from '@angular/core';
import { Usuario } from '../../../models/Usuario';
import { FormatoEstadoPipe } from '../../../pipes/formato-estado-pipe';
import { CarruselPersonalizado } from "../carrusel-personalizado/carrusel-personalizado";
import { Utils } from '../../../services/util';
import { UserSupabase } from '../../../services/user-supabase';
import { MatDialog } from '@angular/material/dialog';
import { FormularioAltaUsuario } from '../../formulario-alta-usuario/formulario-alta-usuario';
import { VerDetallesUsuario } from '../../ver-detalles-usuario/ver-detalles-usuario';

@Component({
  selector: 'app-card-usuario',
  imports: [FormatoEstadoPipe, CarruselPersonalizado],
  templateUrl: './card-usuario.html',
  styleUrl: './card-usuario.scss'
})

export class CardUsuario {
  //! ======================= Variables y servicios =======================
  @Input({ required: true }) usuario!: Usuario;

  private matDialog = inject(MatDialog)
  private utilSvc = inject(Utils)
  private userSvc = inject(UserSupabase);


  //! ======================= Métodos de botones =======================

  async aprobarUsuario(usr: Usuario){
    this.utilSvc.mostrarLoading();
    usr.estado = true;
    await this.userSvc.actualizarUsuario(usr);
    this.utilSvc.ocultarLoading();
  }

  async editarUsuario(usr: Usuario){
  
    this.userSvc.setUsuarioSeleccionado(usr);
     const dialogRef = this.matDialog.open(FormularioAltaUsuario, {
        width: "100vw",
        height: "100vh",
        disableClose: true,  
        autoFocus: true,     
      });
    dialogRef.afterClosed().subscribe(() => {
    this.userSvc.deseleccionarUsuario();
  });    
  }

  async eliminarUsuario(usr: Usuario){

    this.utilSvc.mostrarAlert({
      title: '¿Estás seguro que deseas eliminar este usuario?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        this.utilSvc.mostrarLoading();
        await this.userSvc.eliminarUsuario(usr);
        this.utilSvc.mostrarToast('Usuario eliminado', 'info','center',1500);       
        this.utilSvc.ocultarLoading();
      } else if (result.isDismissed) {
        this.utilSvc.mostrarToast('Acción cancelada', 'success','center',1500);       
      }
    });
  }

  async verDetalles(usr: Usuario){
    this.userSvc.setUsuarioSeleccionado(usr);
    this.matDialog.open(VerDetallesUsuario, {
      width: '25vw',
      height: '78vh', 
      
    });
  }
}
