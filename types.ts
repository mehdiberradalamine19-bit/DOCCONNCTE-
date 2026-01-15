
export type UserRole = 'patient' | 'doctor' | 'guest';

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  image: string;
  availability: string[];
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Appointment {
  id: string;
  patientName: string;
  patientEmail?: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  type: 'In-person' | 'Video Call';
}

export interface Notification {
  id: string;
  message: string;
  time: string;
  read: boolean;
}

export interface Patient {
  id: string;
  email: string;
  name: string;
  firstName: string;
  phone: string;
  gender: string;
  age: string;
  password: string;
}

export interface PatientInfo {
  [email: string]: Patient;
}