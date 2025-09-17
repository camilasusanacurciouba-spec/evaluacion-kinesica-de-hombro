import React, { useState } from 'react';
import type { Patient } from '../../types';
import { TextareaField } from './common/FormControls';
import ChevronDownIcon from '../icons/ChevronDownIcon';

interface FlagsTabProps {
    patient: Patient;
    onPatientChange: (patient: Patient) => void;
}

const flagConfig = [
    { key: 'red', title: 'Bandera Roja', description: 'Signos y síntomas de patología grave (p. ej., fracturas no diagnosticadas, tumores, infecciones, patología visceral).' },
    { key: 'orange', title: 'Bandera Naranja', description: 'Problemas de salud mental equivalentes a una bandera roja (p. ej., depresión mayor, trastornos de personalidad).' },
    { key: 'yellow', title: 'Bandera Amarilla', description: 'Creencias, emociones y comportamientos relacionados con el dolor (p. ej., catastrofismo, miedo al movimiento, expectativas negativas).' },
    { key: 'blue', title: 'Bandera Azul', description: 'Percepciones sobre la relación entre el trabajo y la salud (p. ej., insatisfacción laboral, problemas con compañeros/jefes).' },
    { key: 'black', title: 'Bandera Negra', description: 'Obstáculos sistémicos o contextuales (p. ej., problemas con el seguro, legislación, condiciones laborales que impiden la recuperación).' },
    { key: 'pink', title: 'Bandera Rosa', description: 'Factores emocionales que pueden influir en la recuperación (p. ej., tristeza, ansiedad, estrés no clasificados como trastornos mayores).' },
];


const FlagsTab: React.FC<FlagsTabProps> = ({ patient, onPatientChange }) => {
    const [openSections, setOpenSections] = useState<string[]>([]);

    const toggleSection = (sectionTitle: string) => {
        setOpenSections(prevOpenSections =>
          prevOpenSections.includes(sectionTitle)
            ? prevOpenSections.filter(title => title !== sectionTitle)
            : [...prevOpenSections, sectionTitle]
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

    return (
        <div className="p-6 space-y-4">
             <div className="p-4 bg-slate-100 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-slate-800">Registro de Banderas de Alerta (Flags)</h3>
                <p className="text-sm text-slate-600 mt-1">
                    Identifica y documenta factores contextuales y psicosociales que pueden influir en el pronóstico y el manejo del paciente.
                </p>
            </div>
            {flagConfig.map(({ key, title, description }) => {
                const isOpen = openSections.includes(title);
                return (
                    <div key={key} className="border border-slate-200 rounded-lg overflow-hidden transition-all duration-300">
                        <button
                            type="button"
                            onClick={() => toggleSection(title)}
                            className="w-full flex justify-between items-center p-4 text-left text-lg font-semibold text-slate-800 bg-slate-50 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                            aria-expanded={isOpen}
                            aria-controls={`section-content-${key}`}
                        >
                            <span>{title}</span>
                            <ChevronDownIcon className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <div
                            id={`section-content-${key}`}
                            className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                        >
                            <div className="overflow-hidden">
                                <div className="p-6 bg-white border-t border-slate-200">
                                    <p className="text-sm text-slate-600 mb-4">{description}</p>
                                    <TextareaField
                                        label="Observaciones"
                                        name={key}
                                        value={patient.flags[key as keyof Patient['flags']]}
                                        onChange={e => handleFlagChange(key as keyof Patient['flags'], e.target.value)}
                                        rows={4}
                                        placeholder={`Anota aquí cualquier hallazgo relevante para la ${title.toLowerCase()}...`}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default FlagsTab;