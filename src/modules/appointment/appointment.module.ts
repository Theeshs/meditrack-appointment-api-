import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import {
  AppointmentController,
  TomorrowAPIController,
} from './appointment.controller';
import { AppointmentService } from './appointment.service';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment])],
  controllers: [AppointmentController, TomorrowAPIController],
  providers: [AppointmentService],
})
export class AppointmentModule {}
