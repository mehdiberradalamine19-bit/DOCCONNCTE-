import React, { useState } from 'react';
import { User, Search, Plus, Edit, X, Phone, Mail, MapPin, Star, Calendar } from 'lucide-react';
import { Doctor } from '../types';

interface DoctorsPageProps {
  doctors: Doctor[];
  onAddDoctor?: (doctor: Doctor) => void;
  onUpdateDoctor?: (doctor: Doctor) => void;
  onDeleteDoctor?: (id: string) => void;
}

export const DoctorsPage: React.FC<DoctorsPageProps> = ({
  doctors,
  onAddDoctor,
  onUpdateDoctor,
  onDeleteDoctor,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = (doctorData: Partial<Doctor>) => {
    if (isEditing && selectedDoctor && onUpdateDoctor) {
      onUpdateDoctor({ ...selectedDoctor, ...doctorData } as Doctor);
    } else if (onAddDoctor) {
      const newDoctor: Doctor = {
        id: Math.random().toString(36).substr(2, 9),
        name: doctorData.name || '',
        specialty: doctorData.specialty || '',
        rating: doctorData.rating || 0,
        image: doctorData.image || '',
        availability: doctorData.availability || [],
      };
      onAddDoctor(newDoctor);
    }
    setShowAddModal(false);
    setSelectedDoctor(null);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Médecins</h2>
          <p className="text-slate-500 mt-1">Gérez les médecins de votre cabinet</p>
        </div>
        <button
          onClick={() => {
            setSelectedDoctor(null);
            setIsEditing(false);
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Ajouter un médecin
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher un médecin par nom ou spécialité..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900"
        />
      </div>

      {/* Doctors Grid */}
      {filteredDoctors.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
          <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-slate-700 mb-2">
            {searchQuery ? 'Aucun médecin trouvé' : 'Aucun médecin'}
          </h4>
          <p className="text-slate-500">
            {searchQuery 
              ? 'Essayez une autre recherche' 
              : 'Commencez par ajouter un médecin'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all hover:shadow-lg"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden">
                    {doctor.image ? (
                      <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{doctor.name}</h3>
                    <p className="text-slate-500 text-sm">{doctor.specialty}</p>
                    {doctor.rating > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium text-slate-700">{doctor.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedDoctor(doctor);
                      setIsEditing(true);
                      setShowAddModal(true);
                    }}
                    className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {onDeleteDoctor && (
                    <button
                      onClick={() => {
                        if (confirm(`Êtes-vous sûr de vouloir supprimer ${doctor.name} ?`)) {
                          onDeleteDoctor(doctor.id);
                        }
                      }}
                      className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                      title="Supprimer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Availability */}
              {doctor.availability && doctor.availability.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">Disponibilités</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {doctor.availability.slice(0, 4).map((time, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700"
                      >
                        {time}
                      </span>
                    ))}
                    {doctor.availability.length > 4 && (
                      <span className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
                        +{doctor.availability.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <DoctorModal
          doctor={selectedDoctor}
          isEditing={isEditing}
          onClose={() => {
            setShowAddModal(false);
            setSelectedDoctor(null);
            setIsEditing(false);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

// Modal pour ajouter/modifier un médecin
const DoctorModal: React.FC<{
  doctor: Doctor | null;
  isEditing: boolean;
  onClose: () => void;
  onSave: (doctor: Partial<Doctor>) => void;
}> = ({ doctor, isEditing, onClose, onSave }) => {
  const [name, setName] = useState(doctor?.name || '');
  const [specialty, setSpecialty] = useState(doctor?.specialty || '');
  const [rating, setRating] = useState(doctor?.rating?.toString() || '0');
  const [image, setImage] = useState(doctor?.image || '');
  const [availability, setAvailability] = useState<string[]>(doctor?.availability || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !specialty) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    onSave({
      name,
      specialty,
      rating: parseFloat(rating) || 0,
      image,
      availability,
    });
  };

  const addTimeSlot = () => {
    setAvailability([...availability, '09:00']);
  };

  const removeTimeSlot = (index: number) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  const updateTimeSlot = (index: number, value: string) => {
    const updated = [...availability];
    updated[index] = value;
    setAvailability(updated);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            {isEditing ? 'Modifier le médecin' : 'Ajouter un médecin'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Nom complet *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900"
              placeholder="Ex: Dr. Jean Dupont"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Spécialité *
            </label>
            <input
              type="text"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900"
              placeholder="Ex: Médecin Généraliste, Cardiologue, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Note (0-5)
              </label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                URL de l'image
              </label>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900"
                placeholder="https://..."
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-slate-900">
                Disponibilités
              </label>
              <button
                type="button"
                onClick={addTimeSlot}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                + Ajouter un créneau
              </button>
            </div>
            <div className="space-y-2">
              {availability.map((time, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => updateTimeSlot(index, e.target.value)}
                    className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => removeTimeSlot(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {availability.length === 0 && (
                <p className="text-sm text-slate-500">Aucun créneau défini</p>
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 text-slate-900"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
            >
              {isEditing ? 'Enregistrer' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
