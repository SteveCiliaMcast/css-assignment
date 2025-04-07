import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';

@Component({
  selector: 'app-view-appointment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-appointment.component.html',
  styleUrl: './view-appointment.component.css'
})
export class ViewAppointmentComponent implements OnInit {
  appointments: any[] = [];

  constructor(
    private appointmentService: AppointmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.appointmentService.getAppointments().subscribe(
      (data: any[]) => {
        console.log('API Response:', data); // Log the API response
        this.appointments = data;
      },
      (error) => {
        console.error('Error fetching appointments:', error);
      }
    );
  }

  // Navigate to view appointment details
  viewAppointment(appointmentId: number): void {
    this.router.navigate(['/view-appointment', appointmentId]);
  }

  // Navigate to update appointment form
  updateAppointment(appointmentId: number): void {
    this.router.navigate(['/edit-appointment', appointmentId]);
  }

  // Delete an appointment
  deleteAppointment(appointmentId: number): void {
    if (confirm('Are you sure you want to delete this appointment?')) {
      this.appointmentService.deleteAppointment(appointmentId.toString()).subscribe(
        () => {
          console.log(`Appointment with ID ${appointmentId} deleted successfully.`);
          // Refresh the appointments list after deletion
          this.appointments = this.appointments.filter(appt => appt.appointmentId !== appointmentId);
        },
        (error) => {
          console.error('Error deleting appointment:', error);
        }
      );
    }
  }
}
