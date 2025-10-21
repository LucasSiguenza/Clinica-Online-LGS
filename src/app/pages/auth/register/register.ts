import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Utils } from '../../../services/util';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
  standalone: true
})
export class Register {
    private utilsSvc = inject(Utils);

    registroForm = new FormGroup({
    nombre: new FormControl('', Validators.required),
    contraseña:  new FormControl('', [Validators.required, Validators.minLength(6)]),
    email: new FormControl('', Validators.email),
  })

  registro(){
    if(this.registroForm.invalid){
      this.utilsSvc.mostrarToast('Completa el formulario.', 'error');
      return
    }

    this.utilsSvc.mostrarLoading();
    this.utilsSvc.mostrarToast('¡Usuario registrado!', 'success');
    this.utilsSvc.routerLink('/auth/login');
  }


  volverAlLogin(){
    this.utilsSvc.routerLink('auth/login');
  }
}
