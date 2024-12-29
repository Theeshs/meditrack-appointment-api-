import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDTO } from './dtos/create-appointment.dto';
import { UpdateAppointmentDTO } from './dtos/update-appointment.dto';

@Controller('appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  createAppointment(@Body() data: CreateAppointmentDTO) {
    console.log(data);
    return this.appointmentService.createAppointment(data);
  }

  @Get()
  getAllAppointments() {
    return this.appointmentService.getAllAppointments();
  }

  @Get(':id')
  getAppointmentById(@Param('id') id: string) {
    return this.appointmentService.getAppointmentById(id);
  }

  @Put(':id')
  updateAppointment(
    @Param('id') id: string,
    @Body() data: UpdateAppointmentDTO,
  ) {
    return this.appointmentService.updateAppointment(id, data);
  }

  @Delete(':id')
  deleteAppointment(@Param('id') id: string) {
    return this.appointmentService.deleteAppointment(id);
  }
}

@Controller('next24hours')
export class TomorrowAPIController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Get()
  getAppointmentsForNext24Hours() {
    return this.appointmentService.getAppointmentsForNext24Hours();
  }
}
