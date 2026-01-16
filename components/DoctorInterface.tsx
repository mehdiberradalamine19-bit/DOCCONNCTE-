
import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Users, CheckCircle, XCircle, ChevronRight, Activity, TrendingUp, Phone, Mail, MapPin, ArrowLeft, User, Search, Plus, Edit, FileText, X, Video, UserCircle } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
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
  const [showAddAppointmentModal, setShowAddAppointmentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedPatientForDetail, setSelectedPatientForDetail] = useState<string | null>(null);
  const [appointmentFilter, setAppointmentFilter] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all');
  const [flowPeriod, setFlowPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [flowChartType, setFlowChartType] = useState<'area' | 'line' | 'bar'>('area');
  const [selectedFlowDate, setSelectedFlowDate] = useState<string | null>(null);
  
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

  const handleStatus = async (id: string, newStatus: AppointmentStatus) => {
    const appointment = appointments.find(a => a.id === id);
    if (appointment) {
      const updatedAppt = { ...appointment, status: newStatus };
      try {
        await appointmentDB.update(id, updatedAppt);
        setAppointments(prev => prev.map(a => a.id === id ? updatedAppt : a));
      } catch (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
      }
    }
  };

  const handleAddAppointment = async (newAppt: Appointment) => {
    try {
      await appointmentDB.add(newAppt);
      setAppointments(prev => [...prev, newAppt]);
      setShowAddAppointmentModal(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du rendez-vous:', error);
      alert('Erreur lors de la sauvegarde du rendez-vous.');
    }
  };

  const handleUpdateAppointment = async (updatedAppt: Appointment) => {
    try {
      await appointmentDB.update(updatedAppt.id, updatedAppt);
      setAppointments(prev => prev.map(a => a.id === updatedAppt.id ? updatedAppt : a));
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rendez-vous:', error);
      alert('Erreur lors de la mise à jour du rendez-vous.');
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      try {
        await appointmentDB.delete(id);
        setAppointments(prev => prev.filter(a => a.id !== id));
        setSelectedAppointment(null);
      } catch (error) {
        console.error('Erreur lors de la suppression du rendez-vous:', error);
        alert('Erreur lors de la suppression du rendez-vous.');
      }
    }
  };

  // Filtrer les rendez-vous par date sélectionnée et statut
  const getFilteredAppointments = () => {
    let filtered = appointments;
    
    // Filtrer par date si sélectionnée
    if (selectedDate !== null) {
      filtered = filtered.filter(appt => {
        const match = appt.date.match(/(\d+)/);
        if (match) {
          return parseInt(match[1]) === selectedDate;
        }
        return false;
      });
    }
    
    // Filtrer par statut
    if (appointmentFilter !== 'all') {
      filtered = filtered.filter(appt => appt.status === appointmentFilter);
    }
    
    return filtered;
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
  
  // Calculer le flux de patients selon la période sélectionnée
  const getPatientFlowData = () => {
    const today = new Date();
    let flowData: { name: string; count: number; date: string; appointments?: Appointment[] }[] = [];
    
    if (flowPeriod === 'week') {
      const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
      flowData = weekDays.map((day, index) => {
        const dayDate = new Date(today);
        dayDate.setDate(today.getDate() - (7 - index));
        
        const dayNum = dayDate.getDate();
        const monthNum = dayDate.getMonth();
        const yearNum = dayDate.getFullYear();
        const dayDateStr = `${dayNum} ${monthNames[monthNum]} ${yearNum}`;
        
        const dayAppointments = appointments.filter(appt => 
          appt.date === dayDateStr && appt.status === 'confirmed'
        );
        
        return { 
          name: day, 
          count: dayAppointments.length,
          date: dayDateStr,
          appointments: dayAppointments
        };
      });
    } else if (flowPeriod === 'month') {
      // 4 dernières semaines
      for (let week = 3; week >= 0; week--) {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - (week * 7));
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        
        const weekAppointments = appointments.filter(appt => {
          // Parser la date du format "15 Janvier 2025"
          const dateParts = appt.date.split(' ');
          if (dateParts.length < 3) return false;
          
          const day = parseInt(dateParts[0]);
          const monthIndex = monthNames.findIndex(m => 
            m.toLowerCase() === dateParts[1].toLowerCase()
          );
          const year = parseInt(dateParts[2]);
          
          if (isNaN(day) || monthIndex === -1 || isNaN(year)) return false;
          
          const apptDate = new Date(year, monthIndex, day);
          return apptDate >= weekStart && apptDate <= weekEnd && appt.status === 'confirmed';
        });
        
        flowData.push({
          name: `Sem ${4 - week}`,
          count: weekAppointments.length,
          date: `${weekStart.getDate()} ${monthNames[weekStart.getMonth()]} ${weekStart.getFullYear()}`,
          appointments: weekAppointments
        });
      }
    } else if (flowPeriod === 'year') {
      // 12 derniers mois
      const monthNamesShort = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
      for (let month = 11; month >= 0; month--) {
        const monthDate = new Date(today);
        monthDate.setMonth(today.getMonth() - month);
        monthDate.setDate(1);
        monthDate.setHours(0, 0, 0, 0);
        
        const monthAppointments = appointments.filter(appt => {
          // Parser la date du format "15 Janvier 2025"
          const dateParts = appt.date.split(' ');
          if (dateParts.length < 3) return false;
          
          const monthIndex = monthNames.findIndex(m => 
            m.toLowerCase() === dateParts[1].toLowerCase()
          );
          const year = parseInt(dateParts[2]);
          
          return monthIndex === monthDate.getMonth() && 
                 year === monthDate.getFullYear() && 
                 appt.status === 'confirmed';
        });
        
        flowData.push({
          name: monthNamesShort[monthDate.getMonth()],
          count: monthAppointments.length,
          date: monthDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
          appointments: monthAppointments
        });
      }
    }
    
    return flowData;
  };
  
  const patientFlowData = getPatientFlowData();
  
  // Statistiques du flux
  const flowStats = {
    total: patientFlowData.reduce((sum, day) => sum + day.count, 0),
    average: patientFlowData.length > 0 
      ? Math.round(patientFlowData.reduce((sum, day) => sum + day.count, 0) / patientFlowData.length * 10) / 10
      : 0,
    max: Math.max(...patientFlowData.map(d => d.count), 0),
    min: Math.min(...patientFlowData.map(d => d.count), 0),
    trend: patientFlowData.length >= 2 
      ? patientFlowData[patientFlowData.length - 1].count - patientFlowData[0].count
      : 0
  };
  
  // Obtenir les rendez-vous pour une date sélectionnée dans le flux
  const getFlowDateAppointments = () => {
    if (!selectedFlowDate) return [];
    const selectedData = patientFlowData.find(d => d.date === selectedFlowDate);
    return selectedData?.appointments || [];
  };

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
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-900"
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
              <div 
                key={patient.id} 
                onClick={() => setSelectedPatientForDetail(patient.email)}
                className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-shadow cursor-pointer"
              >
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
                    <div className="text-center p-2 bg-white border border-emerald-200 rounded-lg">
                      <p className="text-lg font-bold text-emerald-700">{patient.confirmedCount}</p>
                      <p className="text-xs text-emerald-600 font-medium">Confirmés</p>
                    </div>
                    <div className="text-center p-2 bg-white border border-rose-200 rounded-lg">
                      <p className="text-lg font-bold text-rose-700">{patient.cancelledCount}</p>
                      <p className="text-xs text-rose-600 font-medium">Annulés</p>
                    </div>
                    <div className="text-center p-2 bg-white border border-amber-200 rounded-lg">
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
              <div 
                key={patient.id} 
                onClick={() => setSelectedPatientForDetail(patient.email)}
                className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-shadow cursor-pointer"
              >
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
                      <div key={idx} className="flex items-center justify-between p-2 bg-white border border-rose-200 rounded-lg">
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
              <div 
                key={patient.id} 
                onClick={() => setSelectedPatientForDetail(patient.email)}
                className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-shadow cursor-pointer"
              >
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
                      <div key={idx} className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg">
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
            bg: 'bg-white',
            onClick: () => setShowPatientsToday(true),
            clickable: true
          },
          { label: 'Consultations', value: totalConsultations.toString(), icon: Activity, color: 'text-emerald-600', bg: 'bg-white', clickable: false },
          { 
            label: 'Consultations annulées', 
            value: cancelledAppointments.toString(), 
            icon: Clock, 
            color: 'text-rose-600', 
            bg: 'bg-white',
            onClick: () => setShowCancelledAppointments(true),
            clickable: true
          },
          { label: 'Satisfaction', value: '98%', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-white', clickable: false },
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
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
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
              <h3 className="text-xl font-bold text-slate-900">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h3>
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

          {/* Activity Chart - Flux de patients amélioré */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200">
             <div className="flex items-center justify-between mb-6">
               <h3 className="text-xl font-bold text-slate-900">Flux de patients</h3>
               <div className="flex items-center gap-3">
                 {/* Filtres de période */}
                 <div className="flex gap-1 bg-white p-1 rounded-lg border border-slate-200">
                   {(['week', 'month', 'year'] as const).map((period) => (
                     <button
                       key={period}
                       onClick={() => {
                         setFlowPeriod(period);
                         setSelectedFlowDate(null);
                       }}
                       className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                         flowPeriod === period
                           ? 'bg-white text-blue-600 shadow-sm'
                           : 'text-slate-600 hover:text-slate-900'
                       }`}
                     >
                       {period === 'week' ? 'Semaine' : period === 'month' ? 'Mois' : 'Année'}
                     </button>
                   ))}
                 </div>
                 
                 {/* Type de graphique */}
                 <div className="flex gap-1 bg-white p-1 rounded-lg border border-slate-200">
                   {(['area', 'line', 'bar'] as const).map((type) => (
                     <button
                       key={type}
                       onClick={() => setFlowChartType(type)}
                       className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                         flowChartType === type
                           ? 'bg-white text-blue-600 shadow-sm'
                           : 'text-slate-600 hover:text-slate-900'
                       }`}
                       title={type === 'area' ? 'Aire' : type === 'line' ? 'Ligne' : 'Barres'}
                     >
                       {type === 'area' ? '📊' : type === 'line' ? '📈' : '📊'}
                     </button>
                   ))}
                 </div>
               </div>
             </div>

             {/* Statistiques du flux */}
             <div className="grid grid-cols-4 gap-4 mb-6">
               <div className="bg-white border border-slate-200 p-4 rounded-xl">
                 <p className="text-xs text-slate-900 font-medium mb-1">Total</p>
                 <p className="text-2xl font-bold text-blue-600">{flowStats.total}</p>
               </div>
               <div className="bg-white border border-slate-200 p-4 rounded-xl">
                 <p className="text-xs text-slate-900 font-medium mb-1">Moyenne</p>
                 <p className="text-2xl font-bold text-emerald-600">{flowStats.average}</p>
               </div>
               <div className="bg-white border border-slate-200 p-4 rounded-xl">
                 <p className="text-xs text-slate-900 font-medium mb-1">Maximum</p>
                 <p className="text-2xl font-bold text-purple-600">{flowStats.max}</p>
               </div>
               <div className={`p-4 rounded-xl border border-slate-200 ${flowStats.trend >= 0 ? 'bg-white' : 'bg-white'}`}>
                 <p className="text-xs text-slate-900 font-medium mb-1">Tendance</p>
                 <p className={`text-2xl font-bold ${flowStats.trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                   {flowStats.trend >= 0 ? '+' : ''}{flowStats.trend}
                 </p>
               </div>
             </div>

             {patientFlowData.some(day => day.count > 0) ? (
               <div className="h-80 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   {flowChartType === 'area' ? (
                     <AreaChart 
                       data={patientFlowData}
                       onClick={(data: any) => {
                         if (data && data.activePayload && data.activePayload[0]) {
                           const selectedData = data.activePayload[0].payload;
                           setSelectedFlowDate(selectedData.date);
                         }
                       }}
                     >
                       <defs>
                         <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
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
                         labelFormatter={(label, payload) => {
                           if (payload && payload[0]) {
                             const data = payload[0].payload;
                             return `${label} - ${data.date}`;
                           }
                           return label;
                         }}
                         formatter={(value: any) => [`${value} patient${value > 1 ? 's' : ''}`, 'Patients']}
                       />
                       <Area 
                         type="monotone" 
                         dataKey="count" 
                         stroke="#2563eb" 
                         strokeWidth={3} 
                         fillOpacity={1} 
                         fill="url(#colorCount)"
                         dot={{ fill: '#2563eb', r: 4, cursor: 'pointer' }}
                         activeDot={{ r: 6, fill: '#1d4ed8' }}
                       />
                     </AreaChart>
                   ) : flowChartType === 'line' ? (
                     <LineChart 
                       data={patientFlowData}
                       onClick={(data: any) => {
                         if (data && data.activePayload && data.activePayload[0]) {
                           const selectedData = data.activePayload[0].payload;
                           setSelectedFlowDate(selectedData.date);
                         }
                       }}
                     >
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
                         labelFormatter={(label, payload) => {
                           if (payload && payload[0]) {
                             const data = payload[0].payload;
                             return `${label} - ${data.date}`;
                           }
                           return label;
                         }}
                         formatter={(value: any) => [`${value} patient${value > 1 ? 's' : ''}`, 'Patients']}
                       />
                       <Line 
                         type="monotone" 
                         dataKey="count" 
                         stroke="#2563eb" 
                         strokeWidth={3}
                         dot={{ fill: '#2563eb', r: 4, cursor: 'pointer' }}
                         activeDot={{ r: 6, fill: '#1d4ed8' }}
                       />
                     </LineChart>
                   ) : (
                     <BarChart 
                       data={patientFlowData}
                       onClick={(data: any) => {
                         if (data && data.activePayload && data.activePayload[0]) {
                           const selectedData = data.activePayload[0].payload;
                           setSelectedFlowDate(selectedData.date);
                         }
                       }}
                     >
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
                         labelFormatter={(label, payload) => {
                           if (payload && payload[0]) {
                             const data = payload[0].payload;
                             return `${label} - ${data.date}`;
                           }
                           return label;
                         }}
                         formatter={(value: any) => [`${value} patient${value > 1 ? 's' : ''}`, 'Patients']}
                       />
                       <Bar 
                         dataKey="count" 
                         fill="#2563eb"
                         radius={[8, 8, 0, 0]}
                         cursor="pointer"
                       />
                     </BarChart>
                   )}
                 </ResponsiveContainer>
               </div>
             ) : (
               <div className="h-80 w-full flex items-center justify-center">
                 <div className="text-center text-slate-500">
                   <p className="text-lg font-medium">Aucune donnée pour le moment</p>
                   <p className="text-sm mt-2">Le flux de patients apparaîtra ici</p>
                 </div>
               </div>
             )}

             {/* Détails des rendez-vous pour la date sélectionnée */}
             {selectedFlowDate && getFlowDateAppointments().length > 0 && (
               <div className="mt-6 pt-6 border-t border-slate-200">
                 <div className="flex items-center justify-between mb-4">
                   <h4 className="font-bold text-slate-900">
                     Rendez-vous du {selectedFlowDate}
                   </h4>
                   <button
                     onClick={() => setSelectedFlowDate(null)}
                     className="p-1 hover:bg-slate-100 rounded-lg"
                   >
                     <X className="w-4 h-4 text-slate-400" />
                   </button>
                 </div>
                 <div className="space-y-2 max-h-48 overflow-y-auto">
                   {getFlowDateAppointments().map(appt => (
                     <div key={appt.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-xs">
                           {appt.patientName.split(' ').map(n => n[0]).join('')}
                         </div>
                         <div>
                           <p className="font-medium text-sm text-slate-900">{appt.patientName}</p>
                           <p className="text-xs text-slate-500">{appt.time} - {appt.type === 'Video Call' ? 'Vidéo' : 'Présentiel'}</p>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}
          </section>
        </div>

        {/* Rendez-vous à droite */}
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                {selectedDate ? `Rendez-vous - Jour ${selectedDate}` : 'Prochains rendez-vous'}
              </h3>
              <button
                onClick={() => setShowAddAppointmentModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                <Plus className="w-4 h-4" />
                Ajouter RDV
              </button>
            </div>

            {/* Filter buttons */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {(['all', 'confirmed', 'pending', 'cancelled'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setAppointmentFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    appointmentFilter === filter
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-900 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  {filter === 'all' ? 'Tous' : filter === 'confirmed' ? 'Confirmés' : filter === 'pending' ? 'En attente' : 'Annulés'}
                </button>
              ))}
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {selectedDate ? (
                // Afficher uniquement les rendez-vous qui existent pour la date sélectionnée
                sortedAppointments.length > 0 ? (
                  sortedAppointments.map(appointment => (
                    <div 
                      key={appointment.id} 
                      onClick={() => setSelectedAppointment(appointment)}
                      className="p-4 rounded-xl border border-slate-100 hover:border-blue-100 transition-colors bg-white cursor-pointer"
                    >
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
                          <p className="font-bold text-sm text-slate-900">{appointment.patientName}</p>
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
                      {appointment.notes && (
                        <div className="mt-2 pt-2 border-t border-slate-100">
                          <p className="text-xs text-slate-500 line-clamp-1">{appointment.notes}</p>
                        </div>
                      )}
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
                    <div 
                      key={appt.id} 
                      onClick={() => setSelectedAppointment(appt)}
                      className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-blue-100 transition-colors cursor-pointer bg-white"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-900">
                          {appt.patientName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{appt.patientName}</p>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {appt.time}</span>
                            <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> {appt.date}</span>
                            <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {appt.type === 'Video Call' ? 'Vidéo' : 'Présentiel'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                         {appt.status === 'pending' ? (
                           <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
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
                         <button 
                           onClick={(e) => { e.stopPropagation(); setSelectedAppointment(appt); }}
                           className="p-2 hover:bg-slate-50 rounded-lg"
                         >
                           <ChevronRight className="w-5 h-5 text-slate-400" />
                         </button>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </section>

          <section className="bg-white border border-slate-200 p-6 rounded-2xl text-slate-900">
             <h3 className="font-bold mb-2">Sync. Calendrier</h3>
             <p className="text-sm text-slate-600 mb-4">Connectez votre calendrier Google ou Outlook pour centraliser vos rendez-vous.</p>
             <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors">
               Connecter maintenant
             </button>
          </section>
        </div>
      </div>

      {/* Add Appointment Modal */}
      {showAddAppointmentModal && (
        <AddAppointmentModal
          patients={patients}
          appointments={appointments}
          onClose={() => setShowAddAppointmentModal(false)}
          onAdd={handleAddAppointment}
        />
      )}

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          patients={patients}
          onClose={() => setSelectedAppointment(null)}
          onUpdate={handleUpdateAppointment}
          onDelete={handleDeleteAppointment}
          onStatusChange={handleStatus}
        />
      )}

      {/* Patient Detail Modal */}
      {selectedPatientForDetail && (
        <PatientDetailModal
          patientEmail={selectedPatientForDetail}
          patients={patients}
          appointments={appointments}
          onClose={() => setSelectedPatientForDetail(null)}
        />
      )}
    </div>
  );
};

// Add Appointment Modal Component
const AddAppointmentModal: React.FC<{
  patients: PatientInfo;
  appointments: Appointment[];
  onClose: () => void;
  onAdd: (appt: Appointment) => void;
}> = ({ patients, appointments, onClose, onAdd }) => {
  const [selectedPatientEmail, setSelectedPatientEmail] = useState('');
  const [selectedDate, setSelectedDate] = useState<{ day: number; month: number; year: number } | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState<'In-person' | 'Video Call'>('In-person');
  const [reason, setReason] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const availableTimes = ['09:00', '10:00', '10:30', '11:00', '14:00', '15:00', '15:30', '16:00', '16:30', '17:00'];

  const handleSubmit = () => {
    if (!selectedPatientEmail || !selectedDate || !selectedTime) return;

    const patient = patients[selectedPatientEmail.toLowerCase()];
    if (!patient) return;

    const dateStr = `${selectedDate.day} ${monthNames[selectedDate.month]} ${selectedDate.year}`;
    
    // Vérifier que le créneau n'est pas déjà pris
    const isAlreadyTaken = appointments.some(apt => 
      apt.date === dateStr && 
      apt.time === selectedTime && 
      apt.status !== 'cancelled'
    );
    
    if (isAlreadyTaken) {
      alert('Ce créneau a déjà été réservé. Veuillez choisir un autre créneau.');
      return;
    }
    
    const newAppt: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      patientName: `${patient.firstName} ${patient.name}`,
      patientEmail: patient.email,
      doctorName: 'Docteur Mehdi',
      doctorEmail: 'admin@gmail.com',
      specialty: 'Médecin Généraliste',
      date: dateStr,
      time: selectedTime,
      status: 'confirmed',
      type: appointmentType,
      appointmentTypeId: 'normal',
      duration: 15,
      reason: reason || undefined
    };

    onAdd(newAppt);
  };

  const isTimeTaken = (time: string) => {
    if (!selectedDate) return false;
    const dateStr = `${selectedDate.day} ${monthNames[selectedDate.month]} ${selectedDate.year}`;
    return appointments.some(appt => 
      appt.date === dateStr && 
      appt.time === time && 
      appt.status !== 'cancelled'
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Nouveau rendez-vous</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Patient Selection */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Patient</label>
            <select
              value={selectedPatientEmail}
              onChange={(e) => setSelectedPatientEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900"
            >
              <option value="">Sélectionner un patient</option>
              {Object.values(patients).map(patient => (
                <option key={patient.id} value={patient.email}>
                  {patient.firstName} {patient.name} - {patient.email}
                </option>
              ))}
            </select>
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Date</label>
            <div className="bg-white border border-slate-200 p-4 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h5 className="font-bold text-lg text-slate-900">
                  {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </h5>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const prevMonth = new Date(currentMonth);
                      prevMonth.setMonth(prevMonth.getMonth() - 1);
                      setCurrentMonth(prevMonth);
                    }}
                    className="p-2 hover:bg-white rounded-lg"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => {
                      const nextMonth = new Date(currentMonth);
                      nextMonth.setMonth(nextMonth.getMonth() + 1);
                      setCurrentMonth(nextMonth);
                    }}
                    className="p-2 hover:bg-white rounded-lg"
                  >
                    →
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center">
                {Array.from({length: 30}).map((_, i) => {
                  const day = i + 1;
                  const cellDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                  const today = new Date();
                  const isPast = cellDate < today && cellDate.toDateString() !== today.toDateString();
                  const isSelected = selectedDate?.day === day && 
                                    selectedDate?.month === currentMonth.getMonth() && 
                                    selectedDate?.year === currentMonth.getFullYear();
                  
                  return (
                    <button
                      key={day}
                      onClick={() => {
                        if (!isPast) {
                          setSelectedDate({
                            day,
                            month: currentMonth.getMonth(),
                            year: currentMonth.getFullYear()
                          });
                          setSelectedTime('');
                        }
                      }}
                      disabled={isPast}
                      className={`p-2 text-sm rounded-lg ${
                        isPast
                          ? 'text-slate-300 cursor-not-allowed'
                          : isSelected
                          ? 'bg-blue-600 text-white font-bold'
                          : 'hover:bg-blue-50'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Time Selection */}
          {selectedDate && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Heure</label>
              <div className="grid grid-cols-5 gap-2">
                {availableTimes.map(time => {
                  const taken = isTimeTaken(time);
                  return (
                    <button
                      key={time}
                      onClick={() => !taken && setSelectedTime(time)}
                      disabled={taken}
                      className={`p-3 rounded-xl font-medium text-sm ${
                        taken
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed line-through'
                          : selectedTime === time
                          ? 'bg-blue-600 text-white'
                          : 'bg-white hover:bg-blue-50 border border-slate-200'
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Type Selection */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Type de consultation</label>
            <div className="flex gap-4">
              <button
                onClick={() => setAppointmentType('In-person')}
                className={`flex-1 p-4 rounded-xl border-2 ${
                  appointmentType === 'In-person'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <MapPin className="w-6 h-6 mx-auto mb-2" />
                <span className="font-medium">Présentiel</span>
              </button>
              <button
                onClick={() => setAppointmentType('Video Call')}
                className={`flex-1 p-4 rounded-xl border-2 ${
                  appointmentType === 'Video Call'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <Video className="w-6 h-6 mx-auto mb-2" />
                <span className="font-medium">Vidéo</span>
              </button>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Raison (optionnel)</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Consultation de routine, suivi..."
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 text-slate-900"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedPatientEmail || !selectedDate || !selectedTime}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              Créer le rendez-vous
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Appointment Detail Modal Component
const AppointmentDetailModal: React.FC<{
  appointment: Appointment;
  patients: PatientInfo;
  onClose: () => void;
  onUpdate: (appt: Appointment) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: AppointmentStatus) => void;
}> = ({ appointment, patients, onClose, onUpdate, onDelete, onStatusChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(appointment.notes || '');
  const [reason, setReason] = useState(appointment.reason || '');

  const patient = appointment.patientEmail ? patients[appointment.patientEmail.toLowerCase()] : null;

  const handleSave = async () => {
    const updatedAppt = { ...appointment, notes, reason };
    try {
      await appointmentDB.update(appointment.id, updatedAppt);
      onUpdate(updatedAppt);
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde des modifications.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Détails du rendez-vous</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Patient Info */}
          {patient && (
            <div className="bg-white border border-slate-200 p-4 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-black">
                  {patient.firstName[0]}{patient.name[0] || patient.firstName[1] || ''}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900">{patient.firstName} {patient.name}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                    <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {patient.phone}</span>
                    <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {patient.email}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Appointment Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl">
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-5 h-5 text-slate-400" />
                <span className="font-medium text-slate-900">{appointment.date}</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-slate-400" />
                <span className="font-medium text-slate-900">{appointment.time}</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl">
              <div className="flex items-center gap-3">
                {appointment.type === 'Video Call' ? <Video className="w-5 h-5 text-slate-400" /> : <MapPin className="w-5 h-5 text-slate-400" />}
                <span className="font-medium text-slate-900">{appointment.type === 'Video Call' ? 'Consultation vidéo' : 'Consultation en présentiel'}</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl">
              <span className="font-medium text-slate-900">Statut</span>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                appointment.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                appointment.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                appointment.status === 'cancelled' ? 'bg-rose-100 text-rose-700' :
                'bg-slate-100 text-slate-700'
              }`}>
                {appointment.status === 'confirmed' ? 'Confirmé' : appointment.status === 'pending' ? 'En attente' : appointment.status === 'cancelled' ? 'Annulé' : 'Terminé'}
              </span>
            </div>
          </div>

          {/* Reason */}
          {isEditing ? (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Raison</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900"
              />
            </div>
          ) : (
            reason && (
              <div className="p-4 bg-white border border-slate-200 rounded-xl">
                <p className="text-sm font-medium text-slate-700 mb-1">Raison</p>
                <p className="text-slate-900">{reason}</p>
              </div>
            )
          )}

          {/* Notes */}
          {isEditing ? (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900"
                placeholder="Ajouter des notes sur ce rendez-vous..."
              />
            </div>
          ) : (
            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <p className="text-sm font-medium text-slate-700 mb-1">Notes</p>
              <p className="text-slate-900">{notes || 'Aucune note'}</p>
            </div>
          )}

          {/* Symptômes */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <p className="text-sm font-medium text-slate-700">Symptômes</p>
            </div>
            <p className="text-slate-900 whitespace-pre-wrap">
              {appointment.symptoms || 'Aucun symptôme renseigné'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-slate-200">
            {isEditing ? (
              <>
                <button
                  onClick={() => { setIsEditing(false); setNotes(appointment.notes || ''); setReason(appointment.reason || ''); }}
                  className="flex-1 px-6 py-3 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 text-slate-900"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
                >
                  Enregistrer
                </button>
              </>
            ) : (
              <>
                {appointment.status === 'pending' && (
                  <>
                    <button
                      onClick={() => onStatusChange(appointment.id, 'confirmed')}
                      className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700"
                    >
                      Confirmer
                    </button>
                    <button
                      onClick={() => onStatusChange(appointment.id, 'cancelled')}
                      className="flex-1 px-6 py-3 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700"
                    >
                      Annuler
                    </button>
                  </>
                )}
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 px-6 py-3 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 text-slate-900"
                >
                  <Edit className="w-4 h-4 inline mr-2" />
                  Modifier
                </button>
                <button
                  onClick={() => {
                    if (confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
                      onDelete(appointment.id);
                    }
                  }}
                  className="px-6 py-3 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700"
                >
                  Supprimer
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Patient Detail Modal Component
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
          {/* Patient Info */}
          <div className="bg-white border border-slate-200 p-6 rounded-xl">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-black">
                {patient.firstName[0]}{patient.name[0] || patient.firstName[1] || ''}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2 text-slate-900">{patient.firstName} {patient.name}</h3>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-4 h-4" />
                    <span>{patient.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-4 h-4" />
                    <span>{patient.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <UserCircle className="w-4 h-4" />
                    <span>{patient.gender}, {patient.age} ans</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Appointments History */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-slate-900">Historique des rendez-vous ({patientAppointments.length})</h3>
            {patientAppointments.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <p>Aucun rendez-vous</p>
              </div>
            ) : (
              <div className="space-y-3">
                {patientAppointments.map(appt => (
                  <div key={appt.id} className="p-4 bg-white rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{appt.date} à {appt.time}</p>
                        <p className="text-sm text-slate-500">{appt.type === 'Video Call' ? 'Vidéo' : 'Présentiel'}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        appt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                        appt.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        appt.status === 'cancelled' ? 'bg-rose-100 text-rose-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {appt.status === 'confirmed' ? 'Confirmé' : appt.status === 'pending' ? 'En attente' : appt.status === 'cancelled' ? 'Annulé' : 'Terminé'}
                      </span>
                    </div>
                    {appt.reason && (
                      <p className="text-sm text-slate-600 mt-2">Raison: {appt.reason}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
