
import { Doctor, Appointment } from './types';

export const DOCTORS: Doctor[] = [
  {
    id: 'd1',
    name: 'Docteur Mehdi',
    specialty: 'Médecin Généraliste',
    rating: 5.0,
    image: 'https://picsum.photos/seed/doctor1/200/200',
    availability: ['09:00', '10:30', '11:00', '14:00', '15:00', '16:30']
  }
];

export const MOCK_APPOINTMENTS: Appointment[] = [];
