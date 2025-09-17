
import React from 'react';
import type { Patient, TestResult } from '../../types';
import { FormSection, SelectField } from './common/FormControls';

interface SpecificTestsTabProps {
    patient: Patient;
    onPatientChange: (patient: Patient) => void;
}

const testsConfig = {
    subacromialConflict: {
        title: "Conflicto Subacromial",
        tests: [
            { id: 'arcoDoloroso', name: "Arco Doloroso", type: "Cribado/Cluster", evidence: "a", recommendation: "Mantener", comment: "Valioso por sí mismo y en clusters." },
            { id: 'neer', name: "IAS (Neer)", type: "Descarte", evidence: "b", recommendation: "Mantener (cribado)", comment: "Alta sensibilidad, útil para 'descartar' si es negativo." },
            { id: 'hawkinsKennedy', name: "IAI (Hawkins-Kennedy)", type: "Descarte", evidence: "b", recommendation: "Mantener (cribado)", comment: "Alta sensibilidad, útil para 'descartar' si es negativo." },
            { id: 'yocum', name: "Yocum", type: "Descarte", evidence: "b", recommendation: "Mantener (cribado)", comment: "Sensible para SIS, pero baja especificidad." },
        ]
    },
    rotatorCuff: {
        title: "Rotura del Manguito Rotador",
        tests: [
            { id: 'jobe', name: "Jobe (Debilidad/Dolor)", type: "Diagnóstico", evidence: "a", recommendation: "Mantener", comment: "Alta sensibilidad y especificidad. Una de las más respaldadas." },
            { id: 'brazoCaido', name: "Brazo Caído (Drop Arm)", type: "Diagnóstico", evidence: "b", recommendation: "Mantener (confirmación)", comment: "Baja sensibilidad, alta especificidad. Útil para 'confirmar'." },
            { id: 'gerberLiftOff', name: "Gerber (Lift-Off)", type: "Diagnóstico", evidence: "a", recommendation: "Mantener (confirmación)", comment: "Alta especificidad, útil para 'confirmar'." },
            { id: 'napoleon', name: "Napoleón", type: "Cribado/Cluster", evidence: "b", recommendation: "Mantener (en batería)", comment: "Complementar con otras pruebas." },
        ]
    },
    instability: {
        title: "Inestabilidad",
        tests: [
            { id: 'aprension', name: "Aprensión", type: "Diagnóstico", evidence: "b", recommendation: "Mantener (confirmación)", comment: "Alta especificidad, útil para 'confirmar' si hay aprensión." },
            { id: 'cajonAnterior', name: "Cajón Anterior", type: "Cribado/Cluster", evidence: "b", recommendation: "Mantener (en batería)", comment: "Parte de la evaluación de laxitud, útil en contexto global." },
            { id: 'signoSurco', name: "Signo del Surco", type: "Cribado/Cluster", evidence: "b", recommendation: "Mantener (laxitud inferior)", comment: "Evalúa laxitud inferior." },
        ]
    },
    acromioclavicularJoint: {
        title: "Lesión Articulación Acromioclavicular (AAC)",
        tests: [
            { id: 'palpacionAAC', name: "Palpación AAC", type: "Cribado/Cluster", evidence: "b", recommendation: "Mantener (cribado)", comment: "Útil para localizar dolor y cribado inicial." },
            { id: 'obrien', name: "Test de O'Brien", type: "Cribado/Cluster", evidence: "b", recommendation: "Mantener (en clusters)", comment: "Baja precisión para SLAP. Útil en combinación para AAC." },
        ]
    },
    cervicalRadiculopathy: {
        title: "Radiculopatía Cervical",
        tests: [
            { id: 'spurling', name: "Test de Spurling", type: "Diagnóstico", evidence: "a", recommendation: "Mantener (confirmación)", comment: "Alta especificidad, útil para 'confirmar' si es positivo." },
            { id: 'distraccion', name: "Test de Distracción", type: "Diagnóstico", evidence: "a", recommendation: "Mantener (confirmación)", comment: "Alta especificidad, útil para 'confirmar' si hay alivio." },
            { id: 'tensionMMSS', name: "Test de Tensión del MMSS (ULTT)", type: "Descarte", evidence: "b", recommendation: "Mantener (descarte)", comment: "Alta sensibilidad, útil para 'descartar' si es negativo." },
        ]
    }
};

