import React from 'react';
import type { Patient } from '../../types';
import InfoIcon from '../icons/InfoIcon';

interface MediaTabProps {
    patient: Patient;
    onPatientChange: (patient: Patient) => void;
    onRefreshPatient: () => void;
}

const MediaTab: React.FC<MediaTabProps> = ({ patient, onPatientChange, onRefreshPatient }) => {
    return (
        <div className="p-8 h-full flex items-center justify-center text-center">
             <div>
                <InfoIcon />
                <h3 className="mt-4 text-xl font-semibold text-slate-900">Función no disponible</h3>
                <p className="mt-2 text-slate-600 max-w-lg mx-auto">
                    La carga de archivos multimedia no está habilitada en esta versión de la aplicación.
                </p>
            </div>
        </div>
    )
};

export default MediaTab;