
import React, { useState } from 'react';
import type { Patient, CustomTestResult } from '../../types';
import { FormSection, InputField, TextareaField, SelectField } from './common/FormControls';
import { downloadPatientAsDoc, downloadPatientAsXlsx } from '../../services/patientService';
import DownloadIcon from '../icons/DownloadIcon';

interface AIAnalysisTabProps {
    patient: Patient;
    onPatientChange: (patient: Patient) => void;
}

const AIAnalysisTab: React.FC<AIAnalysisTabProps> = ({ patient, onPatientChange }) => {
    const [isDownloadingDoc, setIsDownloadingDoc] = useState(false);
    const [isDownloadingXlsx, setIsDownloadingXlsx] = useState(false);
    const [newTestName, setNewTestName] = useState('');

    const handleAddTest = () => {
        if (newTestName.trim() === '') return;
        const newTest: CustomTestResult = {
            id: Date.now().toString(),
            name: newTestName.trim(),
            result: 'No realizado',
        };
        const updatedTests = [...(patient.customTests || []), newTest];
        onPatientChange({ ...patient, customTests: updatedTests });
        setNewTestName('');
    };

    const handleTestResultChange = (id: string, newResult: 'Positivo' | 'Negativo' | 'No realizado') => {
        const updatedTests = (patient.customTests || []).map(test =>
            test.id === id ? { ...test, result: newResult } : test
        );
        onPatientChange({ ...patient, customTests: updatedTests });
    };

    const handleRemoveTest = (id: string) => {
        const updatedTests = (patient.customTests || []).filter(test => test.id !== id);
        onPatientChange({ ...patient, customTests: updatedTests });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        onPatientChange({ ...patient, [name]: value });
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

    return (
        <div className="p-6 md:p-8 h-full flex flex-col">
            <div className="flex-shrink-0 mb-6">
                <h3 className="text-xl font-bold text-slate-900">Análisis con IA</h3>
                <p className="text-slate-600 mt-1">
                    Utiliza este chatbot para analizar datos, interpretar resultados o explorar hipótesis.
                </p>
            </div>
            
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-hidden">
                {/* Left Column: Chatbot */}
                <div className="lg:col-span-2 flex flex-col h-full border border-slate-200 rounded-lg overflow-hidden shadow-sm bg-white">
                    <iframe
                        src="https://udify.app/chat/A7x81kyqIOyqBjc4"
                        title="Análisis IA"
                        className="w-full h-full"
                        frameBorder="0"
                    />
                </div>

                {/* Right Column: Actions and Forms */}
                <div className="lg:col-span-1 flex flex-col gap-6 overflow-y-auto pr-2">
                    <div className="flex-shrink-0 p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-col gap-4">
                        <div className="flex-grow">
                            <h4 className="font-semibold text-slate-800">Exportar Resumen para IA</h4>
                            <p className="text-sm text-slate-600 mt-1">
                                Descarga un resumen para adjuntarlo al chatbot y analizar el caso.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <button 
                                onClick={handleDownloadDoc}
                                disabled={isDownloadingDoc}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <DownloadIcon />
                                {isDownloadingDoc ? 'Descargando...' : '.doc'}
                            </button>
                            <button 
                                onClick={handleDownloadXlsx}
                                disabled={isDownloadingXlsx}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <DownloadIcon />
                                {isDownloadingXlsx ? 'Descargando...' : '.xlsx'}
                            </button>
                        </div>
                    </div>

                    <FormSection title="Pruebas Específicas Adicionales">
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {(patient.customTests || []).map(test => (
                                <div key={test.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-50">
                                    <span className="flex-1 font-medium text-slate-700">{test.name}</span>
                                    <div className="w-48">
                                        <SelectField
                                            label=""
                                            value={test.result}
                                            onChange={(e) => handleTestResultChange(test.id, e.target.value as any)}
                                        >
                                            <option value="No realizado">No realizado</option>
                                            <option value="Positivo">Positivo</option>
                                            <option value="Negativo">Negativo</option>
                                        </SelectField>
                                    </div>
                                    <button onClick={() => handleRemoveTest(test.id)} className="p-2 text-slate-500 hover:text-red-500 rounded-full transition-colors" aria-label={`Eliminar prueba ${test.name}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            ))}
                            {(patient.customTests || []).length === 0 && (
                                <p className="text-sm text-slate-500 text-center py-4">No se han añadido pruebas adicionales.</p>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200">
                            <InputField
                                label=""
                                placeholder="Nombre de la prueba"
                                value={newTestName}
                                onChange={(e) => setNewTestName(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTest(); }}}
                            />
                            <button onClick={handleAddTest} className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shrink-0" aria-label="Añadir Prueba">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                            </button>
                        </div>
                    </FormSection>

                    <FormSection title="Diagnóstico Presuntivo">
                        <TextareaField
                            label=""
                            name="presumptiveDiagnosis"
                            value={patient.presumptiveDiagnosis}
                            onChange={handleInputChange}
                            rows={6}
                            placeholder="Escribe tu diagnóstico presuntivo..."
                        />
                    </FormSection>
                    
                    <FormSection title="Resumen Final y Justificación">
                        <TextareaField
                            label=""
                            name="finalSummary"
                            value={patient.finalSummary}
                            onChange={handleInputChange}
                            rows={6}
                            placeholder="Resume el caso y justifica tu diagnóstico y plan de acción."
                        />
                    </FormSection>
                </div>
            </div>
        </div>
    );
};

export default AIAnalysisTab;
