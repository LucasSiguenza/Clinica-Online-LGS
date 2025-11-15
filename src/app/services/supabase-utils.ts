import { inject, Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseUtils {
  //! ======================= Variables y servicios =======================
  supabase: SupabaseClient;

    
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
  //! ======================= Métodos genéricos =======================

  //~ ======================= Métodos Select 
  async listarTodos<T>(tabla: string): Promise<T[]>{
    const {data, error} = await this.supabase
      .from(tabla)
      .select('*');

      if(error) throw new Error(`Error al adquirir la tabla '${tabla}': ${error.message}`);
      
      return data as T[];
  }
  async adquirirColumna<T>(tabla: string, columna: string): Promise<T[]> {
    const { data, error } = await this.supabase
    .from(tabla)
    .select(columna);
    
    if (error) {
      throw new Error(`Error al adquirir columna '${columna}' de la tabla '${tabla}': ${error.message}`);
    }
    
    return data as T[] ?? [];
  }
  
  async adquirirFila<T>(tabla: string, columnaIdent: string, identificador: string): Promise<T | null>{
    const {data, error} = await this.supabase
      .from(tabla)
      .select('*')
      .eq(columnaIdent,identificador)
      .maybeSingle();
    
    if(error) throw new Error(`Error al buscar: ${error.message}`);
    
    return data as T
  }

  async adquirirCelda<T>(tabla: string, columnaReturn: string,columnaIdent: string, identificador: string): Promise<T>{
    const {data, error} = await this.supabase
      .from(tabla)
      .select(columnaReturn)
      .eq(columnaIdent,identificador)
      .maybeSingle();

    if(error) throw new Error(`Error al buscar en ${tabla}, ${columnaIdent}, ${identificador}: ${(error as Error).message}`);
    
    if(!data) return null as T

    const registro = data as unknown as Record<string, unknown >;

    return (registro[columnaReturn] as T) ?? ('' as T);  
}

  //~ ======================= Métodos Insert 
  async insertar<T>(tabla: string, datos: T): Promise<void> {
    const { error } = await this.supabase
    .from(tabla)
    .insert(datos);
    
    if (error) throw new Error(`Error al insertar: ${error.message}`);
  }
  
  //~ ======================= Métodos Update 
  async actualizar<T>(tabla: string, columnaIdent: string, identificador: string, cambios: Partial<T>): Promise<void> {
    const { error } = await this.supabase
      .from(tabla)
      .update(cambios)
      .eq(columnaIdent, identificador);
    if (error) throw new Error(`Error al actualizar: ${error.message}`);
  }
  async eliminar<T>(tabla: string, columnaIdent: string, identificador: string): Promise<void> {
    const { error } = await this.supabase
      .from(tabla)
      .delete()
      .eq(columnaIdent, identificador)
      .single();

    if (error) throw new Error(`Error al elimnar: ${error.message}`);
  }


}
