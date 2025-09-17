export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export interface Message {
  role: Role;
  content: string;
}

// --- Physical Exam Data Structure ---
export interface RangeOfMotionEntry {
  id: string;
  type: 'active' | 'passive';
  elevation: string;
  geb1: string;
  geb2: string;
  scapularHumeralRhythm: string;
}

export interface PhysicalExam {
  inspection: {
    attitude: string;
    deformities: string;
    bonyProminences: string;
    muscleAtrophy: string;
    edema: string;
  };
  palpation: {
    hematoma: string;
    palpatedPain: string;
    referredPain: string;
  };
  symptoms: {
    paresthesias: string;
    crepitations: string;
  };
  muscleChains: string;
  rom: RangeOfMotionEntry[];
}


// --- Studies and Evolution Data Structure ---
export interface MediaFile {
  id: string;
  name: string;
  type: string;
  dataUrl: string;
}

export interface StudiesAndEvolution {
  shoulderRx: string;
  cervicalRx: string;
  otherStudies: string;
  media: MediaFile[];
}

// --- Functional Evaluation (CIF) Data Structure ---
export type CifQualifier = 'Sin dificultad' | 'Dificultad ligera' | 'Dificultad moderada' | 'Dificultad grave' | 'Dificultad completa' | 'No aplicable';

export interface CifActivity {
  qualifier: CifQualifier;
  details: string;
}

export interface FunctionalEvaluation {
  // Movilidad
  changingAndMaintainingBodyPosition: CifActivity;
  carryingMovingObjects: CifActivity;
  walkingAndMoving: CifActivity;
  
  // Autocuidado
  washingOneself: CifActivity;
  caringForBodyParts: CifActivity;
  dressing: CifActivity;

  // Vida doméstica
  preparingMeals: CifActivity;
  doingHousework: CifActivity;

  // Áreas principales de la vida
  workAndEmployment: CifActivity;

  // Vida comunitaria, social y cívica
  recreationAndLeisure: CifActivity;
}

// FIX: Add types for specific tests to resolve errors in SpecificTestsTab.tsx.
// --- Specific Tests Data Structure ---
export type TestResultValue = 'No realizado' | 'Positivo' | 'Negativo';

export interface TestResult {
  result: TestResultValue;
}

export interface SpecificTestsCategory {
  [testId: string]: TestResult;
}

export interface SpecificTests {
  subacromialConflict: SpecificTestsCategory;
  rotatorCuff: SpecificTestsCategory;
  instability: SpecificTestsCategory;
  acromioclavicularJoint: SpecificTestsCategory;
  cervicalRadiculopathy: SpecificTestsCategory;
}

// Custom Tests added by user
export interface CustomTestResult {
  id: string;
  name: string;
  result: 'Positivo' | 'Negativo' | 'No realizado';
}

// --- Main Patient Interface ---
export interface Patient {
  id: string;
  
  // Personal Data
  lastName: string;
  firstName: string;
  birthDate: string;
  nationality: string;
  civilStatus: string;
  idNumber: string;
  insurance: string;
  address: string;
  location: string;
  city: string;
  phone: string;
  
  // Anamnesis
  previousActivities: string;
  currentActivities: string;
  previousSports: string;
  currentSports: string;
  medicalDiagnosis: string;
  referringDoctor: string;
  kinesiologist: string;
  injuryDate: string;
  injuryCause: string;
  firstMedicalAttentionDate: string;
  firstMedicalAttentionPlace: string;
  lesionMechanism: string;
  studies: string;
  internationDays: string;
  firstOsteosynthesis: string;
  firstImmobilization: string;
  secondOsteosynthesis: string;
  secondImmobilization: string;
  dominantHand: 'derecho' | 'izquierdo' | '';
  surgicalHistory: string;
  painMedication: string;
  painMedicationType: string;
  painMedicationFrequency: string;
  extraMedication: string;
  
  // Risk Factors
  riskFactors: {
    menopause: boolean;
    osteopenia: boolean;
    dmo: boolean;
    lastDmo: string;
    frequentFalls: boolean;
    fallsLast6Months: string;
    smoking: boolean;
    alcoholism: boolean;
    barbiturates: boolean;
    neoplasms: boolean;
    homolateralFx: boolean;
    infections: boolean;
    sncDisease: boolean;
    vascularDisease: boolean;
    diabetes: boolean;
    dsr: boolean;
    hypothyroidism: boolean;
    hyperthyroidism: boolean;
    hyperlipidemia: boolean;
    dupuytren: boolean;
    sweatyHands: boolean;
  };

  physicalExam: PhysicalExam;
  functionalEvaluation: FunctionalEvaluation;
  studiesAndEvolution: StudiesAndEvolution;
  specificTests: SpecificTests;
  customTests: CustomTestResult[];
  presumptiveDiagnosis: string;
  finalSummary: string;
  aiAnalysis: string | null;
  
  createdAt: string;
  status: 'In Progress' | 'Completed';
}