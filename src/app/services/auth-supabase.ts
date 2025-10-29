import { inject, Injectable, OnInit } from '@angular/core';
import {createClient, SupabaseClient} from '@supabase/supabase-js'
import { env } from '../../enviroments/enviroment';
import { Usuario } from '../models/Usuario';

@Injectable({
  providedIn: 'root'
})
export class AuthSupabase{
  //? Instanciar Variables y servicios
  private supabase: SupabaseClient;
  
  constructor(){
    this.supabase = createClient(env.supabaseURL, env.supabaseKey,{
      auth:{
        persistSession: true,
        autoRefreshToken: true,
        storage: localStorage,
      } 
    });

    this.supabase.auth.getSession()
    
  }
  //!==================== . ====================
  //!==================== . ====================
  //!==================== Métodos de autenticación ====================


  /**
   * Evalúa si ya existe el usuario en la bd y de no hacerlo lo registra 
   * @returns reporta con toastify los estados
   */
  async registrarUsuarioAuth(usr: Usuario, contrasenia: string){
    const correo = usr.correo;

    const { data: correoDB} = await this.supabase
      .from('usuarios')
      .select('*')
      .eq('correo', correo)
      .single()

    const {data, error} = await this.supabase.auth.signUp({
      email: correo,
      password: contrasenia,
    });
    if(error) throw new Error('Algo salió mal al registrar',{cause:error.message});
    
  }

  async iniciarSesion(correo: string, contrasenia: string){
    const {data, error} = await this.supabase.auth.signInWithPassword({
      email: correo,
      password: contrasenia
    })
    if(error) throw new Error('Algo salió mal al iniciar sesión ',{ cause:error.message });

  }

}
