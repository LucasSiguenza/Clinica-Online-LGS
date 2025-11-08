import { afterNextRender, afterRenderEffect, Component, computed, inject, signal, ViewChild, ViewContainerRef } from '@angular/core';
import { MatDialog } from "@angular/material/dialog";
import { CardUsuario } from "../../../../components/elementos/card-usuario/card-usuario";
import { UserSupabase } from '../../../../services/user-supabase';
import { Usuario } from '../../../../models/Usuario';
import { Header } from "../../../../components/header/header";
import { FormularioAltaUsuario } from '../../../../components/formulario-alta-usuario/formulario-alta-usuario';
import { Utils } from '../../../../services/util';

@Component({
  selector: 'app-panel-de-usuario',
  imports: [CardUsuario, Header],
  templateUrl: './panel-de-usuario.html',
  styleUrl: './panel-de-usuario.scss'
})
export class PanelDeUsuario {
  //! ================= Declaración de variables y servicios =================
  private utilSvc = inject(Utils)
  private userSvc = inject(UserSupabase);
  protected listaUsuarios = computed(() =>{
    const lista = this.userSvc.listaUsuarios(); 
    return (lista ?? []).sort((a, b) => Number(a.id) - Number(b.id));
  });
  private matDialog = inject(MatDialog)
  ngOnInit(): void {
    this.userSvc.cargarListado();
  }
  
  //! ================= Elementos de paginación =================
  constructor() {
    afterRenderEffect(() => {
       setTimeout(() =>{}, 600);
    });
  }

  pagina = signal(1);
  tamañoPagina = 2;

  get listaPaginada(): Usuario[]{
    const inicio = (this.pagina() - 1) * this.tamañoPagina;
    return this.listaUsuarios().slice(inicio, inicio + this.tamañoPagina);
  }
  
  paginasTotales(): number {
    return Math.ceil(this.listaUsuarios().length / this.tamañoPagina);
  }
  
  nextPage() {
    if (this.pagina() < this.paginasTotales()) {
      this.utilSvc.mostrarLoading();

      queueMicrotask(() => {
        this.pagina.set(this.pagina() + 1);

        setTimeout(() => {
          this.utilSvc.ocultarLoading();
        }, 350);
      });
    }
  }
    
  prevPage() {
    if (this.pagina() > 1) {
      this.utilSvc.mostrarLoading();

      queueMicrotask(() => {
        this.pagina.set(this.pagina() - 1);
        setTimeout(() => {
          this.utilSvc.ocultarLoading();
        }, 350);
      });
    }
  }
  
  //! ================= Métodos de control =================
  
  openModal() {
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

 async añadirUsuario(){
    
  }
}
