import { inject, Injectable, signal } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { env } from '../../enviroments/enviroment';
import { Utils } from './util';
import { AuthSupabase } from './auth-supabase';
import { Usuario } from '../models/Usuario';
import { decode } from 'base64-arraybuffer';
import { startWith } from 'rxjs';
import { SupabaseUtils } from './supabase-utils';

@Injectable({
  providedIn: 'root'
})
export class UserSupabase {
  //? Instanciamos servicios y cliente.
  private sbSvc = inject(SupabaseUtils);
  private supabase = this.sbSvc.supabase;
  private utilSvc = inject(Utils);
  private auth = inject(AuthSupabase); 
  //? Instanciamos signals

  listaUsuarios = signal<Usuario[] | null>(null);
  private usuarioSeleccionado = signal<Usuario | null>(null);

  //! ======================= Métodos CRUD =======================

  async cargarListado(){
    const lista = await this.obtenerListadoBD() ?? []; 
    this.listaUsuarios.set(lista);
  }

  async actualizarUsuario(usr: Usuario){
    await this.actualizarUsuarioBD(usr);
    await this.cargarListado();
  }

  async eliminarUsuario(usr: Usuario){
    await this.eliminarUsuarioBD(usr);
    await this.cargarListado();
  }

  async crearUsuario(usr: Usuario, contrasenia: string){
    await this.agregarUsuarioBD(usr, contrasenia);
    await this.cargarListado();
  }
  //! ======================= Métodos de signals =======================
  
  //? Usuario seleccionado
  deseleccionarUsuario(){
    this.usuarioSeleccionado.set(null);
  }
  setUsuarioSeleccionado(usr: Usuario){
    this.usuarioSeleccionado.set(usr); 
  }
  getUsuarioSeleccionado(){
    return this.usuarioSeleccionado();
  }

  

  //! ======================= Métodos BD =======================


  private async obtenerListadoBD(): Promise<Usuario[]>{
    const {data: listaBD, error: excptBD } = await this.supabase
      .from('usuarios')
      .select('*')
      
    if(excptBD) throw new Error('Algo salió mal:', {cause: excptBD.message});
     
      return (listaBD ?? []).map( u =>({
        id: u.id,
        creacion: u.creacion,
        obra_social: u.obra_social ?? '',
        especialidad: this.utilSvc.formatoDesdeSB(u.especialidad) ?? '',
        uid: u.uid, 
        nombre: u.nombre,
        apellido: u.apellido,
        edad: u.edad,
        cuil: u.cuil,
        dni: u.dni,
        correo: u.correo,
        perfil: u.perfil,
        foto: this.obtenerUrlPublica(u),
        estado: u.estado
      }));
    }
    
  

  private async actualizarUsuarioBD(usr: Usuario){
    const listaEsp = await this.sbSvc.adquirirColumna('especialidades', 'nombre') as string[] 

    const usrAct ={
      obra_social: usr.obra_social ,
      especialidad: this.utilSvc.formatoSB(usr.especialidad as string) ,
      estado: usr.estado , 
      nombre: usr.nombre ,
      apellido: usr.apellido,
      edad: usr.edad,
      dni: usr.dni,
      cuil: usr.cuil,
      correo: usr.correo,
      perfil: usr.perfil,
    }

    const {data, error} = await this.supabase
    .from('usuarios')
    .update(usrAct)
    .eq('uid', usr.uid)
    .single()

    if(error) throw new Error('Algo salió mal:', {cause: error.message});
    if(usr.foto == null || usr.foto == undefined || usr.foto == '') return console.log('Usuario actualizado con éxito');

    if(typeof usr.foto === 'string' ){
      if(usr.foto?.startsWith('file:') || usr.foto?.startsWith('data:')){
        usr.foto = await this.subirFotoUsuario(usr, usr.foto);
      } else{
        usr.foto = this.obtenerUrlPublica(usr);
      }
      return console.log('Usuario actualizado con éxito');
    }
    let i = 1
    usr.foto.forEach(async u =>  (
      usr.uid = usr.uid+`${i}`,
      usr.foto = await this.subirFotoUsuario(usr, u)
    ))
    console.log('Usuario actualizado con éxito')
  }

  private async eliminarUsuarioBD(usr: Usuario){
    const {data, error} = await this.supabase
    .from('usuarios')
    .delete()
    .eq('uid', usr.uid)
    .single()

    if(error) throw new Error('Algo salió mal:', {cause: error.message});
    if(data){
      this.eliminarFotoUsuario(usr);
    }
  }

