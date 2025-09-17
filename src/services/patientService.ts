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
    const defaultCifActivity = { qualifier: 'No aplicable' as const, details: '' };
    // FIX: Add default data for specific tests.
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
        previousActivities: '',
        currentActivities: '',
        previousSports: '',
        currentSports: '',
        kinesiologist: '',
        firstMedicalAttentionDate: '',
        firstMedicalAttentionPlace: '',
        lesionMechanism: '',
        studies: '',
        internationDays: '',
        firstOsteosynthesis: '',
        firstImmobilization: '',
        secondOsteosynthesis: '',
        secondImmobilization: '',
        dominantHand: '',
        painMedication: '',
        painMedicationType: '',
        painMedicationFrequency: '',
        extraMedication: '',
        riskFactors: {
          menopause: false,
          osteopenia: false,
          dmo: false,
          lastDmo: '',
          frequentFalls: false,
          fallsLast6Months: '',
          smoking: false,
          alcoholism: false,
          barbiturates: false,
          neoplasms: false,
          homolateralFx: false,
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
        },
        physicalExam: {
            inspection: { attitude: '', deformities: '', bonyProminences: '', muscleAtrophy: '', edema: '' },
            palpation: { hematoma: '', palpatedPain: '', referredPain: '' },
            symptoms: { paresthesias: '', crepitations: '' },
            muscleChains: '',
            rom: [{ id: '1', type: 'active', elevation: '', geb1: '', geb2: '', scapularHumeralRhythm: '' }, { id: '2', type: 'passive', elevation: '', geb1: '', geb2: '', scapularHumeralRhythm: '' }],
        },
        functionalEvaluation: {
            changingAndMaintainingBodyPosition: { ...defaultCifActivity },
            carryingMovingObjects: { ...defaultCifActivity },
            walkingAndMoving: { ...defaultCifActivity },
            washingOneself: { ...defaultCifActivity },
            caringForBodyParts: { ...defaultCifActivity },
            dressing: { ...defaultCifActivity },
            preparingMeals: { ...defaultCifActivity },
            doingHousework: { ...defaultCifActivity },
            workAndEmployment: { ...defaultCifActivity },
            recreationAndLeisure: { ...defaultCifActivity },
        },
        studiesAndEvolution: {
            shoulderRx: '',
            cervicalRx: '',
            otherStudies: '',
            media: [],
        },
        specificTests: defaultSpecificTestsData,
        customTests: [],
        presumptiveDiagnosis: '',
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
    smoking: "Tabaquismo",
    alcoholism: "Alcoholismo",
    barbiturates: "Barbitúricos",
    neoplasms: "Neoplasias",
    homolateralFx: "Fx Hombro Homolateral",
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

function formatPatientDataForDoc(patient: Patient): string {
    const field = (label: string, value: any) => value ? `<li><strong>${label}:</strong> ${value}</li>` : '';
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
        ${field('Actividades Anteriores', `<br>${patient.previousActivities?.replace(/\n/g, '<br>')}`)}
        ${field('Actividades Actuales', `<br>${patient.currentActivities?.replace(/\n/g, '<br>')}`)}
        ${field('Deportes Anteriores', patient.previousSports)}
        ${field('Deportes Actuales', patient.currentSports)}
        ${field('MMSS Dominante', patient.dominantHand)}
    `;

    // Past Treatments
    const treatmentsData = `
        ${field('RX/TAC/RMN/QX?', patient.studies)}
        ${field('Días de Internación', patient.internationDays)}
        ${field('1ra Osteosíntesis y 1ra Inmovilización', `<br>${patient.firstOsteosynthesis?.replace(/\n/g, '<br>')}`)}
        ${field('2da Osteosíntesis y 2da Inmovilización', `<br>${patient.secondOsteosynthesis?.replace(/\n/g, '<br>')}`)}
        ${field('Antecedentes Clínico-Quirúrgicos', `<br>${patient.surgicalHistory?.replace(/\n/g, '<br>')}`)}
    `;

    // Medication
    const medicationData = `
        ${field('Medicación contra dolor', patient.painMedication)}
        ${field('Tipo', patient.painMedicationType)}
        ${field('Frecuencia', patient.painMedicationFrequency)}
        ${field('Medicación extra', patient.extraMedication)}
    `;

    // Risk Factors
    const riskFactorsList = Object.entries(patient.riskFactors)
        .filter(([key, value]) => value === true && riskFactorLabels[key])
        .map(([key]) => `<li>${riskFactorLabels[key]}</li>`).join('');
    const riskFactorsData = `
        ${riskFactorsList}
        ${field('Última DMO', patient.riskFactors.lastDmo)}
        ${field('Caídas últimos 6 meses', patient.riskFactors.fallsLast6Months)}
    `;

    // Physical Exam - Inspection
    const inspectionData = `
        ${field('Actitud del Miembro Superior', patient.physicalExam.inspection.attitude)}
        ${field('Deformidades', patient.physicalExam.inspection.deformities)}
        ${field('Prominencias Óseas', patient.physicalExam.inspection.bonyProminences)}
        ${field('Atrofias Musculares', patient.physicalExam.inspection.muscleAtrophy)}
        ${field('Edema', patient.physicalExam.inspection.edema)}
    `;

    // Physical Exam - Palpation
    const palpationData = `
        ${field('H (Hematoma)', patient.physicalExam.palpation.hematoma)}
        ${field('X (Dolor Palpado)', patient.physicalExam.palpation.palpatedPain)}
        ${field('x (Dolor Referido)', patient.physicalExam.palpation.referredPain)}
        ${field('Parestesias', patient.physicalExam.symptoms.paresthesias)}
        ${field('Crepitaciones', patient.physicalExam.symptoms.crepitations)}
    `;

    // ROM Table
    const romTable = `
        <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
            <thead>
                <tr style="background-color: #f2f2f2;">
                    <th>Tipo</th>
                    <th>Elevación Anterior (°)</th>
                    <th>GEB1</th>
                    <th>GEB2</th>
                    <th>Ritmo Escápulo-Humeral</th>
                </tr>
            </thead>
            <tbody>
                ${patient.physicalExam.rom.map(entry => `
                    <tr>
                        <td>${entry.type === 'active' ? 'Activo' : 'Pasivo'}</td>
                        <td>${entry.elevation || ''}</td>
                        <td>${entry.geb1 || ''}</td>
                        <td>${entry.geb2 || ''}</td>
                        <td>${entry.scapularHumeralRhythm || ''}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    const physicalExamData = `
      <h3>Inspección</h3>
      <ul>${inspectionData}</ul>
      <h3>Palpación y Síntomas</h3>
      <ul>${palpationData}</ul>
      <h3>Rango de Movimiento (ROM) y Dolor</h3>
      ${romTable}
      <h3>Cadenas Musculares</h3>
      <p>${patient.physicalExam.muscleChains?.replace(/\n/g, '<br>') || 'No especificado'}</p>
    `;

    const customTestsData = (patient.customTests || [])
        .map(test => field(test.name, test.result))
        .join('');
        
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
            ${section('Antecedentes y Tratamientos Previos', treatmentsData)}
            ${section('Medicación', medicationData)}
            ${section('Factores de Riesgo y Comorbilidades', riskFactorsData)}
            <h2>Examen Físico</h2>
            ${physicalExamData}
            ${section('Pruebas Específicas Adicionales', customTestsData)}
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