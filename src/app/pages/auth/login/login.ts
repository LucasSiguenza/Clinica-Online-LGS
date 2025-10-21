import { Component, inject } from '@angular/core';
import { Utils } from '../../../services/util';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  standalone: true,
})
export class Login {
  protected utilSvc = inject(Utils);
   
  ingresoForm = new FormGroup({
    email: new FormControl('', Validators.required),
    contraseña:  new FormControl('', [Validators.required, Validators.minLength(6)])
  });
  
  ingresar(){

    this.utilSvc.mostrarToast('Ingreso exitoso', 'success')
    this.utilSvc.routerLink('/home')
  }

  registrarse(){
    this.utilSvc.routerLink('/auth/register')
  }

  botonTesteoAnim(){
  return this.ingresoForm.setValue({
      email: 'anim@anim.com',
      contraseña: 'animeistrum'
    });
}
botonTesteo1(){
    return this.ingresoForm.setValue({
      email: 'c@c.com',
      contraseña: '123456'
    });
}

botonTesteo2(){
  return this.ingresoForm.setValue({
      email: 'teseteo@test.com',
      contraseña: 't e s t e o'
    });
}
}
