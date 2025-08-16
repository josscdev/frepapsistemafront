import { HttpInterceptorFn } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
let wasNetworkError = false;

export const networkInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log('DEBERIA ENTRAR');

      if (error.status === 0) {
        // Esto indica un error de red
        wasNetworkError = true;

        alert('Error de red: Verifique su conexión a internet.');
        window.location.reload();

      }
      else {
        // Si ya se había producido un error de red antes
        if (wasNetworkError) {
          // Actualizar la página
          window.location.reload();

        }
        wasNetworkError = false;
      }
      return throwError(() => error);
    })
  );
};
