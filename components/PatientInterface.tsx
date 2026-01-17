
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Video, CheckCircle, XCircle, MoreVertical, Plus, FileText, Eye, AlertCircle, ArrowLeft, User, Star } from 'lucide-react';
import { DOCTORS } from '../constants';
import { Appointment, AppointmentStatus, MedicalAnalysis, ConsultationType, AppointmentTypeId } from '../types';
import { DEFAULT_APPOINTMENT_TYPES, generateTimeSlots, getAvailableSlotsForType, canPlaceAppointment, SLOT_DURATION_MINUTES } from '../planning';
import type { TimeSlot, DoctorPlanningSettings } from '../types';
import { workingHoursDB } from '../database';

interface PatientDashboardProps {
  userName?: string;
  appointments: Appointment[];
  onAddAppointment: (appt: Appointment) => void;
  onUpdateAppointments: (appointments: Appointment[]) => void;
  patientEmail?: string;
  analyses?: MedicalAnalysis[];
  initialView?: 'overview' | 'booking' | 'history' | 'doctors';
  onViewChange?: (view: 'overview' | 'booking' | 'history' | 'doctors') => void;
  doctorSettings?: Record<string, DoctorPlanningSettings>;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({ 
  userName = 'Patient',
  appointments,
  onAddAppointment,
  onUpdateAppointments,
  patientEmail = '',
  analyses = [],
  initialView = 'overview',
  onViewChange,
  doctorSettings = {}
}) => {
  const setAppointments = (updater: Appointment[] | ((prev: Appointment[]) => Appointment[])) => {
    if (typeof updater === 'function') {
      onUpdateAppointments(updater(appointments));
    } else {
      onUpdateAppointments(updater);
    }
  };
  const [view, setView] = useState<'overview' | 'booking' | 'history' | 'doctors'>(initialView);
  const prevInitialViewRef = React.useRef(initialView);
  
  // Mettre à jour la vue si initialView change depuis le parent (navigation externe)
  useEffect(() => {
    if (initialView !== prevInitialViewRef.current) {
      setView(initialView);
      prevInitialViewRef.current = initialView;
    }
  }, [initialView]);

  // Fonction interne pour changer la vue et notifier le parent
  const handleViewChange = (newView: 'overview' | 'booking' | 'history' | 'doctors') => {
    setView(newView);
    if (onViewChange) {
      onViewChange(newView);
    }
  };
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<typeof DOCTORS[0] | null>(null);
  const [selectedDate, setSelectedDate] = useState<{ day: number; month: number; year: number } | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedAnalysis, setSelectedAnalysis] = useState<MedicalAnalysis | null>(null);
  const [appointmentType, setAppointmentType] = useState<'In-person' | 'Video Call'>('In-person');
  const [consultationType, setConsultationType] = useState<'consultation' | 'prise-de-sang' | 'vaccination' | 'suivi' | 'controle' | 'urgence' | 'autre'>('consultation');
  const [customConsultationReason, setCustomConsultationReason] = useState('');
  const [symptoms, setSymptoms] = useState('');
  // Type par défaut : toujours NORMAL (1 créneau de 15 min)
  const appointmentTypeId: AppointmentTypeId = 'normal';

