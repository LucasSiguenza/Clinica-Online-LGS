import { inject, Injectable, signal } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { env } from '../../enviroments/enviroment';
import { Utils } from './util';
import { AuthSupabase } from './auth-supabase';
import { Usuario } from '../models/Usuario';
import { decode } from 'base64-arraybuffer';
import { startWith } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserSupabase {
  //? Instanciamos servicios y cliente.

  private supabase = createClient(env.supabaseURL, env.supabaseKey);
  private utilSvc = inject(Utils);
  private auth = inject(AuthSupabase); 

  //? Instanciamos signals

  private usuarioActual = signal<Usuario | null>(null);
  private listaUsuarios = signal<Usuario[] | null>(null);
  private usuarioSeleccionado = signal<Usuario | null>(null);

  //! ======================= Métodos CRUD =======================

  async cargarListado(){
    this.listaUsuarios.set(await this.obtenerListadoBD() ?? []); 
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
  
  //? Usuario Actual
  setUsuarioActual(usr: Usuario){
    this.usuarioActual.set(usr); 
  }
  getUsuarioActual(){
    return this.usuarioActual();
  }
  deseleccionarActual(){
    this.usuarioActual.set(null)
  }
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

  //? Lista de usuarios
  setListaUsuarios(lista: Usuario[]){
    this.listaUsuarios.set(lista); 
  }
  getListaUsuarios(){
    return this.listaUsuarios();
  }
  eliminarLista(){
    this.listaUsuarios.set(null)
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
        especialidad: u.especialidad ?? '',
        uid: u.uid, 
        nombre: u.nombre,
        apellido: u.apellido,
        edad: u.edad,
        dni: u.dni,
        correo: u.correo,
        perfil: u.perfil,
        foto: this.obtenerUrlPublica(u.uid),
      }));
    }
    
  

  private async actualizarUsuarioBD(usr: Usuario){
    const {data, error} = await this.supabase
    .from('usuarios')
    .update(usr)
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

    this.auth.registrarUsuarioAuth(usr, contrasenia);

    const {data, error} = await this.supabase
      .from('usuarios')
      .insert({
        obra_social: usr.obra_social ?? 'no',
        especialidad: usr.especialidad ?? 'no',
        nombre: usr.nombre ,
        apellido: usr.apellido,
        edad: usr.edad,
        dni: usr.dni,
        correo: usr.correo,
        perfil: usr.perfil
      })
    if(error) throw new Error('Algo salió mal:', {cause: error.message});

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
      const imagen = decode(foto);
      const archivo = new Blob([imagen], { type: 'image/png' });
      
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
        if(!f.startsWith('data:')) throw new Error('Foto inválida.');
        return decode(f)
      }) // decodifica todas las fotos

      const urls = await Promise.all(arrayFotos.map(async (imagen:ArrayBuffer, i:number) => {
        const rutaArchivo = `${usr.uid}${i}.png`; 

        const archivo = new Blob([imagen], { type: 'image/png' });

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
        .getPublicUrl(`${usr.uid}1.png`)
      const { data: dos } = this.supabase
      .storage
      .from('foto-usuario')
      .getPublicUrl(`${usr.uid}2.png`)

      return [uno.publicUrl+`?v=${timestamp}`, dos.publicUrl+`?v=${timestamp}`];

    }
  }
}
