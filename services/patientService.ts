import * as XLSX from 'xlsx';
import type { Patient, SpecificTests, TestResult } from '../types';

const LOCAL_STORAGE_KEY = 'patients';

export async function getPatients(): Promise<Patient[]> {
    const patientsJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!patientsJSON) {
        return [];
    }
    try {
        const patients = JSON.parse(patientsJSON);
        // Data migration for old patients that might not have all fields
        return patients.map((p: any) => ({
            ...createDefaultPatientData(),
            ...p,
        }));
    } catch (error) {
        console.error("Failed to parse patients from localStorage, clearing it.", error);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        return [];
    }
}

export async function getPatient(id: string): Promise<Patient | undefined> {
  const patients = await getPatients();
  return patients.find(p => p.id === id);
}

export async function savePatient(patient: Patient): Promise<Patient> {
    const patientToSave = { ...patient };
    patientToSave.firstName = patientToSave.firstName || '';
    patientToSave.lastName = patientToSave.lastName || '';

    const patients = await getPatients();
    const index = patients.findIndex(p => p.id === patientToSave.id);
    if (index > -1) {
      patients[index] = patientToSave;
    } else {
      patients.push(patientToSave);
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(patients));
    return patientToSave;
}

const createDefaultPatientData = (): Omit<Patient, 'id' | 'createdAt' | 'status'> => {
    const defaultCifActivity = { qualifier: 'Sin dificultad' as const, details: '' };
    const defaultTestResult: TestResult = { result: 'No realizado' };
    const defaultSpecificTestsData: SpecificTests = {
        subacromialConflict: {
            arcoDoloroso: { ...defaultTestResult },
            neer: { ...defaultTestResult },
            hawkinsKennedy: { ...defaultTestResult },
            yocum: { ...defaultTestResult },
        },
        rotatorCuff: {
            jobe: { ...defaultTestResult },
            brazoCaido: { ...defaultTestResult },
            gerberLiftOff: { ...defaultTestResult },
            napoleon: { ...defaultTestResult },
        },
        instability: {
            aprension: { ...defaultTestResult },
            cajonAnterior: { ...defaultTestResult },
            signoSurco: { ...defaultTestResult },
        },
        acromioclavicularJoint: {
            palpacionAAC: { ...defaultTestResult },
            obrien: { ...defaultTestResult },
        },
        cervicalRadiculopathy: {
            spurling: { ...defaultTestResult },
            distraccion: { ...defaultTestResult },
            tensionMMSS: { ...defaultTestResult },
        },
    };
    
    return {
        firstName: 'Nuevo',
        lastName: 'Paciente',
        birthDate: '',
        idNumber: '',
        insurance: '',
        address: '',
        phone: '',
        medicalDiagnosis: '',
        referringDoctor: '',
        injuryDate: '',
        injuryCause: '',
        surgicalHistory: '',
        nationality: '',
        civilStatus: '',
        location: '',
        city: '',
        kinesiologist: '',
        firstMedicalAttentionDate: '',
        firstMedicalAttentionPlace: '',
        lesionMechanism: '',
        studies: '',
        internationDays: '',
        osteosynthesisAndImmobilization: '',
        dominantHand: '',
        occupation: '',
        workHours: '',
        occupationAnalysis: '',
        hobbies: '',
        hobbyFrequency: '',
        medications: [],
        habits: {
            tobacco: { quantity: '', frequency: '' },
            alcohol: { type: '', quantity: '', frequency: '' },
        },
        riskFactors: {
          associatedDiseases: [],
          menopause: false,
          osteopenia: false,
          dmo: false,
          lastDmo: '',
          frequentFalls: false,
          fallsLast6Months: '',
          barbiturates: false,
          neoplasms: false,
          infections: false,
          sncDisease: false,
          vascularDisease: false,
          diabetes: false,
          dsr: false,
          hypothyroidism: false,
          hyperthyroidism: false,
          hyperlipidemia: false,
          dupuytren: false,
          sweatyHands: false,
          fallLocation: '',
          posturalAlterations: false,
          gaitAlteration: false,
          associatedMuscleWeakness: false,
          decreasedReflexes: false,
          visualAlterations: false,
          tugTestSeconds: '',
        },
        physicalExam: {
            generalObservations: '',
            inspectionNotes: '',
            palpationAndSymptomsNotes: '',
            muscleChains: '',
            rom: [
              { id: '1', type: 'active', elevation: '', elevationEva: '', geb1: '', geb1Eva: '', geb2: '', geb2Eva: '' },
              { id: '2', type: 'passive', elevation: '', elevationEva: '', geb1: '', geb1Eva: '', geb2: '', geb2Eva: '' }
            ],
            romObservations: '',
        },
        functionalEvaluation: {
            combingHair: { ...defaultCifActivity },
            washingBack: { ...defaultCifActivity },
            reachingHighShelf: { ...defaultCifActivity },
            fasteningBehindBack: { ...defaultCifActivity },
            puttingOnJacket: { ...defaultCifActivity },
            carryingHeavyObject: { ...defaultCifActivity },
            sleepingOnAffectedSide: { ...defaultCifActivity },
            specificLimitedActivities: '',
            environmentalFactors: '',
            personalFactors: '',
        },
        studiesAndEvolution: {
            shoulderRx: '',
            cervicalRx: '',
            otherStudies: '',
            media: [],
        },
        specificTests: defaultSpecificTestsData,
        customTests: [],
        customScales: [],
        flags: {
            red: '',
            orange: '',
            yellow: '',
            blue: '',
            black: '',
            pink: '',
        },
        presumptiveDiagnosis: '',
        diagnosticHypothesis: '',
        finalSummary: '',
        aiAnalysis: null,
    };
};


