import { Component, effect, ElementRef, Input, signal, ViewChild } from '@angular/core';
import { Usuario } from '../../../models/Usuario';


@Component({
  selector: 'app-carrusel-personalizado',
  imports: [],
  templateUrl: './carrusel-personalizado.html',
  styleUrl: './carrusel-personalizado.scss'
})
export class CarruselPersonalizado {
  /** Permite recibir una sola imagen o un array de imágenes */
  @Input({ required: true }) fotos!: string | string[];
  @ViewChild('track', { static: true }) track!: ElementRef<HTMLDivElement>;

  ngOnInit() {
    const data = this.fotos
      ? Array.isArray(this.fotos)
        ? this.fotos
        : [this.fotos]
      : [this.placeholder];

    const fondos = [
      'linear-gradient(to right, #ff7e5f, #feb47b)',
      'linear-gradient(to right, #6a11cb, #2575fc)',
      'linear-gradient(to right, #11998e, #38ef7d)',
    ];

    const normalizado = data.length === 1 ? [data[0], data[0]] : data;

    this.cards = normalizado.map((img, i) => ({
      img: img || this.placeholder,
      bg: fondos[i % fondos.length],
    }));

    queueMicrotask(() => this.updateCarousel());
  }

  /** Referencia al track para aplicar la animación */

  
  /** Placeholder por defecto */
  placeholder = 'https://hdpijtoomoargexhddxr.supabase.co/storage/v1/object/public/foto-usuario/user-placeholder.png';

  /** Índice actual del carrusel */
  index = 0;
  
  /** Lista final de tarjetas del carrusel */
  cards: { img: string; bg: string }[] = [];

  /** Actualiza la posición visible */
  updateCarousel() {
    const track = this.track.nativeElement as HTMLElement;
    const height = 280; // altura fija en px

    track.style.transform = `translateX(-${this.index * 100}%)`;
    track.style.height = `${height}px`;
  }

  /** Muestra la siguiente imagen */
  nextCard() {
    this.index = (this.index + 1) % this.cards.length;
    this.updateCarousel();
  }

  /** Muestra la imagen anterior */
  prevCard() {
    this.index = (this.index - 1 + this.cards.length) % this.cards.length;
    this.updateCarousel();
  }
}
