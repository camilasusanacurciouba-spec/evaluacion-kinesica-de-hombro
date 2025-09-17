

import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';
import type { Patient, TestResult } from '../types';

function getAiClient(): GoogleGenAI | null {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    if (!apiKey) {
        console.error("API_KEY no está configurada.");
        return null;
    }
    return new GoogleGenAI({ apiKey });
}

const cifActivityLabels: { [key: string]: string } = {
    combingHair: "Peinarse o lavarse el pelo",
    washingBack: "Lavarse la espalda",
    reachingHighShelf: "Alcanzar un objeto en un estante alto",
    fasteningBehindBack: "Abrocharse por la espalda",
    puttingOnJacket: "Ponerse una chaqueta o abrigo",
    carryingHeavyObject: "Llevar un objeto pesado (ej. bolsa)",
    sleepingOnAffectedSide: "Dormir sobre el lado afectado",
};

const specificTestLabels: { [key: string]: string } = {
    arcoDoloroso: "Arco Doloroso",
    neer: "Neer",
    hawkinsKennedy: "Hawkins-Kennedy",
    yocum: "Yocum",
    jobe: "Jobe",
    brazoCaido: "Brazo Caído",
    gerberLiftOff: "Gerber (Lift-Off)",
    napoleon: "Napoleón",
    aprension: "Aprensión",
    cajonAnterior: "Cajón Anterior",
    signoSurco: "Signo del Surco",
    palpacionAAC: "Palpación AAC",
    obrien: "O'Brien",
    spurling: "Spurling",
    distraccion: "Distracción",
    tensionMMSS: "Tensión MMSS (ULTT)",
};


function formatPatientDataForPrompt(patient: Patient): string {
    const sections: string[] = [];

    sections.push("### Datos Personales y Anamnesis");
    sections.push(`- **Nombre:** ${patient.firstName} ${patient.lastName}`);
    sections.push(`- **Diagnóstico Médico:** ${patient.medicalDiagnosis}`);
    sections.push(`- **Causa de Lesión:** ${patient.injuryCause}`);
    sections.push(`- **Antecedentes:** ${patient.surgicalHistory}`);
    const associatedDiseases = (patient.riskFactors.associatedDiseases || []).map(d => d.name).join(', ');
    if (associatedDiseases) {
        sections.push(`- **Enfermedades Asociadas:** ${associatedDiseases}`);
    }
    sections.push(`- **Factores de Riesgo (Checkbox):** ${Object.entries(patient.riskFactors).filter(([, value]) => value === true).map(([key]) => key).join(', ') || 'Ninguno destacable'}`);
    
    sections.push("\n### Examen Físico");
    if(patient.physicalExam.generalObservations) {
        sections.push(`- **Observaciones Generales:** ${patient.physicalExam.generalObservations}`);
    }
    sections.push(`- **Inspección:** ${patient.physicalExam.inspectionNotes}`);
    sections.push(`- **Palpación y Síntomas:** ${patient.physicalExam.palpationAndSymptomsNotes}`);
    
    const activeRom = patient.physicalExam.rom.find(r => r.type === 'active');
    if (activeRom) {
        sections.push(`- **ROM Activo (Elevación):** ${activeRom.elevation}°`);
    }

    const standardTests: string[] = [];
    if (patient.specificTests) {
        for (const category of Object.values(patient.specificTests)) {
            for (const [testId, testResult] of Object.entries(category)) {
                // FIX: Cast testResult to TestResult to resolve typing error where it was inferred as 'unknown'.
                const resultData = testResult as TestResult;
                if (resultData.result === 'Positivo' || resultData.result === 'Negativo') {
                    const testName = specificTestLabels[testId] || testId;
                    standardTests.push(`- **${testName}:** ${resultData.result}`);
                }
            }
        }
    }
    
    if (standardTests.length > 0) {
        sections.push("\n### Pruebas Específicas (Protocolo Estándar)");
        sections.push(...standardTests);
    }

    if (patient.customTests && patient.customTests.length > 0) {
        sections.push("\n### Pruebas Específicas (Adicionales)");
        patient.customTests.forEach(test => {
            if (test.result !== 'No realizado') {
                sections.push(`- **${test.name}:** ${test.result}`);
            }
        });
    }

    const flags: string[] = [];
    if(patient.flags) {
        for (const [key, value] of Object.entries(patient.flags)) {
            if (value) {
                flags.push(`- **Bandera ${key.charAt(0).toUpperCase() + key.slice(1)}:** ${value}`);
            }
        }
    }
    if (flags.length > 0) {
        sections.push("\n### Banderas de Alerta Identificadas");
        sections.push(...flags);
    }

    sections.push("\n### Evaluación Funcional (Limitaciones en Actividades - según el paciente)");
    const functionalLimitations: string[] = [];
    if(patient.functionalEvaluation) {
        for (const [key, value] of Object.entries(patient.functionalEvaluation)) {
            if (typeof value === 'object' && value.qualifier && value.qualifier !== 'Sin dificultad' && value.qualifier !== 'No aplicable') {
                const activityName = cifActivityLabels[key] || key;
                let limitation = `- **${activityName}:** ${value.qualifier}`;
                if(value.details) {
                    limitation += ` (${value.details})`;
                }
                functionalLimitations.push(limitation);
            }
        }
    }
    
    if (functionalLimitations.length > 0) {
        sections.push(...functionalLimitations);
    } else {
        sections.push("- No se reportan limitaciones significativas en actividades de la vida diaria.");
    }
    
    if (patient.functionalEvaluation.specificLimitedActivities) {
        sections.push(`- **Otras actividades específicas limitadas:** ${patient.functionalEvaluation.specificLimitedActivities}`);
    }
    if (patient.functionalEvaluation.environmentalFactors) {
        sections.push(`- **Factores Ambientales:** ${patient.functionalEvaluation.environmentalFactors}`);
    }
    if (patient.functionalEvaluation.personalFactors) {
        sections.push(`- **Factores Personales:** ${patient.functionalEvaluation.personalFactors}`);
    }

    sections.push("\n### Estudios y Evolución");
    sections.push(`- **Hallazgos RX:** ${patient.studiesAndEvolution.shoulderRx}`);

    if (patient.presumptiveDiagnosis) {
        sections.push("\n### Diagnóstico Presuntivo (del Kinesiólogo)");
        sections.push(patient.presumptiveDiagnosis);
    }
    
    return sections.join('\n');
}

export async function generatePatientAnalysis(patient: Patient): Promise<string> {
    const ai = getAiClient();
    if (!ai) {
        return "Error: El servicio de IA no está configurado correctamente.";
    }

    const prompt = `Por favor, analiza los siguientes datos del paciente y genera un reporte estructurado según la CIF:\n\n${formatPatientDataForPrompt(patient)}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
            }
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error al generar el análisis del paciente:", error);
        return "Ocurrió un error al comunicarse con el servicio de IA. Por favor, inténtelo de nuevo.";
    }
}