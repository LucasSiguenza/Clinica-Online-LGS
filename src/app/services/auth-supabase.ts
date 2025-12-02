import { inject, Injectable, OnInit, signal } from '@angular/core';
import {createClient, RealtimeChannel, SupabaseClient} from '@supabase/supabase-js'
import { env } from '../../enviroments/enviroment';
import { Usuario } from '../models/Usuario';
import { TurnosSupabase } from './turnos-supabase';
import { SupabaseUtils } from './supabase-utils';
import { Utils } from './util';

@Injectable({
  providedIn: 'root'
})
export class AuthSupabase{
  //? Instanciar Variables y servicios
  private sbUtil = inject(SupabaseUtils)
  supabase= this.sbUtil.supabase;
  private turnos = inject(TurnosSupabase);
  usuarioActual = signal<Usuario | null>(null);
  isPrimerIngreso = signal<boolean>(true);
  private canal?: RealtimeChannel; 
  private utilSvc = inject(Utils); 

  //!==================== Métodos de autenticación ====================

  async registrarUsuario(correo: string, contrasenia: string){
    await this.supabase.auth.signUp({email: correo, password: contrasenia})
  }

  async iniciarSesionUsuario(correo: string, constrasenia: string){
    await this.supabase.auth.signInWithPassword({email: correo, password: constrasenia})
  }

  async cerrarSesionUsuario(){
    await this.supabase.auth.signOut();
  }

  /**
   * Evalúa si ya existe el usuario en la bd y de no hacerlo lo registra 
   * @returns reporta con toastify los estados
   */
  async registrarUsuarioAuth(usr: Usuario, contrasenia: string){
    const correo = usr.correo;

    const {data, error} = await this.supabase.auth.signUp({
      email: correo,
      password: contrasenia,
    });

    if(error) throw new Error('Algo salió mal al registrar. ',{cause:error.message});
    return data.user?.id;
    
  }

  async recuperarSesion(){
    const {data, error} = await this.supabase.auth.refreshSession()
    if(error){
      await this.supabase.auth.signOut({scope: 'local'})
      throw error;
    }
    return data.user?.id;
  }

  async cerrarSesion(){
    if(this.supabase.auth.getSession() == null) throw new Error('No hay sesión que cerrar'); 

    this.supabase.auth.signOut({scope: 'global'});
    if(this.canal) this.supabase.removeChannel(this.canal); this.canal = undefined;
    console.log('sesión cerrada.')
  }

  async iniciarSesion(correo: string, contrasenia: string){
    const {data, error} = await this.supabase.auth.signInWithPassword({
      email: correo,
      password: contrasenia
    })
    if(error) throw new Error('Algo salió mal al iniciar sesión ',{ cause:error.message });

    const {data: usuarioDB, error: eDB} = await this.supabase
      .from('usuarios')
      .select('*')
      .eq('uid', data.user.id)
      .single()

    if(eDB) throw new Error(`Fallo al obtener el usuario en la base de datos: ${eDB.cause}`, {cause: eDB.message});

    this.canal = this.turnos.iniciarCanal()

    this.usuarioActual.set(usuarioDB as Usuario);

  }

}
