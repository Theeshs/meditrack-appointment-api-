// src/appointments/dtos/appointment-response.dto.ts
export class AppointmentResponseDTO {
  appointmentId: string;
  patientEmail: string;
  appointmentDate: Date;
  doctorName: string;
  patientName: string;
  status: string;
  patientMobileNumber: string;
}
