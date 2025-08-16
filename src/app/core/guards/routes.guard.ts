import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

export const routesGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  // Agregamos la lógica para validar el token aquí
  const token = localStorage.getItem('token');
  const router: Router = new Router(); // Se crea una nueva instancia de Router

  if (!token) {
    // El token no está presente, redirigir al inicio de sesión
    router.navigate(['/']); // Redirige al inicio de sesión
    return false;
  }

  // Obtener el menú del localStorage
  const menuString = localStorage.getItem('menu');
  let menu;
  if (menuString) {
    menu = JSON.parse(menuString);
  } else {
    // Manejar el caso en el que no hay menú en el localStorage
    return false;
  }

  // Obtener la ruta solicitada
  const requestedPath = state.url;

  // Verificar si la ruta solicitada está presente en el menú
  //console.log('requestedPath', requestedPath);

  let url = requestedPath;
  let partes = url.split("/");

  // Quitamos la primera parte que es vacía y la parte "main"
  let nuevaUrl = partes.slice(2).join("/");

  //console.log('nuevaUrl',nuevaUrl);
  
  const isAuthorized = checkAuthorization(menu, nuevaUrl);

  console.log('Vista Autorizada?', isAuthorized);

  if (isAuthorized) {
    // El usuario tiene acceso a la ruta solicitada
    return true;
  } else {
    // El usuario no tiene acceso a la ruta solicitada, redirigir a una página de error o denegar el acceso
    router.navigate(['/unauthorized']); // Redirige a la página de no autorizado
    return false;
  }
};

function checkAuthorization(menu: any, requestedPath: string): boolean {
  //console.log('DEBE ENTRAR checkAuthorization');
  //console.log('menu', menu);
  console.log('requestedPath', requestedPath);

  if(requestedPath==='Seguridad/AdministracionPermisos/UsuarioPermisos'){
    return true;
  }

  if(requestedPath==='Seguridad/AdministracionPermisosTawa/UsuarioPermisos'){
    return true;
  }

  if(requestedPath==='Seguridad/AdministracionPermisosLimtek/UsuarioPermisos'){
    return true;
  }

  if (!menu || !Array.isArray(menu)) {
    return false; // No hay menú o no es un array válido
  }

  // Recorrer los módulos en el menú
  for (const modulo of menu) {
    // Verificar si la ruta del módulo coincide
    //console.log('modulo', modulo);
    //console.log('modulo.rutamodulo', modulo.rutamodulo);
    if (modulo.rutamodulo && modulo.rutamodulo === requestedPath) {
      //console.log('modulo.rutamodulo', modulo.rutamodulo);

      return true; // La ruta solicitada está presente en el menú
    }


    //console.log('modulo.submodules', modulo.submodules);
    // Si hay submódulos, recorrerlos
    if (modulo.submodules && Array.isArray(modulo.submodules)) {
      for (const submodulo of modulo.submodules) {
        //console.log('submodulo.rutasubmodulo', submodulo.rutasubmodulo);
        // Verificar si la ruta del submódulo coincide
        if (submodulo.rutasubmodulo && submodulo.rutasubmodulo === requestedPath) {
          //console.log('submodulo.rutasubmodulo', submodulo.rutasubmodulo);

          return true; // La ruta solicitada está presente en el menú
        }

        // Si hay ítems, recorrerlos
        if (submodulo.items && Array.isArray(submodulo.items)) {
          for (const item of submodulo.items) {
            // Verificar si la ruta del ítem coincide
            if (item.rutaitemmodulo && item.rutaitemmodulo === requestedPath) {
              //console.log('item.rutaitemmodulo', item.rutaitemmodulo);

              return true; // La ruta solicitada está presente en el menú
            }
          }
        }
      }
    }
  }

  return false; // La ruta solicitada no está en el menú
}

