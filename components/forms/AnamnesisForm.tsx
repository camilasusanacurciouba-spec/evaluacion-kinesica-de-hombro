

import React, { useState } from 'react';
import type { Patient, Medication, AssociatedDisease } from '../../types';
import { InputField, TextareaField, SelectField, CheckboxField } from './common/FormControls';
import ChevronDownIcon from '../icons/ChevronDownIcon';

interface AnamnesisFormProps {
    patient: Patient;
    onPatientChange: (patient: Patient) => void;
}

const AnamnesisForm: React.FC<AnamnesisFormProps> = ({ patient, onPatientChange }) => {
  const [openSections, setOpenSections] = useState<string[]>(['Datos Personales']);
  const [newDisease, setNewDisease] = useState('');

  const toggleSection = (sectionTitle: string) => {
    setOpenSections(prevOpenSections =>
      prevOpenSections.includes(sectionTitle)
        ? prevOpenSections.filter(title => title !== sectionTitle)
        : [...prevOpenSections, sectionTitle]
    );
  };

  const getAge = (birthDate: string) => {
    if (!birthDate) return '';
    try {
      const birthday = new Date(birthDate);
      const ageDifMs = Date.now() - birthday.getTime();
      const ageDate = new Date(ageDifMs);
      return Math.abs(ageDate.getUTCFullYear() - 1970).toString();
    } catch {
      return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onPatientChange({ ...patient, [name]: value });
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    onPatientChange({
        ...patient,
        riskFactors: { ...patient.riskFactors, [name]: checked }
    });
  };

  const handleRiskFactorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onPatientChange({
        ...patient,
        riskFactors: { ...patient.riskFactors, [name]: value }
    });
  };
  
  const handleAddAssociatedDisease = () => {
    if (newDisease.trim() === '') return;
    const newDiseaseEntry: AssociatedDisease = {
        id: Date.now().toString(),
        name: newDisease.trim()
    };
    onPatientChange({
        ...patient,
        riskFactors: {
            ...patient.riskFactors,
            associatedDiseases: [...(patient.riskFactors.associatedDiseases || []), newDiseaseEntry]
        }
    });
    setNewDisease('');
  };
  
  const handleRemoveAssociatedDisease = (id: string) => {
    onPatientChange({
        ...patient,
        riskFactors: {
            ...patient.riskFactors,
            associatedDiseases: patient.riskFactors.associatedDiseases.filter(d => d.id !== id)
        }
    });
  };


  const handleHabitChange = (
    habit: 'tobacco' | 'alcohol',
    field: string,
    value: string
  ) => {
    onPatientChange({
      ...patient,
      habits: {
        ...patient.habits,
        [habit]: {
          ...patient.habits[habit],
          [field]: value
        }
      }
    });
  };

  const handleMedicationChange = (id: string, field: keyof Omit<Medication, 'id'>, value: string) => {
    const updatedMedications = patient.medications.map(med => 
      med.id === id ? { ...med, [field]: value } : med
    );
    onPatientChange({ ...patient, medications: updatedMedications });
  };
  
  const handleAddMedication = () => {
    const newMedication: Medication = {
      id: Date.now().toString(),
      name: '',
      dose: '',
      frequency: ''
    };
    onPatientChange({ ...patient, medications: [...patient.medications, newMedication] });
  };

  const handleRemoveMedication = (id: string) => {
    const updatedMedications = patient.medications.filter(med => med.id !== id);
    onPatientChange({ ...patient, medications: updatedMedications });
  };


  const sections = [
    { 
      title: 'Datos Personales',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <InputField label="Apellido" name="lastName" value={patient.lastName} onChange={handleInputChange} />
            <InputField label="Nombres" name="firstName" value={patient.firstName} onChange={handleInputChange} />
            <InputField label="Fecha de Nacimiento" name="birthDate" type="date" value={patient.birthDate} onChange={handleInputChange} />
            <InputField label="Edad" name="age" value={getAge(patient.birthDate)} readOnly />
            <InputField label="Nacionalidad" name="nationality" value={patient.nationality} onChange={handleInputChange} />
            <InputField label="Estado Civil" name="civilStatus" value={patient.civilStatus} onChange={handleInputChange} />
            <InputField label="DNI/LC/LE/CI" name="idNumber" value={patient.idNumber} onChange={handleInputChange} />
            <InputField label="Obra Social" name="insurance" value={patient.insurance} onChange={handleInputChange} />
            <InputField label="Domicilio" name="address" value={patient.address} onChange={handleInputChange} />
            <InputField label="Localidad" name="location" value={patient.location} onChange={handleInputChange} />
            <InputField label="Partido" name="city" value={patient.city} onChange={handleInputChange} />
            <InputField label="Teléfono" name="phone" value={patient.phone} onChange={handleInputChange} />
        </div>
      )
    },
    {
      title: 'Anamnesis de la Lesión',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <InputField label="Diagnóstico Médico" name="medicalDiagnosis" value={patient.medicalDiagnosis} onChange={handleInputChange} />
          <InputField label="Médico Derivante" name="referringDoctor" value={patient.referringDoctor} onChange={handleInputChange} />
          <InputField label="Kinesiólogo" name="kinesiologist" value={patient.kinesiologist} onChange={handleInputChange} />
          <InputField label="Fecha de Lesión" name="injuryDate" type="date" value={patient.injuryDate} onChange={handleInputChange} />
          <InputField label="Causa" name="injuryCause" value={patient.injuryCause} onChange={handleInputChange} />
          <InputField label="Fecha 1ra Atención Médica" name="firstMedicalAttentionDate" type="date" value={patient.firstMedicalAttentionDate} onChange={handleInputChange} />
          <InputField label="Lugar 1ra Atención Médica" name="firstMedicalAttentionPlace" value={patient.firstMedicalAttentionPlace} onChange={handleInputChange} />
          <div className="lg:col-span-2">
            <TextareaField label="Mecanismo Lesional" name="lesionMechanism" value={patient.lesionMechanism} onChange={handleInputChange} />
          </div>
          <SelectField label="MMSS Dominante" name="dominantHand" value={patient.dominantHand} onChange={handleInputChange}>
              <option value="">Seleccionar...</option>
              <option value="derecho">Derecho</option>
              <option value="izquierdo">Izquierdo</option>
          </SelectField>
        </div>
      )
    },
    {
      title: 'Antecedentes de Caídas',
      content: (
          <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField 
                      label="Cantidad de caídas en los últimos 6 meses" 
                      name="fallsLast6Months" 
                      value={patient.riskFactors.fallsLast6Months} 
                      onChange={handleRiskFactorChange} 
                  />
                  <InputField 
                      label='Test "Get Up and Go" (TUG) - Resultado en segundos' 
                      name="tugTestSeconds" 
                      value={patient.riskFactors.tugTestSeconds} 
                      onChange={handleRiskFactorChange} 
                  />
              </div>
              <div className="mt-6">
                  <TextareaField 
                      label="¿Dónde ocurrió la caída?" 
                      name="fallLocation" 
                      value={patient.riskFactors.fallLocation} 
                      onChange={handleRiskFactorChange} 
                      rows={3}
                  />
              </div>
              <div className="mt-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Alteraciones observadas</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <CheckboxField 
                          label="Alteraciones posturales" 
                          name="posturalAlterations" 
                          checked={patient.riskFactors.posturalAlterations} 
                          onChange={handleCheckboxChange} 
                      />
                      <CheckboxField 
                          label="Alteración de la marcha" 
                          name="gaitAlteration" 
                          checked={patient.riskFactors.gaitAlteration} 
                          onChange={handleCheckboxChange} 
                      />
                      <CheckboxField 
                          label="Debilidad muscular asociada" 
                          name="associatedMuscleWeakness" 
                          checked={patient.riskFactors.associatedMuscleWeakness} 
                          onChange={handleCheckboxChange} 
                      />
                      <CheckboxField 
                          label="Disminución de los reflejos" 
                          name="decreasedReflexes" 
                          checked={patient.riskFactors.decreasedReflexes} 
                          onChange={handleCheckboxChange} 
                      />
                      <CheckboxField 
                          label="Alteraciones visuales" 
                          name="visualAlterations" 
                          checked={patient.riskFactors.visualAlterations} 
                          onChange={handleCheckboxChange} 
                      />
                  </div>
              </div>
          </>
      )
    },
    {
        title: 'Ocupación',
        content: (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Ocupación" name="occupation" value={patient.occupation} onChange={handleInputChange} />
                <InputField label="Horas de trabajo" name="workHours" value={patient.workHours} onChange={handleInputChange} />
                <div className="md:col-span-2">
                    <TextareaField label="Análisis Ocupacional (información sobre la postura, utilización de herramientas, gestos repetitivos)" name="occupationAnalysis" value={patient.occupationAnalysis} onChange={handleInputChange} rows={4} />
                </div>
            </div>
        )
    },
    {
        title: 'Hobbys y Deporte',
        content: (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Hobby / Deporte" name="hobbies" value={patient.hobbies} onChange={handleInputChange} />
                <InputField label="Frecuencia Semanal" name="hobbyFrequency" value={patient.hobbyFrequency} onChange={handleInputChange} />
            </div>
        )
    },
    {
      title: 'Antecedentes y Tratamientos Previos',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="RX/TAC/RMN/QX?" name="studies" value={patient.studies} onChange={handleInputChange} />
          <InputField label="Días de Internación" name="internationDays" value={patient.internationDays} onChange={handleInputChange} />
          <div className="md:col-span-2">
              <TextareaField label="Osteosíntesis y Movilizaciones Realizadas (Tipo, desde/hasta. Agregar un '+' en caso de haber más de una)" name="osteosynthesisAndImmobilization" value={patient.osteosynthesisAndImmobilization} onChange={handleInputChange} />
          </div>
          <div className="md:col-span-2">
            <TextareaField label="Antecedentes Clínico-Quirúrgicos" name="surgicalHistory" value={patient.surgicalHistory} onChange={handleInputChange} />
          </div>
        </div>
      )
    },
    {
      title: 'Medicación',
      content: (
        <div className="space-y-4">
          {(patient.medications || []).map((med, index) => (
             <div key={med.id} className="grid grid-cols-1 md:grid-cols-10 gap-4 items-end p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="md:col-span-4"><InputField label={`Medicamento ${index + 1}`} name="name" value={med.name} onChange={e => handleMedicationChange(med.id, 'name', e.target.value)} placeholder="Nombre del medicamento" /></div>
                <div className="md:col-span-2"><InputField label="Dosis" name="dose" value={med.dose} onChange={e => handleMedicationChange(med.id, 'dose', e.target.value)} placeholder="Ej: 500mg" /></div>
                <div className="md:col-span-3"><InputField label="Frecuencia" name="frequency" value={med.frequency} onChange={e => handleMedicationChange(med.id, 'frequency', e.target.value)} placeholder="Ej: cada 8hs" /></div>
                <div className="md:col-span-1 flex justify-end">
                    <button type="button" onClick={() => handleRemoveMedication(med.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors" aria-label="Eliminar medicamento">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            </div>
          ))}
          <button type="button" onClick={handleAddMedication} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Agregar Medicamento
          </button>
        </div>
      )
    },
    {
      title: 'Hábitos',
      content: (
          <div className="space-y-6">
              <div>
                  <h4 className="font-medium text-slate-700 mb-2">Consumo de Tabaco</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField label="Cantidad" name="tobacco_quantity" value={patient.habits?.tobacco?.quantity || ''} onChange={(e) => handleHabitChange('tobacco', 'quantity', e.target.value)} placeholder="Ej: 10 cigarrillos/día" />
                      <InputField label="Frecuencia" name="tobacco_frequency" value={patient.habits?.tobacco?.frequency || ''} onChange={(e) => handleHabitChange('tobacco', 'frequency', e.target.value)} placeholder="Ej: Diario" />
                  </div>
              </div>
              <div className="pt-6 border-t border-slate-200">
                  <h4 className="font-medium text-slate-700 mb-2">Consumo de Alcohol</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <InputField label="Tipo" name="alcohol_type" value={patient.habits?.alcohol?.type || ''} onChange={(e) => handleHabitChange('alcohol', 'type', e.target.value)} placeholder="Ej: Cerveza, vino" />
                      <InputField label="Cantidad" name="alcohol_quantity" value={patient.habits?.alcohol?.quantity || ''} onChange={(e) => handleHabitChange('alcohol', 'quantity', e.target.value)} placeholder="Ej: 1 litro" />
                      <InputField label="Frecuencia" name="alcohol_frequency" value={patient.habits?.alcohol?.frequency || ''} onChange={(e) => handleHabitChange('alcohol', 'frequency', e.target.value)} placeholder="Ej: Fines de semana" />
                  </div>
              </div>
          </div>
      )
    },
    {
      title: 'Factores de Riesgo y Comorbilidades',
      content: (
        <>
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-600 mb-2">Enfermedades Asociadas (Neurológicas, Vasculares, Metabólicas, Tumorales)</label>
            <div className="space-y-2">
                {(patient.riskFactors.associatedDiseases || []).map(disease => (
                    <div key={disease.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                        <span className="flex-1 text-slate-800">{disease.name}</span>
                        <button type="button" onClick={() => handleRemoveAssociatedDisease(disease.id)} className="p-1 text-red-500 hover:bg-red-100 rounded-full">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
                <InputField 
                    label="" 
                    name="newDisease" 
                    value={newDisease} 
                    onChange={e => setNewDisease(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddAssociatedDisease())}
                    placeholder="Añadir enfermedad..."
                />
                 <button type="button" onClick={handleAddAssociatedDisease} className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4 pt-6 border-t border-slate-200">
            <CheckboxField label="Menopausia" name="menopause" checked={patient.riskFactors.menopause} onChange={handleCheckboxChange} />
            <CheckboxField label="Osteopenia/porosis" name="osteopenia" checked={patient.riskFactors.osteopenia} onChange={handleCheckboxChange} />
            <CheckboxField label="DMO" name="dmo" checked={patient.riskFactors.dmo} onChange={handleCheckboxChange} />
            <CheckboxField label="Caídas Frecuentes" name="frequentFalls" checked={patient.riskFactors.frequentFalls} onChange={handleCheckboxChange} />
            <CheckboxField label="Barbitúricos" name="barbiturates" checked={patient.riskFactors.barbiturates} onChange={handleCheckboxChange} />
            <CheckboxField label="Neoplasias" name="neoplasms" checked={patient.riskFactors.neoplasms} onChange={handleCheckboxChange} />
            {/* FIX: Corrected typo 'infecciones' to 'infections' to match the Patient type definition. */}
            <CheckboxField label="Infecciones" name="infections" checked={patient.riskFactors.infections} onChange={handleCheckboxChange} />
            <CheckboxField label="Enf. del SNC/Periféricas" name="sncDisease" checked={patient.riskFactors.sncDisease} onChange={handleCheckboxChange} />
            <CheckboxField label="Alt/Qx Vascular" name="vascularDisease" checked={patient.riskFactors.vascularDisease} onChange={handleCheckboxChange} />
            <CheckboxField label="Diabetes" name="diabetes" checked={patient.riskFactors.diabetes} onChange={handleCheckboxChange} />
            <CheckboxField label="DSR" name="dsr" checked={patient.riskFactors.dsr} onChange={handleCheckboxChange} />
            <CheckboxField label="Hipotiroidismo" name="hypothyroidism" checked={patient.riskFactors.hypothyroidism} onChange={handleCheckboxChange} />
            <CheckboxField label="Hipertiroidismo" name="hyperthyroidism" checked={patient.riskFactors.hyperthyroidism} onChange={handleCheckboxChange} />
            <CheckboxField label="Hiperlipidemia" name="hyperlipidemia" checked={patient.riskFactors.hyperlipidemia} onChange={handleCheckboxChange} />
            <CheckboxField label="Dupuytren" name="dupuytren" checked={patient.riskFactors.dupuytren} onChange={handleCheckboxChange} />
            <CheckboxField label="Manos Transpiran" name="sweatyHands" checked={patient.riskFactors.sweatyHands} onChange={handleCheckboxChange} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <InputField label="Última DMO (fecha)" name="lastDmo" type="date" value={patient.riskFactors.lastDmo} onChange={handleRiskFactorChange} />
          </div>
        </>
      )
    },
  ];

  return (
    <div className="p-6 space-y-4">
      {sections.map(({ title, content }) => {
        const isOpen = openSections.includes(title);
        return (
          <div key={title} className="border border-slate-200 rounded-lg overflow-hidden transition-all duration-300">
            <button
              type="button"
              onClick={() => toggleSection(title)}
              className="w-full flex justify-between items-center p-4 text-left text-lg font-semibold text-slate-800 bg-slate-50 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-expanded={isOpen}
              aria-controls={`section-content-${title.replace(/\s+/g, '-')}`}
            >
              <span>{title}</span>
              <ChevronDownIcon className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div
              id={`section-content-${title.replace(/\s+/g, '-')}`}
              className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
              <div className="overflow-hidden">
                <div className="p-6 bg-white border-t border-slate-200">
                  {content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AnamnesisForm;