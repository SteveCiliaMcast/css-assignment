import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private baseUrl = 'http://localhost:8080/appointment';

  constructor(private http: HttpClient) {}

  // Get all appointments
  getAppointments(): Observable<any> {
    return this.http.get(`${this.baseUrl}`);
  }

  // Get appointment by ID
  getAppointmentById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  // Create a new appointment
  createAppointment(appointment: any): Observable<any> {
    return this.http.post(`${this.baseUrl}`, appointment);
  }

  // Update an existing appointment
  updateAppointment(id: string, appointment: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, appointment);
  }

  // Delete an appointment
  deleteAppointment(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}