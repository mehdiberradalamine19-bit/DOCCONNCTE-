
import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Users, CheckCircle, XCircle, ChevronRight, Activity, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { MOCK_APPOINTMENTS } from '../constants';
import { AppointmentStatus } from '../types';

const data = [
  { name: 'Lun', count: 12 },
  { name: 'Mar', count: 19 },
  { name: 'Mer', count: 15 },
  { name: 'Jeu', count: 22 },
  { name: 'Ven', count: 18 },
  { name: 'Sam', count: 8 },
  { name: 'Dim', count: 0 },
];

export const DoctorDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState(MOCK_APPOINTMENTS);

  const translateStatus = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmed': return 'Confirmé';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulé';
      case 'completed': return 'Terminé';
      default: return status;
    }
  };

  const handleStatus = (id: string, newStatus: AppointmentStatus) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Patients du jour', value: '18', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Consultations', value: '12', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Demandes en attente', value: '4', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Satisfaction', value: '98%', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-6 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Prochains rendez-vous</h3>
              <div className="flex gap-2">
                 <button className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100">Aujourd'hui</button>
                 <button className="px-3 py-1.5 text-xs font-bold rounded-lg text-slate-500">Semaine</button>
              </div>
            </div>

            <div className="space-y-4">
              {appointments.map(appt => (
                <div key={appt.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-blue-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                      {appt.patientName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-bold">{appt.patientName}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {appt.time}</span>
                        <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {appt.type === 'Video Call' ? 'Vidéo' : 'Présentiel'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                     {appt.status === 'pending' ? (
                       <div className="flex gap-2">
                         <button 
                           onClick={() => handleStatus(appt.id, 'confirmed')}
                           className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                           title="Confirmer"
                         >
                           <CheckCircle className="w-5 h-5" />
                         </button>
                         <button 
                           onClick={() => handleStatus(appt.id, 'cancelled')}
                           className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                           title="Refuser"
                         >
                           <XCircle className="w-5 h-5" />
                         </button>
                       </div>
                     ) : (
                       <span className={`text-xs font-bold uppercase px-2 py-1 rounded border ${appt.status === 'confirmed' ? 'text-emerald-600 border-emerald-100' : 'text-slate-400 border-slate-100'}`}>
                         {translateStatus(appt.status)}
                       </span>
                     )}
                     <button className="p-2 hover:bg-slate-50 rounded-lg">
                       <ChevronRight className="w-5 h-5 text-slate-400" />
                     </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Activity Chart */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200">
             <h3 className="text-xl font-bold mb-6">Flux de patients</h3>
             <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'}}
                    />
                    <Area type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
          </section>
        </div>

        {/* Sidebar Mini-Calendar */}
        <div className="space-y-6">
           <section className="bg-white p-6 rounded-2xl border border-slate-200">
             <div className="flex items-center justify-between mb-4">
               <h3 className="font-bold">Juin 2024</h3>
               <div className="flex gap-1">
                 <button className="p-1 hover:bg-slate-50 rounded">&lt;</button>
                 <button className="p-1 hover:bg-slate-50 rounded">&gt;</button>
               </div>
             </div>
             <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 mb-2">
               <span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span>
             </div>
             <div className="grid grid-cols-7 gap-1 text-center">
               {Array.from({length: 30}).map((_, i) => (
                 <div key={i} className={`p-2 text-sm rounded-lg transition-colors cursor-pointer ${i + 1 === 15 ? 'bg-blue-600 text-white font-bold' : 'hover:bg-blue-50'}`}>
                   {i + 1}
                 </div>
               ))}
             </div>
           </section>

           <section className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl text-white">
              <h3 className="font-bold mb-2">Sync. Calendrier</h3>
              <p className="text-sm text-slate-400 mb-4">Connectez votre calendrier Google ou Outlook pour centraliser vos rendez-vous.</p>
              <button className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors">
                Connecter maintenant
              </button>
           </section>
        </div>
      </div>
    </div>
  );
};
