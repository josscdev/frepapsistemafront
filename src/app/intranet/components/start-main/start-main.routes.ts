import { StartComponent } from './start-layout/start/start.component';
import { StartLayoutComponent } from './start-layout/start-layout.component';
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '' },
  {
    path: '',
    component: StartLayoutComponent,
    children: [
      {
        path: '',
        component: StartComponent
      },
      
      
    ]
  }
];
