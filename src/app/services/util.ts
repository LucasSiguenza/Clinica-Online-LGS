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
   * Abre un selector de archivos y devuelve el archivo seleccionado como base64.
   * @param accept Tipos de archivo permitidos, por ejemplo "image/*" o ".jpg,.png"
   * @returns Promise<string | null> base64 completo (con prefijo "data:[tipo];base64,") o null si se cancela
   */
  seleccionarArchivo(accept: string = '*'): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = accept;

      input.onchange = async () => {
        const file = input.files && input.files.length > 0 ? input.files[0] : null;
        if (!file) {
          resolve(null); // usuario canceló
          return;
        }

        try {
          const base64 = await this.convertirArchivoABase64(file);
          resolve(base64);
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
        const result = reader.result as string; // ya incluye "data:[tipo];base64,"
        resolve(result);
      };

      reader.onerror = (error) => reject(error);

      reader.readAsDataURL(file);
    });
  }
  //! ================== Enrutamiento ==================

  redirigir(url: string) {
    return this.router.navigateByUrl(url);
  }


}