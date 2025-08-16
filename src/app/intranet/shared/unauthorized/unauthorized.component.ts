import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './unauthorized.component.html',
  styleUrl: './unauthorized.component.css'
})
export class UnauthorizedComponent {
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
    } else if(this.idemppaisnegcue === 6){
      this.router.navigate(['/mainLimtek/startLimtek']);
    }
  }
}
