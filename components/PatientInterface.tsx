
import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Video, CheckCircle, XCircle, MoreVertical, Plus } from 'lucide-react';
import { DOCTORS } from '../constants';
import { Appointment, AppointmentStatus } from '../types';

interface PatientDashboardProps {
  userName?: string;
  appointments: Appointment[];
  onAddAppointment: (appt: Appointment) => void;
  onUpdateAppointments: (appointments: Appointment[]) => void;
  patientEmail?: string;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({ 
  userName = 'Patient',
  appointments,
  onAddAppointment,
  onUpdateAppointments,
  patientEmail = ''
}) => {
  const setAppointments = (updater: Appointment[] | ((prev: Appointment[]) => Appointment[])) => {
    if (typeof updater === 'function') {
      onUpdateAppointments(updater(appointments));
    } else {
      onUpdateAppointments(updater);
    }
  };
  const [view, setView] = useState<'overview' | 'booking'>('overview');
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<typeof DOCTORS[0] | null>(null);
  const [selectedDate, setSelectedDate] = useState<{ day: number; month: number; year: number } | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const translateStatus = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmed': return 'Confirmé';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulé';
      case 'completed': return 'Terminé';
      default: return status;
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
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
  };

  if (view === 'booking') {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Prendre un rendez-vous</h2>
          <button 
            onClick={() => { setView('overview'); setBookingStep(1); }}
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
                <div className="bg-slate-50 p-2 rounded-lg">
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
               <div className="bg-slate-50 p-6 rounded-xl">
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
             
             <div>
               <h4 className="font-semibold mb-3">
                 Créneaux disponibles le {selectedDate.day} {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
               </h4>
               <div className="grid grid-cols-4 gap-3">
                 {selectedDoctor.availability.map(time => {
                   const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
                   const dateStr = `${selectedDate.day} ${monthNames[selectedDate.month]} ${selectedDate.year}`;
                   
                   // Vérifier si ce créneau est déjà pris
                   const isTaken = appointments.some(appt => {
                     // Vérifier si la date correspond
                     const dateMatch = appt.date === dateStr;
                     // Vérifier si l'heure correspond
                     const timeMatch = appt.time === time;
                     // Vérifier si le statut n'est pas annulé
                     const isActive = appt.status !== 'cancelled';
                     return dateMatch && timeMatch && isActive;
                   });
                   
                   return (
                     <button 
                       key={time}
                       disabled={isTaken}
                       onClick={() => {
                         if (!isTaken) {
                          const newAppt: Appointment = {
                            id: Math.random().toString(36).substr(2, 9),
                            doctorName: selectedDoctor.name,
                            specialty: selectedDoctor.specialty,
                            patientName: userName,
                            patientEmail: patientEmail || undefined,
                            date: dateStr,
                            time,
                            status: 'confirmed',
                            type: 'In-person'
                          };
                           onAddAppointment(newAppt);
                           setView('overview');
                           setBookingStep(1);
                           setSelectedDate(null);
                         }
                       }}
                       className={`p-3 border rounded-xl font-medium text-center transition-colors ${
                         isTaken
                           ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through'
                           : 'hover:border-blue-500 hover:bg-blue-50 cursor-pointer'
                       }`}
                       title={isTaken ? 'Créneau déjà réservé' : 'Disponible'}
                     >
                       {time}
                       {isTaken && <span className="block text-xs mt-1">Pris</span>}
                     </button>
                   );
                 })}
               </div>
             </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Welcome Section with Background Image */}
      <section className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-200/50">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?q=80&w=2070&auto=format&fit=crop')`,
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/85 via-indigo-900/80 to-blue-800/85 backdrop-blur-[1px]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-8 md:p-12 text-white">
          <h2 className="text-4xl md:text-5xl font-black mb-3 drop-shadow-2xl">
            Bonjour, <span className="bg-gradient-to-r from-blue-300 to-white bg-clip-text text-transparent">{userName}</span> !
          </h2>
          <p className="text-lg md:text-xl opacity-95 drop-shadow-lg font-medium">
            Gérez vos rendez-vous et consultez votre historique.
          </p>
          
          {/* CTA Button */}
          <div className="mt-8">
            <button
              onClick={() => setView('booking')}
              className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all font-bold shadow-xl shadow-black/30 hover:shadow-2xl hover:shadow-black/40 hover:scale-105"
            >
              <Calendar className="w-5 h-5" />
              Réserver un rendez-vous
            </button>
          </div>
        </div>
      </section>

      {/* Appointments List */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Vos rendez-vous</h3>
          <button 
            onClick={() => setView('booking')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium text-sm"
          >
            <Plus className="w-4 h-4" /> Nouveau RDV
          </button>
        </div>

        {(() => {
          // Filtrer les rendez-vous du patient connecté
          const patientAppointments = appointments.filter((appt) => {
            if (patientEmail) {
              return appt.patientEmail?.toLowerCase() === patientEmail.toLowerCase();
            }
            // Si pas d'email, utiliser le nom du patient (pour compatibilité)
            return appt.patientName === userName;
          });

          if (patientAppointments.length === 0) {
            return (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
                <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-slate-700 mb-2">Aucun rendez-vous</h4>
                <p className="text-slate-500 mb-6">Vous n'avez pas encore de rendez-vous.</p>
                <button 
                  onClick={() => setView('booking')}
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
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    {appt.type === 'Video Call' ? <Video className="w-6 h-6 text-blue-600" /> : <MapPin className="w-6 h-6 text-blue-600" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{appt.doctorName}</h4>
                    <p className="text-slate-500 text-sm">{appt.specialty}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusColor(appt.status)}`}>
                  {translateStatus(appt.status)}
                </span>
              </div>
              
              <div className="flex gap-6 py-4 border-t border-slate-50 text-slate-600 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{appt.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{appt.time}</span>
                </div>
              </div>

              {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                <div className="flex gap-2 pt-4 mt-2 border-t border-slate-50">
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
    </div>
  );
};
