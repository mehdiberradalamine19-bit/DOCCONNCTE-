import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Users, CheckCircle, AlertCircle, Timer, UserCircle, FileText, PlayCircle, PauseCircle, SkipForward, Phone, Mail, X, Calendar as CalendarIcon, MapPin } from 'lucide-react';
import { Appointment, PatientInfo } from '../types';
import { appointmentDB } from '../database';

interface WaitingRoomProps {
  appointments: Appointment[];
  patients: PatientInfo;
  onUpdateAppointments: (appointments: Appointment[]) => void;
}

export const WaitingRoom: React.FC<WaitingRoomProps> = ({ 
  appointments, 
  patients,
  onUpdateAppointments 
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [demoMode, setDemoMode] = useState(false);
  const [demoElapsedMinutes, setDemoElapsedMinutes] = useState(0);
  const [demoSimulatedTime, setDemoSimulatedTime] = useState(new Date()); // Temps simulé en mode démo
  const [selectedPatientForDetail, setSelectedPatientForDetail] = useState<string | null>(null);
  const [demoAppointmentsState, setDemoAppointmentsState] = useState<Map<string, Partial<Appointment>>>(new Map()); // État modifiable des rendez-vous démo
  const [demoConsultationStartTime, setDemoConsultationStartTime] = useState<number | null>(null); // Timestamp réel du début de consultation en mode démo
  const [demoTimerBonusSeconds, setDemoTimerBonusSeconds] = useState(0); // Secondes bonus ajoutées au chronomètre via le bouton +5 min

  // Mettre à jour l'heure actuelle toutes les secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Obtenir la date d'aujourd'hui au format utilisé dans l'app
  const getTodayDateStr = () => {
    const today = new Date();
    const day = today.getDate();
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const month = monthNames[today.getMonth()];
    const year = today.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const todayDateStr = getTodayDateStr();

  // Temps simulé pour le mode démo (doit être défini en premier)
  // Base: 8h00 du jour actuel, puis on ajoute demoElapsedMinutes
  const demoTime = useMemo(() => {
    if (!demoMode) return currentTime;
    
    // Utiliser la même base que les rendez-vous démo (8h00 du jour actuel)
    const today = new Date();
    const baseTime = new Date(today);
    baseTime.setHours(8, 0, 0, 0);
    
    // Ajouter les minutes simulées
    const simulated = new Date(baseTime);
    simulated.setMinutes(simulated.getMinutes() + demoElapsedMinutes);
    
    return simulated;
  }, [demoMode, demoElapsedMinutes, currentTime]);
  
  // Debug: afficher demoElapsedMinutes quand il change
  useEffect(() => {
    if (demoMode) {
      console.log('🕐 demoElapsedMinutes a changé:', demoElapsedMinutes);
      console.log('🕐 demoTime calculé:', demoTime);
    }
  }, [demoElapsedMinutes, demoMode, demoTime]);

  // Patients fictifs complets pour le mode démo (15 patients) avec toutes les informations
  const demoPatients = useMemo(() => {
    const basePatients = [
      { firstName: 'Marie', lastName: 'Dupont', email: 'marie.dupont@demo.com', phone: '06 12 34 56 78', gender: 'F', age: '35', address: '15 Rue de la Paix, 75001 Paris', problem: 'Mal de tête persistant depuis 3 jours', reason: 'Consultation de routine' },
      { firstName: 'Jean', lastName: 'Martin', email: 'jean.martin@demo.com', phone: '06 23 45 67 89', gender: 'M', age: '42', address: '42 Avenue des Champs-Élysées, 75008 Paris', problem: 'Douleur au niveau de la cicatrice post-opératoire', reason: 'Suivi post-opératoire' },
      { firstName: 'Sophie', lastName: 'Bernard', email: 'sophie.bernard@demo.com', phone: '06 34 56 78 90', gender: 'F', age: '28', address: '8 Boulevard Saint-Germain, 75005 Paris', problem: 'Fièvre et fatigue depuis 2 jours', reason: 'Consultation urgente' },
      { firstName: 'Pierre', lastName: 'Leroy', email: 'pierre.leroy@demo.com', phone: '06 45 67 89 01', gender: 'M', age: '55', address: '23 Rue de Rivoli, 75004 Paris', problem: 'Besoin de renouveler un traitement pour l\'hypertension', reason: 'Renouvellement ordonnance' },
      { firstName: 'Lucie', lastName: 'Moreau', email: 'lucie.moreau@demo.com', phone: '06 56 78 90 12', gender: 'F', age: '31', address: '67 Rue de Vaugirard, 75006 Paris', problem: 'Bilan annuel de santé, aucun symptôme particulier', reason: 'Bilan de santé complet' },
      { firstName: 'Thomas', lastName: 'Petit', email: 'thomas.petit@demo.com', phone: '06 67 89 01 23', gender: 'M', age: '48', address: '12 Place de la République, 75003 Paris', problem: 'Contrôle de tension artérielle et cholestérol', reason: 'Consultation de routine' },
      { firstName: 'Emma', lastName: 'Durand', email: 'emma.durand@demo.com', phone: '06 78 90 12 34', gender: 'F', age: '26', address: '89 Avenue de la Grande Armée, 75016 Paris', problem: 'Douleurs abdominales et nausées', reason: 'Consultation urgente' },
      { firstName: 'Lucas', lastName: 'Simon', email: 'lucas.simon@demo.com', phone: '06 89 01 23 45', gender: 'M', age: '38', address: '34 Rue du Faubourg Saint-Antoine, 75011 Paris', problem: 'Problème de sommeil et fatigue chronique', reason: 'Consultation de routine' },
      { firstName: 'Clara', lastName: 'Laurent', email: 'clara.laurent@demo.com', phone: '06 90 12 34 56', gender: 'F', age: '29', address: '56 Boulevard Haussmann, 75009 Paris', problem: 'Allergie saisonnière et éternuements', reason: 'Consultation de routine' },
      { firstName: 'Antoine', lastName: 'Lefebvre', email: 'antoine.lefebvre@demo.com', phone: '07 01 23 45 67', gender: 'M', age: '52', address: '78 Rue de la Roquette, 75011 Paris', problem: 'Douleur articulaire au genou droit', reason: 'Consultation spécialisée' },
      { firstName: 'Camille', lastName: 'Garcia', email: 'camille.garcia@demo.com', phone: '07 12 34 56 78', gender: 'F', age: '33', address: '45 Rue de Belleville, 75020 Paris', problem: 'Toux persistante depuis une semaine', reason: 'Consultation urgente' },
      { firstName: 'Hugo', lastName: 'Rousseau', email: 'hugo.rousseau@demo.com', phone: '07 23 45 67 89', gender: 'M', age: '45', address: '91 Avenue de Clichy, 75017 Paris', problem: 'Problème de digestion et brûlures d\'estomac', reason: 'Consultation de routine' },
      { firstName: 'Léa', lastName: 'Vincent', email: 'lea.vincent@demo.com', phone: '07 34 56 78 90', gender: 'F', age: '27', address: '23 Rue de la Butte aux Cailles, 75013 Paris', problem: 'Douleurs musculaires après séance de sport', reason: 'Consultation de routine' },
      { firstName: 'Nathan', lastName: 'Fournier', email: 'nathan.fournier@demo.com', phone: '07 45 67 89 01', gender: 'M', age: '41', address: '67 Boulevard de Magenta, 75010 Paris', problem: 'Maux de dos chroniques, besoin de suivi', reason: 'Suivi médical' },
      { firstName: 'Inès', lastName: 'Girard', email: 'ines.girard@demo.com', phone: '07 56 78 90 12', gender: 'F', age: '36', address: '12 Rue de la Sorbonne, 75005 Paris', problem: 'Problème de vision et maux de tête', reason: 'Consultation spécialisée' },
    ];

    const patientsMap: PatientInfo & { [key: string]: any } = {};
    basePatients.forEach(p => {
      patientsMap[p.email.toLowerCase()] = {
        id: p.email.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        email: p.email.toLowerCase(),
        name: p.lastName,
        firstName: p.firstName,
        phone: p.phone,
        gender: p.gender,
        age: p.age,
        address: p.address,
        password: 'demo123'
      };
    });

    return patientsMap;
  }, []);

  // Données fictives pour le mode démo - 15 clients
  const demoAppointments = useMemo(() => {
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const today = new Date(); // Utiliser la date actuelle
    const day = today.getDate();
    const month = monthNames[today.getMonth()];
    const year = today.getFullYear();
    const todayStr = `${day} ${month} ${year}`;

    // Base time: 8h00 du matin (simulation commence à 8h)
    const baseTime = new Date(today);
    baseTime.setHours(8, 0, 0, 0);

    // Temps actuel simulé (utiliser demoTime qui est calculé de manière cohérente)
    const now = demoTime;

    const appointments = [
      { id: 'demo-1', email: 'marie.dupont@demo.com', time: '08:00', type: 'normal', status: 'completed', startOffset: -60, endOffset: -45 },
      { id: 'demo-2', email: 'jean.martin@demo.com', time: '08:15', type: 'normal', status: 'completed', startOffset: -45, endOffset: -30 },
      { id: 'demo-3', email: 'sophie.bernard@demo.com', time: '08:30', type: 'normal', status: 'completed', startOffset: -30, endOffset: -15 },
      { id: 'demo-4', email: 'pierre.leroy@demo.com', time: '08:45', type: 'rapide', status: 'completed', startOffset: -15, endOffset: 0 },
      { id: 'demo-5', email: 'lucie.moreau@demo.com', time: '09:00', type: 'normal', status: 'in-progress', startOffset: 0 },
      { id: 'demo-6', email: 'thomas.petit@demo.com', time: '09:15', type: 'normal', status: 'confirmed', startOffset: null },
      { id: 'demo-7', email: 'emma.durand@demo.com', time: '09:30', type: 'normal', status: 'confirmed', startOffset: null },
      { id: 'demo-8', email: 'lucas.simon@demo.com', time: '09:45', type: 'normal', status: 'confirmed', startOffset: null },
      { id: 'demo-9', email: 'clara.laurent@demo.com', time: '10:00', type: 'rapide', status: 'confirmed', startOffset: null },
      { id: 'demo-10', email: 'antoine.lefebvre@demo.com', time: '10:15', type: 'long', status: 'confirmed', startOffset: null },
      { id: 'demo-11', email: 'camille.garcia@demo.com', time: '10:30', type: 'normal', status: 'confirmed', startOffset: null },
      { id: 'demo-12', email: 'hugo.rousseau@demo.com', time: '10:45', type: 'normal', status: 'confirmed', startOffset: null },
      { id: 'demo-13', email: 'lea.vincent@demo.com', time: '11:00', type: 'normal', status: 'confirmed', startOffset: null },
      { id: 'demo-14', email: 'nathan.fournier@demo.com', time: '11:15', type: 'long', status: 'confirmed', startOffset: null },
      { id: 'demo-15', email: 'ines.girard@demo.com', time: '11:30', type: 'normal', status: 'confirmed', startOffset: null },
    ];

    return appointments.map((apt, index) => {
      const patient = demoPatients[apt.email.toLowerCase()];
      if (!patient) return null;

      const [hours, minutes] = apt.time.split(':').map(Number);
      const appointmentTime = new Date(baseTime);
      appointmentTime.setHours(hours, minutes, 0, 0);

      // Récupérer l'état modifié de ce rendez-vous (s'il existe)
      const stateOverride = demoAppointmentsState.get(apt.id);
      
      let actualStartTime: string | undefined = stateOverride?.actualStartTime;
      let actualEndTime: string | undefined = stateOverride?.actualEndTime;
      let status = (stateOverride?.status as typeof apt.status) || apt.status;

      // Pour les patients complétés initialement
      if (!stateOverride && apt.status === 'completed' && apt.startOffset !== null && apt.endOffset !== null) {
        const startTime = new Date(baseTime);
        startTime.setMinutes(startTime.getMinutes() + apt.startOffset);
        const endTime = new Date(baseTime);
        endTime.setMinutes(endTime.getMinutes() + apt.endOffset);
        actualStartTime = startTime.toISOString();
        actualEndTime = endTime.toISOString();
      }
      // Pour le patient initialement en cours
      else if (!stateOverride && apt.status === 'in-progress' && apt.startOffset !== null) {
        // Utiliser l'heure du RDV comme heure de début
        actualStartTime = appointmentTime.toISOString();
      }

      const durationMap = { rapide: 15, normal: 15, long: 30 };
      const patientInfo = demoPatients[apt.email.toLowerCase()];
      const patientData = [
        { firstName: 'Marie', lastName: 'Dupont', problem: 'Mal de tête persistant depuis 3 jours', reason: 'Consultation de routine' },
        { firstName: 'Jean', lastName: 'Martin', problem: 'Douleur au niveau de la cicatrice post-opératoire', reason: 'Suivi post-opératoire' },
        { firstName: 'Sophie', lastName: 'Bernard', problem: 'Fièvre et fatigue depuis 2 jours', reason: 'Consultation urgente' },
        { firstName: 'Pierre', lastName: 'Leroy', problem: 'Besoin de renouveler un traitement pour l\'hypertension', reason: 'Renouvellement ordonnance' },
        { firstName: 'Lucie', lastName: 'Moreau', problem: 'Bilan annuel de santé, aucun symptôme particulier', reason: 'Bilan de santé complet' },
        { firstName: 'Thomas', lastName: 'Petit', problem: 'Contrôle de tension artérielle et cholestérol', reason: 'Consultation de routine' },
        { firstName: 'Emma', lastName: 'Durand', problem: 'Douleurs abdominales et nausées', reason: 'Consultation urgente' },
        { firstName: 'Lucas', lastName: 'Simon', problem: 'Problème de sommeil et fatigue chronique', reason: 'Consultation de routine' },
        { firstName: 'Clara', lastName: 'Laurent', problem: 'Allergie saisonnière et éternuements', reason: 'Consultation de routine' },
        { firstName: 'Antoine', lastName: 'Lefebvre', problem: 'Douleur articulaire au genou droit', reason: 'Consultation spécialisée' },
        { firstName: 'Camille', lastName: 'Garcia', problem: 'Toux persistante depuis une semaine', reason: 'Consultation urgente' },
        { firstName: 'Hugo', lastName: 'Rousseau', problem: 'Problème de digestion et brûlures d\'estomac', reason: 'Consultation de routine' },
        { firstName: 'Léa', lastName: 'Vincent', problem: 'Douleurs musculaires après séance de sport', reason: 'Consultation de routine' },
        { firstName: 'Nathan', lastName: 'Fournier', problem: 'Maux de dos chroniques, besoin de suivi', reason: 'Suivi médical' },
        { firstName: 'Inès', lastName: 'Girard', problem: 'Problème de vision et maux de tête', reason: 'Consultation spécialisée' },
      ][index];

      return {
        id: apt.id,
        patientName: `${patientInfo.firstName} ${patientInfo.name}`,
        patientEmail: patientInfo.email,
        doctorName: 'Docteur Mehdi',
        doctorEmail: 'admin@gmail.com',
        specialty: 'Médecin Généraliste',
        date: todayStr,
        time: apt.time,
        status: status as 'confirmed' | 'in-progress' | 'completed',
        type: index === 3 ? 'Video Call' : 'In-person',
        appointmentTypeId: apt.type as 'rapide' | 'normal' | 'long',
        duration: durationMap[apt.type as keyof typeof durationMap],
        reason: patientData.reason,
        symptoms: patientData.problem,
        actualStartTime,
        actualEndTime,
      };
    }).filter((apt): apt is Appointment => apt !== null);
  }, [todayDateStr, demoElapsedMinutes, demoSimulatedTime, demoTime, demoPatients, demoAppointmentsState]);

  // Filtrer les rendez-vous d'aujourd'hui
  const todayAppointments = useMemo(() => {
    if (demoMode) {
      return demoAppointments.filter(appt => 
        appt.status === 'confirmed' || appt.status === 'in-progress' || appt.status === 'completed'
      );
    }
    return appointments.filter(appt => 
      appt.date === todayDateStr && 
      (appt.status === 'confirmed' || appt.status === 'in-progress' || appt.status === 'completed')
    );
  }, [appointments, todayDateStr, demoMode, demoAppointments]);

  // Patients disponibles en mode démo ou réel
  const availablePatients = useMemo(() => {
    return demoMode ? demoPatients : patients;
  }, [demoMode, demoPatients, patients]);

  // Calculer les statistiques
  const stats = useMemo(() => {
    const total = todayAppointments.length;
    const seen = todayAppointments.filter(appt => appt.status === 'completed').length;
    const remaining = todayAppointments.filter(appt => 
      appt.status === 'confirmed' || appt.status === 'in-progress'
    ).length;
    
    // Calculer le retard estimé en utilisant seulement les rendez-vous d'aujourd'hui
    let estimatedDelay = 0;
    
    // Filtrer et trier les rendez-vous du jour par heure
    const sortedTodayAppts = todayAppointments
      .filter(apt => apt.status === 'confirmed' || apt.status === 'in-progress')
      .sort((a, b) => {
        const timeA = a.time.replace(':', '');
        const timeB = b.time.replace(':', '');
        return parseInt(timeA) - parseInt(timeB);
      });

    // Convertir la date d'aujourd'hui en format pour le parsing
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const today = new Date();
    const todayDay = today.getDate();
    const todayMonth = monthNames[today.getMonth()];
    const todayYear = today.getFullYear();

    for (const apt of sortedTodayAppts) {
      // Parser la date et l'heure du rendez-vous
      const [hours, minutes] = apt.time.split(':').map(Number);
      const scheduledTime = new Date(today);
      scheduledTime.setHours(hours, minutes, 0, 0);
      
      // Si le rendez-vous a déjà commencé
      if (apt.actualStartTime) {
        const actualStart = new Date(apt.actualStartTime);
        const actualEnd = apt.actualEndTime ? new Date(apt.actualEndTime) : currentTime;
        const actualDuration = (actualEnd.getTime() - actualStart.getTime()) / 60000;
        
        // Durée prévue selon le type (par défaut 15 minutes)
        const scheduledDuration = apt.duration || 15;
        
        // Calculer le retard accumulé
        if (actualDuration > scheduledDuration) {
          estimatedDelay += actualDuration - scheduledDuration;
        }
      } else if (scheduledTime < currentTime) {
        // Rendez-vous en retard qui n'a pas encore commencé
        estimatedDelay += (currentTime.getTime() - scheduledTime.getTime()) / 60000;
      }
    }

    estimatedDelay = Math.max(0, Math.round(estimatedDelay));

    return { total, seen, remaining, estimatedDelay };
  }, [todayAppointments, currentTime, demoMode, demoTime]);

  // Trouver le patient actuellement en consultation
  const currentAppointment = useMemo(() => {
    return todayAppointments.find(appt => 
      appt.status === 'in-progress' && appt.actualStartTime
    );
  }, [todayAppointments]);

  // Réinitialiser le timestamp de début quand le patient change en mode démo
  useEffect(() => {
    if (demoMode && currentAppointment) {
      // Si le timestamp n'est pas encore défini, l'initialiser
      setDemoConsultationStartTime(prev => {
        if (prev === null) {
          return new Date().getTime();
        }
        return prev;
      });
    } else if (!currentAppointment) {
      // Pas de patient en cours, réinitialiser le timestamp
      setDemoConsultationStartTime(null);
    }
  }, [currentAppointment?.id, demoMode]);

  // Calculer le temps écoulé pour la consultation en cours - Mise à jour en temps réel
  useEffect(() => {
    if (!currentAppointment?.actualStartTime) {
      setElapsedTime(0);
      return;
    }

    const startTime = new Date(currentAppointment.actualStartTime);
    
    // En mode démo, le chronomètre fonctionne normalement en temps réel
    // Quand on clique sur +5 min, on ajoute 5 minutes instantanément au chronomètre
    if (demoMode) {
      // Si on n'a pas encore enregistré le moment de début, l'enregistrer maintenant
      if (demoConsultationStartTime === null && currentAppointment?.actualStartTime) {
        setDemoConsultationStartTime(new Date().getTime());
      }
      
      // Utiliser le timestamp réel de début pour faire avancer le chronomètre normalement
      const realStartTime = demoConsultationStartTime || new Date().getTime();
      
      // Fonction pour mettre à jour le temps écoulé en temps réel
      const updateElapsed = () => {
        if (!currentAppointment?.actualStartTime) {
          setElapsedTime(0);
          return;
        }
        
        // Calculer le temps écoulé réel depuis le début
        const now = new Date().getTime();
        const realElapsed = Math.floor((now - realStartTime) / 1000);
        
        // Ajouter le bonus (secondes ajoutées via le bouton +5 min)
        const totalElapsed = realElapsed + demoTimerBonusSeconds;
        
        setElapsedTime(Math.max(0, totalElapsed));
      };
      
      // Mettre à jour immédiatement
      updateElapsed();
      
      // Mettre à jour toutes les secondes (chronomètre normal en temps réel)
      const interval = setInterval(updateElapsed, 1000);
      return () => clearInterval(interval);
    } else {
      // Mode normal: utiliser le temps réel
      const updateElapsed = () => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setElapsedTime(Math.max(0, elapsed));
      };
      
      // Mettre à jour immédiatement
      updateElapsed();
      
      // Puis toutes les secondes
      const interval = setInterval(updateElapsed, 1000);
      return () => clearInterval(interval);
    }
  }, [currentAppointment?.actualStartTime, demoMode, demoTimerBonusSeconds, demoConsultationStartTime, currentTime]);

  // Formater le temps écoulé (MM:SS)
  const formatElapsedTime = (seconds: number) => {
    // S'assurer que le temps n'est pas négatif
    const safeSeconds = Math.max(0, seconds);
    const mins = Math.floor(safeSeconds / 60);
    const secs = safeSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Obtenir la couleur du chronomètre selon la durée
  const getTimerColor = (minutes: number) => {
    if (minutes < 10) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (minutes < 15) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  // Calculer les patients en salle d'attente
  // Les patients apparaissent dans la salle d'attente exactement 15 minutes avant leur RDV
  const waitingPatients = useMemo(() => {
    const now = demoMode ? demoTime : currentTime;
    return todayAppointments
      .filter(appt => {
        // Statut confirmé et pas encore commencé
        if (appt.status !== 'confirmed' || appt.actualStartTime) return false;
        
        // Parse l'heure du rendez-vous
        const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        const [day, month, year] = appt.date.split(' ');
        const monthIndex = monthNames.findIndex(m => m === month);
        
        if (monthIndex === -1) return false;
        
        const [hours, minutes] = appt.time.split(':').map(Number);
        const appointmentTime = new Date(parseInt(year), monthIndex, parseInt(day), hours, minutes, 0, 0);
        
        // L'heure d'arrivée est exactement 15 minutes avant le RDV
        // Exemple: RDV à 10h00 -> Arrivée à 9h45
        const arrivalTime = new Date(appointmentTime);
        arrivalTime.setMinutes(arrivalTime.getMinutes() - 15);
        
        // Le patient est en salle d'attente si :
        // L'heure d'arrivée (15 min avant) est passée ET le RDV n'a pas encore commencé
        const hasArrived = now >= arrivalTime;
        const appointmentNotStarted = now < appointmentTime;
        
        return hasArrived && appointmentNotStarted;
      })
      .sort((a, b) => {
        // Trier par heure de RDV
        const timeA = a.time.replace(':', '');
        const timeB = b.time.replace(':', '');
        return parseInt(timeA) - parseInt(timeB);
      });
  }, [todayAppointments, currentTime, demoMode, demoTime]);

  // Trouver le prochain patient à consulter
  const nextAppointment = useMemo(() => {
    return todayAppointments
      .filter(appt => appt.status === 'confirmed' && !appt.actualStartTime)
      .sort((a, b) => {
        const timeA = a.time.replace(':', '');
        const timeB = b.time.replace(':', '');
        return parseInt(timeA) - parseInt(timeB);
      })[0];
  }, [todayAppointments]);

  // Démarrer une consultation
  const handleStartConsultation = async (appointmentId: string) => {
    if (demoMode) {
      // Trouver le rendez-vous dans demoAppointments
      const appointment = demoAppointments.find(a => a.id === appointmentId);
      if (!appointment) return;

      // Calculer l'heure de début basée sur l'heure du RDV
      const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
      const today = new Date();
      const baseTime = new Date(today);
      baseTime.setHours(8, 0, 0, 0);
      const [hours, minutes] = appointment.time.split(':').map(Number);
      const appointmentTime = new Date(baseTime);
      appointmentTime.setHours(hours, minutes, 0, 0);

      // Mettre à jour l'état du rendez-vous
      setDemoAppointmentsState(prev => {
        const newMap = new Map(prev);
        newMap.set(appointmentId, {
          status: 'in-progress',
          actualStartTime: appointmentTime.toISOString()
        });
        return newMap;
      });
      
      // Réinitialiser le chronomètre et enregistrer le nouveau moment de début
      setDemoElapsedMinutes(0);
      setDemoConsultationStartTime(new Date().getTime());
      setDemoTimerBonusSeconds(0); // Réinitialiser le bonus
      setElapsedTime(0);
      return;
    }

    const appointment = appointments.find(a => a.id === appointmentId);
    if (!appointment) return;

    const updatedAppointment: Appointment = {
      ...appointment,
      status: 'in-progress',
      actualStartTime: new Date().toISOString()
    };

    try {
      await appointmentDB.update(appointmentId, updatedAppointment);
      const updatedAppointments = appointments.map(a => 
        a.id === appointmentId ? updatedAppointment : a
      );
      onUpdateAppointments(updatedAppointments);
    } catch (error) {
      console.error('Erreur lors du démarrage de la consultation:', error);
      alert('Erreur lors du démarrage de la consultation.');
    }
  };

  // Terminer une consultation
  const handleEndConsultation = async () => {
    if (!currentAppointment) return;

    if (demoMode) {
      // Calculer le temps de fin basé sur le temps simulé actuel
      const today = new Date();
      const baseTime = new Date(today);
      baseTime.setHours(8, 0, 0, 0);
      const endTime = new Date(baseTime);
      endTime.setMinutes(endTime.getMinutes() + demoElapsedMinutes);
      
      console.log('✅ Terminer consultation en mode démo:', currentAppointment.id);
      
      // Marquer le rendez-vous actuel comme terminé
      setDemoAppointmentsState(prev => {
        const newMap = new Map(prev);
        newMap.set(currentAppointment.id, {
          status: 'completed',
          actualStartTime: currentAppointment.actualStartTime || new Date().toISOString(),
          actualEndTime: endTime.toISOString()
        });
        console.log('📝 Rendez-vous marqué comme terminé:', currentAppointment.id);
        return newMap;
      });

      // Trouver le prochain patient et le démarrer automatiquement
      const next = todayAppointments
        .filter(appt => {
          const stateOverride = demoAppointmentsState.get(appt.id);
          const isCompleted = stateOverride?.status === 'completed' || appt.status === 'completed';
          const isInProgress = stateOverride?.status === 'in-progress' || appt.status === 'in-progress';
          return !isCompleted && !isInProgress && appt.id !== currentAppointment.id;
        })
        .sort((a, b) => {
          const timeA = a.time.replace(':', '');
          const timeB = b.time.replace(':', '');
          return parseInt(timeA) - parseInt(timeB);
        })[0];
      
      if (next) {
        // Démarrer automatiquement le prochain patient
        const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        const today = new Date();
        const baseTime = new Date(today);
        baseTime.setHours(8, 0, 0, 0);
        const [hours, minutes] = next.time.split(':').map(Number);
        const appointmentTime = new Date(baseTime);
        appointmentTime.setHours(hours, minutes, 0, 0);

        setDemoAppointmentsState(prev => {
          const newMap = new Map(prev);
          newMap.set(next.id, {
            status: 'in-progress',
            actualStartTime: appointmentTime.toISOString()
          });
          return newMap;
        });
        
        // Réinitialiser le chronomètre et démarrer le nouveau timestamp pour le patient suivant
        setElapsedTime(0);
        setDemoConsultationStartTime(new Date().getTime());
        setDemoTimerBonusSeconds(0); // Réinitialiser le bonus aussi
      } else {
        // Pas de patient suivant, juste réinitialiser
        setElapsedTime(0);
        setDemoConsultationStartTime(null);
        setDemoTimerBonusSeconds(0);
      }
      
      return;
    }

    const updatedAppointment: Appointment = {
      ...currentAppointment,
      status: 'completed',
      actualEndTime: new Date().toISOString()
    };

    try {
      // Mettre à jour le rendez-vous terminé
      await appointmentDB.update(currentAppointment.id, updatedAppointment);
      let updatedAppointments = appointments.map(a => 
        a.id === currentAppointment.id ? updatedAppointment : a
      );

      // Trouver le prochain patient à consulter
      const remainingAppointments = updatedAppointments.filter(a => 
        a.id !== currentAppointment.id && 
        a.date === todayDateStr && 
        a.status === 'confirmed' && 
        !a.actualStartTime
      );
      
      if (remainingAppointments.length > 0) {
        // Trier par heure croissante
        const sorted = remainingAppointments.sort((a, b) => {
          const timeA = a.time.replace(':', '');
          const timeB = b.time.replace(':', '');
          return parseInt(timeA) - parseInt(timeB);
        });
        
        const next = sorted[0];
        
        // Démarrer immédiatement la consultation suivante
        const nextAppointment: Appointment = {
          ...next,
          status: 'in-progress',
          actualStartTime: new Date().toISOString()
        };

        // Mettre à jour le prochain patient en cours
        await appointmentDB.update(next.id, nextAppointment);
        updatedAppointments = updatedAppointments.map(a => 
          a.id === next.id ? nextAppointment : a
        );
      }

      // Mettre à jour l'état avec tous les changements
      onUpdateAppointments(updatedAppointments);
      
      // Réinitialiser le chronomètre
      setElapsedTime(0);
    } catch (error) {
      console.error('Erreur lors de la fin de la consultation:', error);
      alert('Erreur lors de la fin de la consultation.');
    }
  };

  // Fonctions pour le mode démo
  const handleSkip5Minutes = () => {
    console.log('🔘 Bouton +5 min cliqué!');
    
    // Avancer le temps simulé global de 5 minutes
    setDemoElapsedMinutes(prev => {
      const newValue = prev + 5;
      console.log('⏰ Avancer le temps simulé de 5 min. Ancien:', prev, 'Nouveau:', newValue);
      return newValue;
    });
    
    // Ajouter 5 minutes (300 secondes) au chronomètre instantanément
    setDemoTimerBonusSeconds(prev => {
      const newValue = prev + 300; // 5 minutes = 300 secondes
      console.log('⏱️ Ajouter 5 min au chronomètre. Bonus total:', newValue, 'secondes');
      return newValue;
    });
  };

  // Réinitialiser le mode démo
  const handleResetDemo = () => {
    setDemoElapsedMinutes(0);
    setDemoSimulatedTime(new Date());
    setDemoAppointmentsState(new Map());
    setDemoConsultationStartTime(null);
    setDemoTimerBonusSeconds(0);
    setElapsedTime(0);
  };

  // Obtenir le type de rendez-vous en français
  const getAppointmentTypeName = (typeId?: string) => {
    switch (typeId) {
      case 'rapide': return 'Consultation rapide';
      case 'normal': return 'Consultation normale';
      case 'long': return 'Consultation longue';
      default: return 'Consultation';
    }
  };

  // Calculer l'heure d'arrivée d'un patient
  const getArrivalTime = (appointment: Appointment) => {
    const now = demoMode ? demoTime : currentTime;
    const [hours, minutes] = appointment.time.split(':').map(Number);
    
    // Parser la date du rendez-vous
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const [day, month, year] = appointment.date.split(' ');
    const monthIndex = monthNames.findIndex(m => m === month);
    
    if (monthIndex === -1) return '--:--';
    
    const appointmentDate = new Date(parseInt(year), monthIndex, parseInt(day), hours, minutes, 0, 0);
    
    // Arrivée 15 minutes avant
    const arrivalDate = new Date(appointmentDate);
    arrivalDate.setMinutes(arrivalDate.getMinutes() - 15);
    
    return `${String(arrivalDate.getHours()).padStart(2, '0')}:${String(arrivalDate.getMinutes()).padStart(2, '0')}`;
  };

  // Calculer le temps restant avant le RDV (en minutes)
  const getMinutesUntilAppointment = (appointment: Appointment) => {
    const now = demoMode ? demoTime : currentTime;
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const [day, month, year] = appointment.date.split(' ');
    const monthIndex = monthNames.findIndex(m => m === month);
    
    if (monthIndex === -1) return 0;
    
    const [hours, minutes] = appointment.time.split(':').map(Number);
    const appointmentTime = new Date(parseInt(year), monthIndex, parseInt(day), hours, minutes, 0, 0);
    
    const diffMs = appointmentTime.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    return diffMinutes;
  };

  const elapsedMinutes = Math.floor(elapsedTime / 60);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Bannière mode démo */}
      {demoMode && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <PlayCircle className="w-6 h-6" />
              <div>
                <p className="font-bold text-lg">Mode Démo Activé</p>
                <p className="text-sm text-blue-100">15 patients fictifs - Temps simulé : +{demoElapsedMinutes} min</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleResetDemo}
                className="px-4 py-2 bg-white/20 text-white rounded-xl font-bold hover:bg-white/30 transition-colors"
              >
                Réinitialiser
              </button>
              <button
                onClick={() => {
                  setDemoMode(false);
                  setDemoElapsedMinutes(0);
                  setDemoSimulatedTime(new Date());
                }}
                className="px-4 py-2 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors"
              >
                Quitter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bouton activer mode démo (si pas activé) */}
      {!demoMode && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <button
            onClick={() => {
              setDemoMode(true);
              setDemoSimulatedTime(new Date());
              setDemoElapsedMinutes(0);
            }}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-colors flex items-center justify-center gap-3"
          >
            <PlayCircle className="w-5 h-5" />
            Activer le mode démo (15 patients fictifs)
          </button>
        </div>
      )}

      {/* Stats globales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-50">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Patients aujourd'hui</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-50">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Déjà vus</p>
              <p className="text-2xl font-bold text-slate-900">{stats.seen}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-50">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Restants</p>
              <p className="text-2xl font-bold text-slate-900">{stats.remaining}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-rose-50">
              <AlertCircle className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Retard actuel</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.estimatedDelay > 0 ? `+${stats.estimatedDelay}` : '0'} min
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section principale : Patient en cours */}
        <div className="lg:col-span-2 space-y-6">
          {currentAppointment ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Consultation en cours</h2>
                <div className={`px-6 py-3 rounded-xl border-2 ${getTimerColor(elapsedMinutes)}`}>
                  <div className="flex items-center gap-3">
                    <Timer className="w-6 h-6" />
                    <span className="text-3xl font-black">{formatElapsedTime(elapsedTime)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Informations patient */}
                <div 
                  onClick={() => setSelectedPatientForDetail(currentAppointment.patientEmail || '')}
                  className="bg-slate-50 p-6 rounded-xl cursor-pointer transition-all hover:bg-slate-100 hover:shadow-md"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black">
                      {currentAppointment.patientName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900">{currentAppointment.patientName}</h3>
                      <p className="text-slate-500">
                        RDV prévu à {currentAppointment.time}
                      </p>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      <span>Voir détails</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center gap-2 text-slate-700">
                      <UserCircle className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium">
                        {getAppointmentTypeName(currentAppointment.appointmentTypeId)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium">{currentAppointment.type}</span>
                    </div>
                  </div>
                </div>

                {/* Symptômes / Notes */}
                {(currentAppointment.symptoms || currentAppointment.reason) && (
                  <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <p className="text-sm font-bold text-blue-900 uppercase">Symptômes / Notes</p>
                    </div>
                    <p className="text-slate-900 whitespace-pre-wrap">
                      {currentAppointment.symptoms || currentAppointment.reason || 'Aucune note'}
                    </p>
                  </div>
                )}

                    {/* Boutons d'action */}
                    <div className="space-y-3">
                      {demoMode && (
                        <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-xl">
                          <p className="text-sm font-bold text-amber-900 mb-3 text-center">
                            Contrôles Mode Démo
                          </p>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('🔘 Clic sur le bouton +5 min détecté');
                              handleSkip5Minutes();
                            }}
                            type="button"
                            disabled={!demoMode}
                            className="w-full py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 active:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-3"
                          >
                            <SkipForward className="w-5 h-5" />
                            +5 minutes
                          </button>
                          <div className="text-xs text-amber-700 text-center mt-2 space-y-1">
                            <p>Chronomètre: {formatElapsedTime(elapsedTime)}</p>
                            <p className="text-amber-600 font-semibold">Temps simulé: +{demoElapsedMinutes} min</p>
                          </div>
                        </div>
                      )}
                      <button
                        onClick={handleEndConsultation}
                        className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-3"
                      >
                        <CheckCircle className="w-6 h-6" />
                        Terminer la consultation
                      </button>
                    </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
              <UserCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Aucune consultation en cours</h2>
              <p className="text-slate-500 mb-6">
                {nextAppointment 
                  ? `Le prochain patient est ${nextAppointment.patientName} à ${nextAppointment.time}`
                  : 'Aucun patient en attente'}
              </p>
              {nextAppointment && (
                <button
                  onClick={() => handleStartConsultation(nextAppointment.id)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                >
                  Commencer la première consultation
                </button>
              )}
            </div>
          )}
        </div>

        {/* Section latérale : Salle d'attente */}
        <div className="space-y-6">
          {/* Retard estimé en temps réel */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Planning</h3>
            <div className={`p-4 rounded-xl border-2 ${
              stats.estimatedDelay > 0 
                ? 'bg-rose-50 border-rose-200' 
                : 'bg-emerald-50 border-emerald-200'
            }`}>
              <p className="text-sm font-medium text-slate-700 mb-1">Retard estimé</p>
              <p className={`text-3xl font-black ${
                stats.estimatedDelay > 0 ? 'text-rose-600' : 'text-emerald-600'
              }`}>
                {stats.estimatedDelay > 0 ? `+${stats.estimatedDelay}` : '0'} min
              </p>
            </div>
          </div>

          {/* Salle d'attente */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Salle d'attente</h3>
              <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                {waitingPatients.length}
              </div>
            </div>

            {waitingPatients.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Users className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">Aucun patient en salle d'attente</p>
                <p className="text-xs text-slate-400 mt-1">Les patients avec RDV dans les 15 prochaines minutes apparaîtront ici</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {waitingPatients.map((appt) => {
                  const minutesUntil = getMinutesUntilAppointment(appt);
                  const patient = availablePatients[appt.patientEmail?.toLowerCase() || ''];
                  const isNext = appt.id === nextAppointment?.id;
                  
                  return (
                    <div 
                      key={appt.id}
                      onClick={() => setSelectedPatientForDetail(appt.patientEmail || '')}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                        isNext 
                          ? 'bg-blue-50 border-blue-300 hover:bg-blue-100' 
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                          {appt.patientName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-sm text-slate-900">{appt.patientName}</p>
                          {patient && (
                            <p className="text-xs text-slate-600">
                              {patient.firstName} {patient.name}
                            </p>
                          )}
                        </div>
                        {isNext && (
                          <span className="text-xs px-2 py-1 bg-blue-600 text-white rounded-full font-bold">
                            Prochain
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">RDV prévu :</span>
                          <span className="font-bold text-slate-900">{appt.time}</span>
                        </div>
                        {minutesUntil >= 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600">Dans :</span>
                            <span className={`font-bold ${
                              minutesUntil <= 5 ? 'text-rose-600' : 
                              minutesUntil <= 10 ? 'text-amber-600' : 
                              'text-emerald-600'
                            }`}>
                              {minutesUntil} min
                            </span>
                          </div>
                        )}
                        {appt.symptoms && (
                          <div className="pt-2 border-t border-slate-200">
                            <p className="text-slate-600 line-clamp-2">{appt.symptoms}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Prochain client */}
          {nextAppointment && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Prochain client</h3>
              
              {(() => {
                const patient = availablePatients[nextAppointment.patientEmail?.toLowerCase() || ''];
                const isInWaitingRoom = waitingPatients.some(wp => wp.id === nextAppointment.id);
                const minutesUntil = getMinutesUntilAppointment(nextAppointment);
                const now = demoMode ? demoTime : currentTime;
                
                // Calculer si le patient est arrivé (15 min avant le RDV)
                const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
                const [day, month, year] = nextAppointment.date.split(' ');
                const monthIndex = monthNames.findIndex(m => m === month);
                const [hours, minutes] = nextAppointment.time.split(':').map(Number);
                
                if (monthIndex === -1) return null;
                
                const appointmentTime = new Date(parseInt(year), monthIndex, parseInt(day), hours, minutes, 0, 0);
                const arrivalTime = new Date(appointmentTime);
                arrivalTime.setMinutes(arrivalTime.getMinutes() - 15);
                
                const hasArrived = now >= arrivalTime;
                const status = isInWaitingRoom ? 'Dans la salle d\'attente' : (hasArrived ? 'Arrivé' : 'À venir');
                const statusColor = isInWaitingRoom ? 'bg-blue-600' : (hasArrived ? 'bg-emerald-600' : 'bg-amber-600');
                
                return (
                  <div 
                    onClick={() => setSelectedPatientForDetail(nextAppointment.patientEmail || '')}
                    className="p-4 rounded-xl border-2 border-blue-300 bg-blue-50 cursor-pointer transition-all hover:shadow-md hover:bg-blue-100"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                        {nextAppointment.patientName.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-slate-900">{nextAppointment.patientName}</p>
                        {patient && (
                          <p className="text-xs text-slate-600">
                            {patient.firstName} {patient.name}
                          </p>
                        )}
                      </div>
                      <span className={`text-xs px-3 py-1 ${statusColor} text-white rounded-full font-bold`}>
                        {status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">RDV prévu :</span>
                        <span className="font-bold text-slate-900">{nextAppointment.time}</span>
                      </div>
                      {minutesUntil >= 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Dans :</span>
                          <span className={`font-bold ${
                            minutesUntil <= 5 ? 'text-rose-600' : 
                            minutesUntil <= 10 ? 'text-amber-600' : 
                            'text-emerald-600'
                          }`}>
                            {minutesUntil} min
                          </span>
                        </div>
                      )}
                      {nextAppointment.symptoms && (
                        <div className="pt-2 border-t border-slate-200">
                          <p className="text-slate-600 line-clamp-2">{nextAppointment.symptoms}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Modal détails patient */}
      {selectedPatientForDetail && (
        <PatientDetailModal
          patientEmail={selectedPatientForDetail}
          patients={availablePatients}
          appointments={todayAppointments}
          onClose={() => setSelectedPatientForDetail(null)}
        />
      )}
    </div>
  );
};

// Modal pour afficher les détails d'un patient
const PatientDetailModal: React.FC<{
  patientEmail: string;
  patients: PatientInfo;
  appointments: Appointment[];
  onClose: () => void;
}> = ({ patientEmail, patients, appointments, onClose }) => {
  const patient = patients[patientEmail.toLowerCase()];
  if (!patient) return null;

  const patientAppointments = appointments.filter(appt => 
    appt.patientEmail?.toLowerCase() === patientEmail.toLowerCase()
  );

  const currentAppointment = patientAppointments.find(appt => appt.status === 'in-progress');
  const upcomingAppointments = patientAppointments.filter(appt => 
    appt.status === 'confirmed' && !appt.actualStartTime
  );
  const completedAppointments = patientAppointments.filter(appt => appt.status === 'completed');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Détails du patient</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Informations patient */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-black">
                {patient.firstName[0]}{patient.name[0] || patient.firstName[1] || ''}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2 text-slate-900">{patient.firstName} {patient.name}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-sm font-medium">{patient.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-sm font-medium truncate">{patient.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <UserCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-sm font-medium">{patient.gender === 'F' ? 'Féminin' : 'Masculin'}, {patient.age} ans</span>
                  </div>
                  {(patient as any).address && (
                    <div className="flex items-start gap-2 text-slate-700 sm:col-span-2">
                      <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm font-medium">{(patient as any).address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Consultation actuelle */}
          {currentAppointment && (
            <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl">
              <h4 className="text-lg font-bold text-amber-900 mb-3 flex items-center gap-2">
                <Timer className="w-5 h-5" />
                Consultation en cours
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Date et heure :</span>
                  <span className="font-bold text-slate-900">{currentAppointment.date} à {currentAppointment.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Type :</span>
                  <span className="font-medium text-slate-900">{currentAppointment.type === 'Video Call' ? 'Vidéo' : 'Présentiel'}</span>
                </div>
                {currentAppointment.symptoms && (
                  <div className="pt-2 border-t border-amber-200">
                    <p className="text-sm text-slate-700">{currentAppointment.symptoms}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Prochains rendez-vous */}
          {upcomingAppointments.length > 0 && (
            <div>
              <h4 className="text-lg font-bold text-slate-900 mb-4">Prochains rendez-vous ({upcomingAppointments.length})</h4>
              <div className="space-y-3">
                {upcomingAppointments.map(appt => (
                  <div key={appt.id} className="p-4 bg-white rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{appt.date} à {appt.time}</p>
                        <p className="text-sm text-slate-500">{appt.type === 'Video Call' ? 'Vidéo' : 'Présentiel'}</p>
                        {appt.reason && <p className="text-sm text-slate-600 mt-1">Raison: {appt.reason}</p>}
                        {appt.symptoms && <p className="text-sm text-slate-600 mt-1">Symptômes: {appt.symptoms}</p>}
                      </div>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                        Confirmé
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Historique */}
          {completedAppointments.length > 0 && (
            <div>
              <h4 className="text-lg font-bold text-slate-900 mb-4">Historique ({completedAppointments.length})</h4>
              <div className="space-y-3">
                {completedAppointments.slice(0, 5).map(appt => (
                  <div key={appt.id} className="p-4 bg-white rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{appt.date} à {appt.time}</p>
                        <p className="text-sm text-slate-500">{appt.type === 'Video Call' ? 'Vidéo' : 'Présentiel'}</p>
                        {appt.reason && <p className="text-sm text-slate-600 mt-1">Raison: {appt.reason}</p>}
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                        Terminé
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {patientAppointments.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p>Aucun rendez-vous</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
