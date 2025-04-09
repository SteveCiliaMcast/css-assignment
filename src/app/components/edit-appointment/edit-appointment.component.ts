import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../services/appointment.service';
import { Appointment } from '../../dto/appointment.dto';
import { AuthenticateService } from '../../services/authenticate.service'; // Import AuthenticateService
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-appointment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-appointment.component.html',
  styleUrls: ['./edit-appointment.component.css']
})
export class EditAppointmentComponent implements OnInit {
  form!: FormGroup;
  appointmentId!: number;
  isUpcomingAppointment: boolean = false;
  isAdminOrVet: boolean = false; // Variable to check if user is Admin or Vet

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private appointmentService: AppointmentService,
    public authService: AuthenticateService // Inject AuthenticateService
  ) {}

  ngOnInit(): void {
    this.appointmentId = +this.route.snapshot.paramMap.get('id')!;
    this.checkUserRole()
    this.loadAppointment();
    ; // Check the user role after loading the appointment
  }

  loadAppointment(): void {
    this.appointmentService.getAppointmentById(this.appointmentId).subscribe((appointment: Appointment) => {
      const appointmentDateParts = appointment.appointmentDate.split('/');
      const appointmentDate = new Date(`${appointmentDateParts[2]}-${appointmentDateParts[1]}-${appointmentDateParts[0]}`);
      const currentDate = new Date();

      console.log('is admin or vert', this.isAdminOrVet);
      if(this.isAdminOrVet){
        this.isUpcomingAppointment = true;
      }else{
        this.isUpcomingAppointment = appointmentDate >= currentDate;
      }
      
      console.log('Is upcoming appointment:', this.isUpcomingAppointment);

      // Convert date for the form
      const formattedDate = appointment.appointmentDate.split('/').reverse().join('-'); // Convert dd/mm/yyyy to yyyy-mm-dd

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

  // Check if the logged-in user is Admin or Vet
  checkUserRole(): void {
    const userRole = localStorage.getItem('role'); // Retrieve the role from localStorage
    console.log('User role:', userRole);
    this.isAdminOrVet = (userRole === 'ADMIN' || userRole === 'VET');
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
