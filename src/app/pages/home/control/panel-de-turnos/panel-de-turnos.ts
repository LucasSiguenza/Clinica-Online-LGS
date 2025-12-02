import { afterRenderEffect, Component, computed, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Header } from "../../../../components/header/header";
import { TurnosSupabase } from '../../../../services/turnos-supabase';
import { Utils } from '../../../../services/util';
import { Turno } from '../../../../models/Turno';
import { FechaHorarioPipe } from '../../../../pipes/fecha-horario-pipe';
import { TitleCasePipe } from '@angular/common';
import { AuthSupabase } from '../../../../services/auth-supabase';
import { Empleado } from '../../../../models/Empleado';
import { MatDialog } from '@angular/material/dialog';
import { FormTurno } from '../../../../components/form-turno/form-turno';
import { BotonPersonalizado } from "../../../../components/elementos/boton-personalizado/boton-personalizado";
import { GenPdfHistTurnos } from '../../../../directivas/gen-pdf-hist-turnos';

@Component({
  selector: 'app-panel-de-turnos',
  imports: [FormsModule, Header, FechaHorarioPipe,
     TitleCasePipe, BotonPersonalizado, GenPdfHistTurnos],
  templateUrl: './panel-de-turnos.html',
  styleUrl: './panel-de-turnos.scss'
})
export class PanelDeTurnos {
  
  //! ======================== Variables y servicios ========================
  @ViewChild(GenPdfHistTurnos)
  private pdfDirective!: GenPdfHistTurnos
  private dialogCtrl = inject(MatDialog);
  private authSvc = inject(AuthSupabase);
  private turnoSvc = inject(TurnosSupabase);
  private utilSvc = inject(Utils);
  private listados!: [Empleado[], string[]];
  
  protected usuarioActual = this.authSvc.usuarioActual()!
  
  //! ======================== Signals ========================
  private empleados= signal<Empleado[]>([]);
  protected listaTurnos = computed(() => {
    const lista = this.turnoSvc.listaTurnos();
    if(this.usuarioActual.perfil === 'cliente'){
      return (lista ?? []).filter((turno) => turno.paciente === this.usuarioActual.id)
    }
    if( this.usuarioActual.perfil === 'empleado'){
      const empleadoActual = this.empleados().find(
          emp => emp.idEmpleado === this.usuarioActual.id
      );
      if (!empleadoActual) return [];
      console.log(empleadoActual.id)
      return lista.filter(t => t.empleado === empleadoActual.id);    
    }
    return (lista ?? []).sort((a, b) => Number(a.id) - Number(b.id));
  });
  
  async ngOnInit(): Promise<void> {
    this.utilSvc.mostrarLoading()
    this.listados = await this.turnoSvc.recuperarListados();
    this.empleados.set(this.listados[0]  ?? []);

    await this.turnoSvc.cargarLista();
    this.utilSvc.ocultarLoading();
  }

  //! ======================== Constructor ========================

  constructor() {
    afterRenderEffect(() => {
      setTimeout(() => {}, 600);
    });
  }
  
  //! ======================== Elementos de paginación ========================
  
  pagina = signal(1);
  tamañoPagina = 2; 
  
  get listaPaginada(): Turno[] {
    const inicio = (this.pagina() - 1) * this.tamañoPagina;
      return this.listaTurnos().slice(inicio, inicio + this.tamañoPagina);
    }
  
    paginasTotales(): number {
      return Math.ceil(this.listaTurnos().length / this.tamañoPagina);
    }
    
    nextPage() {
      if (this.pagina() < this.paginasTotales()) {
        this.utilSvc.mostrarLoading();
        
        queueMicrotask(() => {
        this.pagina.set(this.pagina() + 1);
        setTimeout(() => this.utilSvc.ocultarLoading(), 350);
      });
    }
  }
  
  prevPage() {
    if (this.pagina() > 1) {
      this.utilSvc.mostrarLoading();
      
      queueMicrotask(() => {
        this.pagina.set(this.pagina() - 1);
        setTimeout(() => this.utilSvc.ocultarLoading(), 350);
      });
    }
  }
  //! ======================== Métodos de botones ========================

  abrirEdicion(t: Turno){
    this.turnoSvc.turnoSeleccionado.set(t);
    this.dialogCtrl.open(FormTurno, {
      width: 'min(90vw, 600px)',
      height: '80vh',
      maxHeight: '80vh',
      panelClass: 'dialog-turno',
      autoFocus: false,
    });
  }


}