export async function createPatient(): Promise<Patient> {
  const newPatient: Patient = {
    id: Date.now().toString(),
// FIX: Corrected duplicate 'new' keyword.
    createdAt: new Date().toISOString(),
    status: 'In Progress',
    ...createDefaultPatientData(),
  };
  return await savePatient(newPatient);
}

export async function deletePatient(patientId: string): Promise<void> {
    let patients = await getPatients();
    patients = patients.filter(p => p.id !== patientId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(patients));
}


// --- Export / Import / Download Features ---

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

const riskFactorLabels: { [key: string]: string } = {
    menopause: "Menopausia",
    osteopenia: "Osteopenia/porosis",
    dmo: "DMO",
    frequentFalls: "Caídas Frecuentes",
    barbiturates: "Barbitúricos",
    neoplasms: "Neoplasias",
    infections: "Infecciones",
    sncDisease: "Enf. del SNC/Periféricas",
    vascularDisease: "Alt/Qx Vascular",
    diabetes: "Diabetes",
    dsr: "DSR",
    hypothyroidism: "Hipotiroidismo",
    hyperthyroidism: "Hipertiroidismo",
    hyperlipidemia: "Hiperlipidemia",
    dupuytren: "Dupuytren",
    sweatyHands: "Manos Transpiran"
};

const flagLabels: { [key: string]: string } = {
    red: "Bandera Roja",
    orange: "Bandera Naranja",
    yellow: "Bandera Amarilla",
    blue: "Bandera Azul",
    black: "Bandera Negra",
    pink: "Bandera Rosa",
};

const shoulderActivityLabels: { [key in keyof Omit<Patient['functionalEvaluation'], 'specificLimitedActivities' | 'environmentalFactors' | 'personalFactors'>]: string } = {
    combingHair: "Peinarse o lavarse el pelo",
    washingBack: "Lavarse la espalda",
    reachingHighShelf: "Alcanzar un objeto en un estante alto",
    fasteningBehindBack: "Abrocharse por la espalda",
    puttingOnJacket: "Ponerse una chaqueta o abrigo",
    carryingHeavyObject: "Llevar un objeto pesado (ej. bolsa)",
    sleepingOnAffectedSide: "Dormir sobre el lado afectado",
};

