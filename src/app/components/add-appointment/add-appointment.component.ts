import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators ,ReactiveFormsModule } from '@angular/forms';
import { AppointmentService } from '../../services/appointment.service';
import { Appointment } from '../../dto/appointment.dto';
import Swal from 'sweetalert2';
import { AuthenticateService } from '../../services/authenticate.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  selector: 'app-add-appointment',
  templateUrl: './add-appointment.component.html',
  styleUrls: ['./add-appointment.component.css']
})
export class AddAppointmentComponent implements OnInit {
  appointmentForm: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    public authService: AuthenticateService
  ) {
    this.appointmentForm = this.fb.group({
      patientName: ['', Validators.required],
      animalType: ['', Validators.required],
      ownerIdCardNumber: [
        '',
        [Validators.required, Validators.pattern(/^\d+[A-Za-z]$/)]
      ],
      ownerName: ['', Validators.required],
      ownerSurname: ['', Validators.required],
      ownerContactNumber: [
        '',
        [Validators.required, Validators.minLength(8), Validators.pattern(/^\d+$/)]
      ],
      appointmentDate: ['', [Validators.required, this.dateNotInPastValidator]],
      appointmentTime: ['', [Validators.required, this.timeNotInPastValidator]],
      appointmentDuration: ['', [Validators.required, Validators.min(1)]],
      reasonForAppointment: ['', Validators.required],
      vetNotes: [''] 
    });
  }

  ngOnInit(): void {
    if (this.authService.isReceptionist()) {
      this.appointmentForm.get('vetNotes')?.clearValidators();
    }
  }

  onSubmit(): void {
    if (this.appointmentForm.valid) {
      const newAppointment: Appointment = this.appointmentForm.value;

      // Reformat the date from yyyy-mm-dd to dd-mm-yyyy
      const [year, month, day] = newAppointment.appointmentDate.split('-');
      newAppointment.appointmentDate = `${day}/${month}/${year}`;

      // Log the data being sent to the API
      console.log('Data being sent to the API:', newAppointment);

      this.appointmentService.createAppointment(newAppointment).subscribe(
        (response) => {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Appointment added successfully!',
            confirmButtonText: 'OK'
          }).then(() => {
            this.router.navigate(['/list-appointments']);
          });
        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to add the appointment. Please try again.',
            confirmButtonText: 'OK'
          });
          console.error('Error adding appointment:', error);
        }
      );
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Form',
        text: 'Please fill out the form correctly before submitting.',
        confirmButtonText: 'OK'
      });
      console.error('Form is not valid');
    }
  }

  // Custom Validator to Check if Date is Not in the Past
  dateNotInPastValidator(control: any): { [key: string]: boolean } | null {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to the start of the day
    const inputDate = new Date(control.value);

    if (inputDate < today) {
      return { pastDate: true }; // Return an error object if the date is in the past
    }
    return null; // Return null if the date is valid
  }

  // Custom Validator to Check if Time is Not in the Past
  timeNotInPastValidator = (control: any): { [key: string]: boolean } | null => {
    const appointmentDateControl = this.appointmentForm?.get('appointmentDate');
    if (!appointmentDateControl || !appointmentDateControl.value || !control.value) {
      return null; // If date or time is not set, skip validation
    }

    const today = new Date();
    const selectedDate = new Date(appointmentDateControl.value);
    const [hours, minutes] = control.value.split(':').map(Number);

    selectedDate.setHours(hours, minutes, 0, 0); // Set the selected time on the selected date

    if (selectedDate < today) {
      return { pastTime: true }; // Return an error object if the time is in the past
    }
    return null; // Return null if the time is valid
  };

  // Convenience getter for easy access to form fields in the template
  get f() {
    return this.appointmentForm.controls;
  }
}
