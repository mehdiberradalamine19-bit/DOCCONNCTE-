
import React, { useState } from 'react';
import { Search, Calendar, Clock, MapPin, Video, CheckCircle, XCircle, MoreVertical, Plus } from 'lucide-react';
import { DOCTORS, MOCK_APPOINTMENTS } from '../constants';
import { Appointment, AppointmentStatus } from '../types';

export const PatientDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [view, setView] = useState<'overview' | 'booking'>('overview');
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<typeof DOCTORS[0] | null>(null);

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
             </div>
             
             <div>
               <h4 className="font-semibold mb-3">Créneaux disponibles (Demain)</h4>
               <div className="grid grid-cols-4 gap-3">
                 {selectedDoctor.availability.map(time => (
                   <button 
                    key={time} 
                    onClick={() => {
                        const newAppt: Appointment = {
                          id: Math.random().toString(36).substr(2, 9),
                          doctorName: selectedDoctor.name,
                          specialty: selectedDoctor.specialty,
                          patientName: 'Vous',
                          date: 'Demain',
                          time,
                          status: 'pending',
                          type: 'In-person'
                        };
                        setAppointments([newAppt, ...appointments]);
                        setView('overview');
                        setBookingStep(1);
                    }}
                    className="p-3 border rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors font-medium text-center"
                   >
                     {time}
                   </button>
                 ))}
               </div>
             </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Search Section */}
      <section className="bg-blue-600 p-8 rounded-3xl text-white shadow-lg shadow-blue-200">
        <h2 className="text-3xl font-bold mb-2">Bonjour, John !</h2>
        <p className="opacity-90 mb-6">Trouvez votre spécialiste et prenez rendez-vous en quelques secondes.</p>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Rechercher un médecin, une clinique, une spécialité..." 
            className="w-full py-4 pl-12 pr-4 rounded-2xl text-slate-800 focus:ring-4 focus:ring-blue-300 outline-none"
          />
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {appointments.map((appt) => (
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
      </section>
    </div>
  );
};
