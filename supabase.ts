import { createClient } from '@supabase/supabase-js';
import { Appointment, Patient, MedicalAnalysis } from './types';

// Configuration Supabase
// Remplacez ces valeurs par vos propres clés Supabase
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Créer le client Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Types pour les tables Supabase
export interface AppointmentRow {
  id: string;
  patient_name: string;
  patient_email?: string;
  doctor_name: string;
  specialty: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'in-progress';
  type: 'In-person' | 'Video Call';
  consultation_type?: string;
  appointment_type_id?: string;
  duration?: number;
  notes?: string;
  reason?: string;
  symptoms?: string;
  actual_start_time?: string;
  actual_end_time?: string;
  created_at?: string;
  updated_at?: string;
  // Support pour les colonnes qui pourraient ne pas exister encore dans Supabase
  [key: string]: any;
}

export interface PatientRow {
  id: string;
  email: string;
  name: string;
  first_name: string;
  phone: string;
  gender: string;
  age: string;
  password: string;
  created_at?: string;
  updated_at?: string;
}

export interface AnalysisRow {
  id: string;
  patient_email: string;
  patient_name: string;
  type: 'blood' | 'urine' | 'imaging' | 'cardiac' | 'other';
  name: string;
  date: string;
  status: 'pending' | 'completed' | 'normal' | 'abnormal';
  laboratory?: string;
  ordered_by?: string;
  results?: string;
  numeric_results?: any; // JSON
  doctor_notes?: string;
  created_at?: string;
  updated_at?: string;
}

// Fonctions de conversion
// Colonnes existantes dans le schéma Supabase actuel (basé sur SUPABASE_SQL.sql)
const EXISTING_APPOINTMENT_COLUMNS = new Set([
  'id', 'patient_name', 'patient_email', 'doctor_name', 'specialty',
  'date', 'time', 'status', 'type', 'consultation_type', 'notes', 'reason'
]);

export const appointmentToRow = (appt: Appointment): Partial<AppointmentRow> => {
  const row: any = {
    id: appt.id,
    patient_name: appt.patientName,
    patient_email: appt.patientEmail || undefined,
    doctor_name: appt.doctorName,
    specialty: appt.specialty,
    date: appt.date,
    time: appt.time,
    // Convertir 'in-progress' en 'confirmed' si la base ne le supporte pas encore
    status: appt.status === 'in-progress' ? 'confirmed' : appt.status,
    type: appt.type,
  };

  // Ajouter uniquement les champs qui existent dans le schéma actuel
  if (appt.consultationType) row.consultation_type = appt.consultationType;
  if (appt.notes) row.notes = appt.notes;
  if (appt.reason) row.reason = appt.reason;

  // Filtrer pour ne garder que les colonnes existantes (au cas où d'autres champs sont ajoutés)
  const filteredRow: Partial<AppointmentRow> = {};
  for (const [key, value] of Object.entries(row)) {
    if (EXISTING_APPOINTMENT_COLUMNS.has(key) && value !== undefined) {
      filteredRow[key as keyof AppointmentRow] = value;
    }
  }

  return filteredRow;
};

export const rowToAppointment = (row: any): Appointment => ({
  id: row.id,
  patientName: row.patient_name,
  patientEmail: row.patient_email,
  doctorName: row.doctor_name,
  specialty: row.specialty,
  date: row.date,
  time: row.time,
  status: row.status as Appointment['status'],
  type: row.type,
  consultationType: row.consultation_type as any,
  appointmentTypeId: row.appointment_type_id as any,
  duration: row.duration,
  notes: row.notes,
  reason: row.reason,
  symptoms: row.symptoms,
  actualStartTime: row.actual_start_time,
  actualEndTime: row.actual_end_time,
});

export const patientToRow = (patient: Patient): PatientRow => ({
  id: patient.id,
  email: patient.email,
  name: patient.name,
  first_name: patient.firstName,
  phone: patient.phone,
  gender: patient.gender,
  age: patient.age,
  password: patient.password,
});

export const rowToPatient = (row: PatientRow): Patient => ({
  id: row.id,
  email: row.email,
  name: row.name,
  firstName: row.first_name,
  phone: row.phone,
  gender: row.gender,
  age: row.age,
  password: row.password,
});

export const analysisToRow = (analysis: MedicalAnalysis): AnalysisRow => ({
  id: analysis.id,
  patient_email: analysis.patientEmail,
  patient_name: analysis.patientName,
  type: analysis.type,
  name: analysis.name,
  date: analysis.date,
  status: analysis.status,
  laboratory: analysis.laboratory,
  ordered_by: analysis.orderedBy,
  results: analysis.results,
  numeric_results: analysis.numericResults || null,
  doctor_notes: analysis.doctorNotes,
});

export const rowToAnalysis = (row: AnalysisRow): MedicalAnalysis => ({
  id: row.id,
  patientEmail: row.patient_email,
  patientName: row.patient_name,
  type: row.type,
  name: row.name,
  date: row.date,
  status: row.status,
  laboratory: row.laboratory,
  orderedBy: row.ordered_by,
  results: row.results,
  numericResults: row.numeric_results || undefined,
  doctorNotes: row.doctor_notes,
});
