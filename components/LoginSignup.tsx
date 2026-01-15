
import React, { useState } from 'react';
import { Mail, Lock, User, LogIn, UserPlus, ArrowLeft, HeartPulse, X, Phone, Calendar } from 'lucide-react';

interface LoginSignupProps {
  onLogin: (email: string, password: string) => void;
  onSignup: (email: string, password: string, name: string, phone: string, gender: string, age: string) => void;
  onBack: () => void;
}

export const LoginSignup: React.FC<LoginSignupProps> = ({ onLogin, onSignup, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      // Version test : connexion sans rien remplir ou avec n'importe quoi
      // Si aucun email n'est rempli, utiliser un compte client par défaut
      const emailToUse = email.trim() || 'client@default.com';
      const passwordToUse = password || 'default';
      onLogin(emailToUse, passwordToUse);
    } else {
      // Version test : accepter n'importe quel email/mot de passe
      // Si aucun champ n'est rempli, utiliser des valeurs par défaut
      const emailToUse = email.trim() || 'client@default.com';
      const passwordToUse = password || 'default';
      const nameToUse = name.trim() || 'Client';
      const phoneToUse = phone.trim() || '0612345678';
      const genderToUse = gender || 'other';
      const ageToUse = age || '25';
      onSignup(emailToUse, passwordToUse, nameToUse, phoneToUse, genderToUse, ageToUse);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 via-white to-slate-100">
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
            <div className="p-4 bg-blue-600 rounded-3xl shadow-xl shadow-blue-200">
              <HeartPulse className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">
              {isLogin ? 'Connexion' : 'Créer un compte'}
            </h1>
            <p className="text-slate-600 mt-2">
              {isLogin 
                ? 'Connectez-vous pour accéder à votre espace' 
                : 'Créez votre compte pour prendre rendez-vous'}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
                <span>{error}</span>
                <button type="button" onClick={() => setError('')} className="text-rose-500 hover:text-rose-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {!isLogin && (
              <>
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-semibold text-slate-700">
                    Nom complet
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jean Dupont"
                      className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-semibold text-slate-700">
                    Numéro de téléphone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="06 12 34 56 78"
                      className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="gender" className="block text-sm font-semibold text-slate-700">
                      Sexe
                    </label>
                    <select
                      id="gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                    >
                      <option value="">Sélectionner</option>
                      <option value="male">Homme</option>
                      <option value="female">Femme</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="age" className="block text-sm font-semibold text-slate-700">
                      Âge
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        id="age"
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="25"
                        min="1"
                        max="120"
                        className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </>
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
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-slate-600">Se souvenir de moi</span>
                </label>
                <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                  Mot de passe oublié ?
                </a>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
            >
              {isLogin ? (
                <>
                  <LogIn className="w-5 h-5" />
                  Se connecter
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Créer un compte
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              {isLogin ? (
                <>
                  Pas encore de compte ?{' '}
                  <button 
                    onClick={() => {
                      setIsLogin(false);
                      setError('');
                      setEmail('');
                      setPassword('');
                      setName('');
                      setPhone('');
                      setGender('');
                      setAge('');
                    }}
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Créer un compte
                  </button>
                </>
              ) : (
                <>
                  Déjà un compte ?{' '}
                  <button 
                    onClick={() => {
                      setIsLogin(true);
                      setError('');
                      setEmail('');
                      setPassword('');
                      setName('');
                      setPhone('');
                      setGender('');
                      setAge('');
                    }}
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Se connecter
                  </button>
                </>
              )}
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
