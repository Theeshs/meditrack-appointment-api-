import { PartialType } from '@nestjs/mapped-types';
import { CreateAppointmentDTO } from './create-appointment.dto';

export class UpdateAppointmentDTO extends PartialType(CreateAppointmentDTO) {}
