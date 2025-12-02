import { Component, inject, input, output } from '@angular/core';
import { SelectorDiaSemana } from '../../../directivas/selector-dia-semana';

@Component({
  selector: 'app-diasamana-selector-radios',
  imports: [],
  hostDirectives: [{
    directive: SelectorDiaSemana,
    outputs: ['cambios']          //! Retorno de fechas
  }],
  templateUrl: './diasamana-selector-radios.html',
  styleUrl: './diasamana-selector-radios.scss'
})
export class DiasamanaSelectorRadios {
  
  selectorDirect = inject(SelectorDiaSemana);
  
  readonly dia = output<number>();

  dias = [
    { nombre: 'Lunes', valor: 1 },
    { nombre: 'Martes', valor: 2 },
    { nombre: 'Miércoles', valor: 3 },
    { nombre: 'Jueves', valor: 4 },
    { nombre: 'Viernes', valor: 5 },
    { nombre: 'Sábado', valor: 6 },
  ];

  seleccionar(valor: number) {
    this.selectorDirect.seleccionarDia(valor);
    this.dia.emit(valor);
  }
}
