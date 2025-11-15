import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fechaHorario'
})
export class FechaHorarioPipe implements PipeTransform {


  transform(value: unknown): string {
    if (!value) return 'Fecha inválida';

    const fecha = new Date(value as string);

    if (isNaN(fecha.getTime())) return 'Fecha inválida';

    // Día / Mes / Año
    const fechaFormateada = new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(fecha);

    // Hora y minutos (24h)
    const horaFormateada = new Intl.DateTimeFormat('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(fecha);

    return `El día ${fechaFormateada} a las ${horaFormateada}`;
  }
}
