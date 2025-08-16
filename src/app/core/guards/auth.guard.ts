import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  // Agregamos la lógica para validar el token aquí
  const token = localStorage.getItem('token');
  const router: Router = new Router(); // Se crea una nueva instancia de Router

  if (token) {
    // El token está presente, permitir el acceso a la ruta
    return true;
  } else {
    // El token no está presente, redirigir al main
    router.navigate(['/']); // Redirige al main
    return false;
  }
};
