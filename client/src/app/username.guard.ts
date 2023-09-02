import { CanActivateFn } from '@angular/router';

export const usernameGuard: CanActivateFn = (route, state) => {

  const username = localStorage.getItem('username');
  if(!username) {
    return false;

  }

  return true;
};
