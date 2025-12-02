import { Component, computed, signal, output, input, effect } from '@angular/core';
import { MatTimepickerModule, MatTimepickerOption } from '@angular/material/timepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { MesPipePipe } from '../../../pipes/mes-pipe-pipe';

@Component({
  selector: 'app-turno-input',
  standalone: true,
  imports: [
    MatTimepickerModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    TitleCasePipe,
    MesPipePipe
  ],
  templateUrl: './input-turno.html',
  styleUrls: ['./input-turno.scss']
})
export class InputTurnoComponent {
fecha = input<Date | string | null | undefined>(null);

  dia = signal<number | null>(null);
  mes = signal<number | null>(null);
  hora = signal<string>('09:00');

  fechaCambio = output<Date>();

  constructor() {

    // ESTE effect reacciona SIEMPRE que el padre cambia el input
    effect(() => {
      const f = this.fecha();
      console.log('Fecha actualizada en el hijo:', f);

      if (f instanceof Date) {
        this.dia.set(f.getDate());
        this.mes.set(f.getMonth() + 1);
        this.hora.set(
          `${String(f.getHours()).padStart(2, '0')}:${String(f.getMinutes()).padStart(2, '0')}`
        );
        return;
      }

      if (typeof f === 'string') {
        const fecha = new Date(f);
        if (!isNaN(fecha.getTime())) {
          this.dia.set(fecha.getDate());
          this.mes.set(fecha.getMonth() + 1);
          this.hora.set(
            `${String(fecha.getHours()).padStart(2, '0')}:${String(fecha.getMinutes()).padStart(2, '0')}`
          );
        }
        return;
      }

      // Si es null → limpiar
      if (f == null) {
        this.dia.set(null);
        this.mes.set(null);
        this.hora.set('09:00');
      }
    });
  }
  /** Día de la semana calculado dinámicamente */
  diaSemana = computed(() => {
    const d = this.dia();
    const m = this.mes();
    if (!d || !m) return '';
    const fecha = new Date(2025, m - 1, d);
    return fecha.toLocaleDateString('es-AR', { weekday: 'long' });
  });

  /** Fecha completa calculada y emitida automáticamente */
  fechaCompleta = computed(() => {
    const d = this.dia();
    const m = this.mes();
    const h = this.hora();

    if (!d || !m || !h) return null;

    const [hh, mm] = h.split(':').map(Number);
    const fecha = new Date(2025, m - 1, d, hh, mm);

    effect(() => {
      const fecha = this.fechaCompleta();
      if (fecha) {
        this.fechaCambio.emit(fecha);
      }
    });

    return fecha;
  });

  // --- handlers ---
  onTimeChange(event: any) {
    const date: Date = event.value;
    if (!date) return;

    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    this.hora.set(`${hh}:${mm}`);
  }

  cambiarDia(event: Event) {
    const input = event.target as HTMLInputElement;
    this.dia.set(input.valueAsNumber);
  }

  cambiarMes(event: Event) {
    const input = event.target as HTMLInputElement;
    this.mes.set(input.valueAsNumber);
  }
}