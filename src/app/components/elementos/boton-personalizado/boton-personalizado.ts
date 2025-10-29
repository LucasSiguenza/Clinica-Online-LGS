import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-boton-personalizado',
  imports: [],
  templateUrl: './boton-personalizado.html',
  styleUrl: './boton-personalizado.scss'
})
export class BotonPersonalizado {
    @Input({required: true}) texto: string = '';
    @Input() tipo: 'button' | 'submit' | 'reset' = 'button';  
    

}
