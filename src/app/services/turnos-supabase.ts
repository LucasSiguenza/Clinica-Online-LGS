import { inject, Injectable, signal } from '@angular/core';
import { SupabaseUtils } from './supabase-utils';
import { Turno } from '../models/Turno';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Empleado } from '../models/Empleado';

@Injectable({
  providedIn: 'root'
})
export class TurnosSupabase {
  //! ======================= Variables y Servicios =======================
  
  private sbUtil = inject(SupabaseUtils);
  private canal = this.sbUtil.supabase.channel('turnos',{config: {}});
  private sb = this.sbUtil.supabase;

  //! ======================= Signals =======================
  
  turnoSeleccionado= signal<Turno | null>(null)
  listaTurnos = signal<Turno[] | []>([]);
  
  //! ======================= Métodos públicos =======================
  
  //~ ======================= Métodos canalTR 
  iniciarCanal(): RealtimeChannel{
    return this.canal
    .on('postgres_changes',
      {event: '*', schema: 'public', table: 'turnos'},
      (registro) =>{
        console.log(`Evento: ${JSON.stringify(registro)}`)
        console.log(`Nuevo suceso: ${JSON.stringify(registro.new)}`)
        console.log(`Suceso anterior: ${JSON.stringify(registro.old)}`)
      }
    )
    .subscribe()
  }
  //~ ======================= Métodos signals
    async cargarLista(){
      const lista = await this.listarTurnosDB() 
      this.listaTurnos.set(lista)
    }

    async actualizarTurno(t: Turno){
      await this.actualizarTurnoDB(t);
      await this.cargarLista()
    }

    async eliminarTurno(t: Turno){
      await this.eliminarTurnoDB(t);
      await this.cargarLista();
    }

    async agregarTurno(t: Turno){
     await  this.agregarTurnoDB(t);
      await this.cargarLista();
    }

    async recuperarListados():Promise<[Empleado[], string[]]>{
      let listaReturn:[Empleado[],string[]] = [[],[]];
      try{
        //~ Buscamos una lista completa de la interfaz empleados, por lo que
        //~ empleamos el método all de la interfaz Promise, que espera a cada una de las promesas.
        const listEmpleados:Empleado[] = await Promise.all(
          //~ Se llama a la lista completa de empleados.
          (await this.sbUtil.listarTodos('empleados'))
          //~ Se mapea cada item del array resultante
          .map(async (item:any): Promise<Empleado> => ({
            id: item.id, //~ Se le asigna su id
            empleado: await this.sbUtil.adquirirCelda('usuarios', 'apellido','id',item.empleado), //~ Se busca en la tabla usuarios su nombre
            especialidad: await this.sbUtil.adquirirCelda('especialidades','nombre','id',item.especialidad), //~ Lo mismo en la tabla especialidad
            idEmpleado: item.empleado,
            idEspecialidad: item.especialidad
          }
        )));
        
        //~ Repetimos proceso para especialidad
        
        const listaEspecialidad:string[] = 
        (await this.sbUtil.listarTodos<{ nombre: string }>('especialidades'))
        .map(esp => esp.nombre);
        
        listaReturn[0] = listEmpleados;
        listaReturn[1] = listaEspecialidad;
        
      }catch(e){
        console.error(`Hubo un error al cargar listado en: ${(e as Error).message}`)
      }
      return listaReturn;
    }

  //! ======================= Métodos privados =======================

  private async listarTurnosDB(){
    let listaDB: Turno[] = []
    try{
      listaDB = await Promise.all(
      (await this.sbUtil.listarTodos('turnos'))
        .map(async (t: any): Promise<Turno> => {

          // === Obtener fila de empleados ===
          const filaEmpleado = await this.sbUtil.adquirirFila<{ empleado: number }>(
            'empleados',
            'id',
            t.empleado
          );

          const idUsuarioEmpleado = filaEmpleado?.empleado ?? null;

          // === Obtener nombre y apellido del empleado ===
          let nombreEmpleado = 'Sin asignar';
          if (idUsuarioEmpleado) {
            const nombre = await this.sbUtil.adquirirCelda<string>('usuarios', 'nombre', 'id', String(idUsuarioEmpleado));
            const apellido = await this.sbUtil.adquirirCelda<string>('usuarios', 'apellido', 'id', String(idUsuarioEmpleado));
            nombreEmpleado = `${nombre} ${apellido}`;
          }

          // === Obtener nombre del paciente ===
          const nombrePaciente = `${await this.sbUtil.adquirirCelda('usuarios','nombre','id', t.paciente)} ${await this.sbUtil.adquirirCelda('usuarios','apellido','id', t.paciente)}`;

          return {
            id: t.id,
            duracion: t.duracion,
            creado: t.creado,
            estado: t.estado,
            empleado: t.empleado,
            especialidad: t.especialidad,
            fecha: t.fecha,
            paciente: t.paciente,
            resenia: (await this.sbUtil.adquirirCelda('resenias','comentario','turno', t.id)) ?? 'Sin comentarios',
            nombreEmpleado,
            nombrePaciente,
            nombreEspecialidad: await this.sbUtil.adquirirCelda('especialidades', 'nombre', 'id', t.especialidad)
          }
        })
    );
    } catch(e){
      console.error(`Hubo un error al cargar listado en: ${(e as Error).message}`)
    } 
    return listaDB ?? [];
    
  }

  private async agregarTurnoDB(turno: Turno){
    try{
      await this.sbUtil.insertar<Turno>('turnos', turno);
    } catch(e){
      console.error(`Hubo un error al agregar el turno: ${(e as Error).message}`)
    } 
  }

  private async actualizarTurnoDB(turno: Turno){
    try{
      await this.sbUtil.actualizar<Turno>('turnos','id',String(turno.id),turno);
    } catch(e){
      console.error(`Hubo un error editar el turno: ${(e as Error).message}`)
    } 
  }

  private async eliminarTurnoDB(turno: Turno){
    try{
      await this.sbUtil.eliminar<Turno>('turnos', 'id', String(turno.id));
    } catch(e){
      console.error(`Hubo un error al cargar listado en: ${(e as Error).message}`)
    } 
  }


}
