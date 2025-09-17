import React, { useState } from 'react';
import type { Patient } from '../../types';
import { downloadPatientAsDoc, downloadPatientAsXlsx } from '../../services/patientService';
import DownloadIcon from '../icons/DownloadIcon';

// Helper components for display
const Section: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
    <div className={`mb-8 ${className}`}>
        <h3 className="text-xl font-bold text-slate-800 border-b-2 border-slate-200 pb-2 mb-4">{title}</h3>
        {children}
    </div>
);

const InfoField: React.FC<{ label: string; value?: string | number | null; children?: React.ReactNode }> = ({ label, value, children }) => {
    if (!value && !children && value !==0) return null;
    return (
        <div className="mb-2">
            <span className="font-semibold text-slate-600">{label}: </span>
            <span className="text-slate-800">{value}</span>
            {children}
        </div>
    );
};

const riskFactorLabels: { [key: string]: string } = {
    menopause: "Menopausia", osteopenia: "Osteopenia/porosis", dmo: "DMO", frequentFalls: "Caídas Frecuentes", barbiturates: "Barbitúricos", neoplasms: "Neoplasias", infections: "Infecciones", sncDisease: "Enf. del SNC/Periféricas", vascularDisease: "Alt/Qx Vascular", diabetes: "Diabetes", dsr: "DSR", hypothyroidism: "Hipotiroidismo", hyperthyroidism: "Hipertiroidismo", hyperlipidemia: "Hiperlipidemia", dupuytren: "Dupuytren", sweatyHands: "Manos Transpiran"
};

const flagLabels: { [key: string]: string } = {
    red: "Bandera Roja",
    orange: "Bandera Naranja",
    yellow: "Bandera Amarilla",
    blue: "Bandera Azul",
    black: "Bandera Negra",
    pink: "Bandera Rosa",
};

const cifActivityLabels: { [key: string]: string } = {
    combingHair: "Peinarse o lavarse el pelo",
    washingBack: "Lavarse la espalda",
    reachingHighShelf: "Alcanzar un objeto en un estante alto",
    fasteningBehindBack: "Abrocharse por la espalda",
    puttingOnJacket: "Ponerse una chaqueta o abrigo",
    carryingHeavyObject: "Llevar un objeto pesado (ej. bolsa)",
    sleepingOnAffectedSide: "Dormir sobre el lado afectado",
};


interface SynthesisTabProps {
    patient: Patient;
}

