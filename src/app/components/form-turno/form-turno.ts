import { Component, computed, effect, inject, Injector, signal, ViewChild } from '@angular/core';
import { TurnosSupabase } from '../../services/turnos-supabase';
import { Utils } from '../../services/util';
import {MatStepper, MatStepperModule} from '@angular/material/stepper';
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
import { FechaFormatoPipe } from '../../pipes/fecha-formato-pipe';
import { InputTurnoComponent } from "../elementos/input-turno/input-turno";

type Reunion = {
  dia: Date | null;
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
    TitleCasePipe,
    DiasamanaSelectorRadios,
    FechaFormatoPipe, InputTurnoComponent],
  providers: [TitleCasePipe], 
  templateUrl: './form-turno.html',
  styleUrl: './form-turno.scss'
})
export class FormTurno {
  //! ==================== Variables y servicios ====================
  
  //^ ==================== Servicios y variables
  
  protected turnoSvc = inject(TurnosSupabase);
  private sbSvc = inject(SupabaseUtils);
  private auth = inject(AuthSupabase);
  private utilSvc = inject(Utils);
  private dialogCtrl = inject(DialogRef);
  protected usuarioActual = this.auth.usuarioActual();
  protected isNuevo = this.turnoSvc.turnoSeleccionado() === null
  @ViewChild(MatStepper) stepper?: MatStepper;
  protected isEditando = !this.isNuevo && !!this.usuarioActual && this.usuarioActual.perfil !== 'cliente'; 
  
  
  //^ ==================== Signals
  protected fechaTurno = signal<Date | null>(null);
  protected empleadoSeleccionado = signal<Empleado | null>(null);
  protected especialidadSeleccionada = signal<string | null>(null);
  protected reunion = signal<Reunion>({
      dia: null,
      hora: null
    });
  protected paciente = signal<string | null>(null);
  protected isTurnoSeleccionado = signal<boolean>(true);
  protected turnoSeleccionado = this.turnoSvc.turnoSeleccionado();
  //~ Listas
  private listaDiasOcupados: Date[] = [];
  protected listaFechas = signal<Date[] | null>(null)
  protected listaEspecialidad= signal<string[] | null>([]);
  protected listaEmpleados= signal<Empleado[] | null>([]);
  protected listaHorarios = computed<Date[]>(() => {
    
    const listaOcupados = this.listaDiasOcupados;
    const selected = this.reunion().dia;
    if (!selected) return [];

    
    const inicio = 8 * 60;
    const fin = 19 * 60;
    const intervalo = 30;
    const lista: Date[] = [];
    
    for (let t = inicio; t <= fin; t += intervalo) {
      const hora = Math.floor(t / 60);
      const minuto = t % 60;

      const fecha = new Date(
        selected.getFullYear(),
        selected.getMonth(),
        selected.getDate(),
        hora,
        minuto,
        0,
        0
      );
      const fechaNorm = this.utilSvc.normalizarAMinutos(fecha);
      const ocupado = (this.listaDiasOcupados ?? []).some(o =>
        this.utilSvc.normalizarAMinutos(o).getTime() === fechaNorm.getTime()
      );

      if (!ocupado) lista.push(fechaNorm);
  }

  return lista;  });
  protected empleadosFiltrados = computed(() => {
    const esp = this.especialidadSeleccionada();
    console.log(esp);
    if (!esp) return [];
    console.log(JSON.stringify(this.listaEmpleados()!.filter(e => e.especialidad === esp)));
    return this.listaEmpleados()!.filter(e => e.especialidad === esp);
  });

  
  //^ ==================== Form
  
  protected form = new FormGroup({
    empleado: new FormControl<Empleado | string>('', [Validators.required]),
    especialidad: new FormControl('', [Validators.required]),
    duracion: new FormControl('', [Validators.required]),
    paciente: new FormControl('', [Validators.required]),
    fecha: new FormControl<Date | null>(null, [Validators.required]),
  })
  r: any;
  
  //? Temporal
  private listados!: any[];


  constructor() {      
    //? Se define los parámetros reactivos para que reunión se actualice en cada cambio
    //? Y defina el valor del parámetro fecha al completar el registro.  
     effect(() => {
        const { dia, hora } = this.reunion();

        //~ Si no hay día, limpiamos el control
        if (!dia) {
          this.form.controls['fecha'].setValue(null);
          return;
        }

        //^ Clonamos la fecha seleccionada para no mutar el original
        const fechaBase = new Date(dia);
        fechaBase.setHours(0, 0, 0, 0);

        if (!hora) {
          //~ Si solo hay día, rompemos la actualización
          return;
        }

        //^ Si hay hora, la aplicamos sobre la fecha clonada
        const [h, m] = hora.split(':').map(Number);
        const fechaCompleta = new Date(fechaBase);
        fechaCompleta.setHours(h, m, 0, 0);

        this.form.controls['fecha'].setValue(fechaCompleta);
      });
  }

  async ngOnInit(){
    this.utilSvc.mostrarLoading();
    this.listados = await this.turnoSvc.recuperarListados();
    this.listaEmpleados.set(this.listados[0]);
    this.listaEspecialidad.set(this.listados[1]);
    if(this.isNuevo){
      this.reunion.set({dia: null, hora: null})
      if(this.usuarioActual!.perfil !== 'empleado') this.paciente.set(this.usuarioActual!.id!);
     } 
    else{
      this.form.patchValue({
        duracion: this.turnoSvc.turnoSeleccionado()?.duracion,
        empleado: this.listaEmpleados()?.find(emp => emp.idEmpleado === this.turnoSvc.turnoSeleccionado()?.empleado),
        fecha: new Date(this.turnoSvc.turnoSeleccionado()?.fecha!),
        especialidad: await this.sbSvc.adquirirCelda('especialidades','nombre','id',String(this.turnoSvc.turnoSeleccionado()?.especialidad)),
        paciente: this.turnoSvc.turnoSeleccionado()?.paciente,
      });
      const f = new Date(this.turnoSvc.turnoSeleccionado()!.fecha);
      this.fechaTurno.set(f);
      this.listaDiasOcupados = await this.turnoSvc.listarTurnosOcupados();
      console.log('Valores agregados');
     }

    this.utilSvc.ocultarLoading();
  }

  //! ==================== Métodos auxiliares ====================

  actualizarReunion<K extends keyof Reunion>(campo: K, valor: Reunion[K]) {
    this.reunion.update(r => ({ ...r, [campo]: valor }) as typeof r);

    if (campo === 'hora') this.modificarStepper();
  }

  actualizarDiasSegunSemana(fechas: Date[]) {
    this.listaFechas.set(fechas);
  }

  modificarStepper() {
    this.isTurnoSeleccionado.set(!this.isTurnoSeleccionado());
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

  protected actualizarTurno(act: Date){
    console.log(JSON.stringify(act));
    this.form.patchValue({
      fecha: act
    })
  }
  //! ==================== Métodos de botones ====================
  

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
      if(this.isNuevo){
        await this.turnoSvc.agregarTurno(turnoForm);
        this.utilSvc.mostrarAlert({
          text: `¡Turno agendado!`,
          title: '¡Felicidades!',
          icon: 'success',
          theme: 'dark'
        });
      } else{
        await this.turnoSvc.actualizarTurno(turnoForm);
        this.utilSvc.mostrarAlert({
          text: `¡Turno actuallizado!`,
          title: '¡Felicidades!',
          icon: 'success',
          theme: 'dark'
        });
        this.turnoSvc.turnoSeleccionado.set(null);
      }
 
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
