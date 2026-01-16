import React, { useState } from 'react';
import { DoctorPlanningSettings } from '../types';
import { DEFAULT_PLANNING_SETTINGS } from '../planning';
import { Settings, Clock, Calendar, AlertCircle, Plus, X } from 'lucide-react';

interface PlanningSettingsProps {
  doctorEmail: string;
  onSave: (settings: DoctorPlanningSettings) => void;
  initialSettings?: DoctorPlanningSettings;
}

export const PlanningSettingsV2: React.FC<PlanningSettingsProps> = ({
  doctorEmail,
  onSave,
  initialSettings,
}) => {
  const [settings, setSettings] = useState<DoctorPlanningSettings>({
    doctorEmail,
    ...DEFAULT_PLANNING_SETTINGS,
    ...initialSettings,
  });

  const [workingHours, setWorkingHours] = useState<{ start: string; end: string }[]>(
    settings.workingHours || DEFAULT_PLANNING_SETTINGS.workingHours
  );

  const [workingDays, setWorkingDays] = useState<number[]>(
    settings.workingDays || DEFAULT_PLANNING_SETTINGS.workingDays
  );

  const dayLabels = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  const handleAddWorkingHours = () => {
    setWorkingHours([...workingHours, { start: '09:00', end: '12:00' }]);
  };

  const handleRemoveWorkingHours = (index: number) => {
    setWorkingHours(workingHours.filter((_, i) => i !== index));
  };

  const handleUpdateWorkingHours = (index: number, field: 'start' | 'end', value: string) => {
    const updated = [...workingHours];
    updated[index] = { ...updated[index], [field]: value };
    setWorkingHours(updated);
  };

  const toggleWorkingDay = (day: number) => {
    if (workingDays.includes(day)) {
      setWorkingDays(workingDays.filter(d => d !== day));
    } else {
      setWorkingDays([...workingDays, day].sort());
    }
  };

  const handleSave = () => {
    if (workingHours.length === 0) {
      alert('Veuillez définir au moins une plage horaire.');
      return;
    }

    if (workingDays.length === 0) {
      alert('Veuillez sélectionner au moins un jour de travail.');
      return;
    }

    const updatedSettings: DoctorPlanningSettings = {
      ...settings,
      workingHours,
      workingDays,
    };
    onSave(updatedSettings);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-slate-900">Configuration du Planning</h2>
      </div>

      {/* Mode de planning */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-900">
          Mode de planning
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="mode"
              value="strict"
              checked={settings.mode === 'strict'}
              onChange={(e) => setSettings({ ...settings, mode: e.target.value as 'strict' | 'flexible' })}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-slate-700">Strict</span>
            <span className="text-xs text-slate-500">(Créneaux fixes, pas de flexibilité)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="mode"
              value="flexible"
              checked={settings.mode === 'flexible'}
              onChange={(e) => setSettings({ ...settings, mode: e.target.value as 'strict' | 'flexible' })}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-slate-700">Flexible</span>
            <span className="text-xs text-slate-500">(Adaptation automatique)</span>
          </label>
        </div>
      </div>

      {/* Jours travaillés */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-900 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Jours travaillés
        </label>
        <div className="flex flex-wrap gap-2">
          {dayLabels.map((label, index) => (
            <button
              key={index}
              onClick={() => toggleWorkingDay(index)}
              className={`px-4 py-2 rounded-lg border-2 transition-all ${
                workingDays.includes(index)
                  ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Horaires d'ouverture */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Horaires d'ouverture
        </label>
        <div className="space-y-3">
          {workingHours.map((range, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <input
                type="time"
                value={range.start}
                onChange={(e) => handleUpdateWorkingHours(index, 'start', e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-slate-600">à</span>
              <input
                type="time"
                value={range.end}
                onChange={(e) => handleUpdateWorkingHours(index, 'end', e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {workingHours.length > 1 && (
                <button
                  onClick={() => handleRemoveWorkingHours(index)}
                  className="ml-auto p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={handleAddWorkingHours}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200"
          >
            <Plus className="w-4 h-4" />
            Ajouter une plage horaire
          </button>
        </div>
      </div>

      {/* Configuration des buffers */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">Configuration des Buffers (invisibles au patient)</h3>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-900">
            Mode de buffer
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="bufferMode"
                value="per-consultations"
                checked={settings.bufferMode === 'per-consultations'}
                onChange={(e) => setSettings({ ...settings, bufferMode: e.target.value as 'per-consultations' | 'per-hour' })}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-slate-700">Par nombre de consultations</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="bufferMode"
                value="per-hour"
                checked={settings.bufferMode === 'per-hour'}
                onChange={(e) => setSettings({ ...settings, bufferMode: e.target.value as 'per-hour' })}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-slate-700">Par heure</span>
            </label>
          </div>
        </div>

        {settings.bufferMode === 'per-consultations' && (
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">
              Fréquence (1 buffer toutes les X consultations)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={settings.bufferFrequency}
              onChange={(e) => setSettings({ ...settings, bufferFrequency: parseInt(e.target.value) || 3 })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-slate-500">
              Un buffer de 15 minutes sera automatiquement inséré toutes les {settings.bufferFrequency} consultations.
            </p>
          </div>
        )}

        {settings.bufferMode === 'per-hour' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              Un buffer de 15 minutes sera automatiquement inséré au début de chaque heure (09:00, 10:00, 11:00, etc.).
            </p>
          </div>
        )}
      </div>

      {/* Statistiques */}
      {settings.averageConsultationDuration && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-slate-900 mb-2">Statistiques observées</h3>
          <p className="text-sm text-slate-700">
            Durée moyenne réelle des consultations : <strong>{settings.averageConsultationDuration.toFixed(1)} minutes</strong>
          </p>
        </div>
      )}

      {/* Bouton de sauvegarde */}
      <div className="flex justify-end pt-4 border-t border-slate-200">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Enregistrer les paramètres
        </button>
      </div>
    </div>
  );
};
