import React from 'react';
import UserIcon from './icons/UserIcon';
import StethoscopeIcon from './icons/StethoscopeIcon';
import ClipboardDocumentListIcon from './icons/ClipboardDocumentListIcon';
import SparklesIcon from './icons/SparklesIcon';
import ClipboardTextIcon from './icons/ClipboardTextIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';
import ChartBarIcon from './icons/ChartBarIcon';

const workflowSteps = [
  {
    icon: <UserIcon />,
    title: '1. Registrar Anamnesis',
    description: 'Completa los datos personales del paciente, la información de la lesión, antecedentes y factores de riesgo.'
  },
  {
    icon: <StethoscopeIcon />,
    title: '2. Registrar Examen Físico',
    description: 'Documenta la inspección, palpación, rango de movimiento y otras observaciones físicas relevantes.'
  },
  {
    icon: <ClipboardDocumentListIcon />,
    title: '3. Registrar Evaluación Funcional',
    description: 'Evalúa las limitaciones en actividades diarias según la CIF. En este punto, puedes descargar una ficha preliminar o continuar.'
  },
  {
    icon: <ChartBarIcon />,
    title: '4. Utilizar Escalas y Diagnóstico',
    description: 'Añade escalas específicas y formula tu hipótesis diagnóstica basada en toda la información recopilada.'
  },
  {
    icon: <SparklesIcon />,
    title: '5. Análisis con IA',
    description: 'El destino casi final. Utiliza el asistente de IA para analizar el caso clínico, refinar tu diagnóstico y obtener sugerencias.'
  },
  {
    icon: <ClipboardTextIcon />,
    title: '6. Adjuntar Estudios y Evolución',
    description: 'Anexa los estudios por imágenes (RX, RMN, etc.) y otros documentos que el paciente pueda tener.'
  },
  {
    icon: <DocumentTextIcon />,
    title: '7. Síntesis Semiológica y Descarga Final',
    description: 'Visualiza un resumen completo de la historia clínica y descarga el informe final en formato .doc o .xlsx.'
  },
];

const WelcomeScreen: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-full p-4 sm:p-6 bg-slate-100">
      <div className="max-w-5xl w-full bg-white p-6 sm:p-8 md:p-12 rounded-lg shadow-xl border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-900 text-center">¡Bienvenido al Asistente de Kinesiología!</h1>
        <p className="text-center text-slate-600 mt-2 max-w-2xl mx-auto">Sigue este flujo de trabajo para una evaluación completa y estructurada. Cada paso te guiará a través de las secciones de la ficha del paciente.</p>
        
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflowSteps.slice(0, 6).map((step, index) => {
            const stepNumber = index + 1;
            const stepTitle = step.title.replace(/^\d+\.\s*/, '');

            return (
              <div 
                key={index} 
                className="relative p-6 bg-slate-50 rounded-lg border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <div className="absolute top-3 left-4 text-6xl font-black text-slate-200/80 select-none" aria-hidden="true">
                  {stepNumber}
                </div>
                <div className="relative z-10 flex flex-col flex-grow">
                  <div className="text-blue-600 bg-blue-100 p-2 rounded-full w-fit mb-4 [&>svg]:h-6 [&>svg]:w-6">
                    {step.icon}
                  </div>
                  <h3 className="font-semibold text-slate-800 text-lg">{stepTitle}</h3>
                  <p className="text-sm text-slate-600 mt-2 flex-grow">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;