import { Appointment, Patient, PatientInfo, MedicalAnalysis, DoctorPlanningSettings, Doctor } from './types';
import { supabase, appointmentToRow, rowToAppointment, patientToRow, rowToPatient, analysisToRow, rowToAnalysis } from './supabase';

// Fonctions pour gérer les rendez-vous avec Supabase
export const appointmentDB = {
  // Récupérer tous les rendez-vous
  getAll: async (): Promise<Appointment[]> => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) {
        console.error('Erreur lors de la récupération des rendez-vous:', error);
        return [];
      }

      return data ? data.map(rowToAppointment) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des rendez-vous:', error);
      return [];
    }
  },

  // Sauvegarder tous les rendez-vous (pour compatibilité)
  saveAll: async (appointments: Appointment[]): Promise<void> => {
    try {
      // Supprimer tous les rendez-vous existants
      await supabase.from('appointments').delete().neq('id', '');
      
      // Insérer tous les nouveaux rendez-vous
      if (appointments.length > 0) {
        const rows = appointments.map(appointmentToRow);
        const { error } = await supabase.from('appointments').insert(rows);
        
        if (error) {
          console.error('Erreur lors de la sauvegarde des rendez-vous:', error);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des rendez-vous:', error);
    }
  },

  // Ajouter un rendez-vous
  add: async (appointment: Appointment): Promise<void> => {
    try {
      const row = appointmentToRow(appointment);
      console.log('Insertion dans Supabase - row:', row);
      const { data, error } = await supabase.from('appointments').insert([row]).select();
      
      if (error) {
        console.error('Erreur Supabase lors de l\'ajout du rendez-vous:', error);
        console.error('Détails de l\'erreur:', JSON.stringify(error, null, 2));
        throw error;
      }
      
      if (data) {
        console.log('Rendez-vous inséré avec succès:', data);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du rendez-vous:', error);
      throw error;
    }
  },

  // Mettre à jour un rendez-vous
  update: async (id: string, updatedAppointment: Appointment): Promise<void> => {
    try {
      const row = appointmentToRow(updatedAppointment);
      // Pour la mise à jour, inclure aussi les nouveaux champs s'ils existent
      const updateRow: any = { ...row };
      
      // Ajouter les champs pour la salle d'attente s'ils sont définis
      // (ces colonnes doivent être ajoutées au schéma Supabase via UPDATE_SUPABASE_WAITING_ROOM.sql)
      if (updatedAppointment.actualStartTime) {
        updateRow.actual_start_time = updatedAppointment.actualStartTime;
      }
      if (updatedAppointment.actualEndTime) {
        updateRow.actual_end_time = updatedAppointment.actualEndTime;
      }
      if (updatedAppointment.symptoms) {
        updateRow.symptoms = updatedAppointment.symptoms;
      }
      if (updatedAppointment.appointmentTypeId) {
        updateRow.appointment_type_id = updatedAppointment.appointmentTypeId;
      }
      if (updatedAppointment.duration) {
        updateRow.duration = updatedAppointment.duration;
      }
      
      const { error } = await supabase
        .from('appointments')
        .update(updateRow)
        .eq('id', id);
      
      if (error) {
        console.error('Erreur lors de la mise à jour du rendez-vous:', error);
        console.error('Détails:', JSON.stringify(error, null, 2));
        // Si l'erreur est due à une colonne manquante, on essaie sans les nouveaux champs
        if (error.code === '42703' || error.message?.includes('column')) {
          console.warn('Colonne non trouvée, mise à jour sans les nouveaux champs. Exécutez UPDATE_SUPABASE_WAITING_ROOM.sql pour les ajouter.');
          const { error: fallbackError } = await supabase
            .from('appointments')
            .update(row)
            .eq('id', id);
          if (fallbackError) throw fallbackError;
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rendez-vous:', error);
      throw error;
    }
  },

  // Supprimer un rendez-vous
  delete: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Erreur lors de la suppression du rendez-vous:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du rendez-vous:', error);
      throw error;
    }
  },

  // Récupérer un rendez-vous par ID
  getById: async (id: string): Promise<Appointment | undefined> => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération du rendez-vous:', error);
        return undefined;
      }

      return data ? rowToAppointment(data) : undefined;
    } catch (error) {
      console.error('Erreur lors de la récupération du rendez-vous:', error);
      return undefined;
    }
  },
};

