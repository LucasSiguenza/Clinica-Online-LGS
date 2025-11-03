import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Utils } from '../../../services/util';
import { InputPersonalizado } from "../../../components/elementos/input-personalizado/input-personalizado";
import { AccordionPersonalizado } from "../../../components/elementos/accordion-personalizado/accordion-personalizado";
import { BotonPersonalizado } from "../../../components/elementos/boton-personalizado/boton-personalizado";
import { Usuario } from '../../../models/Usuario';
import { UserSupabase } from '../../../services/user-supabase';

@Component({
  selector: 'app-register',
  imports: [ ReactiveFormsModule, InputPersonalizado, AccordionPersonalizado, BotonPersonalizado],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
  standalone: true
})
export class Register {

  private utilsSvc = inject(Utils);
  private userSvc = inject(UserSupabase);
  protected placeHolder = 'https://hdpijtoomoargexhddxr.supabase.co/storage/v1/object/public/foto-usuario/user-placeholder.png'
  protected fotoPreviewUno = signal<string | null | undefined>(this.placeHolder);
  protected fotoPreviewDos = signal<string | null | undefined>(this.placeHolder);

  registroForm = new FormGroup({
  nombre: new FormControl('', [Validators.required, Validators.minLength(3)]),
  apellido: new FormControl('', [Validators.required, Validators.minLength(3)]),
  edad: new FormControl('', [Validators.required, Validators.min(13)]),
  dni: new FormControl('', [Validators.required, Validators.minLength(7), Validators.maxLength(8)]),
  cuil: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(11)]),
  obraSocial: new FormControl('No seleccionada', [Validators.required]),
  correo: new FormControl('', [Validators.required ,Validators.email]),
  contrasenia:  new FormControl('', [Validators.required, Validators.minLength(6)]),
  foto1:  new FormControl('', [Validators.required]),
  foto2:  new FormControl('', [Validators.required]),

  })

  async elegirImagen(num:string){
    const foto = await this.utilsSvc.seleccionarArchivo();
    if(num === '1') {
      this.registroForm.patchValue({foto1: String(foto)});
      this.fotoPreviewUno.set(String(foto));
      console.log(foto);
    }
    else {
      this.registroForm.patchValue({foto2: String(foto)});
      this.fotoPreviewDos.set(String(foto)) ;
      console.log(foto);
    }
  }

  async registro(){
    if(this.registroForm.invalid){
      this.utilsSvc.mostrarToast('Completa correctamente el formulario.', 'error');
      return
    }
    var contra = this.registroForm.controls.contrasenia.value;
    const nuevo: Usuario = {
      nombre: this.registroForm.controls.nombre.value as string,
      apellido: this.registroForm.controls.apellido.value as string,
      obra_social: this.registroForm.controls.obraSocial.value as string,
      edad: this.registroForm.controls.edad.value as string,
      dni: this.registroForm.controls.dni.value as string,
      cuil: this.registroForm.controls.cuil.value as string,
      correo: this.registroForm.controls.correo.value as string,
      perfil: 'cliente',
      foto: [this.registroForm.controls.foto1.value, this.registroForm.controls.foto2.value]as string[]
    }
    try{  
      this.utilsSvc.mostrarLoading();
      
      await this.userSvc.crearUsuario(nuevo, contra as string)
      this.utilsSvc.mostrarToast('¡Usuario registrado!', 'success');
      this.utilsSvc.redirigir('/auth/login');
    } catch(e){
      console.error(e);
    } finally{
      this.utilsSvc.ocultarLoading();
    }
  }

  seleccionarObSocial(obra: string){
    this.registroForm.patchValue({
      obraSocial: obra,
    });
  }

  volverAlLogin(){
    this.utilsSvc.redirigir('auth/login');
  }
}
