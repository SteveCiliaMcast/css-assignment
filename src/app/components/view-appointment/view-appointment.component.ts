import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';
import { CommonModule } from '@angular/common';
import { Appointment } from '../../dto/appointment.dto';

@Component({
  selector: 'app-view-appointment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-appointment.component.html',
  styleUrl: './view-appointment.component.css'
})
export class ViewAppointmentComponent implements OnInit {
  appointment!: Appointment;
  appointmentId!: number;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private appointmentService: AppointmentService
  ) {}

  ngOnInit(): void {
    this.appointmentId = +this.route.snapshot.paramMap.get('id')!;
    this.loadAppointment();
  }

  loadAppointment(): void {
    this.appointmentService.getAppointmentById(this.appointmentId).subscribe({
      next: (data) => {
        this.appointment = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading appointment.';
        this.loading = false;
        console.error(err);
      }
    });
  }
}
