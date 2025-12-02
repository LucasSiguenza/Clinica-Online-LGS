import { CanActivateFn } from '@angular/router';

export const turnoCompletadoGuard: CanActivateFn = (route, state) => {
  return true;
};
