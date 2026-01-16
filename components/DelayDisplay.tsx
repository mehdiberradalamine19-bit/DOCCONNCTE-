import React from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { Appointment } from '../types';
import { getRecommendedArrivalTime } from '../planning';

interface DelayDisplayProps {
  appointment: Appointment;
  estimatedDelay: number;
  onNotify?: () => void;
}

export const DelayDisplay: React.FC<DelayDisplayProps> = ({
  appointment,
  estimatedDelay,
  onNotify,
}) => {
  if (estimatedDelay <= 0) {
    return null;
  }

  const recommendedTime = getRecommendedArrivalTime(appointment, estimatedDelay);

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-amber-900 mb-1">Retard estimé</h4>
          <p className="text-sm text-amber-800">
            Le médecin a un retard estimé de <strong>{estimatedDelay} minutes</strong>.
          </p>
          <p className="text-sm text-amber-800 mt-2">
            <Clock className="w-4 h-4 inline mr-1" />
            Heure d'arrivée conseillée : <strong>{recommendedTime}</strong>
          </p>
        </div>
      </div>
      
      {onNotify && (
        <button
          onClick={onNotify}
          className="w-full mt-2 px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors text-sm"
        >
          Recevoir une notification par SMS
        </button>
      )}
    </div>
  );
};
