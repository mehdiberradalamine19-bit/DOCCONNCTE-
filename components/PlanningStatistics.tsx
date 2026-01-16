import React from 'react';
import { BarChart3, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { Appointment } from '../types';
import { calculateStatistics } from '../planning';

interface PlanningStatisticsProps {
  appointments: Appointment[];
  selectedDate: string;
}

export const PlanningStatistics: React.FC<PlanningStatisticsProps> = ({
  appointments,
  selectedDate,
}) => {
  const stats = calculateStatistics(appointments, selectedDate);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <BarChart3 className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-slate-900">Statistiques du jour</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total rendez-vous */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-600 font-medium mb-1">Total RDV</div>
          <div className="text-2xl font-bold text-blue-900">{stats.totalAppointments}</div>
        </div>

        {/* Rendez-vous terminés */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-600 font-medium mb-1">Terminés</div>
          <div className="text-2xl font-bold text-green-900">{stats.completedAppointments}</div>
        </div>

        {/* Durée moyenne */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-purple-600 font-medium mb-1">
            <Clock className="w-4 h-4" />
            Durée moyenne
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {stats.averageDuration > 0 ? `${stats.averageDuration.toFixed(1)} min` : '-'}
          </div>
        </div>

        {/* Retard moyen */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-amber-600 font-medium mb-1">
            <AlertTriangle className="w-4 h-4" />
            Retard moyen
          </div>
          <div className="text-2xl font-bold text-amber-900">
            {stats.averageDelay > 0 ? `${stats.averageDelay.toFixed(1)} min` : '0 min'}
          </div>
        </div>
      </div>

      {/* Graphique simple */}
      {stats.completedAppointments > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4">Détails</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Retard maximum</span>
                <span className="font-semibold text-slate-900">{stats.maxDelay} minutes</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Taux de complétion</span>
                <span className="font-semibold text-slate-900">
                  {stats.totalAppointments > 0 
                    ? `${((stats.completedAppointments / stats.totalAppointments) * 100).toFixed(0)}%`
                    : '0%'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
