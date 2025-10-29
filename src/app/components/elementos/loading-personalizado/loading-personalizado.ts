import { Component, inject } from '@angular/core';
import { Utils } from '../../../services/util';

@Component({
  selector: 'app-loading-personalizado',
  imports: [],
  templateUrl: './loading-personalizado.html',
  styleUrl: './loading-personalizado.scss'
})
export class LoadingPersonalizado {
  utils = inject(Utils);
}
