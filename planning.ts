import { Appointment, AppointmentType, DoctorPlanningSettings, TimeSlot } from './types';

// Types de rendez-vous par défaut (configurés par le médecin)
export const DEFAULT_APPOINTMENT_TYPES: AppointmentType[] = [
  { id: 'rapide', name: 'Consultation rapide', slots: 1, description: '1 créneau de 15 minutes' },
  { id: 'normal', name: 'Consultation normale', slots: 1, description: '1 créneau de 15 minutes' },
  { id: 'long', name: 'Consultation longue', slots: 2, description: '2 créneaux consécutifs (30 minutes)' },
];

// Configuration par défaut du planning
export const DEFAULT_PLANNING_SETTINGS: Omit<DoctorPlanningSettings, 'doctorEmail'> = {
  mode: 'flexible',
  workingHours: [
    { start: '09:00', end: '12:00' },
    { start: '14:00', end: '18:00' },
  ],
  workingDays: [1, 2, 3, 4, 5], // Lundi à vendredi
  bufferMode: 'per-consultations',
  bufferFrequency: 3, // 1 buffer toutes les 3 consultations
};

// Constante : durée d'un créneau de base (NON MODIFIABLE)
export const SLOT_DURATION_MINUTES = 15;

/**
 * Génère automatiquement tous les créneaux de 15 minutes pour une date donnée
 * Le planning est PLEIN par défaut sur les horaires d'ouverture
 */
export function generateTimeSlots(
  date: string,
  settings: DoctorPlanningSettings,
  existingAppointments: Appointment[],
  appointmentTypes: AppointmentType[] = DEFAULT_APPOINTMENT_TYPES
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  
  // Vérifier si c'est un jour travaillé
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.getDay();
  if (!settings.workingDays.includes(dayOfWeek)) {
    return []; // Pas de créneaux si le médecin ne travaille pas ce jour
  }
  
  // Filtrer les rendez-vous du jour (non annulés)
  const dayAppointments = existingAppointments.filter(
    apt => apt.date === date && apt.status !== 'cancelled'
  );
  
  // Créer un map pour savoir quels créneaux sont occupés
  const occupiedSlots = new Set<string>();
  dayAppointments.forEach(apt => {
    if (apt.appointmentTypeId) {
      const aptType = appointmentTypes.find(t => t.id === apt.appointmentTypeId);
      const slotsNeeded = aptType?.slots || 1;
      const startTime = apt.time;
      
      // Bloquer les créneaux nécessaires
      for (let i = 0; i < slotsNeeded; i++) {
        const slotTime = addMinutesToTime(startTime, i * SLOT_DURATION_MINUTES);
        occupiedSlots.add(slotTime);
      }
    }
  });
  
  // Générer les créneaux pour chaque plage horaire
  settings.workingHours.forEach(timeRange => {
    const [startHour, startMinute] = timeRange.start.split(':').map(Number);
    const [endHour, endMinute] = timeRange.end.split(':').map(Number);
    
    let currentTime = new Date(`${date}T${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}:00`);
    const endTime = new Date(`${date}T${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}:00`);
    
    let slotCount = 0; // Compteur de créneaux normaux (non buffers)
    
    while (currentTime < endTime) {
      const timeStr = `${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}`;
      const [hour, minute] = timeStr.split(':').map(Number);
      
      // Règle simple : tous les 4 créneaux (1 heure), le 5ème (début d'heure suivante) est un buffer
      // Exemple : 09:00, 09:15, 09:30, 09:45 (4 créneaux), puis 10:00 = buffer
      // Puis : 10:15, 10:30, 10:45 (3 créneaux), puis 11:00 = buffer
      const isBuffer = minute === 0 && slotCount > 0 && slotCount % 4 === 0;
      
      // Si ce n'est pas un buffer, on incrémente le compteur
      if (!isBuffer) {
        slotCount++;
      }
      
      // Vérifier si le créneau est disponible (pas occupé et pas un buffer)
      const isAvailable = !occupiedSlots.has(timeStr) && !isBuffer;
      
      // Trouver quel rendez-vous occupe ce créneau
      let appointmentId: string | undefined;
      let appointmentTypeId: AppointmentTypeId | undefined;
      dayAppointments.forEach(apt => {
        if (apt.appointmentTypeId) {
          const aptType = appointmentTypes.find(t => t.id === apt.appointmentTypeId);
          const slotsNeeded = aptType?.slots || 1;
          const startTime = apt.time;
          
          // Vérifier si ce créneau fait partie de ce rendez-vous
          for (let i = 0; i < slotsNeeded; i++) {
            const slotTime = addMinutesToTime(startTime, i * SLOT_DURATION_MINUTES);
            if (slotTime === timeStr) {
              appointmentId = apt.id;
              appointmentTypeId = apt.appointmentTypeId;
            }
          }
        }
      });
      
      slots.push({
        time: timeStr,
        date,
        isAvailable,
        isBuffer,
        appointmentId,
        appointmentTypeId,
      });
      
      // Avancer au prochain créneau de 15 minutes
      currentTime = new Date(currentTime.getTime() + SLOT_DURATION_MINUTES * 60000);
    }
  });
  
  return slots;
}

