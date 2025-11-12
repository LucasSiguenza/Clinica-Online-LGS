import { inject, Injectable, OnInit, signal } from '@angular/core';
import {createClient, RealtimeChannel, SupabaseClient} from '@supabase/supabase-js'
import { env } from '../../enviroments/enviroment';
import { Usuario } from '../models/Usuario';
import { TurnosSupabase } from './turnos-supabase';
import { SupabaseUtils } from './supabase-utils';

@Injectable({
  providedIn: 'root'
})
export class AuthSupabase{
  //? Instanciar Variables y servicios
  private sbUtil = inject(SupabaseUtils)
  supabase= this.sbUtil.supabase;
  private turnos = inject(TurnosSupabase);
  usuarioActual = signal<Usuario | null>(null);
  private canal?: RealtimeChannel; 


  //!==================== Métodos de autenticación ====================

  /**
   * Evalúa si ya existe el usuario en la bd y de no hacerlo lo registra 
   * @returns reporta con toastify los estados
   */
  async registrarUsuarioAuth(usr: Usuario, contrasenia: string){
    const correo = usr.correo;

    console.log("Correo: ",correo, " \nContraseña: ",contrasenia);

    const {data, error} = await this.supabase.auth.signUp({
      email: correo,
      password: contrasenia,
    });

    if(error) throw new Error('Algo salió mal al registrar. ',{cause:error.message});
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
