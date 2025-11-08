import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Header } from "../../../../components/header/header";

@Component({
  selector: 'app-panel-de-turnos',
  imports: [FormsModule, Header],
  templateUrl: './panel-de-turnos.html',
  styleUrl: './panel-de-turnos.scss'
})
export class PanelDeTurnos {
 filtroEspecialidad = signal('');
  filtroEspecialista = signal('');

  turnos = signal([
    {
      especialista: 'Dra. Laura Gómez',
      paciente: '—',
      especialidad: 'Cardiología',
      fecha: '2025-11-12',
      hora: '09:30',
      estado: 'pendiente',
      estadoClass: 'pendiente',
      mostrarCancelar: true,
      mostrarVerResena: false,
      mostrarEncuesta: false,
      mostrarCalificar: false,
      mostrarAceptar: true,
      mostrarRechazar: true,
      mostrarFinalizar: false
    },
    {
      especialista: 'Dr. Martín Ruiz',
      paciente: 'Juan Pérez',
      especialidad: 'Dermatología',
      fecha: '2025-11-02',
      hora: '11:00',
      estado: 'realizado',
      estadoClass: 'realizado',
      mostrarCancelar: false,
      mostrarVerResena: true,
      mostrarEncuesta: true,
      mostrarCalificar: true,
      mostrarAceptar: false,
      mostrarRechazar: false,
      mostrarFinalizar: false
    }
  ]);
}
