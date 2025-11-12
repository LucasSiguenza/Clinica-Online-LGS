import { Component, computed, effect, inject, Injector, signal } from '@angular/core';
import { TurnosSupabase } from '../../services/turnos-supabase';
import { Utils } from '../../services/util';
import {MatStepperModule} from '@angular/material/stepper';
import {MatTimepickerModule, MatTimepickerOption} from '@angular/material/timepicker';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { DialogRef } from '@angular/cdk/dialog';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseUtils } from '../../services/supabase-utils';
import { Empleado } from '../../models/Empleado';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { AuthSupabase } from '../../services/auth-supabase';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatListModule } from '@angular/material/list';
import { AsyncPipe } from '@angular/common';
import { MesPipePipe } from '../../pipes/mes-pipe-pipe';
import { DiasamanaSelectorRadios } from "../elementos/diasamana-selector-radios/diasamana-selector-radios";
import { Turno } from '../../models/Turno';

type Reunion = {
  anio: number | null;
  mes: number | null;
  dia: number | null;
  hora: string | null;
};

@Component({
  selector: 'app-form-turno',
  imports: [ReactiveFormsModule,
    MatAutocompleteModule,
    MatInputModule,
    MatOptionModule,
    MatButtonToggleModule,
    MatListModule,
    MatStepperModule,
    DatePipe,
    MesPipePipe,
    TitleCasePipe, DiasamanaSelectorRadios],
  providers: [TitleCasePipe], 
  templateUrl: './form-turno.html',
  styleUrl: './form-turno.scss'
})
export class FormTurno {
  //! ==================== Variables y servicios ====================
  
  //^ ==================== Servicios y variables
  
  private turnoSvc = inject(TurnosSupabase);
  private auth = inject(AuthSupabase);
  private utilSvc = inject(Utils);
  private sbSvc = inject(SupabaseUtils);
  private dialogCtrl = inject(DialogRef);
  protected usuarioActual = this.auth.usuarioActual();
  
  
  protected isNuevo = this.turnoSvc.turnoSeleccionado() === null
  //^ ==================== Signals
  protected empleadoSeleccionado = signal<Empleado | null>(null);
  protected especialidadSeleccionada = signal<string | null>(null);
  protected listaEmpleados= signal<Empleado[] | null>([]);
  protected listaEspecialidad= signal<string[] | null>([]);
  protected paciente = signal<string | null>(null);
  protected listaHorarios = computed<Date[]>(() => {
    const { anio, mes, dia } = this.reunion();
    if (!anio || !mes || !dia) return [];
    
    const inicio = 8 * 60;
    const fin = 19 * 60;
    const intervalo = 30;

    const lista: Date[] = [];
    
    for (let t = inicio; t <= fin; t += intervalo) {
      const hora = Math.floor(t / 60);
      const minuto = t % 60;
      const fecha = new Date(anio, mes - 1, dia, hora, minuto);
      const ocupado = this.ocupados().some(o => o.getTime() === fecha.getTime());
      if (!ocupado) lista.push(fecha);
    }

    return lista;
  });

  protected reunion = signal<Reunion>({
    anio: null,
    mes: null,
    dia: null,
    hora: null
  });
  protected listaFechas = signal<Date[] | null>(null)
  
  //^ ==================== Form
  
  protected form = new FormGroup({
    empleado: new FormControl<Empleado | string>('', [Validators.required]),
    especialidad: new FormControl('', [Validators.required]),
    duracion: new FormControl('', [Validators.required]),
    paciente: new FormControl('', [Validators.required]),
    fecha: new FormControl<Date | null>(null, [Validators.required]),
  })
  r: any;
  
  //^ ==================== Listas
  //? Temporal
  aniosDisponibles = [2025, 2026];
  ocupados = signal<Date[]>([
    new Date(2025, 10, 15, 10, 0),
    new Date(2025, 10, 15, 15, 30)
  ]);
  private listados!: any[];