/**
 * Détermine si un créneau est un buffer (invisible au patient)
 * Règle simple : tous les 4 créneaux (1 heure), le 5ème est un buffer
 * Exemple : 09:00, 09:15, 09:30, 09:45 (4 créneaux), puis 10:00 est buffer
 */
function isBufferSlot(
  time: string,
  settings: DoctorPlanningSettings,
  consultationCount: number
): boolean {
  // Règle simple : tous les 4 créneaux (1 heure), le 5ème créneau (début de l'heure suivante) est un buffer
  const [hour, minute] = time.split(':').map(Number);
  
  // Le buffer est au début de chaque heure (minute = 0)
  // Mais on compte : après 4 créneaux normaux, le 5ème (début d'heure) est buffer
  // Donc : 09:00, 09:15, 09:30, 09:45 (4 créneaux), puis 10:00 = buffer
  return minute === 0;
}

/**
 * Ajoute des minutes à une heure (format "HH:MM")
 */
function addMinutesToTime(time: string, minutes: number): string {
  const [hours, mins] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60);
  const newMins = totalMinutes % 60;
  return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
}

/**
 * Vérifie si un type de rendez-vous peut être placé à une heure donnée
 * (vérifie que tous les créneaux nécessaires sont disponibles)
 */
export function canPlaceAppointment(
  date: string,
  time: string,
  appointmentTypeId: AppointmentTypeId,
  slots: TimeSlot[],
  appointmentTypes: AppointmentType[] = DEFAULT_APPOINTMENT_TYPES
): boolean {
  const aptType = appointmentTypes.find(t => t.id === appointmentTypeId);
  if (!aptType) return false;
  
  const slotsNeeded = aptType.slots;
  
  // Vérifier que tous les créneaux nécessaires sont disponibles
  for (let i = 0; i < slotsNeeded; i++) {
    const slotTime = addMinutesToTime(time, i * SLOT_DURATION_MINUTES);
    const slot = slots.find(s => s.time === slotTime && s.date === date);
    
    if (!slot || !slot.isAvailable || slot.isBuffer) {
      return false;
    }
  }
  
  return true;
}

/**
 * Calcule le retard estimé en temps réel
 */
