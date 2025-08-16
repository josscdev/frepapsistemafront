import {
  HttpEvent,
  HttpHandler,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { SecurityService } from '../../intranet/services/auth/security.service';
import { catchError, throwError } from 'rxjs';
import { routes } from '../../app.routes';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const securityService = inject(SecurityService);
  const routes = inject(Router);
  const token = securityService.getToken();
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe
    (catchError((error) => {
      const CODES = [401, 403]
      if (CODES.includes(error.status)) {
        console.log('Error 401/403', 'DEBES LOGEARTE NUEVAMENTE 😎', error.status);
        //modificas cuando haya un deslogeo joss, pones el metodo aca
        
        securityService.logout(); // <-- Este método debería limpiar el token

        // Mostrar Swal y esperar la interacción
        Swal.fire({
          icon: 'warning',
          title: 'Sesión expirada',
          text: 'Tu sesión ha expirado. Por favor vuelve a iniciar sesión.',
          confirmButtonText: 'OK',
          allowOutsideClick: true, // permite cerrar haciendo clic fuera
        }).then(() => {
          location.href = '/'; // ⚠️ location.href = '/' es más directo que router.navigate(['/']), porque recarga la aplicación completamente
        });
        
        // routes.navigate(['/auth/loginTwo']); // <-- Asegúrate que esta ruta exista

        return throwError(() => error);
      }
      return throwError(() => error);
    }
    ));
};
