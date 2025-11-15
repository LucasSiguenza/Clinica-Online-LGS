import { CanActivateFn } from '@angular/router';

export const sesionUsuarioGuard: CanActivateFn = (route, state) => {
  return true;
};
