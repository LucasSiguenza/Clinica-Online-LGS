import { computed, Directive, effect, input, output, signal } from '@angular/core';

@Directive({
  selector: '[appSelectorDiaSemana]'
})
export class SelectorDiaSemana {

  
  private hoy = new Date();

  diaSeleccionado = signal<number | null>(null);

  //^ Computed que genera las fechas del día elegido en los próximos 15 días
  readonly fechas = computed(() => {
    const dia = this.diaSeleccionado();
    if (dia === null) return [];

    const fechas: Date[] = [];
    const inicio = new Date(this.hoy);
    const fin = new Date(this.hoy);
    fin.setDate(fin.getDate() + 15);

    const cursor = new Date(inicio);

    while (cursor <= fin) {
      if (cursor.getDay() === dia) {
        fechas.push(new Date(cursor));
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    return fechas;
  });

  cambios = output<Date[]>();

  constructor() {
    effect(() => {
      const lista = this.fechas();
      if (lista.length) this.cambios.emit(lista);
    });
  }

  seleccionarDia(dia: number) {
    this.diaSeleccionado.set(dia);
  }
}
