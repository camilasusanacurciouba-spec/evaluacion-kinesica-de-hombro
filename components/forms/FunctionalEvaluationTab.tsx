import React, { useState } from 'react';
import type { Patient, CifActivity } from '../../types';
import { SelectField, TextareaField } from './common/FormControls';
import { downloadPatientAsDoc, downloadPatientAsXlsx } from '../../services/patientService';
import DownloadIcon from '../icons/DownloadIcon';
import ChevronDownIcon from '../icons/ChevronDownIcon';


interface FunctionalEvaluationTabProps {
    patient: Patient;
    onPatientChange: (patient: Patient) => void;
}

const flagConfig = [
    { key: 'red', title: 'Bandera Roja', description: 'Signos y síntomas de patología grave (p. ej., fracturas no diagnosticadas, tumores, infecciones, patología visceral).' },
    { key: 'orange', title: 'Bandera Naranja', description: 'Problemas de salud mental equivalentes a una bandera roja (p. ej., depresión mayor, trastornos de personalidad).' },
    { key: 'yellow', title: 'Bandera Amarilla', description: 'Creencias, emociones y comportamientos relacionados con el dolor (p. ej., catastrofismo, miedo al movimiento, expectativas negativas).' },
    { key: 'blue', title: 'Bandera Azul', description: 'Percepciones sobre la relación entre el trabajo y la salud (p. ej., insatisfacción laboral, problemas con compañeros/jefes).' },
    { key: 'black', title: 'Bandera Negra', description: 'Obstáculos sistémicos o contextuales (p. ej., problemas con el seguro, legislación, condiciones laborales que impiden la recuperación).' },
    { key: 'pink', title: 'Bandera Rosa', description: 'Factores positivos que promueven la recuperación. Incluye buena relación terapéutica (confianza, empatía), comunicación clara y participación activa del paciente.' },
];

const shoulderActivities: { id: keyof Patient['functionalEvaluation'], label: string }[] = [
    { id: 'combingHair', label: "Peinarse o lavarse el pelo" },
    { id: 'washingBack', label: "Lavarse la espalda" },
    { id: 'reachingHighShelf', label: "Alcanzar un objeto en un estante alto" },
    { id: 'fasteningBehindBack', label: "Abrocharse por la espalda" },
    { id: 'puttingOnJacket', label: "Ponerse una chaqueta o abrigo" },
    { id: 'carryingHeavyObject', label: "Llevar un objeto pesado (ej. bolsa)" },
    { id: 'sleepingOnAffectedSide', label: "Dormir sobre el lado afectado" },
];


const SimpleActivityRow: React.FC<{
    label: string;
    activityKey: keyof Patient['functionalEvaluation'],
    value: CifActivity;
    onChange: (activityId: keyof Patient['functionalEvaluation'], field: keyof CifActivity, value: string) => void
}> = ({ label, activityKey, value, onChange }) => (
    <div className="flex justify-between items-center py-3 border-b border-slate-200 last:border-b-0">
        <span className="text-slate-800">{label}</span>
        <div className="w-56">
            <SelectField label="" name={activityKey} value={value.qualifier} onChange={e => onChange(activityKey, 'qualifier', e.target.value)}>
                <option value="Sin dificultad">Sin Dificultad</option>
                <option value="Dificultad ligera">Dificultad Ligera</option>
                <option value="Dificultad moderada">Dificultad Moderada</option>
                <option value="Dificultad grave">Dificultad Grave</option>
                <option value="Dificultad completa">Dificultad Completa</option>
                <option value="No aplicable">No Aplicable</option>
            </SelectField>
        </div>
    </div>
);


