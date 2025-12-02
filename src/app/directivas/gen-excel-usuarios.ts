import { Directive, Input } from '@angular/core';
import { Workbook } from 'exceljs';
import * as FileSaver from 'file-saver';
import { Usuario } from '../models/Usuario';

@Directive({
  selector: '[appGenExcelUsuarios]',
  exportAs: 'appGenExcelUsuarios'
})
export class GenExcelUsuariosDirective {

  @Input('usuariosExcel') usuarios: Usuario[] = [];
  @Input() filename: string = 'Usuarios.xlsx';

  constructor() {}

  async exportExcel() {
    try {
      // --- Ajuste solicitado: encabezados en fila 3 para no chocar con el merge del título ---
      const OFFSET_ROW = 3;   // Headers en fila 3
      const OFFSET_COL = 2;   // Columna B (índice 2)

      const workbook = new Workbook();
      const sheet = workbook.addWorksheet('Usuarios'); // <-- aquí se crea "sheet"

      // ===== 1) TÍTULO (ocupa filas 1 y 2) =====
      // mergeCells acepta 'C1:H2' (rango) o parámetros numéricos
      sheet.mergeCells('C1:H2');
      const titleCell = sheet.getCell('C1');
      titleCell.value = 'Listado de Usuarios';
      titleCell.font = { size: 18, bold: true };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

      // ===== 2) ENCABEZADOS =====
      const headers = [
        'Nombre', 'Apellido', 'Perfil', 'Edad', 'DNI',
        'CUIL', 'Correo', 'Obra Social', 'Especialidad',
        'Estado', 'Creación'
      ];

      // Escribimos headers en la fila OFFSET_ROW (fila 3)
      headers.forEach((header, i) => {
        const cell = sheet.getCell(OFFSET_ROW, OFFSET_COL + i);
        cell.value = header;
        cell.font = { bold: true, color: { argb: 'FF000000' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFBC02D' } // Amarillo
        };
        cell.border = {
          top: { style: 'thick' },
          left: { style: 'thick' },
          bottom: { style: 'thick' },
          right: { style: 'thick' }
        };
      });

      // ===== 3) FILAS DE USUARIOS (desde fila 4 en adelante) =====
      this.usuarios.forEach((u, index) => {
        const rowIndex = OFFSET_ROW + 1 + index; // fila 4, 5, ...

        const formattedDate = u.creacion
          ? new Date(u.creacion).toLocaleDateString('es-AR')
          : 'Desconocida';

        const values = [
          u.nombre,
          u.apellido,
          u.perfil,
          u.edad,
          u.dni,
          u.cuil,
          u.correo,
          u.obra_social ?? '—',
          u.especialidad ?? '—',
          u.perfil !== 'administrador' ? (u.estado ? 'Activo' : 'Inactivo') : '—',
          formattedDate
        ];

        values.forEach((value, colIndex) => {
          const cell = sheet.getCell(rowIndex, OFFSET_COL + colIndex);
          cell.value = value;

          // === COLOR SEGÚN PERFIL ===
          let bg = 'FFFFFFFF';
          if (u.perfil === 'cliente') bg = 'FFFFF59B';
          if (u.perfil === 'empleado') bg = 'FFFFCC80';
          if (u.perfil === 'administrador') bg = 'FFFF8A80';

          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: bg }
          };

          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };

          // === TRATAMIENTO ESPECIAL: Columna "Correo" (index 6 en values) ===
          if (colIndex === 6) { // columna "Correo"
            // evitar wrapText en correo y dar ancho mayor
            cell.alignment = { vertical: 'middle', wrapText: false };
            sheet.getColumn(OFFSET_COL + colIndex).width = 28;
            // opcional: truncar visualmente si es demasiado largo
            if (typeof value === 'string' && value.length > 100) {
              cell.value = value.slice(0, 100) + '…';
            }
          }
        });
      });

      // ===== 4) CONFIGURACIÓN GENERAL DE COLUMNAS =====
      // Nota: sheet.columns puede estar vacío si no hay columnas explícitas, por eso usamos getColumn por seguridad
      const totalCols = OFFSET_COL + headers.length - 1;
      for (let c = OFFSET_COL; c <= totalCols; c++) {
        const col = sheet.getColumn(c);
        // No forzamos wrapText globalmente
        col.width = col.width ?? 18;
        col.alignment = { vertical: 'middle' };
      }

      // ===== 5) DESCARGA =====
      const buffer = await workbook.xlsx.writeBuffer();
      FileSaver.saveAs(new Blob([buffer]), this.filename);

    } catch (e) {
      console.error('Error generando Excel', e);
    }
  }
}