// Fonctions pour gérer les patients avec Supabase
export const patientDB = {
  // Récupérer tous les patients
  getAll: async (): Promise<PatientInfo> => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*');

      if (error) {
        console.error('Erreur lors de la récupération des patients:', error);
        return {};
      }

      const patients: PatientInfo = {};
      if (data) {
        data.forEach(row => {
          const patient = rowToPatient(row);
          patients[patient.email.toLowerCase()] = patient;
        });
      }

      return patients;
    } catch (error) {
      console.error('Erreur lors de la récupération des patients:', error);
      return {};
    }
  },

  // Sauvegarder tous les patients (pour compatibilité)
  saveAll: async (patients: PatientInfo): Promise<void> => {
    try {
      // Supprimer tous les patients existants
      await supabase.from('patients').delete().neq('id', '');
      
      // Insérer tous les nouveaux patients
      const patientArray = Object.values(patients);
      if (patientArray.length > 0) {
        const rows = patientArray.map(patientToRow);
        const { error } = await supabase.from('patients').insert(rows);
        
        if (error) {
          console.error('Erreur lors de la sauvegarde des patients:', error);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des patients:', error);
    }
  },

  // Ajouter ou mettre à jour un patient
  save: async (patient: Patient): Promise<void> => {
    try {
      const row = patientToRow(patient);
      const emailLower = patient.email.toLowerCase();
      
      console.log('[patientDB.save] Sauvegarde du patient:', {
        email: emailLower,
        firstName: patient.firstName,
        name: patient.name,
        bloodType: patient.bloodType,
        address: patient.address,
        city: patient.city,
      });
      
      // Vérifier si le patient existe déjà (sans utiliser .single() pour éviter l'erreur si aucun résultat)
      const { data: existing, error: checkError } = await supabase
        .from('patients')
        .select('id')
        .eq('email', emailLower)
        .maybeSingle(); // Utiliser maybeSingle() au lieu de single() pour ne pas échouer si aucun résultat

      // Si checkError n'est pas lié à "aucun résultat trouvé", le lancer
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('[patientDB.save] Erreur lors de la vérification du patient:', checkError);
        throw checkError;
      }

      if (existing) {
        // Mettre à jour
        console.log('[patientDB.save] Mise à jour du patient existant');
        const { data: updatedData, error } = await supabase
          .from('patients')
          .update(row)
          .eq('email', emailLower)
          .select();
        
        if (error) {
          console.error('[patientDB.save] Erreur lors de la mise à jour du patient:', error);
          throw error;
        }
        console.log('[patientDB.save] Patient mis à jour avec succès:', updatedData);
      } else {
        // Insérer
        console.log('[patientDB.save] Insertion d\'un nouveau patient');
        const { data: insertedData, error } = await supabase
          .from('patients')
          .insert([row])
          .select();
        
        if (error) {
          console.error('[patientDB.save] Erreur lors de l\'ajout du patient:', error);
          throw error;
        }
        console.log('[patientDB.save] Patient inséré avec succès:', insertedData);
      }
    } catch (error) {
      console.error('[patientDB.save] Erreur lors de la sauvegarde du patient:', error);
      throw error;
    }
  },

  // Récupérer un patient par email
  getByEmail: async (email: string): Promise<Patient | undefined> => {
    try {
      const emailLower = email.toLowerCase();
      console.log('[patientDB.getByEmail] Recherche du patient:', emailLower);
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('email', emailLower)
        .maybeSingle(); // Utiliser maybeSingle() au lieu de single() pour éviter les erreurs

      if (error) {
        if (error.code === 'PGRST116') {
          // Aucun résultat trouvé
          console.log('[patientDB.getByEmail] Aucun patient trouvé pour:', emailLower);
          return undefined;
        }
        console.error('[patientDB.getByEmail] Erreur lors de la récupération du patient:', error);
        return undefined;
      }

      if (data) {
        const patient = rowToPatient(data);
        console.log('[patientDB.getByEmail] Patient trouvé:', {
          email: patient.email,
          firstName: patient.firstName,
          name: patient.name,
          bloodType: patient.bloodType,
          address: patient.address,
          city: patient.city,
        });
        return patient;
      }
      
      console.log('[patientDB.getByEmail] Aucune donnée retournée pour:', emailLower);
      return undefined;
    } catch (error) {
      console.error('[patientDB.getByEmail] Erreur lors de la récupération du patient:', error);
      return undefined;
    }
  },

  // Supprimer un patient
  delete: async (email: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('email', email.toLowerCase());
      
      if (error) {
        console.error('Erreur lors de la suppression du patient:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du patient:', error);
      throw error;
    }
  },
};

