import { computed, Directive, effect, input, output, signal } from '@angular/core';

@Directive({
  selector: '[appSelectorDiaSemana]'
})
export class SelectorDiaSemana {

  mes = input.required<number>();
  anio = input.required<number>();

  diaSeleccionado = signal<number | null>(null);

  readonly fechas = computed( () => {
    const mes = this.mes();
    const anio = this.anio();
    const dia = this.diaSeleccionado()

    if(dia === null) return [];

    const fechas: Date[] = []
    const fecha = new Date(anio, mes-1, 1);

    while(fecha.getMonth() === mes -1){
      if(fecha.getDay() === dia) fechas.push(new Date(fecha));
      fecha.setDate(fecha.getDate() + 1)
    }

    return fechas;

  });

  //? Variable que almacena la emisión de fechas ante los cambios de día
  cambios = output<Date[]>();

  constructor(){
    effect( () => {
      const dias = this.fechas();
      if(dias.length > 0) this.cambios.emit(dias);
     })
  }

  seleccionarDia(dia: number){
    console.log(dia, this.mes, this.anio)
    this.diaSeleccionado.set(dia);
  }
}