const SynthesisTab: React.FC<SynthesisTabProps> = ({ patient }) => {
    const [isDownloadingDoc, setIsDownloadingDoc] = useState(false);
    const [isDownloadingXlsx, setIsDownloadingXlsx] = useState(false);

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
    
    const getAge = (birthDate: string) => {
        if (!birthDate) return '';
        try {
          const birthday = new Date(birthDate);
          const ageDifMs = Date.now() - birthday.getTime();
          const ageDate = new Date(ageDifMs);
          return Math.abs(ageDate.getUTCFullYear() - 1970).toString();
        } catch { return ''; }
    };

    const getFunctionalLimitations = () => {
        const limitations: React.ReactNode[] = [];
        if(patient.functionalEvaluation) {
            for (const [key, value] of Object.entries(patient.functionalEvaluation)) {
                if (typeof value === 'object' && value.qualifier && value.qualifier !== 'Sin dificultad' && value.qualifier !== 'No aplicable') {
                    const activityName = cifActivityLabels[key] || key;
                    limitations.push(
                        <li key={key} className="mb-1">
                            <strong>{activityName}:</strong> {value.qualifier}
                            {value.details && <span className="text-slate-500 text-sm"> ({value.details})</span>}
                        </li>
                    );
                }
            }
        }
        return limitations.length > 0 ? <ul className="list-disc list-inside">{limitations}</ul> : <p>No se reportan limitaciones significativas.</p>;
    }

    const { riskFactors } = patient;
    const fallAlterations = [
        riskFactors.posturalAlterations && "Alteraciones posturales",
        riskFactors.gaitAlteration && "Alteración de la marcha",
        riskFactors.associatedMuscleWeakness && "Debilidad muscular asociada",
        riskFactors.decreasedReflexes && "Disminución de los reflejos",
        riskFactors.visualAlterations && "Alteraciones visuales"
    ].filter(Boolean);


    return (
        <div className="p-8 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Síntesis Semiológica</h2>
                <div className="flex items-center gap-2">
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

            <div className="overflow-y-auto prose prose-sm max-w-none">
                <Section title="Datos Personales">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
                        <InfoField label="Apellido" value={patient.lastName} />
                        <InfoField label="Nombres" value={patient.firstName} />
                        <InfoField label="Fecha de Nacimiento" value={patient.birthDate} />
                        <InfoField label="Edad" value={getAge(patient.birthDate)} />
                        <InfoField label="DNI" value={patient.idNumber} />
                        <InfoField label="Obra Social" value={patient.insurance} />
                        <InfoField label="Teléfono" value={patient.phone} />
                        <InfoField label="Domicilio" value={`${patient.address}, ${patient.location}, ${patient.city}`} />
                    </div>
                </Section>

                <Section title="Anamnesis de la Lesión">
                    <InfoField label="Diagnóstico Médico" value={patient.medicalDiagnosis} />
                    <InfoField label="Causa de Lesión" value={patient.injuryCause} />
                    <InfoField label="Fecha de Lesión" value={patient.injuryDate} />
                    <InfoField label="MMSS Dominante" value={patient.dominantHand} />
                    <InfoField label="Antecedentes Clínico-Quirúrgicos">
                        <p className="whitespace-pre-wrap">{patient.surgicalHistory || 'N/A'}</p>
                    </InfoField>
                </Section>
                
                <Section title="Antecedentes de Caídas">
                    <InfoField label="Cantidad de caídas (últimos 6 meses)" value={riskFactors.fallsLast6Months} />
                    <InfoField label="Lugar de la caída">
                        <p className="whitespace-pre-wrap">{riskFactors.fallLocation || 'N/A'}</p>
                    </InfoField>
                    <InfoField label="Resultado Test 'Get Up and Go' (TUG)" value={riskFactors.tugTestSeconds ? `${riskFactors.tugTestSeconds} seg.` : 'No realizado'} />
                    <div className="mt-2">
                        <span className="font-semibold text-slate-600">Alteraciones observadas:</span>
                        {fallAlterations.length > 0 ? (
                             <ul className="list-disc list-inside ml-4 mt-1">
                                {fallAlterations.map(alt => <li key={alt}>{alt}</li>)}
                            </ul>
                        ) : (
                            <span className="text-slate-800 ml-2">Ninguna registrada</span>
                        )}
                    </div>
                </Section>

                <Section title="Factores de Riesgo y Comorbilidades">
                    <ul className="list-disc list-inside">
                    {(patient.riskFactors.associatedDiseases || []).length > 0 && 
                        <li><strong>Enfermedades Asociadas:</strong> {(patient.riskFactors.associatedDiseases.map(d => d.name).join(', '))}</li>
                    }
                    {Object.entries(patient.riskFactors)
                        .filter(([, value]) => value === true)
                        .map(([key]) => riskFactorLabels[key] ? <li key={key}>{riskFactorLabels[key]}</li> : null)
                    }
                    </ul>
                </Section>

                <Section title="Examen Físico">
                     <InfoField label="Observaciones Generales">
                        <p className="whitespace-pre-wrap mt-1">{patient.physicalExam.generalObservations || 'N/A'}</p>
                    </InfoField>
                    <InfoField label="Inspección">
                        <p className="whitespace-pre-wrap mt-1">{patient.physicalExam.inspectionNotes || 'N/A'}</p>
                    </InfoField>
                    <InfoField label="Palpación y Síntomas">
                         <p className="whitespace-pre-wrap mt-1">{patient.physicalExam.palpationAndSymptomsNotes || 'N/A'}</p>
                    </InfoField>

                    <h4 className="font-semibold mt-6 mb-2">Rango de Movimiento (ROM)</h4>
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-slate-50">
                            <tr>
                                <th className="px-4 py-2">Tipo</th>
                                <th className="px-4 py-2">Elevación Ant.</th>
                                <th className="px-4 py-2">EVA</th>
                                <th className="px-4 py-2">GEB1</th>
                                <th className="px-4 py-2">EVA</th>
                                <th className="px-4 py-2">GEB2</th>
                                <th className="px-4 py-2">EVA</th>
                            </tr>
                        </thead>
                        <tbody>
                        {patient.physicalExam.rom.map(entry => (
                            <tr key={entry.id}>
                                <td className="border px-4 py-2 capitalize">{entry.type === 'active' ? 'Activo' : 'Pasivo'}</td>
                                <td className="border px-4 py-2">{entry.elevation}</td>
                                <td className="border px-4 py-2">{entry.elevationEva}</td>
                                <td className="border px-4 py-2">{entry.geb1}</td>
                                <td className="border px-4 py-2">{entry.geb1Eva}</td>
                                <td className="border px-4 py-2">{entry.geb2}</td>
                                <td className="border px-4 py-2">{entry.geb2Eva}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                     <InfoField label="Observaciones de ROM">
                        <p className="whitespace-pre-wrap mt-1">{patient.physicalExam.romObservations || 'N/A'}</p>
                    </InfoField>
                </Section>
                 
                <Section title="Banderas de Alerta">
                    {Object.entries(patient.flags || {}).filter(([, value]) => value).length > 0 ? (
                        <ul className="list-disc list-inside">
                            {Object.entries(patient.flags).filter(([, value]) => value).map(([key, value]) => (
                                <li key={key}><strong>{flagLabels[key] || key}:</strong> {value}</li>
                            ))}
                        </ul>
                     ) : <p>No se registraron banderas de alerta.</p>}
                </Section>

                <Section title="Pruebas Específicas Adicionales">
                    {(patient.customTests || []).length > 0 ? (
                        <ul className="list-disc list-inside">
                            {patient.customTests.map(test => (
                                <li key={test.id}><strong>{test.name}:</strong> {test.result}</li>
                            ))}
                        </ul>
                     ) : <p>No se realizaron pruebas adicionales.</p>}
                </Section>

                <Section title="Escalas Tomadas">
                    {(patient.customScales || []).length > 0 ? (
                        <ul className="list-disc list-inside">
                            {patient.customScales.map(scale => (
                                <li key={scale.id}><strong>{scale.name}:</strong> {scale.score}</li>
                            ))}
                        </ul>
                     ) : <p>No se registraron escalas.</p>}
                </Section>

                <Section title="Evaluación Funcional (Limitaciones según CIF)">
                    {getFunctionalLimitations()}
                </Section>

                <Section title="Factores Contextuales">
                    <InfoField label="Otras actividades específicas limitadas (laboral, deporte)">
                        <p className="whitespace-pre-wrap">{patient.functionalEvaluation.specificLimitedActivities || 'N/A'}</p>
                    </InfoField>
                    <InfoField label="Factores Ambientales (e)">
                        <p className="whitespace-pre-wrap">{patient.functionalEvaluation.environmentalFactors || 'N/A'}</p>
                    </InfoField>
                    <InfoField label="Factores Personales">
                        <p className="whitespace-pre-wrap">{patient.functionalEvaluation.personalFactors || 'N/A'}</p>
                    </InfoField>
                </Section>

                <Section title="Estudios y Archivos">
                     <InfoField label="Hallazgos RX Hombro">
                        <p className="whitespace-pre-wrap">{patient.studiesAndEvolution.shoulderRx || 'N/A'}</p>
                    </InfoField>
                     <h4 className="font-semibold mt-6 mb-2">Archivos Adjuntos</h4>
                     {(patient.studiesAndEvolution.media || []).length > 0 ? (
                        <ul className="list-disc list-inside">
                            {patient.studiesAndEvolution.media.map(file => (
                                <li key={file.id}>{file.name}</li>
                            ))}
                        </ul>
                     ) : <p>No hay archivos adjuntos.</p>}
                </Section>

                <Section title="Hipótesis de Diagnóstico">
                    <p className="whitespace-pre-wrap">{patient.diagnosticHypothesis || 'No especificado.'}</p>
                </Section>
                
                 <Section title="Diagnóstico Presuntivo (IA)">
                    <p className="whitespace-pre-wrap">{patient.presumptiveDiagnosis || 'No especificado.'}</p>
                </Section>
                
                <Section title="Resumen Final y Justificación">
                    <p className="whitespace-pre-wrap">{patient.finalSummary || 'No especificado.'}</p>
                </Section>

                {patient.aiAnalysis && (
                    <Section title="Análisis IA">
                        <div 
                            className="bg-slate-50 border border-slate-200 rounded-lg p-4 whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{ __html: patient.aiAnalysis.replace(/\n/g, '<br />') }}
                        />
                    </Section>
                )}
            </div>
        </div>
    );
};

export default SynthesisTab;