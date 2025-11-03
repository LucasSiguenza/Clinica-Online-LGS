import { inject, Injectable, signal, ViewChild } from '@angular/core';
import {} from '@angular/core'
import { Router } from '@angular/router';
import Toastify from 'toastify-js'

@Injectable({
  providedIn: 'root'
})
export class Utils {

  
  private router = inject(Router)
  cargando = signal(false);

  //! ================== Cargando ==================
  mostrarLoading() {
    this.cargando.set(true);
  }

  ocultarLoading() {
    this.cargando.set(false);
  }
  
  //! ================== ToastyAlert ==================


  mostrarToast(mensaje: string,
    tipo: 'success' | 'error' | 'info' = 'info',
    posicion: 'center'| 'left' | 'right' = 'right',
    duracion: number = 1000,
  ) {
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
    }

    return Toastify({
      text: mensaje,
      duration: duracion,
      gravity: "top",
      position: posicion,
      backgroundColor: background,
      close: false
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
  //! ================== Enrutamiento ==================

  redirigir(url: string) {
    return this.router.navigateByUrl(url);
  }


}