  constructor() {      
    //? Se define los parámetros reactivos para que reunión se actualice en cada cambio
    //? Y defina el valor del parámetro fecha al completar el registro.  
    effect(
      () => {
        const datos = this.reunion();
        if(!datos) return '';
        
        const {anio, mes, dia, hora } = datos;
        
        if (anio && mes && dia && hora) {
          const [h, m] = hora.split(':').map(Number);
          const fechaCompleta = new Date(
            anio, // o podrías usar un signal de anio si lo pedís en el paso anterior
            mes - 1,                  // Date usa meses 0–11
            Number(dia),              // convierte el string a número
            h, m, 0, 0 );
            
            return this.form.controls['fecha'].setValue(fechaCompleta);
          }
    });
  }

  async ngOnInit(){
    this.utilSvc.mostrarLoading();
    this.listados = await this.turnoSvc.recuperarListados();
    this.listaEmpleados.set(this.listados[0]);
    this.listaEspecialidad.set(this.listados[1]);
    this.reunion.set({anio : null ,mes : 1, dia: null, hora: null})
    if(this.usuarioActual != null && this.usuarioActual.perfil === 'cliente') this.paciente.set(this.usuarioActual.id!);
    this.utilSvc.ocultarLoading();
  }

  filtrarEmpleados():Empleado[]{
    if(this.especialidadSeleccionada() === null) return [];
    return this.listaEmpleados()!.filter(m => m.especialidad === this.especialidadSeleccionada());
  }
  //! ==================== Métodos auxiliares ====================
  actualizarReunion<K extends keyof Reunion>(campo: K, valor: Reunion[K]) {
    this.reunion.update(r => ({ ...r, [campo]: valor }) as typeof r);
    console.log(JSON.stringify(this.reunion()))
    console.log(JSON.stringify(this.form.controls.fecha.value))
  }

   protected displayEmpleado = (emp: Empleado): string => {
    this.empleadoSeleccionado.set(emp) 
    return emp ? emp.empleado.toLowerCase()
      .split(' ')
      .filter(p => p.trim().length > 0)
      .map(p => p[0].toUpperCase() + p.slice(1))
      .join(' ') : '';
  }

  protected displayEspecialidad = (esp: string | null): string => {
  if (!esp) return '';
  this.especialidadSeleccionada.set(esp);
  console.log(this.especialidadSeleccionada());
  return esp
    .toLowerCase()
    .split(' ')
    .filter(p => p.trim().length > 0)
    .map(p => p[0].toUpperCase() + p.slice(1))
    .join(' ');
};

  //! ==================== Métodos de botones ====================
  modificarMes(suma: boolean){
    console.log(this.reunion().mes);
    if(suma && this.reunion().mes! < 12) this.actualizarReunion('mes', (this.reunion().mes! + 1))
    if(suma) return;
    else {
      if(this.reunion().mes! > 1) 
        {
          this.actualizarReunion('mes', (this.reunion().mes! - 1))
        }
      }
  }
  

  async confirmar(){
    this.utilSvc.mostrarLoading();
    let duracion: string | null;
    
    if(this.isNuevo) duracion = '30';
    else duracion = this.form.controls.duracion!.value;

    const turnoForm: Turno ={
      duracion: String(duracion),
      empleado: this.empleadoSeleccionado()!.id!,
      especialidad: this.empleadoSeleccionado()!.idEspecialidad!,
      fecha: this.form.controls.fecha.value!,
      paciente: this.paciente(),
    }

    try{
      console.log('Turno creado')
      this.turnoSvc.agregarTurno(turnoForm);
      console.log("¡Turno agendado!")
    }catch(e){
      this.utilSvc.mostrarAlert({
        text: `Causa: ${(e as Error).cause}\nMensaje: ${(e as Error).message}`,
        title: '¡HUBO UN ERROR!',
        icon: 'error'
      });
      console.log(JSON.stringify(e));
      this.utilSvc.ocultarLoading();
      return
    } 
    this.utilSvc.ocultarLoading();
    return this.dialogCtrl.close()
  }

  async cancelar(){
    this.dialogCtrl.close()
  }

}
