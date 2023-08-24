import { CanActivateFn } from '@angular/router';

export const usernameGuard: CanActivateFn = (route, state) => {

  const username = localStorage.getItem('username');
  console.log("Username guard has a username", username);
  if(!username) {
    return false;

  }

  return true;
};
