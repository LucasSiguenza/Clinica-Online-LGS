import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fechaFormato',
  standalone: true
})
export class FechaFormatoPipe implements PipeTransform {

  transform(value: Date): string {
    if (!(value instanceof Date)) return '';

    const dias = [
      'Domingo', 'Lunes', 'Martes', 'Miércoles',
      'Jueves', 'Viernes', 'Sábado'
    ];

    const diaNombre = dias[value.getDay()];
    const dia = value.getDate();
    const mes = value.getMonth() + 1;

    return `${diaNombre} ${dia}/${mes}`;
  }
}