// Fonctions pour gérer les analyses avec Supabase
export const analysisDB = {
  // Récupérer toutes les analyses
  getAll: async (): Promise<MedicalAnalysis[]> => {
    try {
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des analyses:', error);
        return [];
      }

      return data ? data.map(rowToAnalysis) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des analyses:', error);
      return [];
    }
  },

  // Sauvegarder toutes les analyses
  saveAll: async (analyses: MedicalAnalysis[]): Promise<void> => {
    try {
      // Supprimer toutes les analyses existantes
      await supabase.from('analyses').delete().neq('id', '');
      
      // Insérer toutes les nouvelles analyses
      if (analyses.length > 0) {
        const rows = analyses.map(analysisToRow);
        const { error } = await supabase.from('analyses').insert(rows);
        
        if (error) {
          console.error('Erreur lors de la sauvegarde des analyses:', error);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des analyses:', error);
    }
  },

  // Ajouter une analyse
  add: async (analysis: MedicalAnalysis): Promise<void> => {
    try {
      const row = analysisToRow(analysis);
      const { error } = await supabase.from('analyses').insert([row]);
      
      if (error) {
        console.error('Erreur lors de l\'ajout de l\'analyse:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'analyse:', error);
      throw error;
    }
  },

  // Mettre à jour une analyse
  update: async (id: string, updatedAnalysis: MedicalAnalysis): Promise<void> => {
    try {
      const row = analysisToRow(updatedAnalysis);
      const { error } = await supabase
        .from('analyses')
        .update(row)
        .eq('id', id);
      
      if (error) {
        console.error('Erreur lors de la mise à jour de l\'analyse:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'analyse:', error);
      throw error;
    }
  },

  // Supprimer une analyse
  delete: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('analyses')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Erreur lors de la suppression de l\'analyse:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'analyse:', error);
      throw error;
    }
  },

  // Récupérer une analyse par ID
  getById: async (id: string): Promise<MedicalAnalysis | undefined> => {
    try {
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération de l\'analyse:', error);
        return undefined;
      }

      return data ? rowToAnalysis(data) : undefined;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'analyse:', error);
      return undefined;
    }
  },

  // Récupérer les analyses d'un patient
  getByPatientEmail: async (email: string): Promise<MedicalAnalysis[]> => {
    try {
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('patient_email', email.toLowerCase())
        .order('date', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des analyses:', error);
        return [];
      }

      return data ? data.map(rowToAnalysis) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des analyses:', error);
      return [];
    }
  },
};

