import React, { useState, useCallback } from 'react';
import InputField from './InputField';
import { BeamInputs, validateBeamInputs, ValidationResult } from '../utils/validators';

export interface BeamInputFormProps {
  onSubmit: (inputs: BeamInputs) => void;
  isLoading?: boolean;
  className?: string;
}

const BeamInputForm: React.FC<BeamInputFormProps> = ({
  onSubmit,
  isLoading = false,
  className = ''
}) => {
  const [inputs, setInputs] = useState<BeamInputs>({
    width: 300,
    height: 600,
    effectiveDepth: 550,
    concreteStrength: 25,
    steelYieldStrength: 420,
    appliedMoment: 200,
    tensionSteelArea: 1500,
    compressionSteelArea: 0,
    compressionSteelDepth: 50
  });

  const [validation, setValidation] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: []
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [fieldWarnings, setFieldWarnings] = useState<Record<string, string>>({});

  // Update a specific input field
  const updateInput = useCallback((field: keyof BeamInputs, value: number) => {
    const newInputs = { ...inputs, [field]: value };
    setInputs(newInputs);

    // Validate on change
    const validationResult = validateBeamInputs(newInputs);
    setValidation(validationResult);

    // Clear field-specific errors and warnings
    const newFieldErrors: Record<string, string> = {};
    const newFieldWarnings: Record<string, string> = {};

    // Map validation errors to specific fields (simplified mapping)
    validationResult.errors.forEach(error => {
      if (error.includes('width')) newFieldErrors.width = error;
      else if (error.includes('height')) newFieldErrors.height = error;
      else if (error.includes('effective depth')) newFieldErrors.effectiveDepth = error;
      else if (error.includes('concrete strength')) newFieldErrors.concreteStrength = error;
      else if (error.includes('steel yield strength')) newFieldErrors.steelYieldStrength = error;
      else if (error.includes('applied moment')) newFieldErrors.appliedMoment = error;
      else if (error.includes('tension steel')) newFieldErrors.tensionSteelArea = error;
      else if (error.includes('compression steel area')) newFieldErrors.compressionSteelArea = error;
      else if (error.includes('compression steel depth')) newFieldErrors.compressionSteelDepth = error;
    });

    validationResult.warnings.forEach(warning => {
      if (warning.includes('width')) newFieldWarnings.width = warning;
      else if (warning.includes('height')) newFieldWarnings.height = warning;
      else if (warning.includes('effective depth')) newFieldWarnings.effectiveDepth = warning;
      else if (warning.includes('concrete')) newFieldWarnings.concreteStrength = warning;
      else if (warning.includes('steel') && warning.includes('strength')) newFieldWarnings.steelYieldStrength = warning;
      else if (warning.includes('moment')) newFieldWarnings.appliedMoment = warning;
      else if (warning.includes('reinforcement')) newFieldWarnings.tensionSteelArea = warning;
      else if (warning.includes('spacing')) newFieldWarnings.width = warning;
    });

    setFieldErrors(newFieldErrors);
    setFieldWarnings(newFieldWarnings);
  }, [inputs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validation.isValid) {
      onSubmit(inputs);
    }
  };

  const loadExample = (exampleType: 'small' | 'medium' | 'large') => {
    const examples: Record<string, BeamInputs> = {
      small: {
        width: 250,
        height: 400,
        effectiveDepth: 350,
        concreteStrength: 25,
        steelYieldStrength: 420,
        appliedMoment: 80,
        tensionSteelArea: 800,
        compressionSteelArea: 0,
        compressionSteelDepth: 50
      },
      medium: {
        width: 300,
        height: 600,
        effectiveDepth: 550,
        concreteStrength: 30,
        steelYieldStrength: 420,
        appliedMoment: 250,
        tensionSteelArea: 1600,
        compressionSteelArea: 0,
        compressionSteelDepth: 50
      },
      large: {
        width: 400,
        height: 800,
        effectiveDepth: 750,
        concreteStrength: 35,
        steelYieldStrength: 500,
        appliedMoment: 500,
        tensionSteelArea: 2800,
        compressionSteelArea: 0,
        compressionSteelDepth: 50
      }
    };

    const example = examples[exampleType];
    setInputs(example);

    // Validate the example
    const validationResult = validateBeamInputs(example);
    setValidation(validationResult);
    setFieldErrors({});
    setFieldWarnings({});
  };

  return (
    <div className={`engineering-card p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Beam Parameters</h2>
          <p className="text-gray-600 mt-1">Enter the beam geometry, materials, and loading</p>
        </div>

        {/* Example buttons */}
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => loadExample('small')}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
          >
            Small Beam
          </button>
          <button
            type="button"
            onClick={() => loadExample('medium')}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
          >
            Medium Beam
          </button>
          <button
            type="button"
            onClick={() => loadExample('large')}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
          >
            Large Beam
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Beam Geometry Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Beam Geometry</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField
              id="width"
              label="Width"
              value={inputs.width}
              onChange={(value) => updateInput('width', value)}
              unit="mm"
              error={fieldErrors.width}
              warning={fieldWarnings.width}
              min={100}
              max={2000}
              helpText="Beam cross-sectional width"
              required
            />

            <InputField
              id="height"
              label="Total Height"
              value={inputs.height}
              onChange={(value) => updateInput('height', value)}
              unit="mm"
              error={fieldErrors.height}
              warning={fieldWarnings.height}
              min={150}
              max={3000}
              helpText="Overall beam depth"
              required
            />

            <InputField
              id="effectiveDepth"
              label="Effective Depth"
              value={inputs.effectiveDepth}
              onChange={(value) => updateInput('effectiveDepth', value)}
              unit="mm"
              error={fieldErrors.effectiveDepth}
              warning={fieldWarnings.effectiveDepth}
              min={100}
              max={2900}
              helpText="Distance from compression fiber to tension steel centroid"
              required
            />
          </div>
        </div>

        {/* Material Properties Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Material Properties</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              id="concreteStrength"
              label="Concrete Strength (f'c)"
              value={inputs.concreteStrength}
              onChange={(value) => updateInput('concreteStrength', value)}
              unit="MPa"
              error={fieldErrors.concreteStrength}
              warning={fieldWarnings.concreteStrength}
              min={17}
              max={100}
              helpText="28-day compressive strength of concrete"
              required
            />

            <InputField
              id="steelYieldStrength"
              label="Steel Yield Strength (fy)"
              value={inputs.steelYieldStrength}
              onChange={(value) => updateInput('steelYieldStrength', value)}
              unit="MPa"
              error={fieldErrors.steelYieldStrength}
              warning={fieldWarnings.steelYieldStrength}
              min={300}
              max={700}
              helpText="Yield strength of reinforcing steel"
              required
            />
          </div>
        </div>

        {/* Loading Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Applied Loading</h3>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <InputField
              id="appliedMoment"
              label="Applied Moment (Mu)"
              value={inputs.appliedMoment}
              onChange={(value) => updateInput('appliedMoment', value)}
              unit="kN·m"
              error={fieldErrors.appliedMoment}
              warning={fieldWarnings.appliedMoment}
              min={0}
              max={10000}
              helpText="Factored moment at critical section"
              required
            />
          </div>
        </div>

        {/* Reinforcement Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Steel Reinforcement</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              id="tensionSteelArea"
              label="Tension Steel Area (As)"
              value={inputs.tensionSteelArea}
              onChange={(value) => updateInput('tensionSteelArea', value)}
              unit="mm²"
              error={fieldErrors.tensionSteelArea}
              warning={fieldWarnings.tensionSteelArea}
              min={100}
              max={10000}
              helpText="Total area of tension reinforcement"
              required
            />

            <InputField
              id="compressionSteelDepth"
              label="Cover to Compression Steel"
              value={inputs.compressionSteelDepth || 50}
              onChange={(value) => updateInput('compressionSteelDepth', value)}
              unit="mm"
              error={fieldErrors.compressionSteelDepth}
              warning={fieldWarnings.compressionSteelDepth}
              min={20}
              max={200}
              helpText="Distance from compression fiber to compression steel"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <InputField
              id="compressionSteelArea"
              label="Compression Steel Area (A's)"
              value={inputs.compressionSteelArea || 0}
              onChange={(value) => updateInput('compressionSteelArea', value)}
              unit="mm²"
              error={fieldErrors.compressionSteelArea}
              warning={fieldWarnings.compressionSteelArea}
              min={0}
              max={5000}
              helpText="Total area of compression reinforcement (optional)"
            />
          </div>
        </div>

        {/* Global validation messages */}
        {validation.errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-red-800 mb-2">Please fix the following errors:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
              {validation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Submit button */}
        <div className="flex justify-center pt-6">
          <button
            type="submit"
            disabled={!validation.isValid || isLoading}
            className={`
              px-8 py-3 rounded-md font-semibold text-white transition-all duration-200
              ${validation.isValid && !isLoading
                ? 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                : 'bg-gray-400 cursor-not-allowed'
              }
              ${isLoading ? 'animate-pulse' : ''}
            `}
          >
            {isLoading ? (
              <span className="flex items-center space-x-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Analyzing...</span>
              </span>
            ) : (
              'Analyze Beam Capacity'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BeamInputForm;