function formatPatientDataForDoc(patient: Patient): string {
    const field = (label: string, value: any) => value || value === 0 ? `<li><strong>${label}:</strong> ${value}</li>` : '';
    const section = (title: string, content: string) => content.trim() ? `<h2>${title}</h2><ul>${content}</ul>` : '';
    const sectionRaw = (title: string, content: string) => content.trim() ? `<h2>${title}</h2><div>${content}</div>` : '';

    // Personal Data
    const personalData = `
        ${field('Apellido', patient.lastName)}
        ${field('Nombres', patient.firstName)}
        ${field('Fecha de Nacimiento', patient.birthDate)}
        ${field('Edad', getAge(patient.birthDate))}
        ${field('Nacionalidad', patient.nationality)}
        ${field('Estado Civil', patient.civilStatus)}
        ${field('DNI/LC/LE/CI', patient.idNumber)}
        ${field('Obra Social', patient.insurance)}
        ${field('Domicilio', patient.address)}
        ${field('Localidad', patient.location)}
        ${field('Partido', patient.city)}
        ${field('Teléfono', patient.phone)}
    `;

    // Anamnesis
    const anamnesisData = `
        ${field('Diagnóstico Médico', patient.medicalDiagnosis)}
        ${field('Médico Derivante', patient.referringDoctor)}
        ${field('Kinesiólogo', patient.kinesiologist)}
        ${field('Fecha de Lesión', patient.injuryDate)}
        ${field('Causa', patient.injuryCause)}
        ${field('Fecha 1ra Atención Médica', patient.firstMedicalAttentionDate)}
        ${field('Lugar 1ra Atención Médica', patient.firstMedicalAttentionPlace)}
        ${field('MMSS Dominante', patient.dominantHand)}
    `;
    
    // Fall History
    const { riskFactors } = patient;
    const observedAlterations = [
        riskFactors.posturalAlterations && 'Alteraciones posturales',
        riskFactors.gaitAlteration && 'Alteración de la marcha',
        riskFactors.associatedMuscleWeakness && 'Debilidad muscular asociada',
        riskFactors.decreasedReflexes && 'Disminución de los reflejos',
        riskFactors.visualAlterations && 'Alteraciones visuales',
    ].filter(Boolean).join(', ');

    const fallHistoryData = `
        ${field('Cantidad de caídas (últimos 6 meses)', riskFactors.fallsLast6Months)}
        ${field('Lugar de la caída', `<br>${riskFactors.fallLocation?.replace(/\n/g, '<br>')}`)}
        ${field('Resultado Test "Get Up and Go" (TUG)', riskFactors.tugTestSeconds ? `${riskFactors.tugTestSeconds} seg.` : '')}
        ${field('Alteraciones observadas', observedAlterations || 'Ninguna registrada')}
    `;
    
    // Occupation
    const occupationData = `
      ${field('Ocupación', patient.occupation)}
      ${field('Horas de Trabajo', patient.workHours)}
      ${field('Análisis Ocupacional (Posturas, herramientas, gestos repetitivos)', `<br>${patient.occupationAnalysis?.replace(/\n/g, '<br>')}`)}
    `;

    // Hobbies
    const hobbiesData = `
      ${field('Hobby / Deporte', patient.hobbies)}
      ${field('Frecuencia Semanal', patient.hobbyFrequency)}
    `;

    // Past Treatments
    const treatmentsData = `
        ${field('RX/TAC/RMN/QX?', patient.studies)}
        ${field('Días de Internación', patient.internationDays)}
        ${field('Osteosíntesis y Movilizaciones', `<br>${patient.osteosynthesisAndImmobilization?.replace(/\n/g, '<br>')}`)}
        ${field('Antecedentes Clínico-Quirúrgicos', `<br>${patient.surgicalHistory?.replace(/\n/g, '<br>')}`)}
    `;

    // Medication
    const medicationData = (patient.medications || [])
        .map(med => `<li><strong>${med.name || 'Medicamento sin nombre'}:</strong> ${med.dose || 'N/A'} - ${med.frequency || 'N/A'}</li>`)
        .join('');

    // Habits
    const habitsData = `
        ${field('Tabaco', `${patient.habits?.tobacco?.quantity || 'No'} (${patient.habits?.tobacco?.frequency || 'N/A'})`)}
        ${field('Alcohol', `${patient.habits?.alcohol?.type || 'No'}: ${patient.habits?.alcohol?.quantity || 'N/A'} (${patient.habits?.alcohol?.frequency || 'N/A'})`)}
    `;

    // Risk Factors
    const associatedDiseases = (patient.riskFactors.associatedDiseases || [])
        .map(d => `<li>${d.name}</li>`).join('');
    const riskFactorsList = Object.entries(patient.riskFactors)
        .filter(([key, value]) => value === true && riskFactorLabels[key])
        .map(([key]) => `<li>${riskFactorLabels[key]}</li>`).join('');
    const riskFactorsData = `
        ${(patient.riskFactors.associatedDiseases?.length > 0) ? `<li><strong>Enfermedades Asociadas:</strong><ul>${associatedDiseases}</ul></li>` : ''}
        ${riskFactorsList}
        ${field('Última DMO', patient.riskFactors.lastDmo)}
    `;
    
    // Physical Exam
    const generalObservationsData = `<p>${patient.physicalExam.generalObservations?.replace(/\n/g, '<br>') || 'No especificado'}</p>`;
    const inspectionData = `<p>${patient.physicalExam.inspectionNotes?.replace(/\n/g, '<br>') || 'No especificado'}</p>`;
    const palpationData = `<p>${patient.physicalExam.palpationAndSymptomsNotes?.replace(/\n/g, '<br>') || 'No especificado'}</p>`;

    // ROM Table
    const romTable = `
        <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
            <thead>
                <tr style="background-color: #f2f2f2;">
                    <th>Tipo</th>
                    <th>Elevación Anterior (°)</th>
                    <th>EVA</th>
                    <th>GEB1</th>
                    <th>EVA</th>
                    <th>GEB2</th>
                    <th>EVA</th>
                </tr>
            </thead>
            <tbody>
                ${patient.physicalExam.rom.map(entry => `
                    <tr>
                        <td>${entry.type === 'active' ? 'Activo' : 'Pasivo'}</td>
                        <td>${entry.elevation || ''}</td>
                        <td>${entry.elevationEva || ''}</td>
                        <td>${entry.geb1 || ''}</td>
                        <td>${entry.geb1Eva || ''}</td>
                        <td>${entry.geb2 || ''}</td>
                        <td>${entry.geb2Eva || ''}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    const physicalExamData = `
      <h3>Observaciones Generales del Paciente</h3>
      ${generalObservationsData}
      <h3>Inspección</h3>
      ${inspectionData}
      <h3>Palpación y Síntomas</h3>
      ${palpationData}
      <h3>Rango de Movimiento (ROM) y Dolor</h3>
      ${romTable}
      <h4>Observaciones de ROM (compensaciones, ritmo escápulo humeral)</h4>
      <p>${patient.physicalExam.romObservations?.replace(/\n/g, '<br>') || 'No especificado'}</p>
      <h3>Cadenas Musculares</h3>
      <p>${patient.physicalExam.muscleChains?.replace(/\n/g, '<br>') || 'No especificado'}</p>
    `;

    // Functional Evaluation
    const functionalEvalData = (Object.keys(shoulderActivityLabels) as Array<keyof typeof shoulderActivityLabels>)
        .map(key => {
            const activity = patient.functionalEvaluation[key];
            if (activity && activity.qualifier !== 'No aplicable' && activity.qualifier !== 'Sin dificultad') {
                return field(shoulderActivityLabels[key], activity.qualifier);
            }
            return '';
        })
        .join('');

    const contextualFactorsData = `
        ${field('Otras actividades específicas limitadas (laboral, deporte)', `<br>${patient.functionalEvaluation.specificLimitedActivities?.replace(/\n/g, '<br>')}`)}
        ${field('Factores Ambientales (e)', `<br>${patient.functionalEvaluation.environmentalFactors?.replace(/\n/g, '<br>')}`)}
        ${field('Factores Personales', `<br>${patient.functionalEvaluation.personalFactors?.replace(/\n/g, '<br>')}`)}
    `;

    // Flags
    const flagsData = Object.entries(patient.flags || {})
        .filter(([, value]) => value)
        .map(([key, value]) => field(flagLabels[key] || key, `<br>${String(value).replace(/\n/g, '<br>')}`))
        .join('');
    
    const customTestsData = (patient.customTests || [])
        .map(test => field(test.name, test.result))
        .join('');
        
    const customScalesData = (patient.customScales || [])
        .map(scale => field(scale.name, scale.score))
        .join('');

    const diagnosticHypothesisData = `<p>${patient.diagnosticHypothesis?.replace(/\n/g, '<br>') || 'No especificado'}</p>`;
    const presumptiveDiagnosisData = `<p>${patient.presumptiveDiagnosis?.replace(/\n/g, '<br>') || 'No especificado'}</p>`;
    const finalSummaryData = `<p>${patient.finalSummary?.replace(/\n/g, '<br>') || 'No especificado'}</p>`;

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Ficha de Paciente</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
                h2 { color: #3498db; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-top: 30px;}
                h3 { color: #2980b9; margin-top: 20px;}
                h4 { color: #34495e; margin-top: 15px; }
                ul { list-style-type: none; padding-left: 0; }
                li { margin-bottom: 8px; }
                strong { color: #555; }
                table { border-collapse: collapse; width: 100%; margin-top: 15px; }
                th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
            </style>
        </head>
        <body>
            <h1>Ficha de Paciente: ${patient.firstName} ${patient.lastName}</h1>
            ${section('Datos Personales', personalData)}
            ${section('Anamnesis de la Lesión', anamnesisData)}
            ${section('Antecedentes de Caídas', fallHistoryData)}
            ${section('Ocupación', occupationData)}
            ${section('Hobbys y Deporte', hobbiesData)}
            ${section('Antecedentes y Tratamientos Previos', treatmentsData)}
            ${section('Medicación', medicationData)}
            ${section('Hábitos', habitsData)}
            ${section('Factores de Riesgo y Comorbilidades', riskFactorsData)}
            <h2>Examen Físico</h2>
            ${physicalExamData}
            ${section('Evaluación Funcional (Limitaciones en AVD)', functionalEvalData)}
            ${section('Factores Contextuales', contextualFactorsData)}
            ${section('Banderas de Alerta', flagsData)}
            ${section('Pruebas Específicas Adicionales', customTestsData)}
            ${section('Escalas Tomadas', customScalesData)}
            ${sectionRaw('Hipótesis de Diagnóstico', diagnosticHypothesisData)}
            ${sectionRaw('Diagnóstico Presuntivo', presumptiveDiagnosisData)}
            ${sectionRaw('Resumen Final y Justificación', finalSummaryData)}
        </body>
        </html>
    `;

    return html;
}

export function downloadPatientAsDoc(patient: Patient): void {
    const htmlContent = formatPatientDataForDoc(patient);
    const fileName = `Ficha - ${patient.firstName || 'Sin'} ${patient.lastName || 'Nombre'} - ${new Date().toISOString().split('T')[0]}.doc`;
    
    const blob = new Blob(['\ufeff', htmlContent], {
        type: 'application/msword;charset=utf-8'
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

export function downloadPatientAsXlsx(patient: Patient): void {
    const data: (string | number | undefined)[][] = [];

    const addSection = (title: string) => {
        data.push([]); // Spacer
        data.push([title.toUpperCase()]);
    };
    const addField = (label: string, value: any) => {
        if (value || value === 0) data.push([label, String(value)]);
    };

    data.push(['FICHA DE PACIENTE']);
    addField('Nombre Completo', `${patient.firstName} ${patient.lastName}`);
    
    addSection('Datos Personales');
    addField('Apellido', patient.lastName);
    addField('Nombres', patient.firstName);
    addField('Fecha de Nacimiento', patient.birthDate);
    addField('Edad', getAge(patient.birthDate));
    addField('Nacionalidad', patient.nationality);
    addField('Estado Civil', patient.civilStatus);
    addField('DNI/LC/LE/CI', patient.idNumber);
    addField('Obra Social', patient.insurance);
    addField('Domicilio', patient.address);
    addField('Localidad', patient.location);
    addField('Partido', patient.city);
    addField('Teléfono', patient.phone);

    addSection('Anamnesis de la Lesión');
    addField('Diagnóstico Médico', patient.medicalDiagnosis);
    addField('Médico Derivante', patient.referringDoctor);
    addField('Kinesiólogo', patient.kinesiologist);
    addField('Fecha de Lesión', patient.injuryDate);
    addField('Causa', patient.injuryCause);
    addField('Fecha 1ra Atención Médica', patient.firstMedicalAttentionDate);
    addField('Lugar 1ra Atención Médica', patient.firstMedicalAttentionPlace);
    addField('MMSS Dominante', patient.dominantHand);

    addSection('Antecedentes de Caídas');
    const { riskFactors } = patient;
    addField('Cantidad de caídas (últimos 6 meses)', riskFactors.fallsLast6Months);
    addField('Lugar de la caída', riskFactors.fallLocation);
    addField('Resultado Test "Get Up and Go" (TUG) en segundos', riskFactors.tugTestSeconds);
    if (riskFactors.posturalAlterations) addField('Alteraciones posturales', 'Sí');
    if (riskFactors.gaitAlteration) addField('Alteración de la marcha', 'Sí');
    if (riskFactors.associatedMuscleWeakness) addField('Debilidad muscular asociada', 'Sí');
    if (riskFactors.decreasedReflexes) addField('Disminución de los reflejos', 'Sí');
    if (riskFactors.visualAlterations) addField('Alteraciones visuales', 'Sí');
    
    addSection('Ocupación');
    addField('Ocupación', patient.occupation);
    addField('Horas de Trabajo', patient.workHours);
    addField('Análisis Ocupacional (Posturas, herramientas, gestos repetitivos)', patient.occupationAnalysis);
    
    addSection('Hobbys y Deporte');
    addField('Hobby / Deporte', patient.hobbies);
    addField('Frecuencia Semanal', patient.hobbyFrequency);

    addSection('Antecedentes y Tratamientos Previos');
    addField('RX/TAC/RMN/QX?', patient.studies);
    addField('Días de Internación', patient.internationDays);
    addField('Osteosíntesis y Movilizaciones Realizadas', patient.osteosynthesisAndImmobilization);
    addField('Antecedentes Clínico-Quirúrgicos', patient.surgicalHistory);

    addSection('Medicación');
    data.push(['Nombre', 'Dosis', 'Frecuencia']);
    (patient.medications || []).forEach(med => {
        data.push([med.name, med.dose, med.frequency]);
    });

    addSection('Hábitos');
    addField('Tabaco - Cantidad', patient.habits?.tobacco?.quantity);
    addField('Tabaco - Frecuencia', patient.habits?.tobacco?.frequency);
    addField('Alcohol - Tipo', patient.habits?.alcohol?.type);
    addField('Alcohol - Cantidad', patient.habits?.alcohol?.quantity);
    addField('Alcohol - Frecuencia', patient.habits?.alcohol?.frequency);

    addSection('Factores de Riesgo y Comorbilidades');
    data.push(['Enfermedades Asociadas']);
    (patient.riskFactors.associatedDiseases || []).forEach(d => data.push([d.name]));
    Object.entries(patient.riskFactors).filter(([, value]) => value === true).forEach(([key]) => {
        if (riskFactorLabels[key]) addField(riskFactorLabels[key], 'Sí');
    });
    addField('Última DMO', patient.riskFactors.lastDmo);

    addSection('Examen Físico');
    data.push(['Observaciones Generales del Paciente']);
    addField('Notas', patient.physicalExam.generalObservations);
    data.push([]);
    data.push(['Inspección']);
    addField('Notas de Inspección', patient.physicalExam.inspectionNotes);
    data.push([]);
    data.push(['Palpación y Síntomas']);
    addField('Notas de Palpación y Síntomas', patient.physicalExam.palpationAndSymptomsNotes);
    
    data.push([]);
    data.push(['Rango de Movimiento (ROM)']);
    data.push(['Tipo', 'Elevación Anterior (°)', 'EVA', 'GEB1', 'EVA', 'GEB2', 'EVA']);
    patient.physicalExam.rom.forEach(entry => {
        data.push([
            entry.type === 'active' ? 'Activo' : 'Pasivo',
            entry.elevation,
            entry.elevationEva,
            entry.geb1,
            entry.geb1Eva,
            entry.geb2,
            entry.geb2Eva,
        ]);
    });
    addField('Observaciones de ROM (compensaciones, ritmo escápulo humeral)', patient.physicalExam.romObservations);
    data.push([]);
    addField('Cadenas Musculares Acortadas', patient.physicalExam.muscleChains);

    addSection('Evaluación Funcional (Limitaciones en AVD)');
    (Object.keys(shoulderActivityLabels) as Array<keyof typeof shoulderActivityLabels>).forEach(key => {
        const activity = patient.functionalEvaluation[key];
        if (activity && activity.qualifier !== 'No aplicable') {
            addField(shoulderActivityLabels[key], activity.qualifier);
        }
    });

    addSection('Factores Contextuales y Actividades Específicas');
    addField('Otras actividades específicas limitadas (laboral, deporte)', patient.functionalEvaluation.specificLimitedActivities);
    addField('Factores Ambientales (e)', patient.functionalEvaluation.environmentalFactors);
    addField('Factores Personales', patient.functionalEvaluation.personalFactors);
    
    addSection('Banderas de Alerta');
    Object.entries(patient.flags || {}).filter(([,value]) => value).forEach(([key, value]) => {
        addField(flagLabels[key] || key, value);
    });

    addSection('Pruebas Específicas Adicionales');
    (patient.customTests || []).forEach(test => addField(test.name, test.result));

    addSection('Escalas Tomadas');
    (patient.customScales || []).forEach(scale => addField(scale.name, scale.score));

    addSection('Diagnóstico y Resumen');
    addField('Hipótesis de Diagnóstico', patient.diagnosticHypothesis);
    addField('Diagnóstico Presuntivo (IA)', patient.presumptiveDiagnosis);
    addField('Resumen Final y Justificación', patient.finalSummary);
    
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ficha Paciente');

    // Adjust column widths
    const colWidths = [{ wch: 40 }, { wch: 80 }];
    worksheet['!cols'] = colWidths;

    const fileName = `Ficha - ${patient.firstName || 'Sin'} ${patient.lastName || 'Nombre'} - ${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
}


export async function exportAllPatients(): Promise<void> {
    const patients = await getPatients();
    const dataStr = JSON.stringify(patients, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `asistente-clinico-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export function importPatients(file: File): Promise<Patient[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target?.result;
                if (typeof text !== 'string') {
                    throw new Error("File content is not readable text.");
                }
                const patients = JSON.parse(text);
                // Basic validation
                if (!Array.isArray(patients) || (patients.length > 0 && !patients[0].id)) {
                    throw new Error("Invalid backup file format.");
                }
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(patients));
                resolve(patients);
            } catch (e) {
                console.error("Failed to parse or import backup file", e);
                reject(e);
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
}