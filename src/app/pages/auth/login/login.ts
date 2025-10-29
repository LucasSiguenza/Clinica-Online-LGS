import { Component, inject } from '@angular/core';
import { Utils } from '../../../services/util';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthSupabase } from '../../../services/auth-supabase';
import { InputPersonalizado } from "../../../components/elementos/input-personalizado/input-personalizado";
import { BotonPersonalizado } from "../../../components/elementos/boton-personalizado/boton-personalizado";

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, InputPersonalizado, BotonPersonalizado],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  standalone: true,
})
export class Login {
  private utilSvc = inject(Utils);
  private authSvc = inject(AuthSupabase);
   
  ingresoForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email, Validators.nullValidator]),
    constrasenia:  new FormControl('', [Validators.required, Validators.minLength(6),Validators.nullValidator])
  });
  
  async ingresar(){
    if(this.ingresoForm.invalid){
      this.utilSvc.mostrarToast('¡Complete correctamente los campos!','error','center');
      return
    }
    const correo = this.ingresoForm.controls.email.value;
    const contrasenia = this.ingresoForm.controls.constrasenia.value

    try{
      this.utilSvc.mostrarLoading();
      await this.authSvc.iniciarSesion(correo as string, contrasenia as string);
      this.utilSvc.mostrarToast('Ingreso exitoso', 'success','center')
      this.utilSvc.redirigir('/home')
    }catch(e) {
      this.utilSvc.mostrarToast('Algo salió mal', 'error','center');
      console.error(e)
      return
    } finally{
      this.utilSvc.ocultarLoading();
    }
  }

  registrarse(){

    this.utilSvc.redirigir('/auth/register')
    }

  botonTesteoAnim(){
  return this.ingresoForm.setValue({
      email: 'anim@anim.com',
      constrasenia: 'animeistrum'
    });
}
botonTesteo1(){
    return this.ingresoForm.setValue({
      email: 'c@c.com',
      constrasenia: '123456'
    });
}

botonTesteo2(){
  return this.ingresoForm.setValue({
      email: 'teseteo@test.com',
      constrasenia: 't e s t e o'
    });
}
}
