import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Country } from '../../../../models/Auth/country';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth/auth.service';
import { LoginMainRequest } from '../../../../models/Auth/loginMainRequest';
import { SecurityService } from '../../../../services/auth/security.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login-two',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './login-two.component.html',
  styleUrl: './login-two.component.css'
})
export class LoginTwoComponent implements OnInit {
  loginForm: UntypedFormGroup;
  showPassword: boolean = false;
  listCountry: Country[] = [];
  loginMainRequest: LoginMainRequest = new LoginMainRequest();

  constructor(
    private router: Router,
    private authService: AuthService,
    private securityService: SecurityService,
    private fb: UntypedFormBuilder
  ){
    this.loginForm = this.createFormLogin();
  }

  ngOnInit(): void {
    this.getCountry();
    localStorage.removeItem('idpais');
    localStorage.removeItem('user');
    localStorage.removeItem('token');

  }

  createFormLogin(): UntypedFormGroup{
    return this.fb.group({
      country: new FormControl("", Validators.compose([
        Validators.required,
      ])),
      username: new FormControl('', Validators.compose([
        Validators.required,
      ])),
      password: new FormControl('', Validators.compose([
        Validators.required
      ]))
    });
  }

  getLogin(){
    console.log(this.loginForm.getRawValue());
    
    localStorage.setItem('idpais', this.loginForm.getRawValue().country);
    localStorage.setItem('user', this.loginForm.getRawValue().username);

    //console.log(localStorage.getItem('idempresa'));
    //console.log(localStorage.getItem('user'));
    let idempresa:any = localStorage.getItem('idempresa');
    this.loginMainRequest.idempresa=idempresa;
    this.loginMainRequest.idpais=this.loginForm.getRawValue().country;
    this.loginMainRequest.user=this.loginForm.getRawValue().username;
    this.loginMainRequest.password=this.loginForm.getRawValue().password;

    // const loginMainRequest:LoginMainRequest = {
    //   idempresa: '08',
    //   idpais: this.loginForm.getRawValue().country,
    //   user: this.loginForm.getRawValue().username,
    //   password: this.loginForm.getRawValue().password
    // };
    
    this.securityService.authenticate(this.loginMainRequest).subscribe(
      (response) => {
          // Manejar la respuesta del servicio de permisos aquí
          console.log(response); // Aquí puedes ver la respuesta del servicio
          if (response.resultado === "ACCESO CONCEDIDO") {
              localStorage.setItem('token', response.token);
              localStorage.setItem('perfil',response.perfil);
              localStorage.setItem('idusuario',response.idusuario);
              localStorage.setItem('idusuarioromweb',response.idusuarioromweb);
              // Si el acceso es concedido, redirige a la página de autenticación tres
              this.router.navigate(['/auth/loginThree']);
          } else {
            const Toast = Swal.mixin({
              toast: true,
              position: "bottom-end",
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
              }
            });
            Toast.fire({
              icon: "error",
              title: "<b>Se produjo un error durante la autenticación</b>",
              showCloseButton: true,
              text: "ERROR DE DATOS"
            });
              // Si el acceso es denegado, maneja el caso apropiado aquí  
              console.log('Acceso denegado');
          }
      },
      (error) => {
          // Manejar errores de la solicitud HTTP aquí
          const Toast = Swal.mixin({
            toast: true,
            position: "bottom-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.onmouseenter = Swal.stopTimer;
              toast.onmouseleave = Swal.resumeTimer;
            }
          });
          Toast.fire({
            icon: "error",
            title: "<b>Se produjo un error durante la autenticación</b>",
            showCloseButton: true
          });

          console.error('Error al obtener los permisos:', error);
      })
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  getCountry(){
    this.authService.getCountry().subscribe((res) => {
      this.listCountry = res;
      console.log(this.listCountry);
    });
  }

}