const FunctionalEvaluationTab: React.FC<FunctionalEvaluationTabProps> = ({ patient, onPatientChange }) => {
    const [isDownloadingDoc, setIsDownloadingDoc] = useState(false);
    const [isDownloadingXlsx, setIsDownloadingXlsx] = useState(false);
    const [openSections, setOpenSections] = useState<string[]>(['Banderas de Alerta (Flags)']);
    const [openFlagsSections, setOpenFlagsSections] = useState<string[]>([]);

    const toggleSection = (sectionTitle: string) => {
      setOpenSections(prevOpenSections =>
        prevOpenSections.includes(sectionTitle)
          ? prevOpenSections.filter(title => title !== sectionTitle)
          : [...prevOpenSections, sectionTitle]
      );
    };

    const toggleFlagSection = (sectionTitle: string) => {
        setOpenFlagsSections(prev =>
          prev.includes(sectionTitle)
            ? prev.filter(title => title !== sectionTitle)
            : [...prev, sectionTitle]
        );
    };

    const handleFlagChange = (flagKey: keyof Patient['flags'], value: string) => {
        onPatientChange({
            ...patient,
            flags: {
                ...patient.flags,
                [flagKey]: value,
            },
        });
    };
    
    const handleCifChange = (activityId: keyof Patient['functionalEvaluation'], field: keyof CifActivity, value: string) => {
        const updatedPatient = {
            ...patient,
            functionalEvaluation: {
                ...patient.functionalEvaluation,
                [activityId]: {
                    // FIX: Cast to CifActivity to resolve spread type error. The activityId
                    // passed to this function always corresponds to a CifActivity object.
                    ...(patient.functionalEvaluation[activityId] as CifActivity),
                    [field]: value,
                }
            }
        };
        onPatientChange(updatedPatient);
    };

    const handleInputChange = (field: keyof Patient['functionalEvaluation'], value: string) => {
        const updatedPatient = {
            ...patient,
            functionalEvaluation: {
                ...patient.functionalEvaluation,
                [field]: value,
            }
        };
        onPatientChange(updatedPatient);
    };

    const handleDownloadDoc = async () => {
        setIsDownloadingDoc(true);
        try {
            downloadPatientAsDoc(patient);
        } catch (error) {
            console.error("Failed to download patient data as DOC", error);
            alert('Ocurrió un error al descargar la ficha del paciente como .doc.');
        } finally {
            setIsDownloadingDoc(false);
        }
    };
    
    const handleDownloadXlsx = async () => {
        setIsDownloadingXlsx(true);
        try {
            downloadPatientAsXlsx(patient);
        } catch (error) {
            console.error("Failed to download patient data as XLSX", error);
            alert('Ocurrió un error al descargar la ficha del paciente como .xlsx.');
        } finally {
            setIsDownloadingXlsx(false);
        }
    };

    const sections = [
        {
            title: 'Banderas de Alerta (Flags)',
            content: (
                <div className="space-y-2">
                    <p className="text-sm text-slate-600 mb-4">
                        Identifica y documenta factores contextuales y psicosociales que pueden influir en el pronóstico y el manejo del paciente.
                    </p>
                    {flagConfig.map(({ key, title, description }) => {
                        const isFlagOpen = openFlagsSections.includes(title);
                        return (
                            <div key={key} className="border border-slate-200 rounded-md overflow-hidden transition-all duration-300">
                                <button
                                    type="button"
                                    onClick={() => toggleFlagSection(title)}
                                    className="w-full flex justify-between items-center p-3 text-left font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors"
                                >
                                    <span>{title}</span>
                                    <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${isFlagOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isFlagOpen && (
                                   <div className="p-4 bg-white border-t border-slate-200">
                                        <p className="text-xs text-slate-600 mb-3">{description}</p>
                                        <TextareaField
                                            label=""
                                            name={key}
                                            value={patient.flags[key as keyof Patient['flags']]}
                                            onChange={e => handleFlagChange(key as keyof Patient['flags'], e.target.value)}
                                            rows={3}
                                            placeholder={`Anota aquí cualquier hallazgo relevante para la ${title.toLowerCase()}...`}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )
        },
        {
            title: 'Análisis Funcional del Hombro (CIF)',
            content: (
                <>
                    <p className="text-sm text-slate-600 mb-4">Evalúa el impacto en las actividades diarias relacionadas con el hombro.</p>
                    <h4 className="font-semibold text-slate-800 mb-2">Actividades y Participación (d) - Limitaciones en AVD</h4>
                    <div>
                        {shoulderActivities.map((activity) => (
                           <SimpleActivityRow
                              key={activity.id}
                              label={activity.label}
                              activityKey={activity.id}
                              value={patient.functionalEvaluation[activity.id] as CifActivity}
                              onChange={handleCifChange}
                           />
                        ))}
                    </div>
                </>
            )
        },
        {
            title: 'Otras actividades específicas limitadas (laboral, deporte)',
            content: (
                <TextareaField
                    label=""
                    name="specificLimitedActivities"
                    value={patient.functionalEvaluation.specificLimitedActivities}
                    onChange={e => handleInputChange('specificLimitedActivities', e.target.value)}
                    placeholder="Detallar la actividad y la limitación..."
                    rows={4}
                />
            )
        },
        {
            title: 'Factores Personales',
            content: (
                 <TextareaField
                    label="¿Cuáles son sus motivaciones para el tratamiento?"
                    name="personalFactors"
                    value={patient.functionalEvaluation.personalFactors}
                    onChange={e => handleInputChange('personalFactors', e.target.value)}
                    placeholder="Ej: Volver a jugar con mis nietos, poder trabajar sin dolor, retomar mi deporte. Indagar también sobre creencias, miedos, estrategias de afrontamiento y objetivos."
                    rows={4}
                />
            )
        },
        {
            title: 'Factores Ambientales (e)',
            content: (
                <TextareaField
                    label=""
                    name="environmentalFactors"
                    value={patient.functionalEvaluation.environmentalFactors}
                    onChange={e => handleInputChange('environmentalFactors', e.target.value)}
                    placeholder="Ej: e310 Apoyo familiar, e580 Barreras en el lugar de trabajo, e115 Ausencia de ayudas técnicas."
                    rows={4}
                />
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

            <div className="pt-6 border-t border-slate-200 flex justify-end items-center gap-2">
                 <button 
                    onClick={handleDownloadDoc}
                    disabled={isDownloadingDoc}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Descargar Ficha Completa en formato .doc"
                >
                    <DownloadIcon />
                    {isDownloadingDoc ? 'Descargando...' : 'Descargar (.doc)'}
                </button>
                 <button 
                    onClick={handleDownloadXlsx}
                    disabled={isDownloadingXlsx}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Descargar Ficha Completa en formato .xlsx"
                >
                    <DownloadIcon />
                    {isDownloadingXlsx ? 'Descargando...' : 'Descargar (.xlsx)'}
                </button>
            </div>
        </div>
    );
};

export default FunctionalEvaluationTab;