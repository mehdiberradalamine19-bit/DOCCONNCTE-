
export type UserRole = 'patient' | 'doctor' | 'guest';

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  image: string;
  availability: string[];
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'in-progress';

export type ConsultationType = 'consultation' | 'prise-de-sang' | 'vaccination' | 'suivi' | 'controle' | 'urgence' | 'autre';

// Types de rendez-vous PRÉDÉFINIS (configurés par le médecin)
// Le patient choisit UNIQUEMENT le type, jamais la durée
export type AppointmentTypeId = 'rapide' | 'normal' | 'long';
export interface AppointmentType {
  id: AppointmentTypeId;
  name: string;
  slots: number; // Nombre de créneaux de 15 min (1, 2, etc.)
  description?: string;
  doctorEmail?: string; // NULL = type par défaut pour tous
  isActive?: boolean;
}

// Configuration du planning du médecin
export type PlanningMode = 'strict' | 'flexible';
export type BufferMode = 'per-consultations' | 'per-hour';

export interface DoctorPlanningSettings {
  doctorEmail: string;
  mode: PlanningMode; // strict ou flexible
  // Horaires d'ouverture (peut être plusieurs plages)
  workingHours: {
    start: string; // "09:00"
    end: string; // "12:00"
  }[];
  // Jours travaillés (0 = dimanche, 1 = lundi, ..., 6 = samedi)
  workingDays: number[]; // [1, 2, 3, 4, 5] = lundi à vendredi
  // Configuration des buffers (invisibles au patient)
  bufferMode: BufferMode; // 'per-consultations' ou 'per-hour'
  bufferFrequency: number; // toutes les X consultations ou toutes les heures
  // Statistiques observées (calculées automatiquement)
  averageConsultationDuration?: number; // calculé automatiquement
  createdAt?: string;
  updatedAt?: string;
}

// Créneau généré automatiquement (15 minutes)
export interface TimeSlot {
  time: string; // "09:00", "09:15", etc.
  date: string; // "2024-01-15"
  isAvailable: boolean; // false si réservé ou buffer
  isBuffer: boolean; // true si c'est un buffer (invisible au patient)
  appointmentId?: string; // ID du rendez-vous qui occupe ce créneau
  appointmentTypeId?: AppointmentTypeId; // Type de RDV qui occupe ce créneau
}

// Session de consultation (pour calculer le retard)
export interface AppointmentSession {
  appointmentId: string;
  scheduledStartTime: string; // "2024-01-15T09:00:00"
  actualStartTime?: string; // heure réelle de début
  scheduledEndTime: string;
  actualEndTime?: string; // heure réelle de fin
  duration: number; // durée prévue en minutes
  actualDuration?: number; // durée réelle en minutes
  delay?: number; // retard en minutes
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}

export interface Appointment {
  id: string;
  patientName: string;
  patientEmail?: string;
  doctorName: string;
  doctorEmail?: string;
  specialty: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  type: 'In-person' | 'Video Call';
  consultationType?: ConsultationType;
  appointmentTypeId?: AppointmentTypeId; // 'quick', 'normal', 'long'
  duration?: number; // durée en minutes
  notes?: string;
  reason?: string;
  symptoms?: string; // Symptômes du patient
  estimatedDelay?: number; // retard estimé en minutes
  actualStartTime?: string;
  actualEndTime?: string;
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

export type AnalysisType = 'blood' | 'urine' | 'imaging' | 'cardiac' | 'other';

export type AnalysisStatus = 'pending' | 'completed' | 'abnormal' | 'normal';

export interface MedicalAnalysis {
  id: string;
  patientEmail: string;
  patientName: string;
  type: AnalysisType;
  name: string;
  date: string;
  status: AnalysisStatus;
  results?: string;
  values?: { [key: string]: { value: string | number; unit: string; normal: boolean } };
  doctorNotes?: string;
  laboratory?: string;
  orderedBy?: string;
}