export function calculateEstimatedDelay(
  appointments: Appointment[],
  currentTime: Date,
  settings: DoctorPlanningSettings
): number {
  const sortedAppointments = appointments
    .filter(apt => (apt.status === 'confirmed' || apt.status === 'in-progress') && apt.date)
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}:00`);
      const dateB = new Date(`${b.date}T${b.time}:00`);
      return dateA.getTime() - dateB.getTime();
    });
  
  let delay = 0;
  const today = currentTime.toISOString().split('T')[0];
  
  for (const apt of sortedAppointments) {
    if (apt.date !== today) continue;
    
    const scheduledTime = new Date(`${apt.date}T${apt.time}:00`);
    
    // Si le rendez-vous a déjà commencé
    if (apt.actualStartTime) {
      const actualStart = new Date(apt.actualStartTime);
      const actualEnd = apt.actualEndTime ? new Date(apt.actualEndTime) : currentTime;
      const actualDuration = (actualEnd.getTime() - actualStart.getTime()) / 60000;
      
      // Durée prévue selon le type
      const scheduledDuration = apt.duration || SLOT_DURATION_MINUTES;
      
      // Calculer le retard accumulé
      if (actualDuration > scheduledDuration) {
        delay += actualDuration - scheduledDuration;
      }
    } else if (scheduledTime < currentTime) {
      // Rendez-vous en retard qui n'a pas encore commencé
      delay += (currentTime.getTime() - scheduledTime.getTime()) / 60000;
    }
  }
  
  return Math.max(0, Math.round(delay));
}

/**
 * Calcule les statistiques automatiques
 */
export function calculateStatistics(
  appointments: Appointment[],
  date: string
): {
  totalAppointments: number;
  completedAppointments: number;
  averageDuration: number;
  averageDelay: number;
  maxDelay: number;
} {
  const dayAppointments = appointments.filter(apt => apt.date === date);
  const completed = dayAppointments.filter(
    apt => apt.status === 'completed' && apt.actualStartTime && apt.actualEndTime
  );
  
  const durations = completed
    .map(apt => {
      if (apt.actualStartTime && apt.actualEndTime) {
        return (new Date(apt.actualEndTime).getTime() - new Date(apt.actualStartTime).getTime()) / 60000;
      }
      return null;
    })
    .filter((d): d is number => d !== null);
  
  const delays = completed
    .map(apt => {
      if (apt.actualStartTime) {
        const scheduled = new Date(`${apt.date}T${apt.time}:00`);
        const actual = new Date(apt.actualStartTime);
        return Math.max(0, (actual.getTime() - scheduled.getTime()) / 60000);
      }
      return null;
    })
    .filter((d): d is number => d !== null);
  
  return {
    totalAppointments: dayAppointments.length,
    completedAppointments: completed.length,
    averageDuration: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
    averageDelay: delays.length > 0 ? delays.reduce((a, b) => a + b, 0) / delays.length : 0,
    maxDelay: delays.length > 0 ? Math.max(...delays) : 0,
  };
}

/**
 * Obtient l'heure d'arrivée conseillée en cas de retard
 */
export function getRecommendedArrivalTime(
  appointment: Appointment,
  estimatedDelay: number
): string {
  const scheduledTime = new Date(`${appointment.date}T${appointment.time}:00`);
  const recommendedTime = new Date(scheduledTime.getTime() - estimatedDelay * 60000);
  
  return `${String(recommendedTime.getHours()).padStart(2, '0')}:${String(recommendedTime.getMinutes()).padStart(2, '0')}`;
}

/**
 * Génère les créneaux disponibles pour un type de rendez-vous donné
 * (filtre les créneaux où on peut placer ce type)
 */
export function getAvailableSlotsForType(
  slots: TimeSlot[],
  appointmentTypeId: AppointmentTypeId,
  appointmentTypes: AppointmentType[] = DEFAULT_APPOINTMENT_TYPES
): TimeSlot[] {
  const aptType = appointmentTypes.find(t => t.id === appointmentTypeId);
  if (!aptType) return [];
  
  const slotsNeeded = aptType.slots;
  const availableSlots: TimeSlot[] = [];
  
  slots.forEach(slot => {
    if (!slot.isAvailable || slot.isBuffer) return;
    
    // Vérifier que tous les créneaux nécessaires sont disponibles
    let canPlace = true;
    for (let i = 0; i < slotsNeeded; i++) {
      const slotTime = addMinutesToTime(slot.time, i * SLOT_DURATION_MINUTES);
      const nextSlot = slots.find(s => s.time === slotTime && s.date === slot.date);
      
      if (!nextSlot || !nextSlot.isAvailable || nextSlot.isBuffer) {
        canPlace = false;
        break;
      }
    }
    
    if (canPlace) {
      availableSlots.push(slot);
    }
  });
  
  return availableSlots;
}
