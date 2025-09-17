import React, { useState } from 'react';
import type { Patient, CustomScaleResult } from '../../types';
import { FormSection, InputField, TextareaField } from './common/FormControls';

interface ScalesAndDiagnosisTabProps {
    patient: Patient;
    onPatientChange: (patient: Patient) => void;
}

const ScalesAndDiagnosisTab: React.FC<ScalesAndDiagnosisTabProps> = ({ patient, onPatientChange }) => {
    const [newScaleName, setNewScaleName] = useState('');

    const handleAddScale = () => {
        if (newScaleName.trim() === '') return;
        const newScale: CustomScaleResult = {
            id: Date.now().toString(),
            name: newScaleName.trim(),
            score: '',
        };
        const updatedScales = [...(patient.customScales || []), newScale];
        onPatientChange({ ...patient, customScales: updatedScales });
        setNewScaleName('');
    };

    const handleScaleChange = (id: string, newScore: string) => {
        const updatedScales = (patient.customScales || []).map(scale =>
            scale.id === id ? { ...scale, score: newScore } : scale
        );
        onPatientChange({ ...patient, customScales: updatedScales });
    };

    const handleRemoveScale = (id: string) => {
        const updatedScales = (patient.customScales || []).filter(scale => scale.id !== id);
        onPatientChange({ ...patient, customScales: updatedScales });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        onPatientChange({ ...patient, [name]: value });
    };

    return (
        <div className="p-6 md:p-8 h-full flex flex-col gap-8">
            <div className="flex-shrink-0">
                <h3 className="text-xl font-bold text-slate-900">Asistente IA para Escalas y Diagnóstico</h3>
                <p className="text-slate-600 mt-1">
                    Utiliza este chatbot para obtener ayuda en la interpretación de escalas, la formulación de hipótesis diagnósticas o la exploración de diagnósticos diferenciales.
                </p>
            </div>
            
            <div className="flex-1 flex flex-col gap-8 overflow-y-auto pr-2">
                {/* AI Chat for Scale Analysis */}
                <div className="flex-shrink-0 border border-slate-200 rounded-lg overflow-hidden shadow-sm bg-white h-[70vh]">
                    <iframe
                        src="https://udify.app/chat/X7K8WTODRe5VIXmu"
                        title="Análisis de Escalas"
                        className="w-full h-full"
                        frameBorder="0"
                    />
                </div>

                {/* Forms for Scales & Diagnosis */}
                <FormSection title="Escalas Tomadas">
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {(patient.customScales || []).map(scale => (
                            <div key={scale.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-50">
                                <span className="flex-1 font-medium text-slate-700">{scale.name}</span>
                                <div className="w-24">
                                    <InputField
                                        label=""
                                        placeholder="Puntaje"
                                        value={scale.score}
                                        onChange={(e) => handleScaleChange(scale.id, e.target.value)}
                                    />
                                </div>
                                <button onClick={() => handleRemoveScale(scale.id)} className="p-2 text-slate-500 hover:text-red-500 rounded-full transition-colors" aria-label={`Eliminar escala ${scale.name}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        ))}
                        {(patient.customScales || []).length === 0 && (
                            <p className="text-sm text-slate-500 text-center py-4">No se han añadido escalas.</p>
                        )}
                    </div>
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200">
                        <InputField
                            label=""
                            placeholder="Nombre de la escala"
                            value={newScaleName}
                            onChange={(e) => setNewScaleName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddScale()}
                        />
                        <button onClick={handleAddScale} className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shrink-0" aria-label="Añadir Escala">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        </button>
                    </div>
                </FormSection>

                <FormSection title="Hipótesis de Diagnóstico">
                    <TextareaField
                        label=""
                        name="diagnosticHypothesis"
                        value={patient.diagnosticHypothesis}
                        onChange={handleInputChange}
                        rows={10}
                        placeholder="Escribe tu hipótesis diagnóstica basada en la anamnesis, el examen físico y los resultados de las escalas..."
                    />
                </FormSection>
            </div>
        </div>
    );
};

export default ScalesAndDiagnosisTab;