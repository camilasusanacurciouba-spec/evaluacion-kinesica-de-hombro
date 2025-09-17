import React, { useState, useEffect, useCallback } from 'react';
import { getPatients, deletePatient } from '../services/patientService';
import type { Patient } from '../types';
import InfoIcon from './icons/InfoIcon';

interface PatientDirectoryProps {
  onSelectPatient: (id: string) => void;
  onNewPatient: () => void;
}

const PatientDirectory: React.FC<PatientDirectoryProps> = ({ onSelectPatient, onNewPatient }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadPatients = useCallback(async () => {
    setIsLoading(true);
    try {
      const sortedPatients = (await getPatients()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPatients(sortedPatients);
    } catch (error) {
      console.error("Could not load patients", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const getPatientFullName = (patient: Patient) => {
      const name = `${patient.firstName || ''} ${patient.lastName || ''}`.trim();
      return name === 'Nuevo Paciente' ? 'Paciente sin nombre' : name;
  }

  const handleDeletePatient = async (e: React.MouseEvent, patient: Patient) => {
    e.stopPropagation();

    const patientName = getPatientFullName(patient);
    if (window.confirm(`¿Estás seguro de que quieres eliminar la ficha de ${patientName}? Esta acción no se puede deshacer.`)) {
        try {
            await deletePatient(patient.id);
            setPatients(prevPatients => prevPatients.filter(p => p.id !== patient.id));
        } catch(error) {
            console.error("Failed to delete patient", error);
            alert("No se pudo eliminar el paciente.");
        }
    }
  }

  const filteredPatients = patients.filter(patient =>
    getPatientFullName(patient).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderPatientList = () => {
    if (isLoading) {
      return <div className="text-center p-10 text-slate-500">Cargando pacientes...</div>;
    }

    if (patients.length === 0) {
      return (
        <div className="text-center p-10 flex flex-col justify-center items-center h-full">
          <div className="max-w-md">
              <InfoIcon />
              <h3 className="mt-4 text-xl font-semibold text-slate-900">Directorio de Pacientes Vacío</h3>
              <p className="mt-2 text-sm text-slate-600">
                  Aún no has creado ninguna ficha de paciente. ¡Comienza ahora!
              </p>
              <div className="mt-6">
                <button
                    onClick={onNewPatient}
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                    + Crear Nuevo Paciente
                </button>
              </div>
          </div>
        </div>
      );
    }

    return (
      <ul className="divide-y divide-slate-200">
        {filteredPatients.map(patient => (
          <li
            key={patient.id}
            onClick={() => onSelectPatient(patient.id)}
            className="flex justify-between items-center p-4 hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <div>
              <p className="font-semibold text-slate-800">{getPatientFullName(patient)}</p>
              <p className="text-sm text-slate-500">
                Ficha creada: {new Date(patient.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center space-x-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${patient.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {patient.status === 'Completed' ? 'Completada' : 'En Progreso'}
                </span>
                <button 
                    onClick={(e) => handleDeletePatient(e, patient)}
                    className="p-2 text-slate-500 hover:text-red-500 hover:bg-slate-100 rounded-full transition-colors"
                    aria-label="Eliminar paciente"
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col w-full p-6">
      <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
        <div className="p-4 border-b border-slate-200 flex justify-end items-center gap-4">
          <div className="w-full max-w-sm">
            <input
              type="text"
              placeholder="Buscar paciente por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-100 border border-slate-300 rounded-md py-2 px-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Buscar paciente"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {renderPatientList()}
        </div>
      </div>
    </div>
  );
};

export default PatientDirectory;