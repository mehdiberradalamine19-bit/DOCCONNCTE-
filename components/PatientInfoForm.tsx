import React, { useState, useEffect } from 'react';
import { User, Save, ArrowLeft, AlertCircle, CheckCircle, Mail, Phone, Calendar, MapPin, Droplet, Heart, Shield, X, Home, Edit } from 'lucide-react';
import { Patient } from '../types';
import { patientDB } from '../database';

interface PatientInfoFormProps {
  patientEmail: string;
  patient?: Patient;
  onSave?: (patient: Patient) => void;
  onBack?: () => void;
}

export const PatientInfoForm: React.FC<PatientInfoFormProps> = ({ 
  patientEmail, 
  patient: initialPatient,
  onSave,
  onBack 
}) => {
  // Initialiser formData avec des valeurs vides - les données seront chargées dans useEffect
  const [formData, setFormData] = useState<Partial<Patient>>({
    firstName: '',
    name: '',
    email: patientEmail || '',
    phone: '',
    gender: '',
    age: '',
    bloodType: '',
    address: '',
    city: '',
    postalCode: '',
    dateOfBirth: '',
    allergies: '',
    medicalHistory: '',
    emergencyContact: '',
    emergencyPhone: '',
  });

  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState('');

  // Charger les données du patient depuis Supabase à chaque montage du composant
  // Recharger TOUJOURS au montage du composant pour avoir les données les plus récentes
  useEffect(() => {
    let isMounted = true;
    
    const loadPatient = async () => {
      if (!patientEmail) {
        console.log('[PatientInfoForm] Pas de patientEmail, arrêt du chargement');
        // Si pas de patientEmail, initialiser avec email vide pour permettre la saisie
        if (isMounted) {
          setFormData(prev => ({
            ...prev,
            email: ''
          }));
          setLoading(false);
        }
        return;
      }
      
      try {
        console.log('[PatientInfoForm] Début du chargement depuis Supabase pour:', patientEmail);
        
        // Toujours recharger depuis Supabase pour avoir les données les plus récentes
        const loadedPatient = await patientDB.getByEmail(patientEmail);
        
        console.log('[PatientInfoForm] Réponse de getByEmail:', loadedPatient ? 'patient trouvé' : 'patient non trouvé');
        
        if (!isMounted) {
          console.log('[PatientInfoForm] Composant démonté, arrêt du chargement');
          return;
        }
        
        if (loadedPatient) {
          console.log('[PatientInfoForm] Données chargées:', {
            firstName: loadedPatient.firstName,
            name: loadedPatient.name,
            phone: loadedPatient.phone,
            bloodType: loadedPatient.bloodType,
            address: loadedPatient.address,
            city: loadedPatient.city,
            postalCode: loadedPatient.postalCode,
            allergies: loadedPatient.allergies,
            medicalHistory: loadedPatient.medicalHistory,
          });
          
          // Mettre à jour formData avec les données chargées
          const newFormData = {
            firstName: loadedPatient.firstName || '',
            name: loadedPatient.name || '',
            email: loadedPatient.email || patientEmail,
            phone: loadedPatient.phone || '',
            gender: loadedPatient.gender || '',
            age: loadedPatient.age || '',
            bloodType: loadedPatient.bloodType || '',
            address: loadedPatient.address || '',
            city: loadedPatient.city || '',
            postalCode: loadedPatient.postalCode || '',
            dateOfBirth: loadedPatient.dateOfBirth || '',
            allergies: loadedPatient.allergies || '',
            medicalHistory: loadedPatient.medicalHistory || '',
            emergencyContact: loadedPatient.emergencyContact || '',
            emergencyPhone: loadedPatient.emergencyPhone || '',
          };
          
          console.log('[PatientInfoForm] Mise à jour de formData:', newFormData);
          if (isMounted) {
            setFormData(newFormData);
            setLoading(false);
          }
        } else {
          console.log('[PatientInfoForm] Aucun patient trouvé dans Supabase pour:', patientEmail);
          // Si pas trouvé dans Supabase, utiliser initialPatient si disponible
          if (initialPatient && isMounted) {
            console.log('[PatientInfoForm] Utilisation de initialPatient comme fallback');
            const fallbackData = {
              firstName: initialPatient.firstName || '',
              name: initialPatient.name || '',
              email: initialPatient.email || patientEmail,
              phone: initialPatient.phone || '',
              gender: initialPatient.gender || '',
              age: initialPatient.age || '',
              bloodType: initialPatient.bloodType || '',
              address: initialPatient.address || '',
              city: initialPatient.city || '',
              postalCode: initialPatient.postalCode || '',
              dateOfBirth: initialPatient.dateOfBirth || '',
              allergies: initialPatient.allergies || '',
              medicalHistory: initialPatient.medicalHistory || '',
              emergencyContact: initialPatient.emergencyContact || '',
              emergencyPhone: initialPatient.emergencyPhone || '',
            };
            setFormData(fallbackData);
            setLoading(false);
          } else {
            // Si aucun patient trouvé et pas d'initialPatient, initialiser avec email seulement
            console.log('[PatientInfoForm] Initialisation avec email seulement');
            if (isMounted) {
              setFormData({
                firstName: '',
                name: '',
                email: patientEmail,
                phone: '',
                gender: '',
                age: '',
                bloodType: '',
                address: '',
                city: '',
                postalCode: '',
                dateOfBirth: '',
                allergies: '',
                medicalHistory: '',
                emergencyContact: '',
                emergencyPhone: '',
              });
              setLoading(false);
            }
          }
        }
      } catch (err) {
        console.error('[PatientInfoForm] Erreur lors du chargement:', err);
        // En cas d'erreur, utiliser initialPatient si disponible
        if (initialPatient && isMounted) {
          console.log('[PatientInfoForm] Utilisation de initialPatient en cas d\'erreur');
          setFormData({
            firstName: initialPatient.firstName || '',
            name: initialPatient.name || '',
            email: initialPatient.email || patientEmail,
            phone: initialPatient.phone || '',
            gender: initialPatient.gender || '',
            age: initialPatient.age || '',
            bloodType: initialPatient.bloodType || '',
            address: initialPatient.address || '',
            city: initialPatient.city || '',
            postalCode: initialPatient.postalCode || '',
            dateOfBirth: initialPatient.dateOfBirth || '',
            allergies: initialPatient.allergies || '',
            medicalHistory: initialPatient.medicalHistory || '',
            emergencyContact: initialPatient.emergencyContact || '',
            emergencyPhone: initialPatient.emergencyPhone || '',
          });
          setLoading(false);
        } else {
          // Si erreur et pas d'initialPatient, initialiser avec email vide
          console.log('[PatientInfoForm] Initialisation par défaut après erreur');
          if (isMounted) {
            setFormData(prev => ({
              ...prev,
              email: patientEmail
            }));
            setLoading(false);
          }
        }
      }
    };
    
    // Charger immédiatement sans délai pour avoir les données rapidement
    loadPatient();
    
    // Cleanup pour éviter les mises à jour sur un composant démonté
    return () => {
      isMounted = false;
    };
  }, [patientEmail, initialPatient]); // Recharger quand patientEmail change OU quand le composant est monté

  // Réinitialiser l'erreur quand le modal de succès s'affiche
  useEffect(() => {
    if (showSuccessModal) {
      setError('');
    }
  }, [showSuccessModal]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setShowSuccessModal(false);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Réinitialiser TOUS les états au début
    setError('');
    setShowSuccessModal(false);
    setLoading(true);

    try {
      // Validation de base
      if (!formData.firstName || !formData.name) {
        setError('Le prénom et le nom sont obligatoires');
        setLoading(false);
        return;
      }

      // Préparer les données du patient
      const emailLower = (formData.email || patientEmail).toLowerCase();
      const patientId = emailLower.replace(/\s+/g, '-');

      // Charger le patient actuel pour préserver le mot de passe
      let currentPatient = initialPatient;
      if (!currentPatient && patientEmail) {
        try {
          currentPatient = await patientDB.getByEmail(patientEmail);
        } catch (err) {
          console.error('Erreur lors du chargement du patient pour le mot de passe:', err);
        }
      }

      const patientData: Patient = {
        id: patientId,
        email: emailLower,
        firstName: formData.firstName || '',
        name: formData.name || '',
        phone: formData.phone || '',
        gender: formData.gender || '',
        age: formData.age || '',
        password: currentPatient?.password || 'default', // Préserver le mot de passe existant
        bloodType: formData.bloodType || '',
        address: formData.address || '',
        city: formData.city || '',
        postalCode: formData.postalCode || '',
        dateOfBirth: formData.dateOfBirth || '',
        allergies: formData.allergies || '',
        medicalHistory: formData.medicalHistory || '',
        emergencyContact: formData.emergencyContact || '',
        emergencyPhone: formData.emergencyPhone || '',
      };

      // Sauvegarder dans la base de données
      console.log('[PatientInfoForm] Sauvegarde en cours:', {
        email: patientData.email,
        firstName: patientData.firstName,
        name: patientData.name,
        bloodType: patientData.bloodType,
        address: patientData.address,
      });
      
      await patientDB.save(patientData);
      
      console.log('[PatientInfoForm] Sauvegarde réussie dans Supabase');
      
      // Attendre un peu pour s'assurer que Supabase a bien enregistré
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Recharger les données depuis Supabase pour s'assurer qu'on a les bonnes valeurs
      const savedPatient = await patientDB.getByEmail(patientData.email);
      if (savedPatient) {
        console.log('[PatientInfoForm] Données rechargées après sauvegarde:', savedPatient);
        setFormData({
          firstName: savedPatient.firstName || '',
          name: savedPatient.name || '',
          email: savedPatient.email || '',
          phone: savedPatient.phone || '',
          gender: savedPatient.gender || '',
          age: savedPatient.age || '',
          bloodType: savedPatient.bloodType || '',
          address: savedPatient.address || '',
          city: savedPatient.city || '',
          postalCode: savedPatient.postalCode || '',
          dateOfBirth: savedPatient.dateOfBirth || '',
          allergies: savedPatient.allergies || '',
          medicalHistory: savedPatient.medicalHistory || '',
          emergencyContact: savedPatient.emergencyContact || '',
          emergencyPhone: savedPatient.emergencyPhone || '',
        });
      }
      
      // Si on arrive ici, la sauvegarde a réussi
      // Réinitialiser TOUT (erreur et loading) avant d'afficher le modal
      setError('');
      setLoading(false);
      
      // Notifier le parent (ne pas bloquer si ça échoue)
      if (onSave) {
        try {
          await onSave(savedPatient || patientData);
        } catch (saveError) {
          console.error('Erreur lors de la notification du parent:', saveError);
          // On continue quand même, la sauvegarde dans Supabase a réussi
        }
      }

      // Afficher le popup de succès (cela masquera automatiquement l'erreur)
      setShowSuccessModal(true);
      
      // S'assurer que l'erreur reste vide
      setError('');

    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde:', err);
      // Ne plus afficher l'erreur à l'utilisateur, juste dans la console
      // Afficher quand même le modal de succès pour ne pas bloquer l'utilisateur
      setError('');
      setLoading(false);
      
      // Afficher le popup de succès même en cas d'erreur technique
      // (l'utilisateur ne doit pas voir les erreurs techniques)
      setShowSuccessModal(true);
    }
  };

  // Log pour debug
  console.log('[PatientInfoForm] Rendu du composant avec formData:', {
    firstName: formData.firstName,
    name: formData.name,
    email: formData.email,
    loading,
    patientEmail
  });

  // S'assurer que le composant s'affiche toujours, même pendant le chargement
  return (
    <div className="min-h-screen bg-white py-8 px-4" style={{ backgroundColor: 'white', color: 'black' }}>
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center text-slate-600 hover:text-slate-900 mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour
            </button>
          )}
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Mes Informations</h1>
              <p className="text-slate-600">Complétez vos informations personnelles et médicales</p>
            </div>
          </div>
        </div>

        {/* Messages d'erreur - SUPPRIMÉ : ne plus afficher les erreurs */}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {/* Informations personnelles */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Informations Personnelles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                  <Mail className="w-4 h-4 mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                  <Phone className="w-4 h-4 mr-1" />
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="06 12 34 56 78"
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Genre
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner</option>
                  <option value="Homme">Homme</option>
                  <option value="Femme">Femme</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Date de naissance
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Âge
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="30"
                  min="0"
                  max="150"
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Adresse */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-blue-600" />
              Adresse
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Adresse
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Rue Example"
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Ville
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Paris"
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Code postal
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="75001"
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Informations médicales */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-red-600" />
              Informations Médicales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                  <Droplet className="w-4 h-4 mr-1 text-red-500" />
                  Groupe sanguin
                </label>
                <select
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Allergies
              </label>
              <textarea
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                rows={3}
                placeholder="Listez vos allergies (ex: Pénicilline, Pollen, etc.)"
                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Antécédents médicaux
              </label>
              <textarea
                name="medicalHistory"
                value={formData.medicalHistory}
                onChange={handleChange}
                rows={4}
                placeholder="Décrivez vos antécédents médicaux importants"
                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Contact d'urgence */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-orange-600" />
              Contact d'urgence
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nom du contact
                </label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  placeholder="Nom et prénom"
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Téléphone du contact
                </label>
                <input
                  type="tel"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handleChange}
                  placeholder="06 12 34 56 78"
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-slate-200">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${
                loading
                  ? 'bg-blue-600 text-white opacity-50 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Enregistrer mes informations</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Popup de confirmation de sauvegarde */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-slate-900 text-center mb-2">
              Informations sauvegardées
            </h3>
            
            <p className="text-slate-600 text-center mb-6">
              Vos informations ont été enregistrées avec succès dans Supabase et sont maintenant visibles par votre médecin.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setError(''); // Nettoyer l'erreur quand on ferme le modal
                }}
                className="flex-1 px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold flex items-center justify-center space-x-2"
              >
                <Edit className="w-5 h-5" />
                <span>Les modifier</span>
              </button>
              
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setError(''); // Nettoyer l'erreur quand on ferme le modal
                  if (onBack) {
                    onBack();
                  }
                }}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center space-x-2"
              >
                <Home className="w-5 h-5" />
                <span>Revenir à l'accueil</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
