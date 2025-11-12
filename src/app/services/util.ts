import { inject, Injectable, signal, ViewChild } from '@angular/core';
import {} from '@angular/core'
import { Router } from '@angular/router';
import Toastify from 'toastify-js';
import Swal, { SweetAlertOptions } from 'sweetalert2'

@Injectable({
  providedIn: 'root'
})
export class Utils {

  
  private router = inject(Router)
  cargando = signal(false);
  modal = signal(false);

  //! ================== Cargando ==================
  mostrarLoading() {
    this.cargando.set(true);
  }

  ocultarLoading() {
    this.cargando.set(false);
  }

  //! ================== Alert ==================

  mostrarAlert(opts: SweetAlertOptions){
    return Swal.fire(opts);
  }

  //! ================== Toast ==================

mostrarToast(
    mensaje: string,
    tipo: 'success' | 'error' | 'info' = 'info',
    posicion: 'center' | 'left' | 'right' = 'right',
    duracion: number = 3000
  ){

    let background = '';
    switch (tipo) {
      case 'success':
        background = 'linear-gradient(to right, #00b09b, #96c93d)';
        break;
      case 'error':
        background = 'linear-gradient(to right, #ff5f6d, #ffc371)';
        break;
      case 'info':
      default:
        background = 'linear-gradient(to right, #2193b0, #6dd5ed)';
        break;
    }

    Toastify({
      text: mensaje,
      duration: duracion,
      gravity: 'top', // top o bottom
      position: posicion, // left, center o right
      stopOnFocus: true, // pausa cuando el mouse pasa por encima
      close: false, // muestra un botón de cierre elegante
      style: {
        background,
        color: '#fff',
        textAlign: 'center',
        fontSize: '14px',
        fontWeight: '500',
        borderRadius: '8px',
        padding: '12px 24px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
      },
    }).showToast();
  }
  //! ================== Imagenes ==================
  /**
 * Abre un selector de archivos y devuelve el archivo seleccionado como base64 completo (con prefijo data:[tipo];base64,)
 * @param accept Tipos de archivo permitidos, por ejemplo "image/*" o ".jpg,.png"
 * @returns Promise<string | null> base64 completo o null si se cancela
 */
  public async seleccionarArchivo(accept: string = 'image/*'): Promise<string | null> {
    return new Promise((retorno, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = accept;

      input.onchange = async () => {
        const file = input.files && input.files.length > 0 ? input.files[0] : null;
        if (!file) {
          retorno(null);
          return;
        }
        try {
          const base64 = await this.convertirArchivoABase64(file);
          retorno(base64) ;
          console.log(retorno)
        } catch (error) {
          reject(error);
        }
      };

      input.click();
    });
  }

  /**
   * Convierte un archivo (File) a su representación base64 completa (con prefijo data:[tipo];base64,)
   * @param file Archivo a convertir
   * @returns Promise<string> cadena base64 completa
   */
  private convertirArchivoABase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
        console.log(resolve)
      };

      reader.onerror = (error) => reject(error);

      reader.readAsDataURL(file);  // Documentación: readAsDataURL devuelve DataURL con prefijo. :contentReference[oaicite:3]{index=3}
    });
  }

  /**
   * Convierte un string base64 completo (con prefijo data:[tipo];base64,) a un Blob válido para subir.
   * @param base64 cadena base64 completa con prefijo
   * @returns Blob o null si el formato es inválido
   */
  public formatearBase64AImagen(base64: string): Blob | null {
    if (!base64 || !base64.startsWith('data:')) {
      console.warn('El string no tiene prefijo data: esperado.');
    }

    // Extraer el tipo MIME
    const match = base64.match(/^data:(.*?);base64,/);
    if (!match) {
      console.warn('No se pudo extraer MIME del prefijo del base64.');
      return null;
    }
    const mimeType = match[1];

    // Eliminar el prefijo para obtener solo la parte base64
    const base64Data = base64.substring(base64.indexOf(',') + 1);

    // Decodificar a bytes
    const byteChars = atob(base64Data);  // atob decodifica base64 → string de bytes. :contentReference[oaicite:4]{index=4}
    const byteNumbers = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteNumbers[i] = byteChars.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    // Crear Blob
    const blob = new Blob([byteArray], { type: mimeType });
    return blob;
  }
  //! ================== Formateo de strings ==================
  formatoSB(valor: string): string {
    return valor
      .trim()
      .toLowerCase()
      .normalize('NFD')                 //^ elimina acentos (ej: "clínica" → "clinica")
      .replace(/[\u0300-\u036f]/g, '')  //^ limpia diacríticos
      .replace(/\s+/g, '-');            //^ reemplaza espacios por guiones 
  }
  formatoDesdeSB(valor: string): string {
    return valor
      .split('-')
      .map(p => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' ');
  }

  /**
   * Convierte cualquier cadena a Capitalize Case (solo la primera letra en mayúscula).
   * Si la cadena contiene varias palabras, respeta los espacios y las mayúsculas iniciales de cada una.
   * Ejemplo: "juAN péREz" → "Juan Pérez"
   */
  toCapitalizeCase(value: string | null | undefined): string {
    if (!value) return '';

    return value
      .toLowerCase()
      .split(' ')
      .filter(p => p.trim().length > 0)
      .map(p => p[0].toUpperCase() + p.slice(1))
      .join(' ');
  }
  //! ================== Enrutamiento ==================

  redirigir(url: string) {
    this.router.navigateByUrl(url);
  }


}
 
 