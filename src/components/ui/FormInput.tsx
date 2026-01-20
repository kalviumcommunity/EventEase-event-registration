import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';

interface FormInputProps {
  label: string;
  name: string;
  error?: FieldError;
  register: UseFormRegister<any>;
  type?: string;
  placeholder?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  error,
  register,
  type = 'text',
  placeholder,
}) => {
  const isTextarea = type === 'textarea';

  return (
    <div className="mb-4">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      {isTextarea ? (
        <textarea
          id={name}
          {...register(name)}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
          }`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${name}-error` : undefined}
          rows={4}
        />
      ) : (
        <input
          id={name}
          type={type}
          {...register(name)}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
          }`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${name}-error` : undefined}
        />
      )}
      {error && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-600">
          {error.message}
        </p>
      )}
    </div>
  );
};

export default FormInput;
