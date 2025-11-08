import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule } from "@angular/forms";
@Component({
  selector: 'app-form-encuesta',
  imports: [FormsModule],
  templateUrl: './form-encuesta.html',
  styleUrl: './form-encuesta.scss'
})
export class FormEncuesta {
   form = new FormGroup({
    seleccion: new FormControl('')
  });

  protected opciones = ['Excelente', 'Buena', 'Regular', 'Mala'];
  protected enviada = false;

  enviar() {
    if (this.form.value.seleccion) this.enviada = true;
  }
  
}
