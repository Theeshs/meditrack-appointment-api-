import { IsString, IsDate } from 'class-validator';

export class CreateAppointmentDTO {
  @IsString()
  patientId: string;

  @IsString()
  doctorId: string;

  @IsDate()
  appointmentDate: Date;
}
