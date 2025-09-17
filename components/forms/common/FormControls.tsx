import React from 'react';

export const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <fieldset className="border border-slate-200 rounded-lg p-6 h-full">
        <legend className="px-2 text-lg font-semibold text-slate-800">{title}</legend>
        {children}
    </fieldset>
);

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export const InputField: React.FC<InputFieldProps> = ({ label, name, ...props }) => (
    <div>
        {label && <label htmlFor={name} className="block text-sm font-medium text-slate-600 mb-2">{label}</label>}
        <input 
            id={name}
            name={name}
            {...props}
            className="w-full bg-white border border-slate-300 rounded-md py-2 px-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 read-only:bg-slate-100 disabled:opacity-50" 
        />
    </div>
);

interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    className?: string;
}

export const TextareaField: React.FC<TextareaFieldProps> = ({ label, name, className, ...props }) => (
    <div className="h-full">
        {label && <label htmlFor={name} className="block text-sm font-medium text-slate-600 mb-2">{label}</label>}
        <textarea
            id={name}
            name={name}
            rows={2}
            {...props}
            className={`w-full bg-white border border-slate-300 rounded-md py-2 px-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className || ''}`}
        />
    </div>
);

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({ label, name, children, ...props }) => (
    <div>
        {label && <label htmlFor={name} className="block text-sm font-medium text-slate-600 mb-2">{label}</label>}
        <select
            id={name}
            name={name}
            {...props}
            className="w-full bg-white border border-slate-300 rounded-md py-2 px-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
            {children}
        </select>
    </div>
);


interface CheckboxFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({ label, name, ...props }) => (
    <div className="relative flex items-start">
        <div className="flex h-6 items-center">
            <input
                id={name}
                name={name}
                type="checkbox"
                {...props}
                className="h-4 w-4 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-600"
            />
        </div>
        <div className="ml-3 text-sm leading-6">
            <label htmlFor={name} className="font-medium text-slate-700">
                {label}
            </label>
        </div>
    </div>
);