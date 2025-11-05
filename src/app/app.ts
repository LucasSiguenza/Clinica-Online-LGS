import { afterRenderEffect, Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingPersonalizado } from "./components/elementos/loading-personalizado/loading-personalizado";
import { Utils } from './services/util';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoadingPersonalizado],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('clinica-lgs');
  protected utilSvc = inject(Utils); 
   constructor() {
    //? Espera a que Angular haya completado el render del DOM
    afterRenderEffect(() => {
      setTimeout(() => this.utilSvc.cargando.set(false), 600);
    });
  }
}

