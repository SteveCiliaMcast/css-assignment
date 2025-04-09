import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';
import { Appointment } from '../../dto/appointment.dto';
import * as ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AppointmentStatusPipe } from "../../pipes/appointment-status.pipe";
import Swal from 'sweetalert2';
import { AuthenticateService } from '../../services/authenticate.service';

@Component({
  selector: 'app-list-appointments',
  standalone: true,
  imports: [CommonModule, AppointmentStatusPipe],
  templateUrl: './list-appointments.component.html',
  styleUrls: ['./list-appointments.component.css']
})
export class ListAppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];

  constructor(
    private appointmentService: AppointmentService,
    private router: Router,
    public authService: AuthenticateService // Assuming you have an AuthService for authentication
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
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this appointment? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.appointmentService.deleteAppointment(appointmentId.toString()).subscribe(
          () => {
            this.appointments = this.appointments.filter(appt => appt.appointmentId !== appointmentId);
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'The appointment has been deleted successfully.',
              confirmButtonText: 'OK'
            });
          },
          (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to delete the appointment. Please try again.',
              confirmButtonText: 'OK'
            });
            console.error('Error deleting appointment:', error);
          }
        );
      }
    });
  }

  getStatus(date: string, time: string): string {
    const [day, month, year] = date.split('/').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    const apptDate = new Date(year, month - 1, day, hour, minute);
    return apptDate > new Date() ? 'Upcoming' : 'Past';
  }

  exportToExcel(): void {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Appointments');

    // Define the columns
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Patient Name', key: 'patientName', width: 20 },
      { header: 'Animal Type', key: 'animalType', width: 15 },
      { header: 'Owner Name', key: 'ownerName', width: 20 },
      { header: 'Owner Surname', key: 'ownerSurname', width: 20 },
      { header: 'Date & Time', key: 'dateTime', width: 25 },
      { header: 'Duration', key: 'duration', width: 10 },
      { header: 'Status', key: 'status', width: 12 }
    ];

    // Add rows with conditional formatting
    this.appointments.forEach(appt => {
      const status = this.getStatus(appt.appointmentDate, appt.appointmentTime);
      const dateTime = `${appt.appointmentDate} ${appt.appointmentTime}`;
      const row = worksheet.addRow({
        id: appt.appointmentId,
        patientName: appt.patientName,
        animalType: appt.animalType,
        ownerName: appt.ownerName,
        ownerSurname: appt.ownerSurname,
        dateTime: dateTime,
        duration: `${appt.appointmentDuration} mins`,
        status: status
      });

      // Apply green background for upcoming appointments
      if (status === 'Upcoming') {
        row.eachCell(cell => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'C6EFCE' } // Light green background
          };
        });
      }
    });

    // Save the Excel file
    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Appointments.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  exportToPDF(): void {
    const doc = new jsPDF();
  
    const tableData = this.appointments.map(appt => [
      appt.appointmentId,
      appt.patientName,
      appt.animalType,
      appt.ownerName,
      appt.ownerSurname,
      `${appt.appointmentDate} ${appt.appointmentTime}`,
      `${appt.appointmentDuration} mins`,
      this.getStatus(appt.appointmentDate, appt.appointmentTime)
    ]);
  
    autoTable(doc, {
      head: [
        [
          'ID', 'Patient Name', 'Animal Type', 'Owner Name', 'Owner Surname',
          'Date & Time', 'Duration', 'Status'
        ]
      ],
      body: tableData,
      // Header styles
      headStyles: {
        fillColor: [255, 255, 255],  // White background for header
        textColor: [0, 0, 0],        // Black text for header
        fontSize: 10,                // Adjust font size if needed
        fontStyle: 'bold',           // Make header text bold
      },
      didParseCell: (data) => {
        if (data.row.index !== undefined) {
          const appt = this.appointments[data.row.index];
          const status = this.getStatus(appt.appointmentDate, appt.appointmentTime);
          if (status === 'Upcoming') {
            data.cell.styles.fillColor = [204, 255, 204]; // Light green for 'Upcoming' status
          }
        }
      }
    });
  
    doc.save('appointments.pdf');
  }
  
}
