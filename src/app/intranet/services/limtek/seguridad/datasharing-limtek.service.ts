import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DatasharingLimtekService {

  private selectedItemSubject = new BehaviorSubject<any>(null);
  selectedItem$ = this.selectedItemSubject.asObservable();

  constructor() { }

  setSelectedItem(item: any) {
    this.selectedItemSubject.next(item);
    localStorage.setItem('usuarioPermisosDatos', JSON.stringify(item));
  }
  
}
