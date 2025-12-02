import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import {provideSweetAlert2} from '@sweetalert2/ngx-sweetalert2'
import { provideNativeDateAdapter } from '@angular/material/core';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideNativeDateAdapter(),
    provideZonelessChangeDetection(),
    provideSweetAlert2({
      dismissOnDestroy: true,
      fireOnInit: false
    }),
    provideRouter(routes)
  ]
};
