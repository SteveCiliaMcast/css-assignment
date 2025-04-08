import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'appointmentStatus',
  standalone: true
})
export class AppointmentStatusPipe implements PipeTransform {
  transform(appointmentDate: string, appointmentTime: string): string {
    // Parse 'dd/MM/yyyy' to proper Date object
    const [day, month, year] = appointmentDate.split('/').map(Number);
    const [hours, minutes] = appointmentTime.split(':').map(Number);

    const appointmentDateTime = new Date(year, month - 1, day, hours, minutes);
    const now = new Date();

    return appointmentDateTime > now ? 'Upcoming' : 'Past';
  }
}