const EvidenceBadge: React.FC<{ evidence: 'a' | 'b' | 'c' }> = ({ evidence }) => {
    const config = {
        a: { label: "Alta", className: "bg-green-100 text-green-800" },
        b: { label: "Moderada", className: "bg-yellow-100 text-yellow-800" },
        c: { label: "Nula", className: "bg-red-100 text-red-800" },
    };
    const { label, className } = config[evidence] || config.c;
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${className}`}>{label}</span>;
};

const TypeBadge: React.FC<{ type: 'Diagnóstico' | 'Descarte' | 'Cribado/Cluster' }> = ({ type }) => {
    const config = {
        'Diagnóstico': { label: "Diagnóstico", className: "bg-purple-100 text-purple-800" },
        'Descarte': { label: "Descarte", className: "bg-sky-100 text-sky-800" },
        'Cribado/Cluster': { label: "Cribado/Cluster", className: "bg-gray-100 text-gray-800" },
    };
    const { label, className } = config[type] || config['Cribado/Cluster'];
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${className}`}>{label}</span>;
};


const TestRow: React.FC<{
    test: { id: string, name: string, type: string, evidence: 'a' | 'b' | 'c', recommendation: string, comment: string },
    value: TestResult,
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}> = ({ test, value, onChange }) => (
    <tr className="border-b border-slate-200 hover:bg-slate-50">
        <td className="px-4 py-3 font-medium text-slate-800">{test.name}</td>
        <td className="px-4 py-3"><TypeBadge type={test.type as any} /></td>
        <td className="px-4 py-3"><EvidenceBadge evidence={test.evidence} /></td>
        <td className="px-4 py-3 text-slate-600">{test.recommendation}</td>
        <td className="px-4 py-3 text-slate-500">{test.comment}</td>
        <td className="px-4 py-3">
            <SelectField name={test.id} value={value.result} onChange={onChange} label="">
                <option value="No realizado">No realizado</option>
                <option value="Positivo">Positivo</option>
                <option value="Negativo">Negativo</option>
            </SelectField>
        </td>
    </tr>
);

const SpecificTestsTab: React.FC<SpecificTestsTabProps> = ({ patient, onPatientChange }) => {

    const handleTestChange = (category: keyof typeof testsConfig, testId: string, value: string) => {
        const updatedPatient = {
            ...patient,
            specificTests: {
                ...patient.specificTests,
                [category]: {
                    ...patient.specificTests[category],
                    [testId]: { result: value },
                },
            },
        };
        onPatientChange(updatedPatient);
    };

    return (
        <div className="p-6 space-y-8">
            <div className="p-4 bg-slate-100 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-slate-800">Guía de Evidencia (Actualización 2025)</h3>
                <p className="text-sm text-slate-600 mt-1">
                    Las pruebas se clasifican según su utilidad clínica principal (Diagnóstico, Descarte) y la evidencia científica más reciente.
                </p>
            </div>
            
            {Object.entries(testsConfig).map(([categoryKey, category]) => (
                <FormSection key={categoryKey} title={category.title}>
                    <div className="overflow-x-auto -mx-6">
                        <table className="w-full text-sm text-left text-slate-500">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-4 py-3">Prueba</th>
                                    <th scope="col" className="px-4 py-3">Tipo</th>
                                    <th scope="col" className="px-4 py-3">Nivel de Evidencia</th>
                                    <th scope="col" className="px-4 py-3">Recomendación</th>
                                    <th scope="col" className="px-4 py-3">Comentario</th>
                                    <th scope="col" className="px-4 py-3">Resultado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {category.tests.map(test => (
                                    <TestRow
                                        key={test.id}
                                        test={test as any}
                                        value={patient.specificTests[categoryKey][test.id]}
                                        onChange={(e) => handleTestChange(categoryKey as keyof typeof testsConfig, test.id, e.target.value)}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </FormSection>
            ))}
        </div>
    );
};

export default SpecificTestsTab;