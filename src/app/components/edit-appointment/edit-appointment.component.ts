import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';

@Component({
  selector: 'app-edit-appointment',
  templateUrl: './edit-appointment.component.html',
  styleUrls: ['./edit-appointment.component.css']
})
export class EditAppointmentComponent implements OnInit {
  editForm: FormGroup;
  appointmentId: number;

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.editForm = this.fb.group({
      patientName: ['', Validators.required],
      animalType: ['', Validators.required],
      ownerIdCardNumber: ['', Validators.required],
      ownerName: ['', Validators.required],
      ownerSurname: ['', Validators.required],
      ownerContactNumber: ['', Validators.required],
      appointmentDate: ['', Validators.required],
      appointmentTime: ['', Validators.required],
      appointmentDuration: [0, Validators.required],
      reasonForAppointment: ['', Validators.required],
      vetNotes: ['']
    });
    this.appointmentId = 0;
  }

  ngOnInit(): void {
    // Get the appointment ID from the route
    this.appointmentId = Number(this.route.snapshot.paramMap.get('id'));

    // Fetch the appointment details
    this.appointmentService.getAppointmentById(this.appointmentId.toString()).subscribe(
      (data) => {
        this.editForm.patchValue(data); // Populate the form with the fetched data
      },
      (error) => {
        console.error('Error fetching appointment:', error);
      }
    );
  }

  onSubmit(): void {
    if (this.editForm.valid) {
      this.appointmentService.updateAppointment(this.appointmentId.toString(), this.editForm.value).subscribe(
        () => {
          console.log('Appointment updated successfully');
          this.router.navigate(['/view-appointment']); // Navigate back to the appointments list
        },
        (error) => {
          console.error('Error updating appointment:', error);
        }
      );
    }
  }
}