  private async agregarUsuarioBD(usr: Usuario, contrasenia: string){

    const { data: existing, error: checkError } = await this.supabase
      .from('usuarios')
      .select('*')
      .eq('correo', usr.correo);

    if (existing?.length) {
      this.utilSvc.mostrarToast('El correo ya está registrado', 'error');
      console.error(checkError);
      return;
    }

    const uid = await this.auth.registrarUsuarioAuth(usr, contrasenia);
    usr.uid = uid;
    const {data, error} = await this.supabase
      .from('usuarios')
      .insert({
        uid: uid,
        obra_social: usr.obra_social ?? 'no',
        especialidad: this.utilSvc.formatoSB(usr.especialidad as string) ?? 'no',
        nombre: usr.nombre ,
        apellido: usr.apellido,
        edad: usr.edad,
        dni: usr.dni,
        cuil: usr.cuil,
        correo: usr.correo,
        perfil: usr.perfil
      })
      .select('id')
      .single();
    if(error) throw new Error('Algo salió mal:', {cause: error.message});
    
    const usrDB= { id: data.id}
    
    if(usr.isEmpleado!){
      //^ Buscar ID de la especialidad existente
      const { data: espExistente, error: errBuscarEsp } = await this.supabase
        .from('especialidades')
        .select('id')
        .eq('nombre', usr.especialidad)
        .single();

      if (errBuscarEsp && errBuscarEsp.code !== 'PGRST116'){ //? ignora "no rows found"
        throw new Error('Error al buscar especialidad: ', { cause: errBuscarEsp });}

      let especialidadId = espExistente?.id;

      //^ Si no existe, crear nueva especialidad
      if (!especialidadId) {
        const { data: nuevaEsp, error: errNuevaEsp } = await this.supabase
          .from('especialidades')
          .insert({ nombre: usr.especialidad })
          .select('id')
          .single();

        if (errNuevaEsp)
          throw new Error('Error al registrar nueva especialidad: ', { cause: errNuevaEsp });

        especialidadId = nuevaEsp.id;
      }

      //^ Registrar empleado con las FK correctas
      const empleadoBD = {
        empleado: usrDB.id,              //? id del usuario recién insertado
        especialidad: especialidadId,  //? id de especialidad
      };

      const { error: errEmp } = await this.supabase
        .from('empleados')
        .insert(empleadoBD);

      if (errEmp){
        throw new Error('Error al registrar empleado: ', { cause: errEmp });}
    }
    
    
    if(typeof usr.foto === 'string' ){
      if(usr.foto?.startsWith('file:') || usr.foto?.startsWith('data:')){
        usr.foto = await this.subirFotoUsuario(usr, usr.foto);
      } else{
        usr.foto = this.obtenerUrlPublica(usr);
      }
    } else {
        usr.foto = await this.subirFotoUsuario(usr, usr.foto);
    }

    console.log('Usuario agregado con éxito')
  }
  //! ======================= Métodos Imagenes =======================
  private async eliminarFotoUsuario(usr: Usuario) {
    if(usr.perfil === 'cliente'){
    const { error } = await this.supabase.storage.from('foto-usuario').remove([`${usr.uid}1.png`,`${usr.uid}2.png`]);
    if (error) throw error;
    return
    }

    const { error } = await this.supabase.storage.from('foto-usuario').remove([`${usr.uid}.png`]);
    if (error) throw error;
  }


  //? Sube una foto asociada a un usuario
  //* Retorna la url de la foto subida.

  private async subirFotoUsuario(usr: Usuario, foto: string[]| string): Promise<string | string[]> {
    if (!usr?.uid) throw new Error('Usuario inválido.');
    if (!foto) throw new Error('Foto inválida.');
    
    
    if(typeof foto === 'string'){
      if(!foto.startsWith('data:')) throw new Error('Foto inválida.');
      var archivo = this.utilSvc.formatearBase64AImagen(foto); 
      
      const rutaArchivo = `${usr.uid}.png`;
  
      const { error } = await this.supabase.storage
        .from('foto-usuario')
        .upload(rutaArchivo, archivo
        , { cacheControl: '3600', upsert: true, contentType: 'image/png' });
  
      if (error) throw new Error(`Error subiendo la foto: ${error.message}`);
  
      const { data } = this.supabase.storage
        .from('foto-usuario')
        .getPublicUrl(rutaArchivo);
  
      return data.publicUrl;
    } else {

      const arrayFotos = foto.map(f =>{ 
        return this.utilSvc.formatearBase64AImagen(f)
      }) // decodifica todas las fotos

      const urls = await Promise.all(arrayFotos.map(async (archivo, i:number) => {
        const rutaArchivo = `${usr.uid}${i}.png`; 

        const { error } = await this.supabase.storage
          .from('foto-usuario')
          .upload(rutaArchivo, archivo, { cacheControl: '3600', upsert: true, contentType: 'image/png' });

        if (error) throw new Error(`Error subiendo la foto: ${error.message}`);

        const { data } = this.supabase.storage
          .from('foto-usuario')
          .getPublicUrl(rutaArchivo);

        return data.publicUrl;
      }));

      return urls; // devuelve un array de URLs
    }
  }
  
  obtenerUrlPublica(usr: Usuario): string | string[] {
    if (!usr.uid) return 'https://hdpijtoomoargexhddxr.supabase.co/storage/v1/object/public/foto-usuario/user-placeholder.png';

    if(typeof usr.foto === 'string'){
      const timestamp = new Date().getTime();
      const { data } = this.supabase
        .storage
        .from('foto-usuario')
        .getPublicUrl(`${usr.uid}.png`);
     
      return data?.publicUrl+`?v=${timestamp}`;
    } else{
      const timestamp = new Date().getTime();
      const { data: uno } = this.supabase
        .storage
        .from('foto-usuario')
        .getPublicUrl(`${usr.uid}0.png`)
      const { data: dos } = this.supabase
      .storage
      .from('foto-usuario')
      .getPublicUrl(`${usr.uid}1.png`)

      return [uno.publicUrl+`?v=${timestamp}`, dos.publicUrl+`?v=${timestamp}`];

    }
  }
}
