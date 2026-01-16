
import React, { useState } from 'react';
import { FileText, Plus, Search, Filter, Download, Eye, Calendar, User, TrendingUp, AlertCircle, CheckCircle, Clock, X, Edit, Save } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MedicalAnalysis, AnalysisType, AnalysisStatus, PatientInfo } from '../types';

interface AnalysesInterfaceProps {
  patients: PatientInfo;
  onAddAnalysis?: (analysis: MedicalAnalysis) => void;
  analyses?: MedicalAnalysis[];
  onUpdateAnalyses?: (analyses: MedicalAnalysis[]) => void;
}

export const AnalysesInterface: React.FC<AnalysesInterfaceProps> = ({ 
  patients, 
  analyses: externalAnalyses = [],
  onUpdateAnalyses,
  onAddAnalysis
}) => {
  const [internalAnalyses, setInternalAnalyses] = useState<MedicalAnalysis[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<AnalysisType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<AnalysisStatus | 'all'>('all');
  const [selectedAnalysis, setSelectedAnalysis] = useState<MedicalAnalysis | null>(null);
  const [editingAnalysis, setEditingAnalysis] = useState<MedicalAnalysis | null>(null);

  const analyses = externalAnalyses.length > 0 ? externalAnalyses : internalAnalyses;
  const setAnalyses = onUpdateAnalyses || ((newAnalyses: MedicalAnalysis[]) => setInternalAnalyses(newAnalyses));

  const analysisTypes: { value: AnalysisType; label: string; icon: string }[] = [
    { value: 'blood', label: 'Sang', icon: '🩸' },
    { value: 'urine', label: 'Urine', icon: '💧' },
    { value: 'imaging', label: 'Imagerie', icon: '📷' },
    { value: 'cardiac', label: 'Cardiaque', icon: '❤️' },
    { value: 'other', label: 'Autre', icon: '📋' }
  ];

  const getStatusColor = (status: AnalysisStatus) => {
    switch (status) {
      case 'normal': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'abnormal': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusLabel = (status: AnalysisStatus) => {
    switch (status) {
      case 'normal': return 'Normal';
      case 'abnormal': return 'Anormal';
      case 'completed': return 'Terminé';
      case 'pending': return 'En attente';
      default: return status;
    }
  };

  const filteredAnalyses = analyses.filter(analysis => {
    const matchesSearch = !searchQuery || 
      analysis.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      analysis.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || analysis.type === filterType;
    const matchesStatus = filterStatus === 'all' || analysis.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Statistiques
  const stats = {
    total: analyses.length,
    pending: analyses.filter(a => a.status === 'pending').length,
    abnormal: analyses.filter(a => a.status === 'abnormal').length,
    normal: analyses.filter(a => a.status === 'normal').length
  };

  // Données pour graphiques
  const getAnalysisByTypeData = () => {
    const data = analysisTypes.map(type => ({
      name: type.label,
      count: analyses.filter(a => a.type === type.value).length
    }));
    return data;
  };

  const getAnalysisByMonthData = () => {
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const currentMonth = new Date().getMonth();
    const data = [];
    
    for (let i = 5; i >= 0; i--) {
      const month = (currentMonth - i + 12) % 12;
      const monthName = monthNames[month];
      const count = analyses.filter(a => {
        const analysisDate = new Date(a.date);
        return analysisDate.getMonth() === month;
      }).length;
      data.push({ name: monthName, count });
    }
    
    return data;
  };

  const handleAddAnalysis = (newAnalysis: MedicalAnalysis) => {
    if (onAddAnalysis) {
      onAddAnalysis(newAnalysis);
    } else {
      setAnalyses([...analyses, newAnalysis]);
    }
    setShowAddModal(false);
  };

  const handleUpdateAnalysis = (updatedAnalysis: MedicalAnalysis) => {
    setAnalyses(analyses.map(a => a.id === updatedAnalysis.id ? updatedAnalysis : a));
    setEditingAnalysis(null);
  };

  const handleDeleteAnalysis = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette analyse ?')) {
      setAnalyses(analyses.filter(a => a.id !== id));
      setSelectedAnalysis(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Analyses médicales</h2>
          <p className="text-slate-500 mt-1">Gérez les analyses de vos patients</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Nouvelle analyse
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total analyses', value: stats.total, icon: FileText, color: 'text-blue-600', bg: 'bg-white' },
          { label: 'En attente', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-white' },
          { label: 'Anormales', value: stats.abnormal, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-white' },
          { label: 'Normales', value: stats.normal, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-white' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div className="flex-1">
              <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par patient ou nom d'analyse..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as AnalysisType | 'all')}
              className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900"
            >
              <option value="all">Tous les types</option>
              {analysisTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as AnalysisStatus | 'all')}
              className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="completed">Terminé</option>
              <option value="normal">Normal</option>
              <option value="abnormal">Anormal</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Analyses List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredAnalyses.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-xl font-medium text-slate-600">Aucune analyse trouvée</p>
              <p className="text-slate-500 mt-2">
                {searchQuery || filterType !== 'all' || filterStatus !== 'all' 
                  ? 'Essayez de modifier vos filtres' 
                  : 'Ajoutez une nouvelle analyse pour commencer'}
              </p>
            </div>
          ) : (
            filteredAnalyses.map(analysis => {
              const patient = patients[analysis.patientEmail.toLowerCase()];
              const typeInfo = analysisTypes.find(t => t.value === analysis.type);
              
              return (
                <div
                  key={analysis.id}
                  onClick={() => setSelectedAnalysis(analysis)}
                  className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-2xl">
                        {typeInfo?.icon || '📋'}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{analysis.name}</h3>
                        <p className="text-sm text-slate-500">
                          {patient ? `${patient.firstName} ${patient.name}` : analysis.patientName}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(analysis.status)}`}>
                      {getStatusLabel(analysis.status)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-slate-600 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{analysis.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>{typeInfo?.label || analysis.type}</span>
                    </div>
                    {analysis.laboratory && (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Labo:</span>
                        <span>{analysis.laboratory}</span>
                      </div>
                    )}
                  </div>
                  
                  {analysis.results && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-sm text-slate-600 line-clamp-2">{analysis.results}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Charts */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="text-xl font-bold mb-6">Analyses par type</h3>
            {analyses.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getAnalysisByTypeData()}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{fill: '#94a3b8', fontSize: 12}} />
                    <YAxis tick={{fill: '#94a3b8', fontSize: 12}} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                      }}
                    />
                    <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400">
                <p>Aucune donnée</p>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="text-xl font-bold mb-6">Évolution mensuelle</h3>
            {analyses.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getAnalysisByMonthData()}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{fill: '#94a3b8', fontSize: 12}} />
                    <YAxis tick={{fill: '#94a3b8', fontSize: 12}} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                      }}
                    />
                    <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} dot={{ fill: '#2563eb', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400">
                <p>Aucune donnée</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Analysis Modal */}
      {showAddModal && (
        <AddAnalysisModal
          patients={patients}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddAnalysis}
          analysisTypes={analysisTypes}
        />
      )}

      {/* Analysis Detail Modal */}
      {selectedAnalysis && (
        <AnalysisDetailModal
          analysis={selectedAnalysis}
          patients={patients}
          onClose={() => setSelectedAnalysis(null)}
          onEdit={() => {
            setEditingAnalysis(selectedAnalysis);
            setSelectedAnalysis(null);
          }}
          onDelete={() => handleDeleteAnalysis(selectedAnalysis.id)}
          onUpdate={handleUpdateAnalysis}
          analysisTypes={analysisTypes}
        />
      )}

      {/* Edit Analysis Modal */}
      {editingAnalysis && (
        <EditAnalysisModal
          analysis={editingAnalysis}
          patients={patients}
          onClose={() => setEditingAnalysis(null)}
          onSave={handleUpdateAnalysis}
          analysisTypes={analysisTypes}
        />
      )}
    </div>
  );
};

// Add Analysis Modal
const AddAnalysisModal: React.FC<{
  patients: PatientInfo;
  onClose: () => void;
  onAdd: (analysis: MedicalAnalysis) => void;
  analysisTypes: { value: AnalysisType; label: string; icon: string }[];
}> = ({ patients, onClose, onAdd, analysisTypes }) => {
  const [selectedPatientEmail, setSelectedPatientEmail] = useState('');
  const [analysisType, setAnalysisType] = useState<AnalysisType>('blood');
  const [analysisName, setAnalysisName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [laboratory, setLaboratory] = useState('');
  const [status, setStatus] = useState<AnalysisStatus>('pending');
  const [results, setResults] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [showValuesForm, setShowValuesForm] = useState(false);
  const [values, setValues] = useState<{ [key: string]: { value: string; unit: string; normal: boolean } }>({});
  const [newValueKey, setNewValueKey] = useState('');
  const [newValueValue, setNewValueValue] = useState('');
  const [newValueUnit, setNewValueUnit] = useState('');
  const [newValueNormal, setNewValueNormal] = useState(true);

  const handleSubmit = () => {
    if (!selectedPatientEmail || !analysisName) return;

    const patient = patients[selectedPatientEmail.toLowerCase()];
    if (!patient) return;

    const newAnalysis: MedicalAnalysis = {
      id: Math.random().toString(36).substr(2, 9),
      patientEmail: patient.email,
      patientName: `${patient.firstName} ${patient.name}`,
      type: analysisType,
      name: analysisName,
      date: new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
      status,
      laboratory: laboratory || undefined,
      orderedBy: 'Docteur Mehdi',
      results: results || undefined,
      doctorNotes: doctorNotes || undefined,
      values: Object.keys(values).length > 0 ? values : undefined
    };

    onAdd(newAnalysis);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Nouvelle analyse</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Patient</label>
            <select
              value={selectedPatientEmail}
              onChange={(e) => setSelectedPatientEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900"
            >
              <option value="">Sélectionner un patient</option>
              {Object.values(patients).map(patient => (
                <option key={patient.id} value={patient.email}>
                  {patient.firstName} {patient.name} - {patient.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Type d'analyse</label>
            <div className="grid grid-cols-3 gap-3">
              {analysisTypes.map(type => (
                <button
                  key={type.value}
                  onClick={() => setAnalysisType(type.value)}
                  className={`p-4 rounded-xl border-2 text-center ${
                    analysisType === type.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{type.icon}</div>
                  <div className="text-sm font-medium">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Nom de l'analyse</label>
            <input
              type="text"
              value={analysisName}
              onChange={(e) => setAnalysisName(e.target.value)}
              placeholder="Ex: Numération formule sanguine, Glycémie..."
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Statut</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AnalysisStatus)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900"
              >
                <option value="pending">En attente</option>
                <option value="completed">Terminé</option>
                <option value="normal">Normal</option>
                <option value="abnormal">Anormal</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Laboratoire (optionnel)</label>
            <input
              type="text"
              value={laboratory}
              onChange={(e) => setLaboratory(e.target.value)}
              placeholder="Nom du laboratoire"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900"
            />
          </div>

          {/* Résultats textuels */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Résultats (optionnel)</label>
            <textarea
              value={results}
              onChange={(e) => setResults(e.target.value)}
              rows={4}
              placeholder="Entrez les résultats de l'analyse..."
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900"
            />
          </div>

          {/* Valeurs numériques */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-slate-700">Valeurs mesurées (optionnel)</label>
              <button
                type="button"
                onClick={() => setShowValuesForm(!showValuesForm)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {showValuesForm ? 'Masquer' : 'Ajouter des valeurs'}
              </button>
            </div>
            
            {showValuesForm && (
              <div className="space-y-4 p-4 bg-white rounded-xl border border-slate-200">
                {/* Formulaire pour ajouter une valeur */}
                <div className="grid grid-cols-12 gap-2">
                  <input
                    type="text"
                    value={newValueKey}
                    onChange={(e) => setNewValueKey(e.target.value)}
                    placeholder="Nom (ex: Hémoglobine)"
                    className="col-span-4 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900"
                  />
                  <input
                    type="text"
                    value={newValueValue}
                    onChange={(e) => setNewValueValue(e.target.value)}
                    placeholder="Valeur (ex: 14.5)"
                    className="col-span-3 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900"
                  />
                  <input
                    type="text"
                    value={newValueUnit}
                    onChange={(e) => setNewValueUnit(e.target.value)}
                    placeholder="Unité (ex: g/dL)"
                    className="col-span-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900"
                  />
                  <label className="col-span-2 flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={newValueNormal}
                      onChange={(e) => setNewValueNormal(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span>Normal</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (newValueKey && newValueValue) {
                        setValues({
                          ...values,
                          [newValueKey]: {
                            value: newValueValue,
                            unit: newValueUnit,
                            normal: newValueNormal
                          }
                        });
                        setNewValueKey('');
                        setNewValueValue('');
                        setNewValueUnit('');
                        setNewValueNormal(true);
                      }
                    }}
                    className="col-span-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                  >
                    +
                  </button>
                </div>

                {/* Liste des valeurs ajoutées */}
                {Object.keys(values).length > 0 && (
                  <div className="space-y-2 mt-4">
                    {Object.entries(values).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-2 bg-white rounded-lg">
                        <span className="text-sm font-medium">{key}: {value.value} {value.unit}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded ${value.normal ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            {value.normal ? 'Normal' : 'Anormal'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const newValues = { ...values };
                              delete newValues[key];
                              setValues(newValues);
                            }}
                            className="text-rose-600 hover:text-rose-700 text-sm"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notes du médecin */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Notes du médecin (optionnel)</label>
            <textarea
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              rows={3}
              placeholder="Ajoutez vos notes ou recommandations..."
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 text-slate-900"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedPatientEmail || !analysisName}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              Créer l'analyse
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Analysis Detail Modal
const AnalysisDetailModal: React.FC<{
  analysis: MedicalAnalysis;
  patients: PatientInfo;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpdate: (analysis: MedicalAnalysis) => void;
  analysisTypes: { value: AnalysisType; label: string; icon: string }[];
}> = ({ analysis, patients, onClose, onEdit, onDelete, onUpdate, analysisTypes }) => {
  const patient = patients[analysis.patientEmail.toLowerCase()];
  const typeInfo = analysisTypes.find(t => t.value === analysis.type);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Détails de l'analyse</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {patient && (
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-black">
                  {patient.firstName[0]}{patient.name[0] || patient.firstName[1] || ''}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{patient.firstName} {patient.name}</h3>
                  <p className="text-sm text-slate-600">{patient.email}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
              <span className="font-medium">Type</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{typeInfo?.icon}</span>
                <span>{typeInfo?.label || analysis.type}</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
              <span className="font-medium">Nom</span>
              <span>{analysis.name}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
              <span className="font-medium">Date</span>
              <span>{analysis.date}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
              <span className="font-medium">Statut</span>
              <span className={`px-3 py-1 rounded-full text-sm font-bold border ${
                analysis.status === 'normal' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                analysis.status === 'abnormal' ? 'bg-rose-100 text-rose-700 border-rose-200' :
                analysis.status === 'completed' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                'bg-amber-100 text-amber-700 border-amber-200'
              }`}>
                {analysis.status === 'normal' ? 'Normal' : analysis.status === 'abnormal' ? 'Anormal' : analysis.status === 'completed' ? 'Terminé' : 'En attente'}
              </span>
            </div>
            {analysis.laboratory && (
              <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
                <span className="font-medium">Laboratoire</span>
                <span>{analysis.laboratory}</span>
              </div>
            )}
          </div>

          {analysis.results && (
            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <h4 className="font-bold mb-2">Résultats</h4>
              <p className="text-slate-700 whitespace-pre-wrap">{analysis.results}</p>
            </div>
          )}

          {analysis.values && Object.keys(analysis.values).length > 0 && (
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <h4 className="font-bold mb-4">Valeurs</h4>
              <div className="space-y-2">
                {Object.entries(analysis.values).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span className="font-medium">{key}</span>
                    <div className="flex items-center gap-3">
                      <span className={value.normal ? 'text-emerald-600' : 'text-rose-600'}>
                        {value.value} {value.unit}
                      </span>
                      {value.normal ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-rose-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.doctorNotes && (
            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <h4 className="font-bold mb-2">Notes du médecin</h4>
              <p className="text-slate-700 whitespace-pre-wrap">{analysis.doctorNotes}</p>
            </div>
          )}

          <div className="flex gap-4 pt-4 border-t border-slate-200">
            <button
              onClick={onEdit}
              className="flex-1 px-6 py-3 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Modifier
            </button>
            <button
              onClick={onDelete}
              className="px-6 py-3 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Edit Analysis Modal
const EditAnalysisModal: React.FC<{
  analysis: MedicalAnalysis;
  patients: PatientInfo;
  onClose: () => void;
  onSave: (analysis: MedicalAnalysis) => void;
  analysisTypes: { value: AnalysisType; label: string; icon: string }[];
}> = ({ analysis, patients, onClose, onSave, analysisTypes }) => {
  const [status, setStatus] = useState<AnalysisStatus>(analysis.status);
  const [results, setResults] = useState(analysis.results || '');
  const [doctorNotes, setDoctorNotes] = useState(analysis.doctorNotes || '');

  const handleSave = () => {
    onSave({
      ...analysis,
      status,
      results: results || undefined,
      doctorNotes: doctorNotes || undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Modifier l'analyse</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Statut</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AnalysisStatus)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900"
            >
              <option value="pending">En attente</option>
              <option value="completed">Terminé</option>
              <option value="normal">Normal</option>
              <option value="abnormal">Anormal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Résultats</label>
            <textarea
              value={results}
              onChange={(e) => setResults(e.target.value)}
              rows={6}
              placeholder="Entrez les résultats de l'analyse..."
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Notes du médecin</label>
            <textarea
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              rows={4}
              placeholder="Ajoutez vos notes..."
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 text-slate-900"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