// Fonction pour initialiser la base de données avec des données par défaut
export const initDatabase = async (defaultAppointments: Appointment[] = []): Promise<void> => {
  try {
    // Vérifier si la base est vide
    const appointments = await appointmentDB.getAll();
    if (appointments.length === 0 && defaultAppointments.length > 0) {
      await appointmentDB.saveAll(defaultAppointments);
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
  }
};

// Fonction pour exporter toutes les données (pour sauvegarde)
export const exportDatabase = async () => {
  return {
    appointments: await appointmentDB.getAll(),
    patients: await patientDB.getAll(),
    analyses: await analysisDB.getAll(),
  };
};

// Fonction pour importer des données (pour restauration)
export const importDatabase = async (data: {
  appointments?: Appointment[];
  patients?: PatientInfo;
  analyses?: MedicalAnalysis[];
}): Promise<void> => {
  if (data.appointments) {
    await appointmentDB.saveAll(data.appointments);
  }
  if (data.patients) {
    await patientDB.saveAll(data.patients);
  }
  if (data.analyses) {
    await analysisDB.saveAll(data.analyses);
  }
};

// Fonction pour vider la base de données (attention !)
export const clearDatabase = async (): Promise<void> => {
  await supabase.from('appointments').delete().neq('id', '');
  await supabase.from('patients').delete().neq('id', '');
  await supabase.from('analyses').delete().neq('id', '');
};

// Fonctions pour gérer les horaires des médecins avec Supabase
export const workingHoursDB = {
  // Récupérer les horaires d'un médecin par son email
  getByDoctorEmail: async (doctorEmail: string): Promise<DoctorPlanningSettings | null> => {
    try {
      const { data, error } = await supabase
        .from('doctor_planning_settings')
        .select('*')
        .eq('doctor_email', doctorEmail.toLowerCase())
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur lors de la récupération des horaires:', error);
        return null;
      }

      if (!data) return null;

      return {
        doctorEmail: data.doctor_email,
        mode: data.mode as 'strict' | 'flexible',
        workingHours: data.working_hours || [],
        workingDays: data.working_days || [],
        bufferMode: data.buffer_mode as 'per-consultations' | 'per-hour',
        bufferFrequency: data.buffer_frequency || 3,
        averageConsultationDuration: data.average_consultation_duration,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des horaires:', error);
      return null;
    }
  },

  // Sauvegarder les horaires d'un médecin
  save: async (doctorId: string, doctorEmail: string, doctorName: string, workingDays: number[], workingHours: { start: string; end: string }[]): Promise<void> => {
    try {
      const emailLower = doctorEmail.toLowerCase();

      // Vérifier si les horaires existent déjà
      const { data: existing } = await supabase
        .from('doctor_planning_settings')
        .select('doctor_email')
        .eq('doctor_email', emailLower)
        .maybeSingle();

      if (existing) {
        // Mettre à jour
        const { error } = await supabase
          .from('doctor_planning_settings')
          .update({
            working_days: workingDays,
            working_hours: workingHours,
            updated_at: new Date().toISOString(),
          })
          .eq('doctor_email', emailLower);

        if (error) {
          console.error('Erreur lors de la mise à jour des horaires:', error);
          throw error;
        }
      } else {
        // Insérer (avec les valeurs par défaut pour les autres champs)
        const { error } = await supabase.from('doctor_planning_settings').insert([{
          doctor_email: emailLower,
          mode: 'flexible',
          working_days: workingDays,
          working_hours: workingHours,
          buffer_mode: 'per-consultations',
          buffer_frequency: 3,
        }]);

        if (error) {
          console.error('Erreur lors de l\'ajout des horaires:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des horaires:', error);
      throw error;
    }
  },

  // Récupérer tous les horaires
  getAll: async (): Promise<Record<string, DoctorPlanningSettings>> => {
    try {
      const { data, error } = await supabase
        .from('doctor_planning_settings')
        .select('*');

      if (error) {
        console.error('Erreur lors de la récupération des horaires:', error);
        return {};
      }

      const result: Record<string, DoctorPlanningSettings> = {};
      if (data) {
        data.forEach(row => {
          result[row.doctor_email.toLowerCase()] = {
            doctorEmail: row.doctor_email,
            mode: row.mode as 'strict' | 'flexible',
            workingHours: row.working_hours || [],
            workingDays: row.working_days || [],
            bufferMode: row.buffer_mode as 'per-consultations' | 'per-hour',
            bufferFrequency: row.buffer_frequency || 3,
            averageConsultationDuration: row.average_consultation_duration,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          };
        });
      }

      return result;
    } catch (error) {
      console.error('Erreur lors de la récupération des horaires:', error);
      return {};
    }
  },
};
