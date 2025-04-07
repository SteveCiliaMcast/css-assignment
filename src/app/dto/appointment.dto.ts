export class Appointment {
    appointmentId: number;
    patientName: string;
    animalType: string;
    ownerIdCardNumber: string;
    ownerName: string;
    ownerSurname: string;
    ownerContactNumber: string;
    appointmentDate: string;
    appointmentTime: string;
    appointmentDuration: number;
    reasonForAppointment: string;
    vetNotes?: string | null;

    constructor(
        appointmentId: number,
        patientName: string,
        animalType: string,
        ownerIdCardNumber: string,
        ownerName: string,
        ownerSurname: string,
        ownerContactNumber: string,
        appointmentDate: string,
        appointmentTime: string,
        appointmentDuration: number,
        reasonForAppointment: string,
        vetNotes?: string | null
    ) {
        this.appointmentId = appointmentId;
        this.patientName = patientName;
        this.animalType = animalType;
        this.ownerIdCardNumber = ownerIdCardNumber;
        this.ownerName = ownerName;
        this.ownerSurname = ownerSurname;
        this.ownerContactNumber = ownerContactNumber;
        this.appointmentDate = appointmentDate;
        this.appointmentTime = appointmentTime;
        this.appointmentDuration = appointmentDuration;
        this.reasonForAppointment = reasonForAppointment;
        this.vetNotes = vetNotes || null;
    }
}