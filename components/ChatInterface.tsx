import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getPatient, savePatient } from '../services/patientService';
import type { Patient } from '../types';
import UserIcon from './icons/UserIcon';
import StethoscopeIcon from './icons/StethoscopeIcon';
import ClipboardTextIcon from './icons/ClipboardTextIcon';
import SparklesIcon from './icons/SparklesIcon';
import AnamnesisForm from './forms/AnamnesisForm';
import PhysicalExamTab from './forms/PhysicalExamTab';
import StudiesAndEvolutionTab from './forms/StudiesAndEvolutionTab';
import AIAnalysisTab from './forms/AIAnalysisTab';
import ClipboardDocumentListIcon from './icons/ClipboardDocumentListIcon';
import FunctionalEvaluationTab from './forms/FunctionalEvaluationTab';
import SynthesisTab from './forms/SynthesisTab';
import DocumentTextIcon from './icons/DocumentTextIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import ScalesAndDiagnosisTab from './forms/ScalesAndDiagnosisTab';

interface PatientFileProps {
  patientId: string;
  onBack: () => void;
}

const useDebounce = (callback: (...args: any[]) => void, delay: number) => {
    const timeoutRef = useRef<number | null>(null);
    return (...args: any[]) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = window.setTimeout(() => {
            callback(...args);
        }, delay);
    };
};

const PatientFile: React.FC<PatientFileProps> = ({ patientId, onBack }) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Anamnesis');

  const loadPatient = useCallback(async () => {
    setIsLoading(true);
    const patientData = await getPatient(patientId);
    setPatient(patientData || null);
    setIsLoading(false);
  }, [patientId]);

  useEffect(() => {
    loadPatient();
  }, [loadPatient]);

  const debouncedSave = useDebounce((updatedPatient: Patient) => {
      savePatient(updatedPatient);
  }, 1500);

  const handlePatientChange = useCallback((updatedPatient: Patient) => {
      setPatient(updatedPatient);
      debouncedSave(updatedPatient);
  }, [debouncedSave]);


  const renderTabContent = () => {
    if (!patient) return null;

    switch (activeTab) {
      case 'Anamnesis':
        return <AnamnesisForm patient={patient} onPatientChange={handlePatientChange} />;
      case 'Examen Físico':
        return <PhysicalExamTab patient={patient} onPatientChange={handlePatientChange} />;
      case 'Evaluación Funcional':
        return <FunctionalEvaluationTab patient={patient} onPatientChange={handlePatientChange} />;
      case 'Escalas y Diagnóstico':
        return <ScalesAndDiagnosisTab patient={patient} onPatientChange={handlePatientChange} />;
      case 'Análisis IA':
        return <AIAnalysisTab patient={patient} onPatientChange={handlePatientChange} />;
      case 'Estudios y Evolución':
        return <StudiesAndEvolutionTab patient={patient} onPatientChange={handlePatientChange} />;
      case 'Síntesis Semiológica':
        return <SynthesisTab patient={patient} />;
      default:
        return null;
    }
  };
  
  const patientName = patient ? `${patient.firstName} ${patient.lastName}`.trim() : 'un nuevo paciente';
  const subTitle = patient && (patient.firstName !== 'Nuevo' || patient.lastName !== 'Paciente') 
    ? `Editando la ficha de ${patientName}` 
    : 'Completando datos para un nuevo paciente.';

  if (isLoading) {
    return <div className="text-center p-10 text-slate-500">Cargando paciente...</div>;
  }

  return (
    <div className="flex flex-col h-full bg-slate-100 text-slate-800 p-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Ficha del Paciente: {patientName === 'Nuevo Paciente' ? '' : patientName}</h2>
          <p className="text-slate-600">{subTitle}</p>
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-0 overflow-hidden bg-white rounded-lg shadow-sm">
        <nav className="flex-shrink-0 border-b border-slate-200 flex items-center overflow-x-auto">
            <TabButton icon={<UserIcon />} label="Anamnesis" isActive={activeTab === 'Anamnesis'} onClick={() => setActiveTab('Anamnesis')} />
            <TabButton icon={<StethoscopeIcon />} label="Examen Físico" isActive={activeTab === 'Examen Físico'} onClick={() => setActiveTab('Examen Físico')} />
            <TabButton icon={<ClipboardDocumentListIcon />} label="Evaluación Funcional" isActive={activeTab === 'Evaluación Funcional'} onClick={() => setActiveTab('Evaluación Funcional')} />
            <TabButton icon={<ChartBarIcon />} label="Escalas y Diagnóstico" isActive={activeTab === 'Escalas y Diagnóstico'} onClick={() => setActiveTab('Escalas y Diagnóstico')} />
            <TabButton icon={<SparklesIcon />} label="Análisis IA" isActive={activeTab === 'Análisis IA'} onClick={() => setActiveTab('Análisis IA')} />
            <TabButton icon={<ClipboardTextIcon />} label="Estudios y Evolución" isActive={activeTab === 'Estudios y Evolución'} onClick={() => setActiveTab('Estudios y Evolución')} />
            <TabButton icon={<DocumentTextIcon />} label="Síntesis Semiológica" isActive={activeTab === 'Síntesis Semiológica'} onClick={() => setActiveTab('Síntesis Semiológica')} />
        </nav>
        <main className="flex-1 overflow-y-auto p-2">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
};

interface TabButtonProps {
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ icon, label, isActive, onClick }) => (
    <button 
      onClick={onClick} 
      className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-medium whitespace-nowrap transition-colors ${isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
      role="tab"
      aria-selected={isActive}
    >
        {icon}
        <span>{label}</span>
    </button>
);

export default PatientFile;