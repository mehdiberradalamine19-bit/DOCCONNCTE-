
import React, { useState } from 'react';
import { UserRole } from './types';
import { PatientDashboard } from './components/PatientInterface';
import { DoctorDashboard } from './components/DoctorInterface';
import { Stethoscope, User, ShieldCheck, LogOut, Bell, Settings, Menu, X, HeartPulse } from 'lucide-react';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>('guest');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
  };

  const LandingPage = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 via-white to-slate-100">
      <div className="max-w-4xl w-full text-center space-y-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-blue-600 rounded-3xl shadow-xl shadow-blue-200">
             <HeartPulse className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-black tracking-tight text-slate-900">
            Doc<span className="text-blue-600">Connect</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-xl mx-auto">
            La nouvelle génération de connectivité médicale. Simple, rapide et sécurisée.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <button 
            onClick={() => handleRoleSelect('patient')}
            className="group relative overflow-hidden bg-white p-10 rounded-3xl border border-slate-200 hover:border-blue-500 hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 space-y-6">
              <div className="mx-auto w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Espace Patient</h2>
                <p className="text-slate-500">Prenez rendez-vous, consultez votre historique et échangez avec vos praticiens.</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => handleRoleSelect('doctor')}
            className="group relative overflow-hidden bg-white p-10 rounded-3xl border border-slate-200 hover:border-emerald-500 hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute inset-0 bg-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 space-y-6">
              <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Stethoscope className="w-10 h-10 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Espace Praticien</h2>
                <p className="text-slate-500">Gérez votre planning, validez les demandes et développez votre activité.</p>
              </div>
            </div>
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-slate-400 font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-sm">Conforme RGPD & Données Chiffrées</span>
        </div>
      </div>
    </div>
  );

  if (role === 'guest') {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <div 
                className="flex items-center gap-2 cursor-pointer" 
                onClick={() => setRole('guest')}
              >
                <div className="p-2 bg-blue-600 rounded-xl">
                  <HeartPulse className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-black tracking-tight text-slate-900 hidden sm:block">
                  Doc<span className="text-blue-600">Connect</span>
                </span>
              </div>

              {/* Desktop Nav */}
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                {role === 'patient' ? (
                  <>
                    <a href="#" className="border-blue-500 text-slate-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold">Tableau de bord</a>
                    <a href="#" className="border-transparent text-slate-500 hover:text-slate-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Médecins</a>
                    <a href="#" className="border-transparent text-slate-500 hover:text-slate-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Historique</a>
                  </>
                ) : (
                  <>
                    <a href="#" className="border-blue-500 text-slate-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold">Planning</a>
                    <a href="#" className="border-transparent text-slate-500 hover:text-slate-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Patients</a>
                    <a href="#" className="border-transparent text-slate-500 hover:text-slate-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Analyses</a>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <button className="p-2 text-slate-400 hover:text-blue-600 rounded-full hover:bg-slate-100 transition-colors" title="Notifications">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-slate-400 hover:text-blue-600 rounded-full hover:bg-slate-100 transition-colors" title="Paramètres">
                <Settings className="w-5 h-5" />
              </button>
              
              <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

              <div className="flex items-center gap-3 pl-2">
                 <div className="hidden sm:block text-right">
                    <p className="text-sm font-bold text-slate-900">{role === 'patient' ? 'John Doe' : 'Dr. Sarah Martin'}</p>
                    <p className="text-xs font-medium text-slate-500 capitalize">{role === 'patient' ? 'Patient' : 'Médecin'}</p>
                 </div>
                 <img 
                    src={role === 'patient' ? 'https://picsum.photos/seed/user/100/100' : 'https://picsum.photos/seed/doctor1/100/100'} 
                    alt="Profil" 
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-blue-50 ring-offset-2"
                 />
                 <button 
                  onClick={() => setRole('guest')}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Déconnexion"
                 >
                   <LogOut className="w-5 h-5" />
                 </button>
              </div>

              {/* Mobile menu button */}
              <div className="flex md:hidden">
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-400">
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 p-4 space-y-2">
            <a href="#" className="block px-4 py-2 text-blue-600 font-bold bg-blue-50 rounded-lg">Tableau de bord</a>
            <a href="#" className="block px-4 py-2 text-slate-600">Messages</a>
            <a href="#" className="block px-4 py-2 text-slate-600">Paramètres</a>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {role === 'patient' ? <PatientDashboard /> : <DoctorDashboard />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-400 text-sm font-medium">© 2024 DocConnect. Tous droits réservés.</p>
          <div className="mt-4 flex justify-center gap-6">
            <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors text-xs font-bold uppercase tracking-widest">Confidentialité</a>
            <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors text-xs font-bold uppercase tracking-widest">Conditions</a>
            <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors text-xs font-bold uppercase tracking-widest">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