  const translateStatus = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmed': return 'Confirmé';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulé';
      case 'completed': return 'Terminé';
      default: return status;
    }
  };

  const translateConsultationType = (type?: ConsultationType) => {
    if (!type) return 'Consultation';
    switch (type) {
      case 'consultation': return 'Consultation';
      case 'prise-de-sang': return 'Prise de sang';
      case 'vaccination': return 'Vaccination';
      case 'suivi': return 'Suivi';
      case 'controle': return 'Contrôle';
      case 'urgence': return 'Urgence';
      case 'autre': return 'Autre';
      default: return 'Consultation';
    }
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'cancelled': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'completed': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const cancelAppointment = (id: string) => {
    const updatedAppointments = appointments.map(a => a.id === id ? { ...a, status: 'cancelled' as AppointmentStatus } : a);
    setAppointments(updatedAppointments);
    onUpdateAppointments(updatedAppointments);
  };

  if (view === 'booking') {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Prendre un rendez-vous</h2>
          <button 
            onClick={() => { 
              handleViewChange('overview'); 
              setBookingStep(1);
            }}
            className="text-blue-600 hover:underline font-medium"
          >
            Retour au tableau de bord
          </button>
        </header>

        {bookingStep === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DOCTORS.map(doc => (
              <div key={doc.id} className="bg-white p-5 rounded-xl border border-slate-200 hover:shadow-md transition-shadow cursor-pointer flex gap-4 items-start" onClick={() => { setSelectedDoctor(doc); setBookingStep(2); }}>
                <img src={doc.image} alt={doc.name} className="w-16 h-16 rounded-full object-cover" />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{doc.name}</h3>
                  <p className="text-blue-600 text-sm font-medium">{doc.specialty}</p>
                  <div className="flex items-center gap-1 mt-1 text-slate-500 text-sm">
                    <span className="text-amber-500">★</span> {doc.rating} (120+ avis)
                  </div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <Plus className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        )}

        {bookingStep === 2 && selectedDoctor && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
             <div className="flex gap-4 items-center pb-6 border-b border-slate-100">
                <img src={selectedDoctor.image} alt={selectedDoctor.name} className="w-16 h-16 rounded-full object-cover" />
                <div>
                  <h3 className="font-bold text-xl">{selectedDoctor.name}</h3>
                  <p className="text-slate-500">{selectedDoctor.specialty}</p>
                </div>
                <button
                  onClick={() => {
                    setBookingStep(1);
                    setSelectedDate(null);
                  }}
                  className="ml-auto text-blue-600 hover:underline text-sm font-medium"
                >
                  ← Retour
                </button>
             </div>
             
             <div>
               <h4 className="font-semibold mb-4">Sélectionnez une date</h4>
               <div className="bg-white p-6 rounded-xl border border-slate-200">
                 <div className="flex items-center justify-between mb-4">
                   <h5 className="font-bold text-lg">
                     {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                   </h5>
                   <div className="flex gap-2">
                     <button
                       onClick={() => {
                         const prevMonth = new Date(currentMonth);
                         prevMonth.setMonth(prevMonth.getMonth() - 1);
                         setCurrentMonth(prevMonth);
                       }}
                       className="p-2 hover:bg-white rounded-lg transition-colors"
                     >
                       ←
                     </button>
                     <button
                       onClick={() => {
                         const nextMonth = new Date(currentMonth);
                         nextMonth.setMonth(nextMonth.getMonth() + 1);
                         setCurrentMonth(nextMonth);
                       }}
                       className="p-2 hover:bg-white rounded-lg transition-colors"
                     >
                       →
                     </button>
                   </div>
                 </div>
                 <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 mb-2">
                   <span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span>
                 </div>
                 <div className="grid grid-cols-7 gap-2 text-center">
                   {(() => {
                     const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
                     const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
                     const daysInMonth = lastDay.getDate();
                     const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Lundi = 0
                     const today = new Date();
                     const cells = [];
                     
                     // Jours vides au début
                     for (let i = 0; i < startingDayOfWeek; i++) {
                       cells.push(<div key={`empty-${i}`} className="p-2"></div>);
                     }
                     
                     // Jours du mois
                     for (let day = 1; day <= daysInMonth; day++) {
                       const cellDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                       const isPast = cellDate < today && cellDate.toDateString() !== today.toDateString();
                       const isSelected = selectedDate && selectedDate.day === day && 
                                         selectedDate.month === currentMonth.getMonth() && 
                                         selectedDate.year === currentMonth.getFullYear();
                       
                       cells.push(
                         <button
                           key={day}
                           onClick={() => {
                             if (!isPast) {
                               setSelectedDate({
                                 day,
                                 month: currentMonth.getMonth(),
                                 year: currentMonth.getFullYear()
                               });
                               setBookingStep(3);
                             }
                           }}
                           disabled={isPast}
                           className={`p-2 text-sm rounded-lg transition-colors ${
                             isPast
                               ? 'text-slate-300 cursor-not-allowed'
                               : isSelected
                               ? 'bg-blue-600 text-white font-bold'
                               : 'hover:bg-blue-50 cursor-pointer'
                           }`}
                         >
                           {day}
                         </button>
                       );
                     }
                     
                     return cells;
                   })()}
                 </div>
               </div>
             </div>
          </div>
        )}

        {bookingStep === 3 && selectedDoctor && selectedDate && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
             <div className="flex gap-4 items-center pb-6 border-b border-slate-100">
                <img src={selectedDoctor.image} alt={selectedDoctor.name} className="w-16 h-16 rounded-full object-cover" />
                <div>
                  <h3 className="font-bold text-xl">{selectedDoctor.name}</h3>
                  <p className="text-slate-500">{selectedDoctor.specialty}</p>
                </div>
                <button
                  onClick={() => {
                    setBookingStep(2);
                  }}
                  className="ml-auto text-blue-600 hover:underline text-sm font-medium"
                >
                  ← Retour
                </button>
             </div>
             
             {/* Type de consultation */}
             <div>
               <h4 className="font-semibold mb-3">Type de consultation</h4>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                 {[
                   { value: 'consultation', label: 'Consultation', icon: '🩺' },
                   { value: 'prise-de-sang', label: 'Prise de sang', icon: '🩸' },
                   { value: 'vaccination', label: 'Vaccination', icon: '💉' },
                   { value: 'suivi', label: 'Suivi', icon: '📋' },
                   { value: 'controle', label: 'Contrôle', icon: '🔍' },
                   { value: 'urgence', label: 'Urgence', icon: '🚨' },
                   { value: 'autre', label: 'Autre', icon: '📝' }
                 ].map((consultType) => (
                   <button
                     key={consultType.value}
                     onClick={() => setConsultationType(consultType.value as any)}
                     className={`p-3 rounded-xl border-2 text-center transition-all ${
                       consultationType === consultType.value
                         ? 'border-blue-600 bg-blue-50'
                         : 'border-slate-200 hover:border-blue-300'
                     }`}
                   >
                     <div className="text-2xl mb-1">{consultType.icon}</div>
                     <span className="text-sm font-medium text-slate-900">{consultType.label}</span>
                   </button>
                 ))}
               </div>
               {consultationType === 'autre' && (
                 <div className="mt-4">
                   <label className="block text-sm font-semibold text-slate-700 mb-2">
                     Précisez la raison de votre consultation
                   </label>
                   <input
                     type="text"
                     value={customConsultationReason}
                     onChange={(e) => setCustomConsultationReason(e.target.value)}
                     placeholder="Ex: Bilan de santé, Certificat médical, etc."
                     className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900"
                   />
                 </div>
               )}
             </div>

             {/* Symptômes */}
             <div>
               <div className="flex items-center justify-between mb-3">
                 <h4 className="font-semibold">Quels sont vos symptômes ?</h4>
                 <span className={`text-sm font-medium ${
                   symptoms.length > 200 
                     ? 'text-red-600' 
                     : symptoms.length > 150 
                     ? 'text-amber-600' 
                     : 'text-slate-500'
                 }`}>
                   {Math.max(0, 200 - symptoms.length)} caractères restants
                 </span>
               </div>
               <textarea
                 value={symptoms}
                 onChange={(e) => {
                   if (e.target.value.length <= 200) {
                     setSymptoms(e.target.value);
                   }
                 }}
                 placeholder="Décrivez vos symptômes, douleurs, ou préoccupations médicales..."
                 rows={4}
                 maxLength={200}
                 className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900 resize-none ${
                   symptoms.length > 200 
                     ? 'border-red-300' 
                     : symptoms.length > 150 
                     ? 'border-amber-300' 
                     : 'border-slate-200'
                 }`}
               />
               <p className="text-xs text-slate-500 mt-2">
                 Cette information aidera le médecin à mieux préparer votre consultation. (Maximum 200 caractères)
               </p>
             </div>

             {/* Mode de consultation */}
             <div>
               <h4 className="font-semibold mb-3">Mode de consultation</h4>
               <div className="grid grid-cols-2 gap-4">
                 <button
                   onClick={() => setAppointmentType('In-person')}
                   className={`p-4 rounded-xl border-2 text-center transition-all ${
                     appointmentType === 'In-person'
                       ? 'border-blue-600 bg-blue-50'
                       : 'border-slate-200 hover:border-blue-300'
                   }`}
                 >
                   <MapPin className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                   <span className="font-medium text-slate-900">Présentiel</span>
                 </button>
                 <button
                   onClick={() => setAppointmentType('Video Call')}
                   className={`p-4 rounded-xl border-2 text-center transition-all ${
                     appointmentType === 'Video Call'
                       ? 'border-blue-600 bg-blue-50'
                       : 'border-slate-200 hover:border-blue-300'
                   }`}
                 >
                   <Video className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                   <span className="font-medium text-slate-900">Vidéo</span>
                 </button>
               </div>
             </div>
             
             {/* Créneaux générés automatiquement selon le type choisi */}
             <div>
               <h4 className="font-semibold mb-3">
                 Créneaux disponibles le {selectedDate.day} {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
               </h4>
               {(() => {
                 const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
                 const dateStr = `${selectedDate.day} ${monthNames[selectedDate.month]} ${selectedDate.year}`;
                 
                 // Format de date pour la génération (YYYY-MM-DD)
                 const dateForGeneration = `${selectedDate.year}-${String(selectedDate.month + 1).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}`;
                 
                 // Chercher les horaires du médecin sélectionné dans doctorSettings
                 // Essayer plusieurs formats d'email pour trouver les horaires
                 const doctorEmailVariants = [
                   `doctor-${selectedDoctor.id}@example.com`.toLowerCase(), // Format utilisé dans WorkingHoursManagement
                   selectedDoctor.name.toLowerCase().replace(/\s+/g, '.'), // Format nom.mehdi
                   (selectedDoctor as any).email?.toLowerCase(), // Email direct si défini
                 ];
                 
                 let currentDoctorSettings: DoctorPlanningSettings | undefined;
                 
                 // Chercher dans doctorSettings par clé (email en minuscules)
                 for (const emailVariant of doctorEmailVariants) {
                   if (emailVariant && doctorSettings[emailVariant]) {
                     currentDoctorSettings = doctorSettings[emailVariant];
                     console.log('[PatientInterface] Horaires trouvés avec email:', emailVariant);
                     break;
                   }
                 }
                 
                 // Si pas trouvé par clé, chercher dans tous les settings
                 if (!currentDoctorSettings) {
                   currentDoctorSettings = Object.values(doctorSettings).find(s => {
                     const sEmail = s.doctorEmail.toLowerCase();
                     return doctorEmailVariants.some(v => v && sEmail === v) ||
                            sEmail.includes(selectedDoctor.id.toLowerCase()) ||
                            sEmail.includes(selectedDoctor.name.toLowerCase().replace(/\s+/g, '.'));
                   });
                 }
                 
                 console.log('[PatientInterface] Médecin sélectionné:', selectedDoctor.name, selectedDoctor.id);
                 console.log('[PatientInterface] doctorSettings disponibles:', Object.keys(doctorSettings));
                 console.log('[PatientInterface] Horaires trouvés:', currentDoctorSettings ? 'Oui' : 'Non');
                 
                 // Définir l'email du médecin pour defaultSettings
                 const doctorEmail = doctorEmailVariants[0] || `doctor-${selectedDoctor.id}@example.com`;
                 
                 // Générer les créneaux automatiquement avec les horaires du médecin
                 const defaultSettings: DoctorPlanningSettings = {
                   doctorEmail: doctorEmail,
                   mode: 'flexible',
                   workingHours: [
                     { start: '09:00', end: '12:00' },
                     { start: '14:00', end: '18:00' },
                   ],
                   workingDays: [1, 2, 3, 4, 5],
                   bufferMode: 'per-consultations',
                   bufferFrequency: 3,
                 };
                 
                 const allSlots = generateTimeSlots(
                   dateForGeneration,
                   currentDoctorSettings || defaultSettings,
                   appointments,
                   DEFAULT_APPOINTMENT_TYPES
                 );
                 
                 // Filtrer les créneaux disponibles pour le type choisi (exclure les buffers)
                 const availableSlots = getAvailableSlotsForType(
                   allSlots.filter(s => !s.isBuffer), // Les buffers sont invisibles au patient
                   appointmentTypeId,
                   DEFAULT_APPOINTMENT_TYPES
                 );
                 
                 if (availableSlots.length === 0) {
                   return (
                     <div className="text-center py-8 text-slate-500">
                       <p>Aucun créneau disponible pour ce type de rendez-vous.</p>
                       <p className="text-sm mt-2">Essayez une autre date ou un autre type.</p>
                     </div>
                   );
                 }
                 
                 return (
                   <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                     {availableSlots.map((slot) => {
                       // Vérifier si le créneau est déjà pris
                       const isAlreadyTaken = appointments.some(apt => 
                         apt.date === dateStr && 
                         apt.time === slot.time && 
                         apt.status !== 'cancelled'
                       );
                       
                       return (
                         <button
                           key={slot.time}
                           onClick={() => {
                             // Double vérification avant de créer le rendez-vous
                             if (isAlreadyTaken) {
                               alert('Ce créneau a déjà été réservé. Veuillez choisir un autre créneau.');
                               return;
                             }
                             
                             const selectedAptType = DEFAULT_APPOINTMENT_TYPES.find(t => t.id === appointmentTypeId);
                             const newAppt: Appointment = {
                               id: Math.random().toString(36).substr(2, 9),
                               doctorName: selectedDoctor.name,
                               specialty: selectedDoctor.specialty,
                               patientName: userName,
                               patientEmail: patientEmail || undefined,
                               date: dateStr,
                               time: slot.time,
                               status: 'confirmed',
                               type: appointmentType,
                               consultationType: consultationType,
                               appointmentTypeId: appointmentTypeId,
                               duration: (selectedAptType?.slots || 1) * SLOT_DURATION_MINUTES,
                               reason: consultationType === 'autre' && customConsultationReason ? customConsultationReason : undefined,
                               symptoms: symptoms.trim() || undefined
                             };
                             onAddAppointment(newAppt);
                             handleViewChange('overview');
                             setBookingStep(1);
                             setSelectedDate(null);
                             setAppointmentType('In-person');
                             setConsultationType('consultation');
                             setCustomConsultationReason('');
                             setSymptoms('');
                           }}
                           disabled={isAlreadyTaken}
                           className={`p-3 border rounded-xl font-medium text-center transition-colors ${
                             isAlreadyTaken
                               ? 'border-slate-300 bg-slate-100 text-slate-400 cursor-not-allowed line-through'
                               : 'border-slate-200 hover:border-blue-500 hover:bg-blue-50 cursor-pointer bg-white text-slate-900'
                           }`}
                           title={isAlreadyTaken ? `Créneau déjà réservé à ${slot.time}` : `Disponible à ${slot.time}`}
                         >
                           {slot.time}
                         </button>
                       );
                     })}
                   </div>
                 );
               })()}
             </div>
          </div>
        )}
      </div>
    );
  }

  // Vue médecins
  if (view === 'doctors') {
    return (
      <div className="space-y-8 animate-in fade-in duration-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-900">Médecins disponibles</h2>
            <p className="text-slate-500 mt-1">Consultez la liste des médecins partenaires</p>
          </div>
          <button
            onClick={() => {
              handleViewChange('overview');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-900 rounded-xl hover:bg-slate-50 transition-all font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DOCTORS.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all hover:shadow-lg"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-20 h-20 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {doctor.image ? (
                    <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-slate-900 mb-1">{doctor.name}</h3>
                  <p className="text-slate-500 text-sm mb-2">{doctor.specialty}</p>
                  {doctor.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium text-slate-700">{doctor.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>

              {doctor.availability && doctor.availability.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">Créneaux disponibles</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {doctor.availability.slice(0, 6).map((time, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 font-medium"
                      >
                        {time}
                      </span>
                    ))}
                    {doctor.availability.length > 6 && (
                      <span className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                        +{doctor.availability.length - 6}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setSelectedDoctor(doctor);
                  handleViewChange('booking');
                  setBookingStep(1);
                  if (onViewChange) onViewChange('booking');
                }}
                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                Prendre rendez-vous
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Vue historique
  if (view === 'history') {
    const patientAppointments = appointments.filter((appt) => {
      const matchesPatient = patientEmail 
        ? appt.patientEmail?.toLowerCase() === patientEmail.toLowerCase()
        : appt.patientName === userName;
      
      // Seulement les rendez-vous terminés ou annulés
      return matchesPatient && (appt.status === 'completed' || appt.status === 'cancelled');
    });

    return (
      <div className="space-y-8 animate-in fade-in duration-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-900">Historique des rendez-vous</h2>
            <p className="text-slate-500 mt-1">Consultez vos rendez-vous passés</p>
          </div>
          <button
            onClick={() => {
              handleViewChange('overview');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-900 rounded-xl hover:bg-slate-50 transition-all font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
        </div>

        {patientAppointments.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-slate-700 mb-2">Aucun historique</h4>
            <p className="text-slate-500">Vous n'avez pas encore de rendez-vous dans votre historique.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patientAppointments.map((appt) => (
              <div key={appt.id} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-200 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                      {appt.type === 'Video Call' ? <Video className="w-6 h-6 text-blue-600" /> : <MapPin className="w-6 h-6 text-blue-600" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{appt.doctorName}</h4>
                      <p className="text-slate-500 text-sm">{appt.specialty}</p>
                      {appt.consultationType && (
                        <p className="text-blue-600 text-sm font-medium mt-1">
                          {appt.consultationType === 'autre' && appt.reason 
                            ? appt.reason 
                            : translateConsultationType(appt.consultationType)}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusColor(appt.status)}`}>
                    {translateStatus(appt.status)}
                  </span>
                </div>
                
                <div className="flex gap-6 py-4 border-t border-slate-200 text-slate-900 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{appt.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{appt.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {appt.type === 'Video Call' ? <Video className="w-4 h-4 text-slate-400" /> : <MapPin className="w-4 h-4 text-slate-400" />}
                    <span>{appt.type === 'Video Call' ? 'Vidéo' : 'Présentiel'}</span>
                  </div>
                </div>

                {appt.notes && (
                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-sm text-slate-600">
                      <span className="font-semibold">Notes :</span> {appt.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Welcome Section */}
      <section className="bg-white rounded-3xl border border-slate-200 p-8 md:p-12">
        <h2 className="text-4xl md:text-5xl font-black mb-3 text-slate-900">
          Bonjour, <span className="text-blue-600">{userName}</span> !
        </h2>
        <p className="text-lg md:text-xl text-slate-700 font-medium">
          Gérez vos rendez-vous et consultez votre historique.
        </p>
        
        {/* CTA Buttons */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => {
              handleViewChange('booking');
              if (onViewChange) onViewChange('booking');
            }}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold"
          >
            <Calendar className="w-5 h-5" />
            Réserver un rendez-vous
          </button>
          <button
            onClick={() => {
              handleViewChange('history');
              if (onViewChange) onViewChange('history');
            }}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-900 rounded-xl hover:bg-slate-50 transition-all font-bold"
          >
            <FileText className="w-5 h-5" />
            Voir l'historique
          </button>
        </div>
      </section>

      {/* Appointments List */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Vos rendez-vous</h3>
          <button 
            onClick={() => {
              handleViewChange('booking');
              if (onViewChange) onViewChange('booking');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium text-sm"
          >
            <Plus className="w-4 h-4" /> Nouveau RDV
          </button>
        </div>

        {(() => {
          // Filtrer les rendez-vous du patient connecté (seulement actifs)
          const patientAppointments = appointments.filter((appt) => {
            const matchesPatient = patientEmail 
              ? appt.patientEmail?.toLowerCase() === patientEmail.toLowerCase()
              : appt.patientName === userName;
            
            // Seulement les rendez-vous actifs (confirmés ou en attente)
            return matchesPatient && (appt.status === 'confirmed' || appt.status === 'pending');
          });

          if (patientAppointments.length === 0) {
            return (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
                <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-slate-700 mb-2">Aucun rendez-vous</h4>
                <p className="text-slate-500 mb-6">Vous n'avez pas encore de rendez-vous.</p>
                <button 
                  onClick={() => {
                    handleViewChange('booking');
                    if (onViewChange) onViewChange('booking');
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  Réserver un rendez-vous
                </button>
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patientAppointments.map((appt) => (
            <div key={appt.id} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-200 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                    {appt.type === 'Video Call' ? <Video className="w-6 h-6 text-blue-600" /> : <MapPin className="w-6 h-6 text-blue-600" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{appt.doctorName}</h4>
                    <p className="text-slate-500 text-sm">{appt.specialty}</p>
                    {appt.consultationType && (
                      <p className="text-blue-600 text-sm font-medium mt-1">
                        {appt.consultationType === 'autre' && appt.reason 
                          ? appt.reason 
                          : translateConsultationType(appt.consultationType)}
                      </p>
                    )}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusColor(appt.status)}`}>
                  {translateStatus(appt.status)}
                </span>
              </div>
              
                  <div className="flex gap-6 py-4 border-t border-slate-200 text-slate-900 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{appt.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{appt.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  {appt.type === 'Video Call' ? <Video className="w-4 h-4 text-slate-400" /> : <MapPin className="w-4 h-4 text-slate-400" />}
                  <span>{appt.type === 'Video Call' ? 'Vidéo' : 'Présentiel'}</span>
                </div>
              </div>

              {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                <div className="flex gap-2 pt-4 mt-2 border-t border-slate-200">
                  <button className="flex-1 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    Déplacer
                  </button>
                  <button 
                    onClick={() => cancelAppointment(appt.id)}
                    className="flex-1 py-2 text-sm font-semibold text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              )}
            </div>
              ))}
            </div>
          );
        })()}
      </section>

      {/* Analyses médicales */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Mes analyses médicales</h3>
        </div>

        {analyses.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-slate-700 mb-2">Aucune analyse</h4>
            <p className="text-slate-500">Vos analyses médicales apparaîtront ici une fois publiées par votre médecin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analyses.map((analysis) => {
              const getStatusColor = () => {
                switch (analysis.status) {
                  case 'normal': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
                  case 'abnormal': return 'bg-rose-100 text-rose-700 border-rose-200';
                  case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
                  case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
                  default: return 'bg-slate-100 text-slate-700 border-slate-200';
                }
              };

              const getStatusLabel = () => {
                switch (analysis.status) {
                  case 'normal': return 'Normal';
                  case 'abnormal': return 'Anormal';
                  case 'completed': return 'Terminé';
                  case 'pending': return 'En attente';
                  default: return analysis.status;
                }
              };

              const getTypeIcon = () => {
                switch (analysis.type) {
                  case 'blood': return '🩸';
                  case 'urine': return '💧';
                  case 'imaging': return '📷';
                  case 'cardiac': return '❤️';
                  default: return '📋';
                }
              };

              return (
                <div key={analysis.id} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-200 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-2xl">
                        {getTypeIcon()}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{analysis.name}</h4>
                        <p className="text-slate-500 text-sm">{analysis.date}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusColor()}`}>
                      {getStatusLabel()}
                    </span>
                  </div>
                  
                  <div className="flex gap-6 py-4 border-t border-slate-200 text-slate-700 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{analysis.date}</span>
                    </div>
                    {analysis.laboratory && (
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span>{analysis.laboratory}</span>
                      </div>
                    )}
                  </div>

                  {analysis.results && (
                    <div className="pt-4 mt-2 border-t border-slate-200">
                      <p className="text-sm text-slate-900 line-clamp-2">{analysis.results}</p>
                    </div>
                  )}

                  {analysis.status === 'abnormal' && (
                    <div className="mt-4 pt-4 border-t border-rose-100 bg-rose-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-rose-700">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm font-semibold">Résultats anormaux - Consultez votre médecin</span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 mt-2 border-t border-slate-200">
                    <button 
                      onClick={() => setSelectedAnalysis(analysis)}
                      className="flex-1 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Voir les détails
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Modal de détails d'analyse */}
      {selectedAnalysis && (
        <AnalysisDetailView
          analysis={selectedAnalysis}
          onClose={() => setSelectedAnalysis(null)}
        />
      )}
    </div>
  );
};

// Modal pour voir les détails d'une analyse
const AnalysisDetailView: React.FC<{
  analysis: MedicalAnalysis;
  onClose: () => void;
}> = ({ analysis, onClose }) => {
  const getStatusColor = () => {
    switch (analysis.status) {
      case 'normal': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'abnormal': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getTypeIcon = () => {
    switch (analysis.type) {
      case 'blood': return '🩸';
      case 'urine': return '💧';
      case 'imaging': return '📷';
      case 'cardiac': return '❤️';
      default: return '📋';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Détails de l'analyse</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-xl">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-4xl">
                {getTypeIcon()}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">{analysis.name}</h3>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm text-slate-600">{analysis.date}</span>
                  {analysis.laboratory && (
                    <span className="text-sm text-slate-600">• {analysis.laboratory}</span>
                  )}
                </div>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-bold border ${getStatusColor()}`}>
                {analysis.status === 'normal' ? 'Normal' : analysis.status === 'abnormal' ? 'Anormal' : analysis.status === 'completed' ? 'Terminé' : 'En attente'}
              </span>
            </div>
          </div>

          {analysis.results && (
            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <h4 className="font-bold mb-3 text-slate-900">Résultats</h4>
              <p className="text-slate-900 whitespace-pre-wrap">{analysis.results}</p>
            </div>
          )}

          {analysis.values && Object.keys(analysis.values).length > 0 && (
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <h4 className="font-bold mb-4 text-slate-900">Valeurs mesurées</h4>
              <div className="space-y-2">
                {Object.entries(analysis.values).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span className="font-medium text-slate-700">{key}</span>
                    <div className="flex items-center gap-3">
                      <span className={value.normal ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
                        {value.value} {value.unit}
                      </span>
                      {value.normal ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-rose-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.doctorNotes && (
            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <h4 className="font-bold mb-2 text-slate-900">Notes du médecin</h4>
              <p className="text-slate-900 whitespace-pre-wrap">{analysis.doctorNotes}</p>
            </div>
          )}

          {analysis.status === 'abnormal' && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
              <div className="flex items-center gap-3 text-rose-700">
                <AlertCircle className="w-6 h-6" />
                <div>
                  <p className="font-bold">Attention : Résultats anormaux</p>
                  <p className="text-sm mt-1">Veuillez consulter votre médecin pour discuter de ces résultats.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
