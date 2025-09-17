
import React, { useState } from 'react';
import PatientFile from './components/ChatInterface';
import Header from './components/Header';
import PatientDirectory from './components/PatientList';
import { createPatient } from './services/patientService';
import type { Patient } from './types';
import WelcomeScreen from './components/WelcomeScreen';

function App() {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);

  const handleBackToDirectory = () => {
    setSelectedPatientId(null);
  };

  const handleContinueFromWelcome = () => {
    setShowWelcomeScreen(false);
  };
  
  const handleGoToWelcome = () => {
    setShowWelcomeScreen(true);
  };

  const handleNewPatient = async () => {
    try {
        const newPatient = await createPatient();
        setSelectedPatientId(newPatient.id);
    } catch(e) {
        console.error("Failed to create new patient", e);
        alert("No se pudo crear el nuevo paciente.");
    }
  }

  const renderContent = () => {
    if (showWelcomeScreen) {
      return <WelcomeScreen />;
    }

    if (selectedPatientId) {
      return (
        <PatientFile 
          patientId={selectedPatientId} 
          onBack={handleBackToDirectory}
        />
      );
    }
    
    return <PatientDirectory onSelectPatient={setSelectedPatientId} onNewPatient={handleNewPatient}/>;
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 text-slate-800">
      <Header 
        onNewPatient={handleNewPatient}
        onGoToDirectory={handleBackToDirectory}
        onGoToWelcome={handleGoToWelcome}
        isPatientSelected={!!selectedPatientId}
        showControls={!showWelcomeScreen}
        onStartEvaluation={handleContinueFromWelcome}
      />
      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
