import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../services/appointment.service';
import { Appointment } from '../../dto/appointment.dto';


@Component({
  selector: 'app-edit-appointment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-appointment.component.html',
  styleUrl: './edit-appointment.component.css'
})
export class EditAppointmentComponent implements OnInit {
  form!: FormGroup;
  appointmentId!: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private appointmentService: AppointmentService
  ) {}

  ngOnInit(): void {
    this.appointmentId = +this.route.snapshot.paramMap.get('id')!;
    this.loadAppointment();
  }

  loadAppointment(): void {
    this.appointmentService.getAppointmentById(this.appointmentId).subscribe((appointment: Appointment) => {
      this.form = this.fb.group({
        animalType: [appointment.animalType, Validators.required],
        appointmentDate: [appointment.appointmentDate, Validators.required],
        appointmentDuration: [appointment.appointmentDuration, [Validators.required, Validators.min(1)]],
        appointmentTime: [appointment.appointmentTime, Validators.required],
        ownerContactNumber: [appointment.ownerContactNumber, Validators.required],
        ownerIdCardNumber: [appointment.ownerIdCardNumber, Validators.required],
        ownerName: [appointment.ownerName, Validators.required],
        ownerSurname: [appointment.ownerSurname, Validators.required],
        patientName: [appointment.patientName, Validators.required],
        reasonForAppointment: [appointment.reasonForAppointment, Validators.required],
        vetNotes: [appointment.vetNotes || '']
      });
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.appointmentService.updateAppointment(this.appointmentId, this.form.value).subscribe(() => {
        alert('Appointment updated successfully.');
        this.router.navigate(['/view-appointment']);
      });
    }
  }
}
