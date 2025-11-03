import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingPersonalizado } from "./components/elementos/loading-personalizado/loading-personalizado";


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoadingPersonalizado],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('clinica-lgs');
}
