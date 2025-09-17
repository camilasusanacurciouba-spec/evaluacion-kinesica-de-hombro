
import React from 'react';
import type { Patient, MediaFile } from '../../types';
import { FormSection, TextareaField } from './common/FormControls';
import UploadIcon from '../icons/UploadIcon';

interface StudiesAndEvolutionTabProps {
    patient: Patient;
    onPatientChange: (patient: Patient) => void;
}

const StudiesAndEvolutionTab: React.FC<StudiesAndEvolutionTabProps> = ({ patient, onPatientChange }) => {

  const handleInputChange = (field: keyof Patient['studiesAndEvolution'], value: any) => {
    const updatedPatient = {
      ...patient,
      studiesAndEvolution: {
        ...patient.studiesAndEvolution,
        [field]: value,
      },
    };
    onPatientChange(updatedPatient);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        Array.from(e.target.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                const newFile: MediaFile = {
                    id: `${file.name}-${Date.now()}`,
                    name: file.name,
                    type: file.type,
                    dataUrl: loadEvent.target?.result as string,
                };
                const updatedMedia = [...patient.studiesAndEvolution.media, newFile];
                handleInputChange('media', updatedMedia);
            };
            reader.readAsDataURL(file);
        });
    }
  };
  
  const removeMediaFile = (id: string) => {
      const updatedMedia = patient.studiesAndEvolution.media.filter(file => file.id !== id);
      handleInputChange('media', updatedMedia);
  };

  return (
    <div className="p-6 space-y-8">
      <FormSection title="Diagnósticos por Imágenes y Otros Estudios Complementarios">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextareaField 
              label="RX Hombro: Indicar hallazgos" 
              name="shoulderRx" 
              value={patient.studiesAndEvolution.shoulderRx}
              onChange={(e) => handleInputChange('shoulderRx', e.target.value)}
              rows={5}
            />
            <TextareaField 
              label="RX Cervical: Indicar hallazgos" 
              name="cervicalRx" 
              value={patient.studiesAndEvolution.cervicalRx}
              onChange={(e) => handleInputChange('cervicalRx', e.target.value)}
              rows={5}
            />
          </div>
          <TextareaField 
            label="Otros DxI (TAC, RMN, USG): Indicar hallazgos" 
            name="otherStudies" 
            value={patient.studiesAndEvolution.otherStudies}
            onChange={(e) => handleInputChange('otherStudies', e.target.value)}
            rows={5}
          />
        </div>
      </FormSection>

      <FormSection title="Archivos Adjuntos (Imágenes, PDFs)">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(patient.studiesAndEvolution.media || []).map(file => (
                <div key={file.id} className="relative group border rounded-lg overflow-hidden shadow-sm aspect-square">
                    {file.type.startsWith('image/') ? (
                        <img src={file.dataUrl} alt={file.name} className="h-full w-full object-cover" />
                    ) : (
                        <div className="h-full w-full bg-slate-100 flex items-center justify-center p-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 text-xs truncate" title={file.name}>{file.name}</div>
                    <button 
                        onClick={() => removeMediaFile(file.id)} 
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                        aria-label={`Eliminar ${file.name}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            ))}
            <label className="flex flex-col items-center justify-center h-full w-full border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors aspect-square">
                <div className="flex flex-col items-center justify-center text-center p-2">
                    <UploadIcon />
                    <p className="mt-2 text-sm text-slate-500"><span className="font-semibold">Click para adjuntar</span></p>
                    <p className="text-xs text-slate-500">Imágenes o PDF</p>
                </div>
                <input type="file" className="hidden" multiple onChange={handleFileChange} accept="image/*,.pdf" />
            </label>
        </div>
        <p className="text-xs text-slate-500 mt-4">
            <strong>Aviso:</strong> Los archivos se guardan localmente en el navegador. Para un almacenamiento seguro y permanente, se recomienda utilizar un sistema de gestión externo.
        </p>
      </FormSection>
    </div>
  );
};

export default StudiesAndEvolutionTab;