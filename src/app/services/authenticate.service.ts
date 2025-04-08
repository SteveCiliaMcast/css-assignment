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
}