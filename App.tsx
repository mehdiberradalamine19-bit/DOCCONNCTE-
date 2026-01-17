
import React, { useState, useEffect } from 'react';
import { UserRole, Appointment, Patient, PatientInfo, MedicalAnalysis, Doctor } from './types';
import { PatientDashboard } from './components/PatientInterface';
import { DoctorDashboard } from './components/DoctorInterface';
import { AnalysesInterface } from './components/AnalysesInterface';
import { LoginSignup } from './components/LoginSignup';
import { HomePage } from './components/HomePage';
import { DoctorsPage } from './components/DoctorsPage';
import { WaitingRoom } from './components/WaitingRoom';
import { PatientInfoForm } from './components/PatientInfoForm';
import { WorkingHoursManagement } from './components/WorkingHoursManagement';
import { MOCK_APPOINTMENTS } from './constants';
import { Stethoscope, LogOut, Bell, Settings, Menu, X, HeartPulse } from 'lucide-react';
import { appointmentDB, patientDB, analysisDB, initDatabase, workingHoursDB } from './database';
import { DoctorPlanningSettings } from './types';

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
  const [showPatientInfo, setShowPatientInfo] = useState(false);
  const [patientInfoKey, setPatientInfoKey] = useState(0); // Compteur pour forcer le remount
  const [showWorkingHours, setShowWorkingHours] = useState(false);
  const [patients, setPatients] = useState<PatientInfo>({});
  const [currentPatientEmail, setCurrentPatientEmail] = useState<string>('');
  const [analyses, setAnalyses] = useState<MedicalAnalysis[]>([]);
  const [doctorSettingsMap, setDoctorSettingsMap] = useState<Record<string, DoctorPlanningSettings>>({});
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
        
        // Charger les horaires des médecins
        const loadedWorkingHours = await workingHoursDB.getAll();
        setDoctorSettingsMap(loadedWorkingHours);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };
    
    loadData();
  }, []);

  // Recharger les horaires quand on revient du panneau d'horaires
  useEffect(() => {
    const reloadWorkingHours = async () => {
      if (!showWorkingHours) {
        // Recharger les horaires depuis Supabase
        try {
          const loadedWorkingHours = await workingHoursDB.getAll();
          setDoctorSettingsMap(loadedWorkingHours);
        } catch (error) {
          console.error('Erreur lors du rechargement des horaires:', error);
        }
      }
    };
    
    reloadWorkingHours();
  }, [showWorkingHours]);

  // Recharger les données du patient quand on affiche la page "Mes Informations"
  useEffect(() => {
    const reloadPatientData = async () => {
      if (showPatientInfo && role === 'patient' && currentPatientEmail) {
        try {
          console.log('[App] Rechargement des données patient pour:', currentPatientEmail);
          // Recharger les patients depuis Supabase pour avoir les données les plus récentes
          const loadedPatients = await patientDB.getAll();
          console.log('[App] Patients chargés:', Object.keys(loadedPatients));
          
          setPatients(loadedPatients);
          
          // Recharger aussi le patient spécifique pour mettre à jour le nom d'utilisateur
          const emailLower = currentPatientEmail.toLowerCase();
          const patient = loadedPatients[emailLower];
          if (patient) {
            console.log('[App] Patient trouvé:', patient.firstName, patient.name);
            setUserName(`${patient.firstName} ${patient.name}`);
          } else {
            console.log('[App] Patient non trouvé pour:', emailLower);
          }
        } catch (error) {
          console.error('[App] Erreur lors du rechargement des données patient:', error);
        }
      }
    };
    
    // Attendre un peu pour s'assurer que le composant est monté
    const timeoutId = setTimeout(() => {
      reloadPatientData();
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [showPatientInfo, role, currentPatientEmail]);

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
    
    console.log('[App.handleSignup] Création d\'un nouveau patient:', {
      email: emailLower,
      firstName: firstName,
      name: lastName,
      phone: phone.trim(),
    });
    
    // Sauvegarder dans la base de données
    try {
      await patientDB.save(newPatient);
      console.log('[App.handleSignup] Patient sauvegardé avec succès dans Supabase');
      
      // Recharger les patients depuis Supabase pour avoir les données les plus récentes
      const loadedPatients = await patientDB.getAll();
      console.log('[App.handleSignup] Patients rechargés:', Object.keys(loadedPatients));
      
      // Mettre à jour l'état local avec les données rechargées
      setPatients(loadedPatients);
      
      // S'assurer que le nouveau patient est dans l'état
      if (loadedPatients[emailLower]) {
        console.log('[App.handleSignup] Nouveau patient trouvé dans l\'état:', loadedPatients[emailLower]);
      } else {
        console.warn('[App.handleSignup] Nouveau patient non trouvé dans l\'état, ajout manuel');
        setPatients(prev => ({
          ...prev,
          [emailLower]: newPatient
        }));
      }
    } catch (error: any) {
      console.error('[App.handleSignup] Erreur lors de l\'inscription:', error);
      console.error('[App.handleSignup] Détails de l\'erreur:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
      });
      
      // Afficher une alerte à l'utilisateur avec les détails de l'erreur
      const errorMessage = error?.message || error?.details || 'Erreur inconnue lors de l\'inscription';
      alert(`Erreur lors de l'inscription: ${errorMessage}\n\nVérifiez la console (F12) pour plus de détails.`);
      
      // En cas d'erreur, ajouter quand même dans l'état local pour permettre la connexion
      setPatients(prev => ({
        ...prev,
        [emailLower]: newPatient
      }));
      
      // Ne pas relancer l'erreur pour permettre à l'utilisateur de continuer malgré l'erreur
      // throw error;
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
                      onClick={() => { setPatientView('overview'); setShowPatientInfo(false); }}
                      className={`${patientView === 'overview' && !showPatientInfo ? 'border-blue-500 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold`}
                    >
                      Tableau de bord
                    </button>
                    <button 
                      onClick={() => { setPatientView('doctors'); setShowPatientInfo(false); setMobileMenuOpen(false); }}
                      className={`${patientView === 'doctors' && !showPatientInfo ? 'border-blue-500 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold`}
                    >
                      Médecins
                    </button>
                    <button 
                      onClick={() => { setPatientView('history'); setShowPatientInfo(false); }}
                      className={`${patientView === 'history' && !showPatientInfo ? 'border-blue-500 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold`}
                    >
                      Historique
                    </button>
                    <button 
                      onClick={() => { 
                        setShowPatientInfo(true); 
                        setPatientInfoKey(prev => prev + 1); // Incrémenter pour forcer le remount
                        setMobileMenuOpen(false); 
                      }}
                      className={`${showPatientInfo ? 'border-blue-500 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold`}
                    >
                      Mes Informations
                    </button>
                  </>
                ) : (
                  <>
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); setShowAllPatientsPage(false); setShowAnalysesPage(false); setShowDoctorsPage(false); setShowWaitingRoom(false); setShowWorkingHours(false); }}
                      className={`${!showAllPatientsPage && !showAnalysesPage && !showDoctorsPage && !showWaitingRoom && !showWorkingHours ? 'border-blue-500 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold`}
                    >
                      Planning
                    </a>
                    <button 
                      onClick={() => { setShowWaitingRoom(true); setShowAllPatientsPage(false); setShowAnalysesPage(false); setShowDoctorsPage(false); setShowWorkingHours(false); }}
                      className={`${showWaitingRoom && !showAllPatientsPage && !showAnalysesPage && !showDoctorsPage && !showWorkingHours ? 'border-blue-500 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold`}
                    >
                      Salle d'attente
                    </button>
                    <button 
                      onClick={() => { setShowAllPatientsPage(true); setShowAnalysesPage(false); setShowDoctorsPage(false); setShowWaitingRoom(false); setShowWorkingHours(false); }}
                      className={`${showAllPatientsPage && !showAnalysesPage && !showDoctorsPage && !showWaitingRoom && !showWorkingHours ? 'border-blue-500 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold`}
                    >
                      Patients
                    </button>
                    <button 
                      onClick={() => { setShowAnalysesPage(true); setShowAllPatientsPage(false); setShowDoctorsPage(false); setShowWaitingRoom(false); setShowWorkingHours(false); }}
                      className={`${showAnalysesPage && !showAllPatientsPage && !showDoctorsPage && !showWaitingRoom && !showWorkingHours ? 'border-blue-500 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold`}
                    >
                      Analyses
                    </button>
                    <button 
                      onClick={() => { setShowDoctorsPage(true); setShowAllPatientsPage(false); setShowAnalysesPage(false); setShowWaitingRoom(false); setShowWorkingHours(false); }}
                      className={`${showDoctorsPage && !showAllPatientsPage && !showAnalysesPage && !showWaitingRoom && !showWorkingHours ? 'border-blue-500 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold`}
                    >
                      Médecins
                    </button>
                    <button 
                      onClick={() => { setShowWorkingHours(true); setShowAllPatientsPage(false); setShowAnalysesPage(false); setShowDoctorsPage(false); setShowWaitingRoom(false); }}
                      className={`${showWorkingHours && !showAllPatientsPage && !showAnalysesPage && !showDoctorsPage && !showWaitingRoom ? 'border-blue-500 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold`}
                    >
                      Horaires
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
                  onClick={(e) => { e.preventDefault(); setPatientView('overview'); setShowPatientInfo(false); setMobileMenuOpen(false); }}
                  className={`block w-full text-left px-4 py-2 ${patientView === 'overview' && !showPatientInfo ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-600'} rounded-lg`}
                >
                  Tableau de bord
                </button>
                <button 
                  onClick={(e) => { e.preventDefault(); setPatientView('doctors'); setShowPatientInfo(false); setMobileMenuOpen(false); }}
                  className={`block w-full text-left px-4 py-2 ${patientView === 'doctors' && !showPatientInfo ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-600'} rounded-lg`}
                >
                  Médecins
                </button>
                <button 
                  onClick={(e) => { e.preventDefault(); setPatientView('history'); setShowPatientInfo(false); setMobileMenuOpen(false); }}
                  className={`block w-full text-left px-4 py-2 ${patientView === 'history' && !showPatientInfo ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-600'} rounded-lg`}
                >
                  Historique
                </button>
                <button 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    setShowPatientInfo(true); 
                    setPatientInfoKey(prev => prev + 1); // Incrémenter pour forcer le remount
                    setMobileMenuOpen(false); 
                  }}
                  className={`block w-full text-left px-4 py-2 ${showPatientInfo ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-600'} rounded-lg`}
                >
                  Mes Informations
                </button>
              </>
                ) : (
                  <>
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); setShowAllPatientsPage(false); setShowAnalysesPage(false); setShowDoctorsPage(false); setShowWaitingRoom(false); setShowWorkingHours(false); }}
                      className={`block px-4 py-2 ${!showAllPatientsPage && !showAnalysesPage && !showDoctorsPage && !showWaitingRoom && !showWorkingHours ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-600'} rounded-lg`}
                    >
                      Planning
                    </a>
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); setShowWaitingRoom(true); setShowAllPatientsPage(false); setShowAnalysesPage(false); setShowDoctorsPage(false); setShowWorkingHours(false); }}
                      className={`block px-4 py-2 ${showWaitingRoom && !showAllPatientsPage && !showAnalysesPage && !showDoctorsPage && !showWorkingHours ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-600'} rounded-lg`}
                    >
                      Salle d'attente
                    </a>
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); setShowAllPatientsPage(true); setShowAnalysesPage(false); setShowDoctorsPage(false); setShowWaitingRoom(false); setShowWorkingHours(false); }}
                      className={`block px-4 py-2 ${showAllPatientsPage && !showAnalysesPage && !showDoctorsPage && !showWaitingRoom && !showWorkingHours ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-600'} rounded-lg`}
                    >
                      Patients
                    </a>
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); setShowAnalysesPage(true); setShowAllPatientsPage(false); setShowDoctorsPage(false); setShowWaitingRoom(false); setShowWorkingHours(false); }}
                      className={`block px-4 py-2 ${showAnalysesPage && !showAllPatientsPage && !showDoctorsPage && !showWaitingRoom && !showWorkingHours ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-600'} rounded-lg`}
                    >
                      Analyses
                    </a>
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); setShowDoctorsPage(true); setShowAllPatientsPage(false); setShowAnalysesPage(false); setShowWaitingRoom(false); setShowWorkingHours(false); }}
                      className={`block px-4 py-2 ${showDoctorsPage && !showAllPatientsPage && !showAnalysesPage && !showWaitingRoom && !showWorkingHours ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-600'} rounded-lg`}
                    >
                      Médecins
                    </a>
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); setShowWorkingHours(true); setShowAllPatientsPage(false); setShowAnalysesPage(false); setShowDoctorsPage(false); setShowWaitingRoom(false); }}
                      className={`block px-4 py-2 ${showWorkingHours && !showAllPatientsPage && !showAnalysesPage && !showDoctorsPage && !showWaitingRoom ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-600'} rounded-lg`}
                    >
                      Horaires
                    </a>
                  </>
                )}
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {role === 'patient' && showPatientInfo ? (
          <PatientInfoForm
            key={`patient-info-${currentPatientEmail}-${patientInfoKey}`}
            patientEmail={currentPatientEmail}
            patient={patients[currentPatientEmail]}
            onSave={async (updatedPatient) => {
              try {
                // La sauvegarde a déjà été faite dans PatientInfoForm, on recharge juste pour synchroniser
                // Recharger les patients depuis Supabase pour avoir les données les plus récentes
                const loadedPatients = await patientDB.getAll();
                // Mettre à jour l'état avec toutes les données rechargées
                setPatients(loadedPatients);
                
                // S'assurer que le patient mis à jour est dans l'état
                const emailLower = currentPatientEmail.toLowerCase();
                if (loadedPatients[emailLower]) {
                  // Mettre à jour le nom d'utilisateur avec les données rechargées
                  setUserName(`${loadedPatients[emailLower].firstName} ${loadedPatients[emailLower].name}`);
                } else {
                  // Si le patient n'est pas dans les données chargées, l'ajouter
                  setPatients(prev => ({
                    ...prev,
                    [emailLower]: updatedPatient
                  }));
                  setUserName(`${updatedPatient.firstName} ${updatedPatient.name}`);
                }
              } catch (error) {
                console.error('Erreur lors du rechargement des patients:', error);
                // En cas d'erreur, mettre à jour quand même l'état local
                const emailLower = currentPatientEmail.toLowerCase();
                setPatients(prev => ({
                  ...prev,
                  [emailLower]: updatedPatient
                }));
                setUserName(`${updatedPatient.firstName} ${updatedPatient.name}`);
              }
            }}
            onBack={() => {
              setShowPatientInfo(false);
              setPatientView('overview');
            }}
          />
        ) : role === 'patient' ? (
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
            onViewChange={(view) => {
              setPatientView(view);
              setShowPatientInfo(false);
            }}
            doctorSettings={doctorSettingsMap}
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
        ) : showWorkingHours ? (
          <WorkingHoursManagement
            doctors={doctors}
            onBack={async () => {
              setShowWorkingHours(false);
              // Recharger les horaires après modification
              const loadedWorkingHours = await workingHoursDB.getAll();
              setDoctorSettingsMap(loadedWorkingHours);
            }}
            onHoursSaved={async () => {
              // Recharger les horaires après chaque sauvegarde automatique
              try {
                console.log('[App] Rechargement des horaires après sauvegarde automatique');
                const loadedWorkingHours = await workingHoursDB.getAll();
                setDoctorSettingsMap(loadedWorkingHours);
                console.log('[App] Horaires rechargés:', Object.keys(loadedWorkingHours));
              } catch (error) {
                console.error('[App] Erreur lors du rechargement des horaires:', error);
              }
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
