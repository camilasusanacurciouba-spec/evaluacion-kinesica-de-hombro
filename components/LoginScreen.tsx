import React from 'react';
import GoogleIcon from './icons/GoogleIcon';

interface LoginScreenProps {
    onLogin: () => void;
    isInitialized: boolean;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, isInitialized }) => {
    return (
        <div className="max-w-md w-full mx-auto bg-white border border-slate-200 shadow-2xl rounded-lg flex flex-col justify-center items-center p-8 text-center">
            <svg className="h-16 w-16 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
            </svg>
            <h2 className="text-2xl font-bold text-slate-900">Asistente de Kinesiología</h2>
            <p className="mt-2 text-slate-600">
                Inicia sesión con tu cuenta de Google para guardar y acceder a tus fichas de paciente de forma segura en Google Drive.
            </p>
            <div className="mt-8">
                <button
                    onClick={onLogin}
                    disabled={!isInitialized}
                    className="inline-flex items-center justify-center px-6 py-3 bg-slate-100 border border-slate-300 rounded-lg text-slate-800 font-medium hover:bg-white transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <GoogleIcon />
                    <span className="ml-3">Iniciar sesión con Google</span>
                </button>
            </div>
            {!isInitialized && (
                <div className="mt-6 text-sm text-red-400 bg-red-500/10 p-3 rounded-lg max-w-sm">
                    <p className="font-semibold">Error de Configuración</p>
                    <p className="mt-1">No se pudo inicializar la conexión con Google. Por favor, verifica que la aplicación esté configurada correctamente y recarga la página.</p>
                </div>
            )}
            <div className="mt-8 text-xs text-slate-500 max-w-sm">
                <p>
                    Al iniciar sesión, autorizas a esta aplicación a crear y administrar una carpeta y sus archivos correspondientes en tu Google Drive. La aplicación no tendrá acceso a ningún otro dato.
                </p>
            </div>
        </div>
    );
};

export default LoginScreen;