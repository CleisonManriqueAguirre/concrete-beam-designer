import React from 'react';
import { CalculationResult } from '../utils/beamCalculations';

export interface ResultsDisplayProps {
  result: CalculationResult;
  className?: string;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, className = '' }) => {
  const getStatusColor = () => {
    if (result.isAdequate) {
      return result.safetyFactor > 1.5 ? 'green' : 'blue';
    }
    return 'red';
  };

  const statusColor = getStatusColor();
  const statusClasses = {
    green: 'result-success',
    blue: 'bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-md',
    red: 'result-danger'
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Card */}
      <div className="engineering-card p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Analysis Results</h2>

        {/* Status Banner */}
        <div className={statusClasses[statusColor]}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {result.isAdequate ? (
                  <svg className="w-6 h-6 text-current" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-current" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg">
                  {result.isAdequate ? 'SECTION ADEQUATE' : 'SECTION INADEQUATE'}
                </h3>
                <p className="text-sm opacity-90">
                  φMn = {result.phiMn.toFixed(1)} kN·m {result.isAdequate ? '≥' : '<'} Mu = {result.Mu} kN·m
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{result.safetyFactor.toFixed(2)}</div>
              <div className="text-sm opacity-90">Safety Factor</div>
            </div>
          </div>
        </div>

        {/* Key Results Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-900">{result.phiMn.toFixed(1)}</div>
            <div className="text-sm text-gray-600">φMn (kN·m)</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-900">{result.neutralAxisDepth.toFixed(0)}</div>
            <div className="text-sm text-gray-600">c (mm)</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-900">{result.phi.toFixed(2)}</div>
            <div className="text-sm text-gray-600">φ factor</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-900">
              {result.isTensionControlled ? 'Yes' : 'No'}
            </div>
            <div className="text-sm text-gray-600">Tension Controlled</div>
          </div>
        </div>
      </div>

      {/* Material Properties */}
      <div className="engineering-card p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Material Properties</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Concrete</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>f'c:</span>
                <span>{result.materialProperties.concrete.fc} MPa</span>
              </div>
              <div className="flex justify-between">
                <span>Ec:</span>
                <span>{(result.materialProperties.concrete.Ec / 1000).toFixed(0)} GPa</span>
              </div>
              <div className="flex justify-between">
                <span>β₁:</span>
                <span>{result.materialProperties.concrete.beta1.toFixed(3)}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Steel</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>fy:</span>
                <span>{result.materialProperties.steel.fy} MPa</span>
              </div>
              <div className="flex justify-between">
                <span>Es:</span>
                <span>{(result.materialProperties.steel.Es / 1000).toFixed(0)} GPa</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Strain Analysis */}
      <div className="engineering-card p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Strain Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">
              {(result.compressionStrain * 1000).toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">εc (×10⁻³)</div>
            <div className="text-xs text-gray-500 mt-1">Compression strain</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">
              {(result.tensionStrain * 1000).toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">εs (×10⁻³)</div>
            <div className="text-xs text-gray-500 mt-1">Tension steel strain</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">
              {result.stressBlockDepth.toFixed(0)}
            </div>
            <div className="text-sm text-gray-600">a (mm)</div>
            <div className="text-xs text-gray-500 mt-1">Stress block depth</div>
          </div>
        </div>
      </div>

      {/* Detailed Calculations */}
      <div className="engineering-card p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Calculation Steps
          <span className="text-sm font-normal text-gray-600 ml-2">
            (Per ACI 318 Requirements)
          </span>
        </h3>
        <div className="space-y-3">
          {result.calculationSteps.map((step, index) => (
            <div key={index} className="calculation-step">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {step.step}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
                    <div className="lg:w-1/3">
                      <h4 className="font-semibold text-gray-900 text-sm">{step.description}</h4>
                      <p className="text-xs text-blue-600 mt-1">{step.reference}</p>
                    </div>
                    <div className="lg:w-1/3 mt-2 lg:mt-0">
                      <div className="text-sm text-gray-700 font-mono bg-gray-50 px-2 py-1 rounded">
                        {step.formula}
                      </div>
                    </div>
                    <div className="lg:w-1/3 mt-2 lg:mt-0">
                      <div className="text-sm text-gray-600">{step.calculation}</div>
                      <div className="text-sm font-semibold text-gray-900">{step.result}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <div className="engineering-card p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Design Recommendations</h3>
          <div className="space-y-2">
            {result.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-2">
                <svg
                  className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-gray-700">{recommendation}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export Options */}
      <div className="engineering-card p-4">
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Print Report</span>
          </button>
          <button
            onClick={() => {
              const data = {
                result: result,
                timestamp: new Date().toISOString(),
                version: '1.0'
              };
              const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json'
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `beam-analysis-${Date.now()}.json`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            <span>Export Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;