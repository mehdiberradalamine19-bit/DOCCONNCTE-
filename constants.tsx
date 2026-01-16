
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

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: '1',
    patientName: 'Client',
    patientEmail: 'client@default.com',
    doctorName: 'Docteur Mehdi',
    specialty: 'Médecin Généraliste',
    date: `${new Date().getDate()} ${['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][new Date().getMonth()]} ${new Date().getFullYear()}`,
    time: '10:00',
    status: 'confirmed',
    type: 'In-person',
    reason: 'Consultation de routine'
  },
  {
    id: '2',
    patientName: 'Client',
    patientEmail: 'client@default.com',
    doctorName: 'Docteur Mehdi',
    specialty: 'Médecin Généraliste',
    date: `${new Date().getDate() + 1} ${['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][new Date().getMonth()]} ${new Date().getFullYear()}`,
    time: '14:30',
    status: 'pending',
    type: 'Video Call',
    reason: 'Suivi post-opératoire'
  }
];
