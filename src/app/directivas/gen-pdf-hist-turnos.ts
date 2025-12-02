import { Directive, Input, ElementRef, Renderer2 } from '@angular/core';
import html2pdf from 'html2pdf.js';
import { Turno } from '../models/Turno';

@Directive({
  selector: '[appGenPdfHistTurnos]',
  exportAs: 'appGenPdfHistTurnos'
})
export class GenPdfHistTurnos {

  @Input('turnosPdf') turnos: Turno[] = [];
  @Input() filename: string = 'MisTurnos.pdf';

  // Imagen local dentro de assets
  @Input() imageUrl: string = '/user-placeholder.png';

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  public exportPdf() {

    // === CONTENEDOR PRINCIPAL ===
    const wrapper = this.renderer.createElement('div');
    this.renderer.setStyle(wrapper, 'padding', '20px');
    this.renderer.setStyle(wrapper, 'font-family', 'Arial, sans-serif');
    this.renderer.setStyle(wrapper, 'background', '#000');       // 🟩 FONDO NEGRO
    this.renderer.setStyle(wrapper, 'color', '#fff');            // 🟩 TEXTO BLANCO

    // === 1) TÍTULO ===
    const title = this.renderer.createElement('h1');
    title.textContent = 'Clínica LGS';
    this.renderer.setStyle(title, 'text-align', 'center');
    this.renderer.setStyle(title, 'margin-bottom', '20px');
    this.renderer.appendChild(wrapper, title);

    // === 2) FOTO ===
    const img = this.renderer.createElement('img');
    img.src = this.imageUrl;
    this.renderer.setStyle(img, 'display', 'block');
    this.renderer.setStyle(img, 'margin', '0 auto 25px auto');
    this.renderer.setStyle(img, 'width', '110px');
    this.renderer.setStyle(img, 'height', '110px');
    this.renderer.setStyle(img, 'border-radius', '50%');
    this.renderer.setStyle(img, 'object-fit', 'cover');
    this.renderer.appendChild(wrapper, img);

    // === 3) TABLA ===
    const table = this.renderer.createElement('table');
    this.renderer.setStyle(table, 'width', '100%');
    this.renderer.setStyle(table, 'border-collapse', 'collapse');
    this.renderer.setStyle(table, 'font-size', '12px');

    // ---- head ----
    const thead = this.renderer.createElement('thead');
    const headerRow = this.renderer.createElement('tr');

    const headers = [
      'ID', 'Fecha', 'Especialidad', 'Empleado',
      'Paciente', 'Duración (min)', 'Estado'
    ];

    headers.forEach(h => {
      const th = this.renderer.createElement('th');
      th.textContent = h;
      this.renderer.setStyle(th, 'border', '1px solid #666');
      this.renderer.setStyle(th, 'padding', '6px');
      this.renderer.setStyle(th, 'background', '#222'); // mejor contraste
      this.renderer.setStyle(th, 'font-weight', 'bold');
      this.renderer.appendChild(headerRow, th);
    });

    this.renderer.appendChild(thead, headerRow);
    this.renderer.appendChild(table, thead);

    // ---- body ----
    const tbody = this.renderer.createElement('tbody');

    this.turnos.sort((a, b) =>{
       const fechaA = new Date(a.fecha).getTime();
       const fechaB = new Date(b.fecha).getTime();
       return fechaA - fechaB;
      }).forEach(t => {

      const row = this.renderer.createElement('tr');

      const cells = [
        t.id + '',
        t.fecha ? new Date(t.fecha).toLocaleString() : '',
        t.nombreEspecialidad,
        t.nombreEmpleado,
        t.nombrePaciente ?? '',
        t.duracion + '',
        t.estado
      ];

      cells.forEach(c => {
        const td = this.renderer.createElement('td');
        td.textContent = c;
        this.renderer.setStyle(td, 'border', '1px solid #666');
        this.renderer.setStyle(td, 'padding', '6px');
        this.renderer.setStyle(td, 'background', '#111'); 
        this.renderer.appendChild(row, td);
      });

      this.renderer.appendChild(tbody, row);
    });

    this.renderer.appendChild(table, tbody);
    this.renderer.appendChild(wrapper, table);

    // === 4) PDF ===
    const opt: any = {
      margin: 0.5,
      filename: this.filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf()
      .set(opt)
      .from(wrapper)
      .save()
      .catch(err => console.error('Error PDF:', err));
  }
}
