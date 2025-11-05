import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import {provideSweetAlert2} from '@sweetalert2/ngx-sweetalert2'

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideSweetAlert2({
      dismissOnDestroy: true,
      fireOnInit: false
    }),
    provideRouter(routes)
  ]
};
