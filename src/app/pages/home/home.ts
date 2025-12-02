import { Component, ElementRef, AfterViewInit, ViewChild, inject } from '@angular/core';
import { Utils } from '../../services/util';
import { AuthSupabase } from '../../services/auth-supabase';
import { Header } from "../../components/header/header";
import { MatDialog } from '@angular/material/dialog';
import { FormTurno } from '../../components/form-turno/form-turno';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.scss',
  imports: [Header],
})
export class Home {
  private utilSvc = inject(Utils);
  protected auth = inject(AuthSupabase);
  private dialogCtrl = inject(MatDialog);
  
  async abrirFormTurno() {
    this.dialogCtrl.open(FormTurno, {
      width: 'min(90vw, 600px)',
      height: '80vh',
      maxHeight: '80vh',
      panelClass: 'dialog-turno',
      autoFocus: false,
    });
  }

  
}
