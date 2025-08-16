import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css'
})
export class NotFoundComponent {

  idemppaisnegcue: number;

  constructor(
    private router: Router
  ) {
    this.idemppaisnegcue = Number(localStorage.getItem('idemppaisnegcue'));
  }

  regresarRuta() {
    if (this.idemppaisnegcue === 3 || this.idemppaisnegcue === 4) {
      this.router.navigate(['/main/start']);
    } else if (this.idemppaisnegcue === 5) {
      this.router.navigate(['/mainTawa/startTawa']);
    } else if (this.idemppaisnegcue === 6) {
      this.router.navigate(['/mainLimtek/startLimtek']);
    }
  }
}
