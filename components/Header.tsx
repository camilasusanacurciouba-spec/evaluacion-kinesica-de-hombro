
import React from 'react';
import UserGroupIcon from './icons/UserGroupIcon';
import UserPlusIcon from './icons/UserPlusIcon';

interface HeaderProps {
    onNewPatient: () => void;
    onGoToDirectory: () => void;
    onGoToWelcome: () => void;
    isPatientSelected: boolean;
    showControls: boolean;
    onStartEvaluation?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNewPatient, onGoToDirectory, onGoToWelcome, isPatientSelected, showControls, onStartEvaluation }) => {
  const handleBackClick = isPatientSelected ? onGoToDirectory : onGoToWelcome;
    
  return (
    <header className="bg-white border-b border-slate-200 w-full z-10 shrink-0 shadow-sm">
      <div className="max-w-full mx-auto px-6">
        <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-8">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                    FICHA DE HOMBRO
                </h1>
            </div>
            
            {showControls ? (
              <div className="flex items-center space-x-4">
                  <button onClick={handleBackClick} className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 transition-colors">
                      atras
                  </button>
                  <button onClick={onNewPatient} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
                      <UserPlusIcon />
                      Nuevo Paciente
                  </button>
              </div>
            ) : (
                <button onClick={onStartEvaluation} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
                    Comenzar a Evaluar
                </button>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;