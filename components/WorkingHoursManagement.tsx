import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Save, Plus, X, ArrowLeft, User, CheckCircle } from 'lucide-react';
import { Doctor, DoctorPlanningSettings } from '../types';
import { DOCTORS } from '../constants';
import { workingHoursDB } from '../database';

interface WorkingHoursManagementProps {
  doctors: Doctor[];
  onBack?: () => void;
  onHoursSaved?: () => void; // Callback appelé après chaque sauvegarde
}

interface WorkingHoursState {
  [doctorId: string]: {
    workingDays: number[]; // 0 = dimanche, 1 = lundi, ..., 6 = samedi
    workingHours: { start: string; end: string }[]; // Ex: [{start: "09:00", end: "12:00"}, {start: "14:00", end: "18:00"}]
  };
}

const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const dayAbbrev = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export const WorkingHoursManagement: React.FC<WorkingHoursManagementProps> = ({ doctors, onBack, onHoursSaved }) => {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(doctors[0]?.id || '');
  const [workingHours, setWorkingHours] = useState<WorkingHoursState>({});
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  // Charger les horaires depuis Supabase
  useEffect(() => {
    const loadWorkingHours = async () => {
      try {
        const allHours = await workingHoursDB.getAll();
        const defaultHours: WorkingHoursState = {};
        
        doctors.forEach(doctor => {
          // Chercher les horaires du médecin par email ou id
          const doctorEmail = (doctor as any).email || `doctor-${doctor.id}@example.com`;
          const savedSettings = Object.values(allHours).find(s => 
            s.doctorEmail === doctorEmail || s.doctorEmail === `doctor-${doctor.id}@example.com`
          );
          
          if (savedSettings) {
            defaultHours[doctor.id] = {
              workingDays: savedSettings.workingDays,
              workingHours: savedSettings.workingHours,
            };
          } else if (!workingHours[doctor.id]) {
            // Horaires par défaut si pas trouvé dans Supabase
            defaultHours[doctor.id] = {
              workingDays: [1, 2, 3, 4, 5], // Lundi à Vendredi par défaut
              workingHours: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '18:00' }] // Matin et après-midi par défaut
            };
          } else {
            defaultHours[doctor.id] = workingHours[doctor.id];
          }
        });
        
        if (Object.keys(defaultHours).length > 0) {
          setWorkingHours(prev => ({ ...prev, ...defaultHours }));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des horaires:', error);
        // En cas d'erreur, utiliser les valeurs par défaut
        const defaultHours: WorkingHoursState = {};
        doctors.forEach(doctor => {
          if (!workingHours[doctor.id]) {
            defaultHours[doctor.id] = {
              workingDays: [1, 2, 3, 4, 5],
              workingHours: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '18:00' }]
            };
          }
        });
        if (Object.keys(defaultHours).length > 0) {
          setWorkingHours(prev => ({ ...prev, ...defaultHours }));
        }
      }
    };
    
    loadWorkingHours();
  }, [doctors]);

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);
  const currentSettings = workingHours[selectedDoctorId] || {
    workingDays: [1, 2, 3, 4, 5],
    workingHours: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '18:00' }]
  };

  const toggleWorkingDay = (dayIndex: number) => {
    setWorkingHours(prev => ({
      ...prev,
      [selectedDoctorId]: {
        ...prev[selectedDoctorId],
        workingDays: prev[selectedDoctorId]?.workingDays.includes(dayIndex)
          ? prev[selectedDoctorId].workingDays.filter(d => d !== dayIndex)
          : [...(prev[selectedDoctorId]?.workingDays || []), dayIndex].sort()
      }
    }));
    // Sauvegarder automatiquement après un court délai
    setTimeout(() => autoSave(selectedDoctorId), 500);
  };

  const addWorkingHour = () => {
    setWorkingHours(prev => ({
      ...prev,
      [selectedDoctorId]: {
        ...prev[selectedDoctorId],
        workingHours: [
          ...(prev[selectedDoctorId]?.workingHours || []),
          { start: '09:00', end: '17:00' }
        ]
      }
    }));
    // Sauvegarder automatiquement après un court délai
    setTimeout(() => autoSave(selectedDoctorId), 500);
  };

  const removeWorkingHour = (index: number) => {
    setWorkingHours(prev => ({
      ...prev,
      [selectedDoctorId]: {
        ...prev[selectedDoctorId],
        workingHours: prev[selectedDoctorId].workingHours.filter((_, i) => i !== index)
      }
    }));
    // Sauvegarder automatiquement après un court délai
    setTimeout(() => autoSave(selectedDoctorId), 500);
  };

  const updateWorkingHour = (index: number, field: 'start' | 'end', value: string) => {
    setWorkingHours(prev => ({
      ...prev,
      [selectedDoctorId]: {
        ...prev[selectedDoctorId],
        workingHours: prev[selectedDoctorId].workingHours.map((wh, i) =>
          i === index ? { ...wh, [field]: value } : wh
        )
      }
    }));
    // Sauvegarder automatiquement après un court délai (debounce)
    setTimeout(() => autoSave(selectedDoctorId), 800);
  };

  // Fonction de sauvegarde automatique dans Supabase
  const autoSave = async (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) return;

    setSaving(true);
    try {
      const doctorEmail = (doctor as any).email || `doctor-${doctorId}@example.com`;
      const currentHours = workingHours[doctorId];
      
      if (!currentHours) {
        console.error('Aucun horaire à sauvegarder');
        return;
      }

      // Sauvegarder dans Supabase
      await workingHoursDB.save(
        doctorId,
        doctorEmail,
        doctor.name,
        currentHours.workingDays,
        currentHours.workingHours
      );

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      
      console.log('[WorkingHoursManagement] Horaires sauvegardés automatiquement dans Supabase');
      
      // Notifier le parent que les horaires ont été sauvegardés pour recharger doctorSettingsMap
      if (onHoursSaved) {
        onHoursSaved();
      }
    } catch (error) {
      console.error('[WorkingHoursManagement] Erreur lors de la sauvegarde automatique:', error);
      // Ne pas alerter l'utilisateur pour les sauvegardes automatiques
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    await autoSave(selectedDoctorId);
  };

  if (doctors.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Aucun médecin disponible</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        select::-webkit-scrollbar {
          display: none;
        }
        select {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        select option {
          font-size: 20px !important;
          font-weight: bold !important;
          padding: 6px 8px !important;
          line-height: 1.2 !important;
        }
        /* Limiter la hauteur du dropdown pour ne montrer que 2-3 éléments */
        select[size] {
          max-height: 120px;
          overflow-y: auto;
        }
      `}</style>
      <div className="space-y-6 animate-in fade-in duration-700">
      {/* En-tête avec design amélioré */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900">
              Gestion des Horaires
            </h2>
            <p className="text-slate-600 mt-1 text-sm">Configurez les horaires d'ouverture pour chaque médecin</p>
          </div>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-blue-400 transition-all font-semibold shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
        )}
      </div>

      {/* Messages de feedback améliorés */}
      {success && (
        <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 border-l-4 border-emerald-500 rounded-xl flex items-center gap-3 shadow-md animate-in slide-in-from-top duration-300">
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-emerald-900 font-semibold">Horaires sauvegardés !</p>
            <p className="text-emerald-700 text-sm">Les modifications sont enregistrées automatiquement</p>
          </div>
        </div>
      )}
      
      {/* Indicateur de sauvegarde amélioré */}
      {saving && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-xl flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div>
            <p className="text-blue-900 font-semibold">Sauvegarde en cours...</p>
            <p className="text-blue-700 text-sm">Veuillez patienter quelques instants</p>
          </div>
        </div>
      )}

      {/* Sélection du médecin améliorée */}
      <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-2xl border-2 border-slate-200 shadow-lg">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Sélectionner un médecin</h3>
            <p className="text-xs text-slate-500">Choisissez le médecin dont vous souhaitez gérer les horaires</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map(doctor => (
            <button
              key={doctor.id}
              onClick={() => setSelectedDoctorId(doctor.id)}
              className={`p-5 rounded-xl border-2 transition-all text-left transform hover:scale-[1.02] ${
                selectedDoctorId === doctor.id
                  ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg ring-2 ring-blue-200'
                  : 'border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/50 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  selectedDoctorId === doctor.id ? 'bg-blue-600' : 'bg-slate-200'
                }`}>
                  <User className={`w-5 h-5 ${selectedDoctorId === doctor.id ? 'text-white' : 'text-slate-600'}`} />
                </div>
                <div className="flex-1">
                  <div className={`font-bold ${selectedDoctorId === doctor.id ? 'text-blue-900' : 'text-slate-900'}`}>
                    {doctor.name}
                  </div>
                  <div className={`text-sm mt-1 ${selectedDoctorId === doctor.id ? 'text-blue-700' : 'text-slate-600'}`}>
                    {doctor.specialty}
                  </div>
                </div>
                {selectedDoctorId === doctor.id && (
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedDoctor && (
        <div className="bg-white p-8 rounded-2xl border-2 border-slate-200 shadow-lg space-y-8">
          {/* En-tête du médecin sélectionné */}
          <div className="flex items-center gap-4 pb-6 border-b-2 border-slate-100">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">
                {selectedDoctor.name}
              </h3>
              <p className="text-slate-600 text-sm mt-0.5">{selectedDoctor.specialty}</p>
            </div>
          </div>

          {/* Jours ouverts améliorés */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <label className="block text-base font-bold text-slate-900">
                  Jours d'ouverture
                </label>
                <p className="text-xs text-slate-500 mt-0.5">Cliquez sur les jours où le médecin travaille</p>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-3">
              {dayNames.map((dayName, displayIndex) => {
                // Mapping : 0=lundi (affichage) -> 1=lundi (stockage), 6=dimanche (affichage) -> 0=dimanche (stockage)
                const storageIndex = displayIndex === 6 ? 0 : displayIndex + 1;
                const isSelected = currentSettings.workingDays.includes(storageIndex);
                return (
                  <button
                    key={displayIndex}
                    onClick={() => toggleWorkingDay(storageIndex)}
                    className={`p-4 rounded-xl border-2 transition-all font-semibold transform hover:scale-105 ${
                      isSelected
                        ? 'border-blue-600 bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg ring-2 ring-blue-200'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-900 shadow-sm'
                    }`}
                    title={`${isSelected ? 'Désactiver' : 'Activer'} ${dayName}`}
                  >
                    <div className="text-sm font-black">{dayAbbrev[displayIndex]}</div>
                    <div className="text-xs mt-1 font-medium opacity-90">{dayName.substring(0, 3)}</div>
                  </button>
                );
              })}
            </div>
            {currentSettings.workingDays.length > 0 && (
              <p className="text-sm text-emerald-600 mt-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>{currentSettings.workingDays.length} jour{currentSettings.workingDays.length > 1 ? 's' : ''} sélectionné{currentSettings.workingDays.length > 1 ? 's' : ''}</span>
              </p>
            )}
          </div>

          {/* Plages horaires améliorées */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <label className="block text-base font-bold text-slate-900">
                    Plages horaires
                  </label>
                  <p className="text-xs text-slate-500 mt-0.5">Définissez les heures de disponibilité pour chaque jour</p>
                </div>
              </div>
              <button
                onClick={addWorkingHour}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Ajouter une plage
              </button>
            </div>

            <div className="space-y-4">
              {currentSettings.workingHours.map((hourRange, index) => {
                // Convertir "HH:mm" en heures et minutes pour les sélecteurs
                const startParts = hourRange.start.split(':');
                const endParts = hourRange.end.split(':');
                const startHour = parseInt(startParts[0]) || 9;
                const startMin = parseInt(startParts[1]) || 0;
                const endHour = parseInt(endParts[0]) || 17;
                const endMin = parseInt(endParts[1]) || 0;

                const handleStartChange = (hour: number, min: number) => {
                  const timeValue = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
                  updateWorkingHour(index, 'start', timeValue);
                  // La sauvegarde automatique est déjà gérée dans updateWorkingHour
                };

                const handleEndChange = (hour: number, min: number) => {
                  const timeValue = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
                  updateWorkingHour(index, 'end', timeValue);
                  // La sauvegarde automatique est déjà gérée dans updateWorkingHour
                };

                return (
                  <div key={index} className="flex items-center gap-4 p-5 bg-gradient-to-br from-slate-50 to-white rounded-xl border-2 border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-bold text-slate-700 min-w-[35px]">De:</label>
                          <div className="flex items-center gap-2">
                            <select
                              value={startHour}
                              onChange={(e) => handleStartChange(parseInt(e.target.value), startMin)}
                              className="px-4 py-2.5 border-2 border-slate-300 rounded-xl bg-white text-slate-900 focus:ring-4 focus:ring-blue-200 focus:border-blue-600 text-lg font-black shadow-md hover:shadow-lg hover:border-blue-500 transition-all cursor-pointer min-w-[85px] appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23334155%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3E%3Cpolyline points=%226 9 12 15 18 9%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:18px_18px] bg-[right_10px_center] pr-9"
                              style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%236366F1' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 10px center',
                                backgroundSize: '18px 18px',
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none'
                              }}
                            >
                              {Array.from({ length: 24 }, (_, i) => (
                                <option key={i} value={i} style={{ fontSize: '18px', fontWeight: 'bold', padding: '8px' }}>{String(i).padStart(2, '0')}h</option>
                              ))}
                            </select>
                            <style>{`
                              select::-webkit-scrollbar {
                                display: none;
                              }
                              select {
                                -ms-overflow-style: none;
                                scrollbar-width: none;
                              }
                            `}</style>
                            <select
                              value={startMin}
                              onChange={(e) => handleStartChange(startHour, parseInt(e.target.value))}
                              className="px-4 py-2.5 border-2 border-slate-300 rounded-xl bg-white text-slate-900 focus:ring-4 focus:ring-blue-200 focus:border-blue-600 text-lg font-black shadow-md hover:shadow-lg hover:border-blue-500 transition-all cursor-pointer min-w-[75px] appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23334155%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3E%3Cpolyline points=%226 9 12 15 18 9%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:18px_18px] bg-[right_10px_center] pr-9"
                              style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%236366F1' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 10px center',
                                backgroundSize: '18px 18px',
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none'
                              }}
                            >
                              {[0, 15, 30, 45].map(m => (
                                <option key={m} value={m} style={{ fontSize: '18px', fontWeight: 'bold', padding: '8px' }}>{String(m).padStart(2, '0')}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="text-2xl text-slate-400 font-black">→</div>
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-bold text-slate-700 min-w-[35px]">À:</label>
                          <div className="flex items-center gap-2">
                            <select
                              value={endHour}
                              onChange={(e) => handleEndChange(parseInt(e.target.value), endMin)}
                              className="px-4 py-2.5 border-2 border-slate-300 rounded-xl bg-white text-slate-900 focus:ring-4 focus:ring-blue-200 focus:border-blue-600 text-lg font-black shadow-md hover:shadow-lg hover:border-blue-500 transition-all cursor-pointer min-w-[85px] appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23334155%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3E%3Cpolyline points=%226 9 12 15 18 9%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:18px_18px] bg-[right_10px_center] pr-9"
                              style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%236366F1' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 10px center',
                                backgroundSize: '18px 18px',
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none'
                              }}
                            >
                              {Array.from({ length: 24 }, (_, i) => (
                                <option key={i} value={i} style={{ fontSize: '18px', fontWeight: 'bold', padding: '8px' }}>{String(i).padStart(2, '0')}h</option>
                              ))}
                            </select>
                            <select
                              value={endMin}
                              onChange={(e) => handleEndChange(endHour, parseInt(e.target.value))}
                              className="px-4 py-2.5 border-2 border-slate-300 rounded-xl bg-white text-slate-900 focus:ring-4 focus:ring-blue-200 focus:border-blue-600 text-lg font-black shadow-md hover:shadow-lg hover:border-blue-500 transition-all cursor-pointer min-w-[75px] appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23334155%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3E%3Cpolyline points=%226 9 12 15 18 9%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:18px_18px] bg-[right_10px_center] pr-9"
                              style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%236366F1' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 10px center',
                                backgroundSize: '18px 18px',
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none'
                              }}
                            >
                              {[0, 15, 30, 45].map(m => (
                                <option key={m} value={m} style={{ fontSize: '18px', fontWeight: 'bold', padding: '8px' }}>{String(m).padStart(2, '0')}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                    {currentSettings.workingHours.length > 1 && (
                      <button
                        onClick={() => removeWorkingHour(index)}
                        className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all hover:scale-110 border-2 border-transparent hover:border-red-200"
                        title="Supprimer cette plage horaire"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {currentSettings.workingHours.length === 0 && (
              <div className="text-center py-8 px-4 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
                <Clock className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-600 mb-1">Aucune plage horaire définie</p>
                <p className="text-xs text-slate-500">Cliquez sur "Ajouter une plage" pour commencer</p>
              </div>
            )}
          </div>

          {/* Bouton de sauvegarde amélioré */}
          <div className="flex justify-end pt-6 border-t-2 border-slate-200">
            <button
              onClick={handleSave}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-bold text-base shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Save className="w-5 h-5" />
              Enregistrer les horaires
            </button>
          </div>
        </div>
      )}
      </div>
    </>
  );
};
