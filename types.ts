// FIX: Add UserProfile interface for Google authentication.
export interface UserProfile {
  name: string;
  email: string;
  picture: string;
}

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
  elevationEva: string;
  geb1: string;
  geb1Eva: string;
  geb2: string;
  geb2Eva: string;
}

export interface PhysicalExam {
  generalObservations: string;
  inspectionNotes: string;
  palpationAndSymptomsNotes: string;
  muscleChains: string;
  rom: RangeOfMotionEntry[];
  romObservations: string;
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
  details: string; // Kept for data structure consistency, but UI might not use it.
}

export interface FunctionalEvaluation {
  // Actividades y Participación (d) - Limitaciones en AVD
  combingHair: CifActivity;
  washingBack: CifActivity;
  reachingHighShelf: CifActivity;
  fasteningBehindBack: CifActivity;
  puttingOnJacket: CifActivity;
  carryingHeavyObject: CifActivity;
  sleepingOnAffectedSide: CifActivity;

  // Contextual Factors and Specific Activities
  specificLimitedActivities: string;
  environmentalFactors: string;
  personalFactors: string;
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

// Custom Scales added by user
export interface CustomScaleResult {
  id: string;
  name: string;
  score: string;
}

// Medication
export interface Medication {
  id: string;
  name: string;
  dose: string;
  frequency: string;
}

// Associated Disease for Risk Factors
export interface AssociatedDisease {
  id: string;
  name: string;
}

// Flags
export interface Flags {
    red: string;
    orange: string;
    yellow: string;
    blue: string;
    black: string;
    pink: string;
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
  occupation: string;
  workHours: string;
  occupationAnalysis: string;
  hobbies: string;
  hobbyFrequency: string;

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
  osteosynthesisAndImmobilization: string;
  dominantHand: 'derecho' | 'izquierdo' | '';
  surgicalHistory: string;
  medications: Medication[];

  // Habits
  habits: {
      tobacco: { quantity: string; frequency: string; };
      alcohol: { type: string; quantity: string; frequency: string; };
  };
  
  // Risk Factors
  riskFactors: {
    associatedDiseases: AssociatedDisease[];
    menopause: boolean;
    osteopenia: boolean;
    dmo: boolean;
    lastDmo: string;
    frequentFalls: boolean;
    fallsLast6Months: string;
    barbiturates: boolean;
    neoplasms: boolean;
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
    // Fall History
    fallLocation: string;
    posturalAlterations: boolean;
    gaitAlteration: boolean;
    associatedMuscleWeakness: boolean;
    decreasedReflexes: boolean;
    visualAlterations: boolean;
    tugTestSeconds: string;
  };

  physicalExam: PhysicalExam;
  functionalEvaluation: FunctionalEvaluation;
  studiesAndEvolution: StudiesAndEvolution;
  specificTests: SpecificTests;
  customTests: CustomTestResult[];
  customScales: CustomScaleResult[];
  flags: Flags;
  presumptiveDiagnosis: string;
  diagnosticHypothesis: string;
  finalSummary: string;
  aiAnalysis: string | null;
  
  createdAt: string;
  status: 'In Progress' | 'Completed';
}