import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-accordion-personalizado',
  imports: [],
  templateUrl: './accordion-personalizado.html',
  styleUrl: './accordion-personalizado.scss'
})
export class AccordionPersonalizado {
  @Input() title: string = 'Título';
  isOpen: boolean = false;

  toggle() {
    this.isOpen = !this.isOpen;
  }
}
