import React, { useState, useEffect } from 'react';
import { DoctorPlanningSettings } from '../types';
import { DEFAULT_PLANNING_SETTINGS } from '../planning';
import { Settings, Clock, Calendar, AlertCircle } from 'lucide-react';

interface PlanningSettingsProps {
  doctorEmail: string;
  onSave: (settings: DoctorPlanningSettings) => void;
  initialSettings?: DoctorPlanningSettings;
}

export const PlanningSettings: React.FC<PlanningSettingsProps> = ({
  doctorEmail,
  onSave,
  initialSettings,
}) => {
  const [settings, setSettings] = useState<DoctorPlanningSettings>({
    doctorEmail,
    ...DEFAULT_PLANNING_SETTINGS,
    ...initialSettings,
  });

  const [workingHoursStart, setWorkingHoursStart] = useState(settings.workingHours.start);
  const [workingHoursEnd, setWorkingHoursEnd] = useState(settings.workingHours.end);

  const handleSave = () => {
    const updatedSettings: DoctorPlanningSettings = {
      ...settings,
      workingHours: {
        start: workingHoursStart,
        end: workingHoursEnd,
      },
    };
    onSave(updatedSettings);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-slate-900">Paramètres de Planning</h2>
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

      {/* Heures de travail */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Heure de début
          </label>
          <input
            type="time"
            value={workingHoursStart}
            onChange={(e) => setWorkingHoursStart(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Heure de fin
          </label>
          <input
            type="time"
            value={workingHoursEnd}
            onChange={(e) => setWorkingHoursEnd(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Durée de base des créneaux */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-900">
          Durée de base des créneaux (minutes)
        </label>
        <input
          type="number"
          min="5"
          max="60"
          step="5"
          value={settings.baseSlotDuration}
          onChange={(e) => setSettings({ ...settings, baseSlotDuration: parseInt(e.target.value) || 15 })}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-xs text-slate-500">Durée minimale d'un créneau (par défaut: 15 minutes)</p>
      </div>

      {/* Configuration des buffers */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">Configuration des Buffers</h3>
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
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-900">
            Durée du buffer (minutes)
          </label>
          <input
            type="number"
            min="5"
            max="30"
            step="5"
            value={settings.bufferDuration}
            onChange={(e) => setSettings({ ...settings, bufferDuration: parseInt(e.target.value) || 15 })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
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
