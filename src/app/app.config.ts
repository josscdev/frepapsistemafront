import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptor/auth.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { networkInterceptor } from './public/services/ROM/entel/validacion-bundles/network-interceptor.service';


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor,networkInterceptor])),
    //provideHttpClient(withInterceptors([])),
    // { provide: HTTP_INTERCEPTORS, useClass: NetworkInterceptor, multi:
    //   true
    //   }
    // provideHttpClient(withInterceptors
    provideAnimations(), provideAnimationsAsync(),
  ],
};
