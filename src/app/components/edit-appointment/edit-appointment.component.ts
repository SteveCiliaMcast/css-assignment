import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../services/appointment.service';
import { Appointment } from '../../dto/appointment.dto';
import Swal from 'sweetalert2';


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
      // Convert date from dd/mm/yyyy to yyyy-mm-dd (if needed)
      const parts = appointment.appointmentDate.split('/');
      const formattedDate = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : appointment.appointmentDate;

      this.form = this.fb.group({
        patientName: [appointment.patientName, Validators.required],
        animalType: [appointment.animalType, Validators.required],
        ownerName: [appointment.ownerName, Validators.required],
        ownerSurname: [appointment.ownerSurname, Validators.required],
        ownerContactNumber: [
          appointment.ownerContactNumber,
          [Validators.required, Validators.minLength(8), Validators.pattern(/^\d+$/)]
        ],
        ownerIdCardNumber: [
          appointment.ownerIdCardNumber,
          [Validators.required, Validators.pattern(/^\d+[A-Za-z]$/)]
        ],
        appointmentDate: [formattedDate, Validators.required],
        appointmentTime: [appointment.appointmentTime, Validators.required],
        appointmentDuration: [appointment.appointmentDuration, [Validators.required, Validators.min(1)]],
        reasonForAppointment: [appointment.reasonForAppointment, Validators.required],
        vetNotes: [appointment.vetNotes || '']
      }, { validators: this.dateTimeNotInPastValidator });
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      const updatedAppointment = this.form.value;

      // Reformat date from yyyy-mm-dd to dd/mm/yyyy
      const [year, month, day] = updatedAppointment.appointmentDate.split('-');
      updatedAppointment.appointmentDate = `${day}/${month}/${year}`;

      this.appointmentService.updateAppointment(this.appointmentId, updatedAppointment).subscribe(() => {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Appointment updated successfully.',
          confirmButtonText: 'OK'
        }).then(() => {
          this.router.navigate(['/list-appointments']);
        });
      });
    }
  }

  // Custom Validator for combined date + time check
  dateTimeNotInPastValidator(group: FormGroup): { [key: string]: any } | null {
    const date = group.get('appointmentDate')?.value;
    const time = group.get('appointmentTime')?.value;

    if (!date || !time) return null;

    const now = new Date();
    const selectedDateTime = new Date(`${date}T${time}`);

    return selectedDateTime < now ? { pastDateTime: true } : null;
  }

  get f() {
    return this.form.controls;
  }

  goBack(): void {
    this.router.navigate(['/list-appointments']); // Navigate back to the list of appointments
  }
}
