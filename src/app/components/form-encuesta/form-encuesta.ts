import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
@Component({
  selector: 'app-form-encuesta',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './form-encuesta.html',
  styleUrl: './form-encuesta.scss'
})
export class FormEncuesta {
  protected seleccion = signal<string | null>(null);
  protected form = new FormGroup({
    seleccion: new FormControl('')
  })
 protected opciones = ['Excelente', 'Buena', 'Regular', 'Mala'];
  protected enviada = signal(false);

  enviar() {
    if (this.seleccion()) this.enviada.set(true);
    this.form.patchValue({seleccion: this.seleccion()})
  }
  
}
