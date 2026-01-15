
import React, { useState } from 'react';
import { UserRole, Appointment, Patient, PatientInfo } from './types';
import { PatientDashboard } from './components/PatientInterface';
import { DoctorDashboard } from './components/DoctorInterface';
import { LoginSignup } from './components/LoginSignup';
import { HomePage } from './components/HomePage';
import { MOCK_APPOINTMENTS } from './constants';
import { Stethoscope, LogOut, Bell, Settings, Menu, X, HeartPulse } from 'lucide-react';

// Wrapper pour gérer l'état de navigation du dashboard docteur
const DoctorDashboardWrapper: React.FC<{ 
  appointments: Appointment[]; 
  onUpdateAppointments: (appts: Appointment[]) => void;
  showAllPatients?: boolean;
  onShowAllPatients?: (show: boolean) => void;
  patients?: PatientInfo;
}> = ({ appointments, onUpdateAppointments, showAllPatients, onShowAllPatients, patients = {} }) => {
  return (
    <DoctorDashboard 
      appointments={appointments}
      onUpdateAppointments={onUpdateAppointments}
      showAllPatients={showAllPatients}
      onShowAllPatients={onShowAllPatients}
      patients={patients}
    />
  );
};

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole | null>(null); // null = non connecté
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [showAllPatientsPage, setShowAllPatientsPage] = useState(false);
  const [patients, setPatients] = useState<PatientInfo>({});
  const [currentPatientEmail, setCurrentPatientEmail] = useState<string>('');

  const handleLogin = (email: string, password: string) => {
    // Si l'email est admin@gmail.com, accès espace praticien
    if (email.toLowerCase() === 'admin@gmail.com') {
      setRole('doctor');
      setUserName('Docteur Mehdi');
      setCurrentPatientEmail('');
    } else {
      // Sinon, accès espace patient
      setRole('patient');
      const emailLower = email.toLowerCase();
      setCurrentPatientEmail(emailLower);
      // Chercher le patient dans la base de données
      const patient = patients[emailLower];
      if (patient) {
        // Utiliser le nom complet du patient
        setUserName(`${patient.firstName} ${patient.name}`);
      } else {
        // Si c'est le compte par défaut, afficher "Client"
        if (emailLower === 'client@default.com') {
          setUserName('Client');
        } else {
          setUserName(email.split('@')[0] || 'Client');
        }
      }
    }
    setIsAuthenticated(true);
    setShowLogin(false);
  };

  const handleSignup = (email: string, password: string, name: string, phone: string, gender: string, age: string) => {
    // Séparer le nom en prénom et nom
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || name;
    const lastName = nameParts.slice(1).join(' ') || name;
    
    const emailLower = email.toLowerCase();
    
    // Créer un ID unique pour le patient
    const patientId = emailLower.replace(/\s+/g, '-');
    
    // Stocker les informations du patient
    const newPatient: Patient = {
      id: patientId,
      email: emailLower,
      name: lastName,
      firstName: firstName,
      phone: phone.trim(),
      gender,
      age,
      password
    };
    
    setPatients(prev => ({
      ...prev,
      [emailLower]: newPatient
    }));
    
    // Après inscription, on connecte l'utilisateur comme patient
    setRole('patient');
    setCurrentPatientEmail(emailLower);
    setUserName(name);
    setIsAuthenticated(true);
    setShowLogin(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setRole(null);
    setUserName('');
    setCurrentPatientEmail('');
  };

  const handleBookAppointment = () => {
    // Si non connecté, rediriger vers la connexion
    if (!isAuthenticated) {
      setShowLogin(true);
    } else {
      // Si connecté, on peut directement accéder à la réservation
      // Pour l'instant, on reste sur le dashboard patient
    }
  };

  // Afficher la page de connexion/inscription
  if (showLogin) {
    return <LoginSignup onLogin={handleLogin} onSignup={handleSignup} onBack={() => setShowLogin(false)} />;
  }

  // Afficher la page d'accueil si non connecté
  if (!isAuthenticated || role === null) {
    return <HomePage onBookAppointment={handleBookAppointment} onLogin={() => setShowLogin(true)} />;
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat bg-fixed z-0"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?q=80&w=2070&auto=format&fit=crop')`,
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-blue-900/50 to-indigo-900/60 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-slate-50/90"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <div 
                className="flex items-center gap-2 cursor-pointer" 
                onClick={handleLogout}
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
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); setShowAllPatientsPage(false); }}
                      className={`${!showAllPatientsPage ? 'border-blue-500 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold`}
                    >
                      Planning
                    </a>
                    <button 
                      onClick={() => setShowAllPatientsPage(true)}
                      className={`${showAllPatientsPage ? 'border-blue-500 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold`}
                    >
                      Patients
                    </button>
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
                    <p className="text-sm font-bold text-slate-900">{userName || (role === 'patient' ? 'Patient' : 'Médecin')}</p>
                    <p className="text-xs font-medium text-slate-500 capitalize">{role === 'patient' ? 'Patient' : 'Médecin'}</p>
                 </div>
                 <img 
                    src={role === 'patient' ? 'https://picsum.photos/seed/user/100/100' : 'https://picsum.photos/seed/doctor1/100/100'} 
                    alt="Profil" 
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-blue-50 ring-offset-2"
                 />
                 <button 
                  onClick={handleLogout}
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
            {role === 'patient' ? (
              <>
                <a href="#" className="block px-4 py-2 text-blue-600 font-bold bg-blue-50 rounded-lg">Tableau de bord</a>
                <a href="#" className="block px-4 py-2 text-slate-600">Messages</a>
                <a href="#" className="block px-4 py-2 text-slate-600">Paramètres</a>
              </>
            ) : (
              <>
                <a href="#" className="block px-4 py-2 text-blue-600 font-bold bg-blue-50 rounded-lg">Planning</a>
                <a href="#" className="block px-4 py-2 text-slate-600">Patients</a>
                <a href="#" className="block px-4 py-2 text-slate-600">Analyses</a>
              </>
            )}
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {role === 'patient' ? (
          <PatientDashboard 
            userName={userName} 
            appointments={appointments}
            onAddAppointment={(appt) => setAppointments([appt, ...appointments])}
            onUpdateAppointments={setAppointments}
            patientEmail={currentPatientEmail}
          />
        ) : (
          <DoctorDashboardWrapper 
            appointments={appointments}
            onUpdateAppointments={setAppointments}
            showAllPatients={showAllPatientsPage}
            onShowAllPatients={setShowAllPatientsPage}
            patients={patients}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/95 backdrop-blur-xl border-t border-slate-200/50 py-10 mt-auto relative z-10">
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
    </div>
  );
};

export default App;
