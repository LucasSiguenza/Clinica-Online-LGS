import { Component, ElementRef, AfterViewInit, ViewChild, inject } from '@angular/core';
import { Utils } from '../../services/util';
import { AuthSupabase } from '../../services/auth-supabase';
import { Header } from "../../components/header/header";

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.scss',
  imports: [Header],
})
export class Home {
  private utilSvc = inject(Utils);
  private auth = inject(AuthSupabase);

  async cerrarSesion(){
    this.utilSvc.mostrarLoading();
    try{
      await this.auth.cerrarSesion();
      this.utilSvc.redirigir('');
    } catch(e){
      console.error(e)
    } finally{
      this.utilSvc.ocultarLoading();
    }
  }
  
}
