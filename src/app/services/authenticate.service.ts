import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticateService {
  private apiUrl = 'http://localhost:8080/authenticate'; // API endpoint

  constructor(private http: HttpClient) {}

  authenticate(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, credentials);
  }

  getToken(): string | null {
    return localStorage.getItem('jwtToken');
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isReceptionist(): boolean {
    return this.getRole() === 'RECEPTIONIST';
  }

  isVet(): boolean {
    return this.getRole() === 'VET';
  }

  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }

  logout(): void {
    localStorage.clear();
  }
}
