
import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Users, CheckCircle, XCircle, ChevronRight, Activity, TrendingUp, Phone, Mail, MapPin, ArrowLeft, User, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Appointment, AppointmentStatus, PatientInfo } from '../types';


interface DoctorDashboardProps {
  appointments: Appointment[];
  onUpdateAppointments: (appointments: Appointment[]) => void;
  showAllPatients?: boolean;
  onShowAllPatients?: (show: boolean) => void;
  patients?: PatientInfo;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ 
  appointments, 
  onUpdateAppointments,
  showAllPatients: externalShowAllPatients,
  onShowAllPatients: externalOnShowAllPatients,
  patients = {}
}) => {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showPatientsToday, setShowPatientsToday] = useState(false);
  const [showCancelledAppointments, setShowCancelledAppointments] = useState(false);
  const [internalShowAllPatients, setInternalShowAllPatients] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const showAllPatients = externalShowAllPatients !== undefined ? externalShowAllPatients : internalShowAllPatients;
  const setShowAllPatients = externalOnShowAllPatients || setInternalShowAllPatients;

  const setAppointments = (updater: Appointment[] | ((prev: Appointment[]) => Appointment[])) => {
    if (typeof updater === 'function') {
      onUpdateAppointments(updater(appointments));
    } else {
      onUpdateAppointments(updater);
    }
  };

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

  // Filtrer les rendez-vous par date sélectionnée
  const getFilteredAppointments = () => {
    if (selectedDate === null) {
      return appointments;
    }
    
    // Extraire le jour de la date du rendez-vous (ex: "15 Janvier 2025" -> 15)
    return appointments.filter(appt => {
      const match = appt.date.match(/(\d+)/);
      if (match) {
        return parseInt(match[1]) === selectedDate;
      }
      return false;
    });
  };

  const filteredAppointments = getFilteredAppointments();

  // Trier par heure - n'afficher que les rendez-vous qui existent
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const timeA = a.time.replace(':', '');
    const timeB = b.time.replace(':', '');
    return parseInt(timeA) - parseInt(timeB);
  });

  const handleDateClick = (day: number) => {
    setSelectedDate(day);
  };

  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  // Calculer les statistiques
  const today = new Date();
  const todayDay = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();
  const monthNamesLower = monthNames.map(m => m.toLowerCase());
  const todayMonthName = monthNamesLower[todayMonth];
  const todayDateStr = `${todayDay} ${monthNames[todayMonth]} ${todayYear}`;
  
  // Obtenir les rendez-vous d'aujourd'hui (en comparant les dates formatées)
  const todayAppointments = appointments.filter(appt => {
    // Comparer la date du rendez-vous avec la date d'aujourd'hui formatée
    // Format attendu: "15 Janvier 2025"
    return appt.date === todayDateStr && appt.status === 'confirmed';
  });

  // Patients du jour (nombre unique de patients avec rendez-vous confirmés aujourd'hui)
  const uniquePatientsToday = new Set(todayAppointments.map(appt => appt.patientName)).size;
  
  // Obtenir la liste unique des patients du jour avec leurs rendez-vous
  const patientsTodayMap = new Map<string, any[]>();
  todayAppointments.forEach(appt => {
    if (!patientsTodayMap.has(appt.patientName)) {
      patientsTodayMap.set(appt.patientName, []);
    }
    patientsTodayMap.get(appt.patientName)!.push(appt);
  });
  
  // Créer une liste de patients avec leurs informations réelles
  const patientsToday = Array.from(patientsTodayMap.entries()).map(([patientName, patientAppointments]) => {
    // Chercher le patient via l'email dans les rendez-vous
    const patientEmail = patientAppointments[0]?.patientEmail;
    const patient = patientEmail ? patients[patientEmail.toLowerCase()] : undefined;
    
    // Si pas trouvé par email, chercher par nom
    if (!patient) {
      const patientByName = Object.values(patients).find(p => 
        `${p.firstName} ${p.name}` === patientName || p.firstName === patientName || p.name === patientName
      );
      if (patientByName) return {
        id: patientByName.id,
        name: patientByName.name,
        firstName: patientByName.firstName,
        fullName: `${patientByName.firstName} ${patientByName.name}`,
        phone: patientByName.phone,
        email: patientByName.email,
        gender: patientByName.gender,
        age: patientByName.age,
        appointments: patientAppointments
      };
    }
    
    if (patient) {
      // Utiliser les vraies informations du patient
      return {
        id: patient.id,
        name: patient.name,
        firstName: patient.firstName,
        fullName: `${patient.firstName} ${patient.name}`,
        phone: patient.phone,
        email: patient.email,
        gender: patient.gender,
        age: patient.age,
        appointments: patientAppointments
      };
    }
    
    // Si le patient n'est pas trouvé, utiliser les valeurs par défaut
    const nameParts = patientName.split(' ');
    const firstName = nameParts[0] || patientName;
    const lastName = nameParts.slice(1).join(' ') || patientName;
    
    return {
      id: patientName.toLowerCase().replace(/\s+/g, '-'),
      name: lastName,
      firstName: firstName,
      fullName: patientName,
      phone: 'Non renseigné',
      email: 'Non renseigné',
      gender: 'Non renseigné',
      age: 'Non renseigné',
      appointments: patientAppointments
    };
  });
  
  // Consultations (nombre total de rendez-vous confirmés)
  const totalConsultations = appointments.filter(appt => appt.status === 'confirmed').length;
  
  // Consultations annulées (tous les rendez-vous annulés)
  const cancelledAppointmentsList = appointments.filter(appt => appt.status === 'cancelled');
  const cancelledAppointments = cancelledAppointmentsList.length;
  
  // Calculer le flux de patients par jour de la semaine (dernière semaine)
  const getPatientFlowData = () => {
    const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const today = new Date();
    const flowData = weekDays.map((day, index) => {
      // Calculer la date pour chaque jour de la semaine précédente
      const dayDate = new Date(today);
      dayDate.setDate(today.getDate() - (7 - index));
      
      const dayNum = dayDate.getDate();
      const monthNum = dayDate.getMonth();
      const yearNum = dayDate.getFullYear();
      const dayDateStr = `${dayNum} ${monthNames[monthNum]} ${yearNum}`;
      
      // Compter les rendez-vous confirmés pour ce jour
      const dayAppointments = appointments.filter(appt => 
        appt.date === dayDateStr && appt.status === 'confirmed'
      ).length;
      
      return { name: day, count: dayAppointments };
    });
    
    return flowData;
  };
  
  const patientFlowData = getPatientFlowData();
  
  // Grouper les consultations annulées par patient
  const cancelledByPatient = new Map<string, any[]>();
  cancelledAppointmentsList.forEach(appt => {
    if (!cancelledByPatient.has(appt.patientName)) {
      cancelledByPatient.set(appt.patientName, []);
    }
    cancelledByPatient.get(appt.patientName)!.push(appt);
  });
  
  const cancelledPatients = Array.from(cancelledByPatient.entries()).map(([patientName, patientAppointments]) => {
    // Chercher le patient via l'email dans les rendez-vous
    const patientEmail = patientAppointments[0]?.patientEmail;
    const patient = patientEmail ? patients[patientEmail.toLowerCase()] : undefined;
    
    // Si pas trouvé par email, chercher par nom
    if (!patient) {
      const patientByName = Object.values(patients).find(p => 
        `${p.firstName} ${p.name}` === patientName || p.firstName === patientName || p.name === patientName
      );
      if (patientByName) return {
        id: patientByName.id,
        name: patientByName.name,
        firstName: patientByName.firstName,
        fullName: `${patientByName.firstName} ${patientByName.name}`,
        phone: patientByName.phone,
        email: patientByName.email,
        gender: patientByName.gender,
        age: patientByName.age,
        appointments: patientAppointments
      };
    }
    
    if (patient) {
      // Utiliser les vraies informations du patient
      return {
        id: patient.id,
        name: patient.name,
        firstName: patient.firstName,
        fullName: `${patient.firstName} ${patient.name}`,
        phone: patient.phone,
        email: patient.email,
        gender: patient.gender,
        age: patient.age,
        appointments: patientAppointments
      };
    }
    
    // Si le patient n'est pas trouvé, utiliser les valeurs par défaut
    const nameParts = patientName.split(' ');
    const firstName = nameParts[0] || patientName;
    const lastName = nameParts.slice(1).join(' ') || patientName;
    
    return {
      id: patientName.toLowerCase().replace(/\s+/g, '-'),
      name: lastName,
      firstName: firstName,
      fullName: patientName,
      phone: 'Non renseigné',
      email: 'Non renseigné',
      gender: 'Non renseigné',
      age: 'Non renseigné',
      appointments: patientAppointments
    };
  });
  
  // Obtenir tous les patients uniques de tous les rendez-vous
  const allPatientsMap = new Map<string, any[]>();
  appointments.forEach(appt => {
    if (!allPatientsMap.has(appt.patientName)) {
      allPatientsMap.set(appt.patientName, []);
    }
    allPatientsMap.get(appt.patientName)!.push(appt);
  });
  
  // Créer une liste de tous les patients avec leurs informations réelles
  const allPatients = Array.from(allPatientsMap.entries()).map(([patientName, patientAppointments]) => {
    // Chercher le patient via l'email dans les rendez-vous
    const patientEmail = patientAppointments[0]?.patientEmail;
    const patient = patientEmail ? patients[patientEmail.toLowerCase()] : undefined;
    
    // Si pas trouvé par email, chercher par nom
    if (!patient) {
      const patientByName = Object.values(patients).find(p => 
        `${p.firstName} ${p.name}` === patientName || p.firstName === patientName || p.name === patientName
      );
      if (patientByName) {
        const confirmedCount = patientAppointments.filter(a => a.status === 'confirmed').length;
        const cancelledCount = patientAppointments.filter(a => a.status === 'cancelled').length;
        const pendingCount = patientAppointments.filter(a => a.status === 'pending').length;
        return {
          id: patientByName.id,
          name: patientByName.name,
          firstName: patientByName.firstName,
          fullName: `${patientByName.firstName} ${patientByName.name}`,
          phone: patientByName.phone,
          email: patientByName.email,
          gender: patientByName.gender,
          age: patientByName.age,
          appointments: patientAppointments,
          totalAppointments: patientAppointments.length,
          confirmedCount,
          cancelledCount,
          pendingCount
        };
      }
    }
    
    // Compter les rendez-vous par statut
    const confirmedCount = patientAppointments.filter(a => a.status === 'confirmed').length;
    const cancelledCount = patientAppointments.filter(a => a.status === 'cancelled').length;
    const pendingCount = patientAppointments.filter(a => a.status === 'pending').length;
    
    if (patient) {
      // Utiliser les vraies informations du patient
      return {
        id: patient.id,
        name: patient.name,
        firstName: patient.firstName,
        fullName: `${patient.firstName} ${patient.name}`,
        phone: patient.phone,
        email: patient.email,
        gender: patient.gender,
        age: patient.age,
        appointments: patientAppointments,
        totalAppointments: patientAppointments.length,
        confirmedCount,
        cancelledCount,
        pendingCount
      };
    }
    
    // Si le patient n'est pas trouvé, utiliser les valeurs par défaut
    const nameParts = patientName.split(' ');
    const firstName = nameParts[0] || patientName;
    const lastName = nameParts.slice(1).join(' ') || patientName;
    
    return {
      id: patientName.toLowerCase().replace(/\s+/g, '-'),
      name: lastName,
      firstName: firstName,
      fullName: patientName,
      phone: 'Non renseigné',
      email: 'Non renseigné',
      gender: 'Non renseigné',
      age: 'Non renseigné',
      appointments: patientAppointments,
      totalAppointments: patientAppointments.length,
      confirmedCount,
      cancelledCount,
      pendingCount
    };
  });
  
  // Filtrer les patients selon la recherche
  const filteredAllPatients = allPatients.filter(patient => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      patient.fullName.toLowerCase().includes(query) ||
      patient.firstName.toLowerCase().includes(query) ||
      patient.name.toLowerCase().includes(query) ||
      patient.phone.includes(query) ||
      patient.email.toLowerCase().includes(query)
    );
  });

  // Si on affiche la page de tous les patients
  if (showAllPatients) {
    return (
      <div className="space-y-8 animate-in fade-in duration-700">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => {
              setShowAllPatients(false);
              setSearchQuery('');
            }}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex-1">
            <h2 className="text-3xl font-black text-slate-900">Tous les patients</h2>
            <p className="text-slate-500 mt-1">{allPatients.length} patient{allPatients.length > 1 ? 's' : ''} au total</p>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un patient par nom, prénom, téléphone ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
            />
          </div>
          {searchQuery && (
            <p className="text-sm text-slate-500 mt-2">
              {filteredAllPatients.length} résultat{filteredAllPatients.length > 1 ? 's' : ''} trouvé{filteredAllPatients.length > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {filteredAllPatients.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-xl font-medium text-slate-600">
              {searchQuery ? 'Aucun patient trouvé' : 'Aucun patient'}
            </p>
            <p className="text-slate-500 mt-2">
              {searchQuery ? 'Essayez avec d\'autres mots-clés' : 'Les patients avec rendez-vous apparaîtront ici'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAllPatients.map((patient) => (
              <div key={patient.id} className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-black">
                    {patient.firstName[0]}{patient.name[0] || patient.firstName[1] || ''}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900">{patient.fullName}</h3>
                    <p className="text-sm text-slate-500">
                      {patient.totalAppointments} rendez-vous{patient.totalAppointments > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3 text-slate-700">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium">{patient.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium truncate">{patient.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium">
                      {patient.firstName} {patient.name}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-3">Statistiques</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 bg-emerald-50 rounded-lg">
                      <p className="text-lg font-bold text-emerald-700">{patient.confirmedCount}</p>
                      <p className="text-xs text-emerald-600 font-medium">Confirmés</p>
                    </div>
                    <div className="text-center p-2 bg-rose-50 rounded-lg">
                      <p className="text-lg font-bold text-rose-700">{patient.cancelledCount}</p>
                      <p className="text-xs text-rose-600 font-medium">Annulés</p>
                    </div>
                    <div className="text-center p-2 bg-amber-50 rounded-lg">
                      <p className="text-lg font-bold text-amber-700">{patient.pendingCount}</p>
                      <p className="text-xs text-amber-600 font-medium">En attente</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Si on affiche la page des consultations annulées
  if (showCancelledAppointments) {
    return (
      <div className="space-y-8 animate-in fade-in duration-700">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setShowCancelledAppointments(false)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h2 className="text-3xl font-black text-slate-900">Consultations annulées</h2>
            <p className="text-slate-500 mt-1">{cancelledAppointments} consultation{cancelledAppointments > 1 ? 's' : ''} annulée{cancelledAppointments > 1 ? 's' : ''}</p>
          </div>
        </div>

        {cancelledPatients.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
            <CheckCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-xl font-medium text-slate-600">Aucune consultation annulée</p>
            <p className="text-slate-500 mt-2">Toutes vos consultations sont confirmées</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cancelledPatients.map((patient) => (
              <div key={patient.id} className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white text-xl font-black">
                    {patient.firstName[0]}{patient.name[0] || patient.firstName[1] || ''}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900">{patient.fullName}</h3>
                    <p className="text-sm text-slate-500">
                      {patient.appointments.length} consultation{patient.appointments.length > 1 ? 's' : ''} annulée{patient.appointments.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3 text-slate-700">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium">{patient.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium">{patient.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium">
                      {patient.firstName} {patient.name}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2">Consultations annulées</p>
                  <div className="space-y-2">
                    {patient.appointments.map((appt, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-rose-50 rounded-lg">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-3 h-3 text-slate-400" />
                            <span className="text-sm font-medium text-slate-700">{appt.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span className="text-sm font-medium text-slate-700">{appt.time}</span>
                          </div>
                        </div>
                        <span className="text-xs px-2 py-1 bg-rose-100 text-rose-700 rounded-full font-semibold">
                          Annulé
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Si on affiche la page des patients du jour
  if (showPatientsToday) {
    return (
      <div className="space-y-8 animate-in fade-in duration-700">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setShowPatientsToday(false)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h2 className="text-3xl font-black text-slate-900">Patients du jour</h2>
            <p className="text-slate-500 mt-1">{uniquePatientsToday} patient{uniquePatientsToday > 1 ? 's' : ''} aujourd'hui</p>
          </div>
        </div>

        {patientsToday.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-xl font-medium text-slate-600">Aucun patient aujourd'hui</p>
            <p className="text-slate-500 mt-2">Les patients avec rendez-vous confirmés apparaîtront ici</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patientsToday.map((patient) => (
              <div key={patient.id} className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-black">
                    {patient.firstName[0]}{patient.name[0] || patient.firstName[1] || ''}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900">{patient.fullName}</h3>
                    <p className="text-sm text-slate-500">
                      {patient.appointments.length} rendez-vous{patient.appointments.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3 text-slate-700">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium">{patient.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium">{patient.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium">
                      {patient.firstName} {patient.name}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2">Rendez-vous</p>
                  <div className="space-y-2">
                    {patient.appointments.map((appt, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span className="text-sm font-medium text-slate-700">{appt.time}</span>
                        </div>
                        <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full font-semibold">
                          Confirmé
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: 'Patients du jour', 
            value: uniquePatientsToday.toString(), 
            icon: Users, 
            color: 'text-blue-600', 
            bg: 'bg-blue-50',
            onClick: () => setShowPatientsToday(true),
            clickable: true
          },
          { label: 'Consultations', value: totalConsultations.toString(), icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50', clickable: false },
          { 
            label: 'Consultations annulées', 
            value: cancelledAppointments.toString(), 
            icon: Clock, 
            color: 'text-rose-600', 
            bg: 'bg-rose-50',
            onClick: () => setShowCancelledAppointments(true),
            clickable: true
          },
          { label: 'Satisfaction', value: '98%', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50', clickable: false },
        ].map((stat, i) => (
          <div 
            key={i} 
            onClick={stat.clickable ? stat.onClick : undefined}
            className={`bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-4 ${
              stat.clickable ? 'cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all' : ''
            }`}
          >
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div className="flex-1">
              <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
            {stat.clickable && (
              <ChevronRight className="w-5 h-5 text-slate-400" />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendrier en haut/gauche */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-6 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h3>
              <div className="flex gap-1">
                <button 
                  onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                  className="p-1 hover:bg-slate-50 rounded"
                >
                  &lt;
                </button>
                <button 
                  onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                  className="p-1 hover:bg-slate-50 rounded"
                >
                  &gt;
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 mb-2">
              <span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center">
              {Array.from({length: 30}).map((_, i) => {
                const day = i + 1;
                const isSelected = selectedDate === day;
                const hasAppointments = appointments.some(appt => {
                  const match = appt.date.match(/(\d+)/);
                  return match && parseInt(match[1]) === day;
                });
                
                return (
                  <button
                    key={i}
                    onClick={() => handleDateClick(day)}
                    className={`p-3 text-sm rounded-lg transition-colors cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-600 text-white font-bold shadow-lg' 
                        : hasAppointments
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold'
                        : 'hover:bg-blue-50'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Activity Chart */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200">
             <h3 className="text-xl font-bold mb-6">Flux de patients</h3>
             {patientFlowData.some(day => day.count > 0) ? (
               <div className="h-64 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={patientFlowData}>
                     <defs>
                       <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                         <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis 
                       dataKey="name" 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{fill: '#94a3b8', fontSize: 12}} 
                       dy={10} 
                     />
                     <YAxis 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{fill: '#94a3b8', fontSize: 12}} 
                       allowDecimals={false}
                     />
                     <Tooltip 
                       contentStyle={{
                         borderRadius: '12px', 
                         border: 'none', 
                         boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                         backgroundColor: 'white'
                       }}
                       labelFormatter={(label) => `Jour: ${label}`}
                       formatter={(value: any) => [`${value} patient${value > 1 ? 's' : ''}`, 'Patients']}
                     />
                     <Area 
                       type="monotone" 
                       dataKey="count" 
                       stroke="#2563eb" 
                       strokeWidth={3} 
                       fillOpacity={1} 
                       fill="url(#colorCount)" 
                     />
                   </AreaChart>
                 </ResponsiveContainer>
               </div>
             ) : (
               <div className="h-64 w-full flex items-center justify-center">
                 <div className="text-center text-slate-500">
                   <p className="text-lg font-medium">Aucune donnée pour le moment</p>
                   <p className="text-sm mt-2">Le flux de patients apparaîtra ici</p>
                 </div>
               </div>
             )}
          </section>
        </div>

        {/* Rendez-vous à droite */}
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">
                {selectedDate ? `Rendez-vous - Jour ${selectedDate}` : 'Prochains rendez-vous'}
              </h3>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {selectedDate ? (
                // Afficher uniquement les rendez-vous qui existent pour la date sélectionnée
                sortedAppointments.length > 0 ? (
                  sortedAppointments.map(appointment => (
                    <div key={appointment.id} className="p-4 rounded-xl border border-slate-100 hover:border-blue-100 transition-colors bg-white">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2 text-blue-600">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-bold">{appointment.time}</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-xs ml-auto">
                          {appointment.patientName.split(' ').map(n => n[0]).join('')}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <p className="font-bold text-sm">{appointment.patientName}</p>
                          <p className="text-xs text-slate-500">{appointment.type === 'Video Call' ? 'Vidéo' : 'Présentiel'}</p>
                        </div>
                        <span className={`text-xs font-bold uppercase px-2 py-1 rounded border ${
                          appointment.status === 'confirmed' 
                            ? 'text-emerald-600 border-emerald-100 bg-emerald-50' 
                            : appointment.status === 'cancelled'
                            ? 'text-rose-600 border-rose-100 bg-rose-50'
                            : 'text-slate-400 border-slate-100'
                        }`}>
                          {translateStatus(appointment.status)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <p className="text-lg font-medium">Aucun rendez-vous ce jour</p>
                    <p className="text-sm mt-2">Sélectionnez une autre date</p>
                  </div>
                )
              ) : (
                // Afficher tous les rendez-vous si aucune date n'est sélectionnée
                appointments.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <p className="text-lg font-medium">Aucun rendez-vous pour le moment</p>
                    <p className="text-sm mt-2">Les rendez-vous pris par les patients apparaîtront ici</p>
                  </div>
                ) : (
                  sortedAppointments.map(appt => (
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
                  ))
                )
              )}
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
