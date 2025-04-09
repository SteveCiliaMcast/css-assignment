import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticateService } from '../../services/authenticate.service';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthenticateService,
    private router: Router
  ) {
    // Initialize the form
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]], // Ensure email validation
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const loginData = this.loginForm.value;
  
      this.authService.authenticate(loginData).subscribe({
        next: (response: any) => {
          const token = response.jwtToken;
          const username = response.username; // Or extract it from the response if it's provided
  
          // Save token and username in localStorage
          localStorage.setItem('jwtToken', token);
          localStorage.setItem('username', username); // Save the username
          console.log('Username:', username);
          localStorage.setItem('role', response.role); // Save the role

          console.log('Login successful, token:', token);
          
          Swal.fire({
            icon: 'success',
            title: 'Login Successful',
            text: 'You have been logged in successfully!',
            confirmButtonText: 'OK'
          }).then(() => {
            this.router.navigate(['/list-appointments']).then(() => {
              setTimeout(() => {
                window.location.reload(); // ✅ Now reload happens after navigation
              }, 0);
            });
          });
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: 'Invalid email or password. Please try again.',
            confirmButtonText: 'OK'
          });
          console.error('Login error:', err);
        }
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Form',
        text: 'Please fill out the form correctly before submitting.',
        confirmButtonText: 'OK'
      });
    }
  }
  
}