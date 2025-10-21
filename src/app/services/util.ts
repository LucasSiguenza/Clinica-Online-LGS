import { inject, Injectable } from '@angular/core';
import {} from '@angular/core'
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import Toastify from 'toastify-js'

@Injectable({
  providedIn: 'root'
})
export class Utils {

  
  router = inject(Router)
  
  _loading = new BehaviorSubject<boolean>(false);
  loading$ = this._loading.asObservable();  

  // ================== Cargando ==================

  mostrarLoading(){
    this._loading.next(true);
  }
  ocultarLoading(){
    this._loading.next(false)
  }
  
  // ================== ToastyAlert ==================


  mostrarToast(mensaje: string, type: 'success' | 'error' | 'info' = 'info') {
    let background = '';
    switch (type) {
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
      duration: 2500,
      gravity: "top",
      position: "right",
      backgroundColor: background,
      close: true
    }).showToast();
  }
  // ================== Enrutamiento ==================

  routerLink(url: string) {
    return this.router.navigateByUrl(url);
  }


}