import { Component, signal } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { FormEncuesta } from "../../../components/form-encuesta/form-encuesta";
import { Header } from "../../../components/header/header";

@Component({
  selector: 'app-panel-encuesta',
  imports: [FormsModule, FormEncuesta, Header],
  templateUrl: './panel-encuesta.html',
  styleUrl: './panel-encuesta.scss'
})
export class PanelEncuesta {
 protected opciones = ['Excelente', 'Buena', 'Regular', 'Mala'];
  protected seleccion = signal<string | null>(null);
  protected enviada = signal(false);

  enviar() {
    if (this.seleccion()) this.enviada.set(true);
  }
  
}
