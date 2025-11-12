import { Component, inject, Input } from '@angular/core';
import { Usuario } from '../../models/Usuario';
import { UserSupabase } from '../../services/user-supabase';
import { TitleCasePipe } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { CarruselPersonalizado } from "../elementos/carrusel-personalizado/carrusel-personalizado";

@Component({
  selector: 'app-ver-detalles-usuario',
  imports: [TitleCasePipe, CarruselPersonalizado],
  templateUrl: './ver-detalles-usuario.html',
  styleUrl: './ver-detalles-usuario.scss'
})
export class VerDetallesUsuario {
  private dialogCtrl = inject(MatDialogRef);
  private userSvc = inject(UserSupabase);
  protected usuario = this.userSvc.getUsuarioSeleccionado()!;

  cerrarDialog(){
    this.userSvc.deseleccionarUsuario();
    this.dialogCtrl.close();

  }
}
