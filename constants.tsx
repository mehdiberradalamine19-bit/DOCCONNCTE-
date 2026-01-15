
import { Doctor, Appointment } from './types';

export const DOCTORS: Doctor[] = [
  {
    id: 'd1',
    name: 'Dr. Sarah Martin',
    specialty: 'Cardiologue',
    rating: 4.9,
    image: 'https://picsum.photos/seed/doctor1/200/200',
    availability: ['09:00', '10:30', '14:00', '16:30']
  },
  {
    id: 'd2',
    name: 'Dr. Jean Dupont',
    specialty: 'Médecin Généraliste',
    rating: 4.7,
    image: 'https://picsum.photos/seed/doctor2/200/200',
    availability: ['08:00', '11:00', '15:00', '17:00']
  },
  {
    id: 'd3',
    name: 'Dr. Émilie Roux',
    specialty: 'Dermatologue',
    rating: 4.8,
    image: 'https://picsum.photos/seed/doctor3/200/200',
    availability: ['10:00', '11:30', '13:00', '15:30']
  },
  {
    id: 'd4',
    name: 'Dr. Marc Bernard',
    specialty: 'Pédiatre',
    rating: 4.6,
    image: 'https://picsum.photos/seed/doctor4/200/200',
    availability: ['09:30', '12:00', '14:30', '16:00']
  }
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'a1',
    patientName: 'John Doe',
    doctorName: 'Dr. Sarah Martin',
    specialty: 'Cardiologue',
    date: '15 Juin 2024',
    time: '10:30',
    status: 'confirmed',
    type: 'In-person'
  },
  {
    id: 'a2',
    patientName: 'Jane Smith',
    doctorName: 'Dr. Jean Dupont',
    specialty: 'Médecin Généraliste',
    date: '18 Juin 2024',
    time: '14:00',
    status: 'pending',
    type: 'Video Call'
  },
  {
    id: 'a3',
    patientName: 'Marc Lefebvre',
    doctorName: 'Dr. Émilie Roux',
    specialty: 'Dermatologue',
    date: '10 Juin 2024',
    time: '11:00',
    status: 'completed',
    type: 'In-person'
  }
];
