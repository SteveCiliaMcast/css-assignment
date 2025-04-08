import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';
import { Appointment } from '../../dto/appointment.dto';
import * as ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AppointmentStatusPipe } from "../../pipes/appointment-status.pipe";

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
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Appointments');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Patient', key: 'patient', width: 20 },
      { header: 'Animal', key: 'animal', width: 15 },
      { header: 'Owner', key: 'owner', width: 25 },
      { header: 'Contact', key: 'contact', width: 20 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Time', key: 'time', width: 10 },
      { header: 'Reason', key: 'reason', width: 30 },
      { header: 'Status', key: 'status', width: 12 }
    ];

    this.appointments.forEach(appt => {
      const status = this.getStatus(appt.appointmentDate, appt.appointmentTime);
      const row = worksheet.addRow({
        id: appt.appointmentId,
        patient: appt.patientName,
        animal: appt.animalType,
        owner: `${appt.ownerName} ${appt.ownerSurname}`,
        contact: appt.ownerContactNumber,
        date: appt.appointmentDate,
        time: appt.appointmentTime,
        reason: appt.reasonForAppointment,
        status: status
      });

      if (status === 'Upcoming') {
        row.eachCell(cell => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'C6EFCE' } // Light green
          };
        });
      }
    });

    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], {
        type:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      FileSaver.saveAs(blob, 'Appointments.xlsx');
    });
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
