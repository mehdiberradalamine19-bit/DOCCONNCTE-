
import React from 'react';
import { Calendar, HeartPulse, Clock, ShieldCheck, CheckCircle, ArrowRight, Users, Star } from 'lucide-react';

interface HomePageProps {
  onBookAppointment: () => void;
  onLogin: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onBookAppointment, onLogin }) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30">
                <HeartPulse className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-black tracking-tight text-slate-900">
                Doc<span className="text-blue-600">Connect</span>
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={onLogin}
                className="px-5 py-2.5 text-slate-700 hover:text-blue-600 transition-colors font-medium text-sm"
              >
                Se connecter
              </button>
              <button
                onClick={onBookAppointment}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105"
              >
                <Calendar className="w-5 h-5" />
                Prendre un rendez-vous
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20 pb-20">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-slate-900">Solution de santé connectée</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight">
              <span className="text-slate-900">
                Prenez soin de vous
              </span>
              <br />
              <span className="text-blue-600">
                avec DocConnect
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-700 max-w-3xl mx-auto font-medium leading-relaxed">
              Réservez votre consultation médicale en ligne en quelques clics. 
              <span className="text-slate-600"> Simple, rapide et sécurisé.</span>
            </p>
            
            {/* CTA Button */}
            <div className="flex justify-center gap-4 pt-8">
              <button
                onClick={onBookAppointment}
                className="group px-10 py-5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-bold text-lg flex items-center gap-3"
              >
                <Calendar className="w-6 h-6" />
                Réserver un rendez-vous
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-12 pt-16">
              <div className="text-center bg-white border border-slate-200 px-6 py-4 rounded-2xl">
                <div className="text-4xl font-black text-slate-900">10K+</div>
                <div className="text-sm text-slate-600 font-medium mt-1">Patients satisfaits</div>
              </div>
              <div className="text-center bg-white border border-slate-200 px-6 py-4 rounded-2xl">
                <div className="text-4xl font-black text-slate-900">500+</div>
                <div className="text-sm text-slate-600 font-medium mt-1">Médecins partenaires</div>
              </div>
              <div className="text-center bg-white border border-slate-200 px-6 py-4 rounded-2xl">
                <div className="text-4xl font-black text-slate-900">50K+</div>
                <div className="text-sm text-slate-600 font-medium mt-1">Rendez-vous réservés</div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 pt-20">
            <div className="group bg-white p-10 rounded-3xl border border-slate-200 shadow-lg hover:shadow-2xl transition-all hover:border-blue-300 hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                <Calendar className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900">Réservation en ligne</h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                Réservez votre rendez-vous 24/7 depuis votre ordinateur ou votre smartphone. 
                Disponibilité instantanée.
              </p>
            </div>

            <div className="group bg-white p-10 rounded-3xl border border-slate-200 shadow-lg hover:shadow-2xl transition-all hover:border-emerald-300 hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                <Clock className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900">Disponibilités en temps réel</h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                Consultez les créneaux disponibles instantanément et choisissez celui qui vous convient le mieux.
              </p>
            </div>

            <div className="group bg-white p-10 rounded-3xl border border-slate-200 shadow-lg hover:shadow-2xl transition-all hover:border-purple-300 hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900">Sécurité garantie</h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                Vos données sont protégées et sécurisées conformément au RGPD. 
                Confidentialité absolue garantie.
              </p>
            </div>
          </div>

          {/* Additional Features Section */}
          <div className="bg-white border border-slate-200 rounded-3xl p-12 md:p-16 mb-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-semibold text-slate-900">Service premium</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                  Pourquoi choisir DocConnect ?
                </h2>
                <p className="text-xl text-slate-700 leading-relaxed">
                  Une plateforme moderne conçue pour simplifier votre expérience médicale 
                  et vous offrir les meilleurs services de santé.
                </p>
                <div className="space-y-4 pt-4">
                  {[
                    'Accès 24/7 à la réservation',
                    'Notifications en temps réel',
                    'Historique médical sécurisé',
                    'Support client réactif'
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-slate-900 font-medium text-lg">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-slate-200 p-6 rounded-2xl">
                    <Users className="w-8 h-8 text-blue-600 mb-3" />
                    <div className="text-3xl font-black text-slate-900 mb-1">98%</div>
                    <div className="text-slate-600 text-sm font-medium">Satisfaction</div>
                  </div>
                  <div className="bg-white border border-slate-200 p-6 rounded-2xl">
                    <Clock className="w-8 h-8 text-blue-600 mb-3" />
                    <div className="text-3xl font-black text-slate-900 mb-1">&lt;5min</div>
                    <div className="text-slate-600 text-sm font-medium">Réservation</div>
                  </div>
                  <div className="bg-white border border-slate-200 p-6 rounded-2xl col-span-2">
                    <ShieldCheck className="w-8 h-8 text-blue-600 mb-3" />
                    <div className="text-3xl font-black text-slate-900 mb-1">100%</div>
                    <div className="text-slate-600 text-sm font-medium">Sécurisé & Conforme RGPD</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl">
                <HeartPulse className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-900">
                Doc<span className="text-blue-600">Connect</span>
              </span>
            </div>
            <div className="flex gap-8 text-sm">
              <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">
                Confidentialité
              </a>
              <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">
                Conditions
              </a>
              <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">
                Support
              </a>
            </div>
            <p className="text-slate-400 text-sm font-medium">
              © 2024 DocConnect. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
