
import React, { useState, useEffect } from 'react';
import { UserRole, Appointment, Patient, PatientInfo, MedicalAnalysis, Doctor } from './types';
import { PatientDashboard } from './components/PatientInterface';
import { DoctorDashboard } from './components/DoctorInterface';
import { AnalysesInterface } from './components/AnalysesInterface';
import { LoginSignup } from './components/LoginSignup';
import { HomePage } from './components/HomePage';
import { DoctorsPage } from './components/DoctorsPage';
import { WaitingRoom } from './components/WaitingRoom';
import { MOCK_APPOINTMENTS } from './constants';
import { Stethoscope, LogOut, Bell, Settings, Menu, X, HeartPulse } from 'lucide-react';
import { appointmentDB, patientDB, analysisDB, initDatabase } from './database';

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
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showAllPatientsPage, setShowAllPatientsPage] = useState(false);
  const [showAnalysesPage, setShowAnalysesPage] = useState(false);
  const [showDoctorsPage, setShowDoctorsPage] = useState(false);
  const [showWaitingRoom, setShowWaitingRoom] = useState(false);
  const [patients, setPatients] = useState<PatientInfo>({});
  const [currentPatientEmail, setCurrentPatientEmail] = useState<string>('');
  const [analyses, setAnalyses] = useState<MedicalAnalysis[]>([]);
  const [patientView, setPatientView] = useState<'overview' | 'booking' | 'history' | 'doctors'>('overview');
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  // Charger les données depuis la base de données au démarrage
  useEffect(() => {
    const loadData = async () => {
      try {
        // Initialiser la base de données avec les données mock si elle est vide
        await initDatabase(MOCK_APPOINTMENTS);
        
        // Charger les rendez-vous
        const loadedAppointments = await appointmentDB.getAll();
        setAppointments(loadedAppointments);
        
        // Charger les patients
        const loadedPatients = await patientDB.getAll();
        if (Object.keys(loadedPatients).length > 0) {
          setPatients(loadedPatients);
        }
        
        // Charger les analyses
        const loadedAnalyses = await analysisDB.getAll();
        setAnalyses(loadedAnalyses);
        
        // Charger les médecins (pour l'instant depuis constants, plus tard depuis la DB)
        // TODO: Créer une table doctors dans Supabase
        const { DOCTORS } = await import('./constants');
        setDoctors(DOCTORS);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };
    
    loadData();
  }, []);

  const handleLogin = async (email: string, password: string) => {
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
      const patient = await patientDB.getByEmail(emailLower) || patients[emailLower];
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

  const handleSignup = async (email: string, password: string, name: string, phone: string, gender: string, age: string) => {
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
    
    // Sauvegarder dans la base de données
    try {
      await patientDB.save(newPatient);
      
      // Mettre à jour l'état local
      setPatients(prev => ({
        ...prev,
        [emailLower]: newPatient
      }));
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      // On continue quand même pour permettre l'inscription
    }
    
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
    <div className="min-h-screen flex flex-col bg-white">
      {/* Content */}
      <div className="flex flex-col min-h-screen">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
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
                    <button 
                      onClick={() => setPatientView('overview')}
                      className={`${patientView === 'overview' ? 'border-blue-500 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold`}
                    >
                      Tableau de bord
                    </button>
                    <button 
                      onClick={() => { setPatientView('doctors'); setMobileMenuOpen(false); }}
                      className={`${patientView === 'doctors' ? 'border-blue-500 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold`}
                    >
                      Médecins
                    </button>
                    <button 
                      onClick={() => setPatientView('history')}
                      className={`${patientView === 'history' ? 'border-blue-500 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold`}
                    >
                      Historique
                    </button>
                  </>
                ) : (
                  <>
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); setShowAllPatientsPage(false); setShowAnalysesPage(false); setShowDoctorsPage(false); setShowWaitingRoom(false); }}
                      className={`${!showAllPatientsPage && !showAnalysesPage && !showDoctorsPage && !showWaitingRoom ? 'border-blue-500 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold`}
                    >
                      Planning
                    </a>
                    <button 
                      onClick={() => { setShowWaitingRoom(true); setShowAllPatientsPage(false); setShowAnalysesPage(false); setShowDoctorsPage(false); }}
                      className={`${showWaitingRoom && !showAllPatientsPage && !showAnalysesPage && !showDoctorsPage ? 'border-blue-500 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold`}
                    >
                      Salle d'attente
                    </button>
                    <button 
                      onClick={() => { setShowAllPatientsPage(true); setShowAnalysesPage(false); setShowDoctorsPage(false); setShowWaitingRoom(false); }}
                      className={`${showAllPatientsPage && !showAnalysesPage && !showDoctorsPage && !showWaitingRoom ? 'border-blue-500 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold`}
                    >
                      Patients
                    </button>
                    <button 
                      onClick={() => { setShowAnalysesPage(true); setShowAllPatientsPage(false); setShowDoctorsPage(false); setShowWaitingRoom(false); }}
                      className={`${showAnalysesPage && !showAllPatientsPage && !showDoctorsPage && !showWaitingRoom ? 'border-blue-500 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold`}
                    >
                      Analyses
                    </button>
                    <button 
                      onClick={() => { setShowDoctorsPage(true); setShowAllPatientsPage(false); setShowAnalysesPage(false); setShowWaitingRoom(false); }}
                      className={`${showDoctorsPage && !showAllPatientsPage && !showAnalysesPage && !showWaitingRoom ? 'border-blue-500 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold`}
                    >
                      Médecins
                    </button>
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
                <button 
                  onClick={(e) => { e.preventDefault(); setPatientView('overview'); setMobileMenuOpen(false); }}
                  className={`block w-full text-left px-4 py-2 ${patientView === 'overview' ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-600'} rounded-lg`}
                >
                  Tableau de bord
                </button>
                <button 
                  onClick={(e) => { e.preventDefault(); setPatientView('doctors'); setMobileMenuOpen(false); }}
                  className={`block w-full text-left px-4 py-2 ${patientView === 'doctors' ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-600'} rounded-lg`}
                >
                  Médecins
                </button>
                <button 
                  onClick={(e) => { e.preventDefault(); setPatientView('history'); setMobileMenuOpen(false); }}
                  className={`block w-full text-left px-4 py-2 ${patientView === 'history' ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-600'} rounded-lg`}
                >
                  Historique
                </button>
              </>
                ) : (
                  <>
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); setShowAllPatientsPage(false); setShowAnalysesPage(false); setShowDoctorsPage(false); setShowWaitingRoom(false); }}
                      className={`block px-4 py-2 ${!showAllPatientsPage && !showAnalysesPage && !showDoctorsPage && !showWaitingRoom ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-600'} rounded-lg`}
                    >
                      Planning
                    </a>
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); setShowWaitingRoom(true); setShowAllPatientsPage(false); setShowAnalysesPage(false); setShowDoctorsPage(false); }}
                      className={`block px-4 py-2 ${showWaitingRoom && !showAllPatientsPage && !showAnalysesPage && !showDoctorsPage ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-600'} rounded-lg`}
                    >
                      Salle d'attente
                    </a>
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); setShowAllPatientsPage(true); setShowAnalysesPage(false); setShowDoctorsPage(false); setShowWaitingRoom(false); }}
                      className={`block px-4 py-2 ${showAllPatientsPage && !showAnalysesPage && !showDoctorsPage && !showWaitingRoom ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-600'} rounded-lg`}
                    >
                      Patients
                    </a>
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); setShowAnalysesPage(true); setShowAllPatientsPage(false); setShowDoctorsPage(false); setShowWaitingRoom(false); }}
                      className={`block px-4 py-2 ${showAnalysesPage && !showAllPatientsPage && !showDoctorsPage && !showWaitingRoom ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-600'} rounded-lg`}
                    >
                      Analyses
                    </a>
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); setShowDoctorsPage(true); setShowAllPatientsPage(false); setShowAnalysesPage(false); setShowWaitingRoom(false); }}
                      className={`block px-4 py-2 ${showDoctorsPage && !showAllPatientsPage && !showAnalysesPage && !showWaitingRoom ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-600'} rounded-lg`}
                    >
                      Médecins
                    </a>
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
            onAddAppointment={async (appt) => {
              try {
                console.log('Ajout du rendez-vous:', appt);
                await appointmentDB.add(appt);
                console.log('Rendez-vous ajouté avec succès dans Supabase');
                setAppointments([appt, ...appointments]);
              } catch (error) {
                console.error('Erreur lors de l\'ajout du rendez-vous:', error);
                alert('Erreur lors de la sauvegarde du rendez-vous. Vérifiez la console pour plus de détails.');
              }
            }}
            onUpdateAppointments={async (appts) => {
              try {
                await appointmentDB.saveAll(appts);
                setAppointments(appts);
              } catch (error) {
                console.error('Erreur lors de la mise à jour des rendez-vous:', error);
              }
            }}
            patientEmail={currentPatientEmail}
            analyses={analyses.filter(a => a.patientEmail?.toLowerCase() === currentPatientEmail.toLowerCase())}
            initialView={patientView}
            onViewChange={setPatientView}
          />
        ) : showWaitingRoom ? (
          <WaitingRoom
            appointments={appointments}
            patients={patients}
            onUpdateAppointments={async (appts) => {
              try {
                await appointmentDB.saveAll(appts);
                setAppointments(appts);
              } catch (error) {
                console.error('Erreur lors de la mise à jour des rendez-vous:', error);
              }
            }}
          />
        ) : showAnalysesPage ? (
          <AnalysesInterface
            patients={patients}
            analyses={analyses}
            onUpdateAnalyses={async (analyses) => {
              try {
                await analysisDB.saveAll(analyses);
                setAnalyses(analyses);
              } catch (error) {
                console.error('Erreur lors de la mise à jour des analyses:', error);
              }
            }}
            onAddAnalysis={async (analysis) => {
              try {
                await analysisDB.add(analysis);
                setAnalyses([analysis, ...analyses]);
              } catch (error) {
                console.error('Erreur lors de l\'ajout de l\'analyse:', error);
              }
            }}
          />
        ) : showDoctorsPage ? (
          <DoctorsPage
            doctors={doctors}
            onAddDoctor={(doctor) => {
              setDoctors([...doctors, doctor]);
            }}
            onUpdateDoctor={(doctor) => {
              setDoctors(doctors.map(d => d.id === doctor.id ? doctor : d));
            }}
            onDeleteDoctor={(id) => {
              setDoctors(doctors.filter(d => d.id !== id));
            }}
          />
        ) : (
          <DoctorDashboardWrapper 
            appointments={appointments}
            onUpdateAppointments={async (appts) => {
              try {
                await appointmentDB.saveAll(appts);
                setAppointments(appts);
              } catch (error) {
                console.error('Erreur lors de la mise à jour des rendez-vous:', error);
              }
            }}
            showAllPatients={showAllPatientsPage}
            onShowAllPatients={setShowAllPatientsPage}
            patients={patients}
          />
        )}
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
    </div>
  );
};

export default App;
