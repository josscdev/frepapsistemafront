import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './auth-layout/auth-layout.component';
import { LoginTwoComponent } from './auth-layout/login-two/login-two.component';
import { LoginThreeComponent } from './auth-layout/login-three/login-three.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'loginTwo' },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'loginTwo',
        component: LoginTwoComponent
      },
      {
        path: 'loginThree',
        component: LoginThreeComponent
      }
    ]
  }
];