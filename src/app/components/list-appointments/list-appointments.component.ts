import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';
import { Appointment } from '../../dto/appointment.dto';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AppointmentStatusPipe } from "../../pipes/appointment-status.pipe";

@Component({
  selector: 'app-list-appointments',
  standalone: true,
  imports: [CommonModule, AppointmentStatusPipe],
  templateUrl: './list-appointments.component.html',
  styleUrl: './list-appointments.component.css'
})
export class ListAppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];

  constructor(
    private appointmentService: AppointmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.appointmentService.getAppointments().subscribe(
      (data: Appointment[]) => {
        this.appointments = data;
      },
      (error) => {
        console.error('Error fetching appointments:', error);
      }
    );
  }

  viewAppointment(appointmentId: number): void {
    this.router.navigate(['/view-appointment', appointmentId]);
  }

  updateAppointment(appointmentId: number): void {
    this.router.navigate(['/edit-appointment', appointmentId]);
  }

  deleteAppointment(appointmentId: number): void {
    if (confirm('Are you sure you want to delete this appointment?')) {
      this.appointmentService.deleteAppointment(appointmentId.toString()).subscribe(
        () => {
          this.appointments = this.appointments.filter(appt => appt.appointmentId !== appointmentId);
        },
        (error) => {
          console.error('Error deleting appointment:', error);
        }
      );
    }
  }

  getStatus(date: string, time: string): string {
    const [day, month, year] = date.split('/').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    const apptDate = new Date(year, month - 1, day, hour, minute);
    return apptDate > new Date() ? 'Upcoming' : 'Past';
  }

  exportToExcel(): void {
    const worksheetData = this.appointments.map(appt => ({
      'ID': appt.appointmentId,
      'Patient': appt.patientName,
      'Animal': appt.animalType,
      'Owner': `${appt.ownerName} ${appt.ownerSurname}`,
      'Contact': appt.ownerContactNumber,
      'Date': appt.appointmentDate,
      'Time': appt.appointmentTime,
      'Reason': appt.reasonForAppointment,
      'Status': this.getStatus(appt.appointmentDate, appt.appointmentTime)
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    // Apply background color for "Upcoming" appointments
    this.appointments.forEach((appt, index) => {
      const status = this.getStatus(appt.appointmentDate, appt.appointmentTime);
      if (status === 'Upcoming') {
        const rowIndex = index + 2; // +2 because Excel rows start at 1, and the first row is the header
        const cellAddress = `H${rowIndex}`; // Assuming "Status" is in column H
        if (!worksheet[cellAddress]) {
          worksheet[cellAddress] = { t: 's', v: status }; // Ensure the cell exists
        }
        worksheet[cellAddress].s = {
          fill: {
            fgColor: { rgb: '00FF00' } // Green background
          }
        };
      }
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Appointments');
    XLSX.writeFile(workbook, 'Appointments.xlsx');
  }

  exportToPDF(): void {
    const doc = new jsPDF();

    const tableData = this.appointments.map(appt => [
      appt.appointmentId,
      appt.patientName,
      appt.animalType,
      `${appt.ownerName} ${appt.ownerSurname}`,
      appt.ownerContactNumber,
      appt.appointmentDate,
      appt.appointmentTime,
      appt.reasonForAppointment,
      this.getStatus(appt.appointmentDate, appt.appointmentTime)
    ]);

    autoTable(doc, {
      head: [[
        'ID', 'Patient', 'Animal', 'Owner', 'Contact',
        'Date', 'Time', 'Reason', 'Status'
      ]],
      body: tableData,
      didParseCell: (data) => {
        if (data.row.index !== undefined) {
          const appt = this.appointments[data.row.index];
          const status = this.getStatus(appt.appointmentDate, appt.appointmentTime);
          if (status === 'Upcoming') {
            data.cell.styles.fillColor = [204, 255, 204]; // Light green
          }
        }
      }
    });

    doc.save('appointments.pdf');
  }
}
