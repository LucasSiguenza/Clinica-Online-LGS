import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mesPipe'
})
export class MesPipePipe implements PipeTransform {

  transform(value: number| string | null): string {
    if(typeof value === 'string') return value;
    if (!value) return '';
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[value - 1];
  }

}
