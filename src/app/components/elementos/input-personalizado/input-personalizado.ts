import { Component, Input } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { ReactiveFormsModule, FormGroup, Form } from '@angular/forms';

@Component({
  selector: 'app-input-personalizado',
  imports: [ReactiveFormsModule, TitleCasePipe],
  templateUrl: './input-personalizado.html',
  styleUrl: './input-personalizado.scss'
})
export class InputPersonalizado {

  @Input({ required: true }) form!: FormGroup;
  @Input({ required: true }) control!: string;
  @Input() tipoInput: string = 'text';
  @Input() placeHolder!: string 
  @Input() mensajeAdicional: string = '';

}
