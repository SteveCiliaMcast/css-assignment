import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthenticateService } from '../../services/authenticate.service'; // Import AuthenticateService

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  isLoggedIn = false;
  userName: string | null = null; // Variable to store the user's name

  constructor(private router: Router, public authService: AuthenticateService) {
    this.checkLoginStatus();
    this.userName = authService.getUsername(); // Retrieve the user's name
    console.log(this.userName);
  }

  checkLoginStatus(): void {
    this.isLoggedIn = !!localStorage.getItem('jwtToken');
  }

  logout(): void {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('role');
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }
}
