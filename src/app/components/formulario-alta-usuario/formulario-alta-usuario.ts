import { Component, effect, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { Utils } from '../../services/util';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccordionPersonalizado } from "../elementos/accordion-personalizado/accordion-personalizado";
import { UserSupabase } from '../../services/user-supabase';
import { Usuario } from '../../models/Usuario';
import { AuthSupabase } from '../../services/auth-supabase';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-formulario-alta-usuario',
  imports: [ReactiveFormsModule, AccordionPersonalizado, TitleCasePipe],
  templateUrl: './formulario-alta-usuario.html',
  styleUrl: './formulario-alta-usuario.scss'
})
export class FormularioAltaUsuario {
  //! =============== Declaración de servicios y Controllers ===============
  protected authSvc = inject(AuthSupabase);
  dialogCtrl = inject(MatDialogRef);
  private userSvc = inject(UserSupabase);
  private utilsSvc = inject(Utils);
  
  //! =============== Declaración de variables ===============
  protected placeHolder = 'https://hdpijtoomoargexhddxr.supabase.co/storage/v1/object/public/foto-usuario/user-placeholder.png'
  protected fotoPreviewUno = signal<string | null | undefined>(this.placeHolder);
  protected fotoPreviewDos = signal<string | null | undefined>(this.placeHolder);
  protected isNuevo = this.userSvc.getUsuarioSeleccionado() == null;
  
  
  form = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(3)]),
    apellido: new FormControl('', [Validators.required, Validators.minLength(3)]),
    edad: new FormControl('', [Validators.required, Validators.min(13)]),
    dni: new FormControl('', [Validators.required, Validators.minLength(7), Validators.maxLength(8)]),
    cuil: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(11)]),
    obraSocial: new FormControl('no', [Validators.required]),
    especialidad: new FormControl('no', [Validators.required]),
    perfil: new FormControl('', [Validators.required]),
    correo: new FormControl('', [Validators.required ,Validators.email]),
    contrasenia:  new FormControl('', [Validators.required, Validators.minLength(6)]),
    foto1:  new FormControl('', [Validators.required]),
    foto2:  new FormControl('', [Validators.required]),
  })
  
  protected perfil = signal(this.form.controls.perfil.value);

  ngOnInit() {
    const usr = this.userSvc.getUsuarioSeleccionado();

    this.form.controls.perfil.valueChanges.subscribe(value => {
      this.perfil.set(value);
    });

    if (usr) {
      this.form.patchValue({
        nombre: usr.nombre,
        apellido: usr.apellido,
        correo: usr.correo,
        dni: usr.dni,
        cuil: usr.cuil,
        edad: usr.edad,
        obraSocial: usr.obra_social,
        especialidad: usr.especialidad,
        contrasenia: 'NO NECESARIA',
        perfil: usr.perfil
      });

      const fotos = this.userSvc.obtenerUrlPublica(usr);
      if (Array.isArray(fotos)) {
        this.fotoPreviewUno.set(fotos[0]);
        this.fotoPreviewDos.set(fotos[1]);
        this.form.patchValue({ foto1: fotos[0], foto2: fotos[1] });
      } else if (typeof fotos === 'string') {
        this.fotoPreviewUno.set(fotos);
        this.fotoPreviewDos.set(this.placeHolder);
        this.form.patchValue({ foto1: fotos, foto2: this.placeHolder });
      }
    }
  }

  //! =============== Métodos de componentes ===============
  async elegirImagen(num:string){
    const foto = await this.utilsSvc.seleccionarArchivo();
    if(num === '1') {
      this.form.patchValue({foto1: String(foto)});
        this.fotoPreviewUno.set(String(foto));
        console.log(foto);
      }
      else {
        this.form.patchValue({foto2: String(foto)});
        this.fotoPreviewDos.set(String(foto)) ;
        console.log(foto);
      }
  }

  seleccionarObSocial(obra: string){
    this.form.patchValue({
      obraSocial: obra,
    });
  }
  seleccionarPerfil(obra: string){
    this.form.patchValue({
      perfil: obra,
    });
  }
  seleccionarEspecialidad(obra: string){
    this.form.patchValue({
      especialidad: obra,
    });
  }
  guardarEspecialidad() {
    let especialidad = this.form.controls.especialidad.value || '';

    if (especialidad) {
      this.form.controls.especialidad.setValue(especialidad);
      console.log('Especialidad guardada:', especialidad);
    }
  }
  
  //! =============== Métodos de botones ===============
  cerrarDialog(): void {
    this.dialogCtrl.close();
     this.utilsSvc.mostrarAlert({
        text: '¡Cancelado con éxito!',
        title: 'Cerrado',
        icon: 'success',
        theme:'dark'
      });  
  }

  async confirmarDialog(){
    if(this.form.invalid){
      console.log(this.form)
      this.utilsSvc.mostrarAlert({
        text: '¡Debe rellenar todos los campos válidamente!',
        title: 'Error',
        icon: 'error',
        theme:'dark'
      });
      this.form.markAllAsTouched();
      return;
    }

    this.utilsSvc.mostrarLoading();

    if(this.perfil() == 'admin'){
      this.form.patchValue({
        especialidad: 'no',
        obraSocial: 'no'
      })
    }
    const isEmpleado = this.form.controls.perfil.value == 'empleado'
    const usuario: Usuario = {
      nombre: String(this.form.controls.nombre.value),
      apellido: String(this.form.controls.apellido.value),
      correo: String(this.form.controls.correo.value),
      cuil: String(this.form.controls.cuil.value),
      dni: String(this.form.controls.dni.value),
      edad: String(this.form.controls.edad.value),
      foto: [String(this.form.controls.foto1.value),String(this.form.controls.foto2.value)],
      obra_social: this.form.controls.obraSocial.value,
      especialidad: this.form.controls.especialidad.value,
      perfil: String(this.form.controls.perfil.value),
      isEmpleado: isEmpleado,
    }
    
    const contrasenia = this.form.controls.contrasenia.value
    try{
      if(this.isNuevo){
        await this.userSvc.crearUsuario(usuario, contrasenia as string);
        this.utilsSvc.mostrarToast('¡Usuario registrado!', 'success');
      }
      else{
        const usuarioEdit: Usuario ={...this.userSvc.getUsuarioSeleccionado(), ...usuario}
        await this.userSvc.actualizarUsuario(usuarioEdit);
      }
    } catch(e){
      console.error(JSON.stringify(e));
      this.utilsSvc.mostrarAlert({
        title: `Algo salió mal: ${(e as Error).cause}`,
        text: `Error: ${(e as Error).message}`,
        icon: 'warning'
      })
      return
    } finally{
      this.utilsSvc.ocultarLoading();
      return this.dialogCtrl.close();  
    }
  }
}
