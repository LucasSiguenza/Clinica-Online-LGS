import { afterRenderEffect, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Header } from "../../../../components/header/header";
import { TurnosSupabase } from '../../../../services/turnos-supabase';
import { Utils } from '../../../../services/util';
import { Turno } from '../../../../models/Turno';
import { FechaHorarioPipe } from '../../../../pipes/fecha-horario-pipe';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-panel-de-turnos',
  imports: [FormsModule, Header, FechaHorarioPipe, TitleCasePipe],
  templateUrl: './panel-de-turnos.html',
  styleUrl: './panel-de-turnos.scss'
})
export class PanelDeTurnos {
 
  private turnoSvc = inject(TurnosSupabase);
  private utilSvc = inject(Utils);


  protected listaTurnos = computed(() => {
    const lista = this.turnoSvc.listaTurnos();
    return (lista ?? []).sort((a, b) => Number(a.id) - Number(b.id));
  });

  pagina = signal(1);
  tamañoPagina = 6; // 3 por fila → dos filas visibles

  get listaPaginada(): Turno[] {
    const inicio = (this.pagina() - 1) * this.tamañoPagina;
    return this.listaTurnos().slice(inicio, inicio + this.tamañoPagina);
  }

  paginasTotales(): number {
    return Math.ceil(this.listaTurnos().length / this.tamañoPagina);
  }

  constructor() {
    afterRenderEffect(() => {
      setTimeout(() => {}, 600);
    });
  }

  ngOnInit(): void {
    this.turnoSvc.cargarLista();
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
}
