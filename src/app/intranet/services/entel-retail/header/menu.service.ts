import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private menuSubject = new BehaviorSubject<any>(null);
  menu$: Observable<any> = this.menuSubject.asObservable();

  constructor() { }

  updateMenu(menu: any): void {
    localStorage.setItem('menu', JSON.stringify(menu));
    this.menuSubject.next(menu);
  }

  clearMenu(): void {
    localStorage.removeItem('menu');
    this.menuSubject.next(null);
  }

  loadMenuFromLocalStorage(): void {
    const menu = localStorage.getItem('menu');
    if (menu) {
      this.menuSubject.next(JSON.parse(menu));
    } else {
      this.menuSubject.next(null);
    }
  }
}
