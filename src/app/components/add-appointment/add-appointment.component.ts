import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppointmentService } from '../../services/appointment.service';
import { Appointment } from '../../dto/appointment.dto';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms'; // <-- ReactiveFormsModule import

@Component({
  selector: 'app-add-appointment',
  standalone: true, // If you are using standalone component
  imports: [CommonModule, ReactiveFormsModule], // <-- Make sure ReactiveFormsModule is in imports
  templateUrl: './add-appointment.component.html',
  styleUrls: ['./add-appointment.component.css']
})
export class AddAppointmentComponent implements OnInit {
  appointmentForm: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private appointmentService: AppointmentService
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

  ngOnInit(): void {}

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
          console.log('Appointment added successfully!', response);
          // Navigate back to the list of appointments or another page
          this.router.navigate(['/list-appointments']);
        },
        (error) => {
          console.error('Error adding appointment:', error);
        }
      );
    } else {
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
