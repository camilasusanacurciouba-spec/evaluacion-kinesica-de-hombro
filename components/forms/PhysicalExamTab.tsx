

import React, { useState } from 'react';
import type { Patient, RangeOfMotionEntry } from '../../types';
import { InputField, TextareaField } from './common/FormControls';
import ChevronDownIcon from '../icons/ChevronDownIcon';

interface PhysicalExamTabProps {
    patient: Patient;
    onPatientChange: (patient: Patient) => void;
}

const PhysicalExamTab: React.FC<PhysicalExamTabProps> = ({ patient, onPatientChange }) => {
  const [openSections, setOpenSections] = useState<string[]>(['Inspección']);

  const toggleSection = (sectionTitle: string) => {
    setOpenSections(prevOpenSections =>
      prevOpenSections.includes(sectionTitle)
        ? prevOpenSections.filter(title => title !== sectionTitle)
        : [...prevOpenSections, sectionTitle]
    );
  };
  
  const handlePhysicalExamChange = (field: keyof Patient['physicalExam'], value: string) => {
    onPatientChange({
        ...patient,
        physicalExam: {
            ...patient.physicalExam,
            [field]: value,
        }
    });
  }

  const handleRomChange = (id: string, field: keyof Omit<RangeOfMotionEntry, 'id' | 'type'>, value: string) => {
    const updatedRom = patient.physicalExam.rom.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    );
    const updatedPatient = {
      ...patient,
      physicalExam: {
        ...patient.physicalExam,
        rom: updatedRom,
      },
    };
    onPatientChange(updatedPatient);
  };

  const sections = [
     {
      title: 'Observaciones Generales del Paciente',
      content: (
        <TextareaField 
            label="" 
            name="generalObservations" 
            value={patient.physicalExam.generalObservations} 
            onChange={(e) => handlePhysicalExamChange('generalObservations', e.target.value)} 
            placeholder="Ingresar datos del paciente como vino a la consulta (Feliz, triste), si duerme bien habitualmente, si nos cuenta un estres asociado (problemas familiares, economicos, sociales) que estén afectandolo animicamente."
            rows={5}
        />
      )
    },
    {
      title: 'Inspección',
      content: (
        <TextareaField 
            label="" 
            name="inspectionNotes" 
            value={patient.physicalExam.inspectionNotes} 
            onChange={(e) => handlePhysicalExamChange('inspectionNotes', e.target.value)} 
            placeholder="Actitud del Miembro Superior afectado- comparacion bilateral, Deformidades, Prominencias Óseas, Atrofias Musculares, Edema."
            rows={5}
        />
      )
    },
    {
      title: 'Palpación y Síntomas',
      content: (
        <TextareaField 
            label="" 
            name="palpationAndSymptomsNotes" 
            value={patient.physicalExam.palpationAndSymptomsNotes} 
            onChange={(e) => handlePhysicalExamChange('palpationAndSymptomsNotes', e.target.value)}
            placeholder="H (Hematoma), X (Dolor Palpado), x (Dolor Referido), Parestesias, Crepitaciones."
            rows={5}
        />
      )
    },
    {
      title: 'Rango de Movimiento (ROM) y Dolor',
      content: (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                <tr>
                  <th scope="col" className="px-4 py-3">Tipo</th>
                  <th scope="col" className="px-4 py-3">Elevación Anterior (°)</th>
                  <th scope="col" className="px-4 py-3">EVA</th>
                  <th scope="col" className="px-4 py-3">GEB1</th>
                  <th scope="col" className="px-4 py-3">EVA</th>
                  <th scope="col" className="px-4 py-3">GEB2</th>
                  <th scope="col" className="px-4 py-3">EVA</th>
                </tr>
              </thead>
              <tbody>
                {patient.physicalExam.rom.map((entry) => (
                  <tr key={entry.id} className="border-b border-slate-200">
                    <td className="px-4 py-2 font-medium text-slate-800 capitalize">{entry.type === 'active' ? 'Activo' : 'Pasivo'}</td>
                    <td className="px-4 py-2"><InputField name="elevation" value={entry.elevation} onChange={(e) => handleRomChange(entry.id, 'elevation', e.target.value)} label="" /></td>
                    <td className="px-4 py-2"><InputField name="elevationEva" value={entry.elevationEva} onChange={(e) => handleRomChange(entry.id, 'elevationEva', e.target.value)} label="" /></td>
                    <td className="px-4 py-2"><InputField name="geb1" value={entry.geb1} onChange={(e) => handleRomChange(entry.id, 'geb1', e.target.value)} label="" /></td>
                    <td className="px-4 py-2"><InputField name="geb1Eva" value={entry.geb1Eva} onChange={(e) => handleRomChange(entry.id, 'geb1Eva', e.target.value)} label="" /></td>
                    <td className="px-4 py-2"><InputField name="geb2" value={entry.geb2} onChange={(e) => handleRomChange(entry.id, 'geb2', e.target.value)} label="" /></td>
                    <td className="px-4 py-2"><InputField name="geb2Eva" value={entry.geb2Eva} onChange={(e) => handleRomChange(entry.id, 'geb2Eva', e.target.value)} label="" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <TextareaField
              label="Observaciones (compensaciones, ritmo escápulo humeral)"
              name="romObservations"
              value={patient.physicalExam.romObservations}
              onChange={(e) => handlePhysicalExamChange('romObservations', e.target.value)}
              rows={4}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">* Escala Visual Análoga del Dolor (0= no dolor, 10= máximo dolor imaginable). GEB1/GEB2: Nivel vertebral alcanzado.</p>
        </>
      )
    },
    {
      title: 'Cadenas Musculares',
      content: (
        <TextareaField 
          label="Cadenas Musculares Acortadas" 
          name="muscleChains" 
          value={patient.physicalExam.muscleChains} 
          onChange={(e) => handlePhysicalExamChange('muscleChains', e.target.value)}
        />
      )
    }
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

export default PhysicalExamTab;