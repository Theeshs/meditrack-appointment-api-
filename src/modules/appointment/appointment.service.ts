import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import axios from 'axios';
import { Appointment } from './entities/appointment.entity';
import { CreateAppointmentDTO } from './dtos/create-appointment.dto';
import { UpdateAppointmentDTO } from './dtos/update-appointment.dto';
import { AppointmentResponseDTO } from './dtos/appointment-response.dto';

@Injectable()
export class AppointmentService {
  private readonly doctorServiceUrl = 'http://doctor-service:3001/doctors';
  private readonly patientServiceUrl = 'http://patient-service:3000/patients';

  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  private async validateDoctorAvailability(doctorId: string): Promise<void> {
    try {
      const response = await axios.get(`${this.doctorServiceUrl}/${doctorId}`);
      if (!response.data.isAvailable) {
        throw new BadRequestException(
          'The doctor is not available at this time.',
        );
      }
    } catch (error) {
      console.log(error);
      if (error.response && error.response.status === 404) {
        throw new NotFoundException(`Doctor with ID ${doctorId} not found.`);
      }
      throw new BadRequestException('Failed to validate doctor availability.');
    }
  }

  private async validatePatientAvailability(patientId: string): Promise<void> {
    try {
      const response = await axios.get(
        `${this.patientServiceUrl}/${patientId}`,
      );
      if (!response.data) {
        throw new BadRequestException('Unable to find patient in the system');
      }
    } catch (error) {
      console.log(error);
      if (error.response && error.response.status === 404) {
        throw new NotFoundException(`Patient with ID ${patientId} not found.`);
      }
      throw new BadRequestException('Failed to validate patient availability.');
    }
  }

  // Check if the doctor already has an appointment in the given time slot
  private async checkDoctorAppointments(
    doctorId: string,
    appointmentDate: Date,
  ): Promise<void> {
    const conflictingAppointment = await this.appointmentRepository.findOne({
      where: { doctorId, appointmentDate },
    });
    console.log(conflictingAppointment);
    if (conflictingAppointment) {
      throw new BadRequestException(
        'The doctor already has an appointment at this time.',
      );
    }
  }

  // Create a new appointment
  async createAppointment(data: CreateAppointmentDTO): Promise<Appointment> {
    // console.log(data);
    await this.validateDoctorAvailability(data.doctorId);
    await this.validatePatientAvailability(data.patientId);
    await Promise.all([
      this.validateDoctorAvailability(data.doctorId),
      this.validatePatientAvailability(data.patientId),
    ]);
    const date = new Date(data.appointmentDate);
    await this.checkDoctorAppointments(data.doctorId, date);
    // console.log(date.toISOString()); // "2024-03-15T10:00:00.000Z"
    // console.log(date.toISOString());
    const appointment = this.appointmentRepository.create(data);
    return this.appointmentRepository.save(appointment);
  }

  // Get all appointments
  async getAllAppointments(): Promise<Appointment[]> {
    return this.appointmentRepository.find();
  }

  // Get a specific appointment by ID
  async getAppointmentById(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
    });
    if (!appointment) throw new NotFoundException('Appointment not found.');
    return appointment;
  }

  // Update an existing appointment
  async updateAppointment(
    id: string,
    data: UpdateAppointmentDTO,
  ): Promise<Appointment> {
    const existingAppointment = await this.getAppointmentById(id);

    // Validate new doctor availability and conflicts if updating doctorId or appointmentDate
    if (data.doctorId || data.appointmentDate) {
      const doctorId = data.doctorId || existingAppointment.doctorId;
      const appointmentDate =
        data.appointmentDate || existingAppointment.appointmentDate;

      await this.validateDoctorAvailability(doctorId);
      await this.checkDoctorAppointments(doctorId, appointmentDate);
    }

    const updatedAppointment = { ...existingAppointment, ...data };
    await this.appointmentRepository.save(updatedAppointment);
    return updatedAppointment;
  }

  // Delete an appointment
  async deleteAppointment(id: string): Promise<void> {
    const appointment = await this.getAppointmentById(id);
    await this.appointmentRepository.remove(appointment);
  }

  async getAppointmentsForNext24Hours(): Promise<AppointmentResponseDTO[]> {
    const today = new Date();
    const startOfTomorrow = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
      0,
      0,
      0,
    );
    const endOfTomorrow = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
      23,
      59,
      59,
    );
    const appointments = await this.appointmentRepository.find({
      where: {
        appointmentDate: Between(startOfTomorrow, endOfTomorrow),
      },
    });

    if (appointments.length === 0) {
      return [];
    }

    return await Promise.all(
      appointments.map(async (appointment) => {
        // Fetch Patient Data
        const patientResponse = await axios.get(
          `${this.patientServiceUrl}/${appointment.patientId}`,
        );
        const patient = patientResponse.data;
        // Fetch Doctor Data
        const doctorResponse = await axios.get(
          `${this.doctorServiceUrl}/${appointment.doctorId}`,
        );
        const doctor = doctorResponse.data;
        return {
          appointmentId: appointment.id,
          patientName: `${patient.firstName} ${patient.lastName}`,
          doctorName: `${doctor.firstName} ${doctor.lastName}`,
          appointmentDate: appointment.appointmentDate,
          patientEmail: patient.email,
          status: appointment.status,
          patientMobileNumber: patient.phoneNumber,
        };
      }),
    );
  }
}
