
import React, { useState } from 'react';
import { Stethoscope, Mail, Lock, LogIn, ArrowLeft, HeartPulse } from 'lucide-react';

interface DoctorLoginProps {
  onLogin: (email: string, password: string) => void;
  onBack: () => void;
}

export const DoctorLogin: React.FC<DoctorLoginProps> = ({ onLogin, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation simple
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    // Validation email basique
    if (!email.includes('@')) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }

    // Pour la démo, on accepte n'importe quel email/mot de passe
    // En production, cela devrait vérifier contre une base de données
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-emerald-50 via-white to-slate-100">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Retour</span>
          </button>
          
          <div className="flex justify-center">
            <div className="p-4 bg-emerald-600 rounded-3xl shadow-xl shadow-emerald-200">
              <Stethoscope className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">
              Espace <span className="text-emerald-600">Praticien</span>
            </h1>
            <p className="text-slate-600 mt-2">
              Connectez-vous pour accéder à votre tableau de bord
            </p>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre.email@exemple.com"
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                <span className="text-slate-600">Se souvenir de moi</span>
              </label>
              <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Mot de passe oublié ?
              </a>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
            >
              <LogIn className="w-5 h-5" />
              Se connecter
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              Pas encore de compte ?{' '}
              <a href="#" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                Créer un compte praticien
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
            <HeartPulse className="w-4 h-4" />
            <span>DocConnect - Plateforme sécurisée</span>
          </div>
        </div>
      </div>
    </div>
  );
};
