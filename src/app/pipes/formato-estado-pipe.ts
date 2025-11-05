import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatoEstado'
})
export class FormatoEstadoPipe implements PipeTransform {

  transform(estado: string | boolean | undefined): string {
    let estadoBool: boolean = false;
    if(estado === undefined) return 'Uso indebido';

    if(estado === 'true') estadoBool = true;
    if(estado === 'false') estadoBool = false;
    
    
    if(estadoBool) return 'Aprobado.';
    else return 'En espera.'
  }

}
