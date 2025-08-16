import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth/auth.service';
import { BusinessUserRequest } from '../../../../models/Auth/businessUserRequest';
import { BusinessUserResponse } from '../../../../models/Auth/businessUserResponse';
import { BusinessAccountUserRequest } from '../../../../models/Auth/businessAccountUserRequest';
import { BusinessAccountUserResponse } from '../../../../models/Auth/businessAccountUserResponse';
import { CodigosRequest } from '../../../../models/rom/seguridad/codigo';

@Component({
  selector: 'app-login-three',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './login-three.component.html',
  styleUrl: './login-three.component.css'
})
export class LoginThreeComponent {
  loginForm: UntypedFormGroup;
  listBusiness: BusinessUserResponse[] = [];
  listAccount: BusinessAccountUserResponse[] = [];
  businessUserRequest: BusinessUserRequest = new BusinessUserRequest();
  businessAccountUserRequest: BusinessAccountUserRequest = new BusinessAccountUserRequest();

  constructor(
    private router: Router,
    private authService: AuthService,
    private fb: UntypedFormBuilder
  ) {
    this.loginForm = this.createFormLogin();
  }

  ngOnInit(): void {
    //this.formLogin();
    this.getBusiness();
  }

  createFormLogin(): UntypedFormGroup {
    return this.fb.group({
      business: new FormControl("", Validators.compose([
        Validators.required,
      ])),
      businessAccount: new FormControl("", Validators.compose([
        Validators.required,
      ]))
    });
  }

  getLogin() {
    console.log(this.loginForm.getRawValue());
    localStorage.setItem('idnegocio', this.loginForm.getRawValue().business);
    localStorage.setItem('idcuenta', this.loginForm.getRawValue().businessAccount);

    //Capturando el nombre del Socio mediante la cuenta
    const idcuenta = Number(localStorage.getItem('idcuenta'));
    const nombrecuenta = this.listAccount.find(account => account.idcuenta === idcuenta)?.nombrecuenta;
    localStorage.setItem('nombrecuenta', nombrecuenta || 'sinnombre');

    const request: CodigosRequest = {
      idpais: Number(localStorage.getItem('idpais')),
      idempresa: Number(localStorage.getItem('idempresa')),
      idnegocio: Number(localStorage.getItem('idnegocio')),
      idcuenta: Number(localStorage.getItem('idcuenta')),
    }

    this.authService.getIdCodigo(request).subscribe(res => {
      console.log('idemppaisnegcue', res)
      if (res != null) {
        localStorage.setItem('idemppaisnegcue', res.idemppaisnegcue);

        const requestPdv: CodigosRequest = {
          idemppaisnegcue: Number(localStorage.getItem('idemppaisnegcue') || 0),
          usuario: (localStorage.getItem('user') || '')
        }
        console.log('requestPdv', requestPdv);

        this.authService.getIdPdv(requestPdv).subscribe(resPdv => {
          console.log('GETIDPDV', resPdv);
          localStorage.setItem('idpdv', resPdv.idpdv)
        })

        const requestRuta = {
          idemppaisnegcue: Number(localStorage.getItem('idemppaisnegcue')) || 0,
        };
        
        // Verifica el request antes de enviarlo
        console.log('Request a enviar:', requestRuta);
        
        this.authService.getRutaPrincipal(requestRuta).subscribe({
          next: (res) => {
            console.log('GETRUTAPRINCIPAL', res);
            
            if (res?.ruta) {
              this.router.navigate([res.ruta]);
            } else {
              console.warn('No se recibió una ruta válida');
            }
          },
          error: (err) => {
            console.error('Error al obtener la ruta principal', err);
            if (err.status === 404) {
              console.warn('No se encontró una ruta para el parámetro proporcionado.');
            }
          },
        });
        
      }
    })
    // this.securityService.authentication().subscribe(res => {
    //   console.log(res.token);
    //   console.log(res.expirationDate);
    //   //this.cookieService.set('token', res.token);
    //   this.router.navigate(['/auth/loginThree']);
    // })

  }

  getBusiness() {
    const idempresa = Number(localStorage.getItem('idempresa'));
    const idpais = Number(localStorage.getItem('idpais'));
    const user = localStorage.getItem('user');
    if (idempresa !== null && idpais !== null && user !== null) {
      this.businessUserRequest.idempresa = idempresa;
      this.businessUserRequest.idpais = idpais;
      this.businessUserRequest.user = user;
    }

    console.log(this.businessUserRequest);

    this.authService.getBusiness(this.businessUserRequest).subscribe(res => {
      this.listBusiness = res;
      console.log(this.listBusiness);

    })
  }

  ongetBusinessAccount(event: any) {

    const idnegocio = (event.target as HTMLSelectElement)?.value;

    console.log(idnegocio);

    if (idnegocio !== null) {
      const idempresa = Number(localStorage.getItem('idempresa'))
      const user = localStorage.getItem('user')
      if (idempresa !== null && user !== null) {
        this.businessAccountUserRequest.idempresa = idempresa;
        this.businessAccountUserRequest.idnegocio = Number(idnegocio);
        this.businessAccountUserRequest.user = user;
      }
      console.log('this.businessAccountUserRequest', this.businessAccountUserRequest)
      this.authService.getBusinessAccount(this.businessAccountUserRequest).subscribe(res => {
        this.listAccount = res;
        console.log(this.listAccount);
      })
    }
  }

}
