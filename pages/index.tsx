import React, { useState } from 'react';
import Head from 'next/head';
import BeamInputForm from '../components/BeamInputForm';
import ResultsDisplay from '../components/ResultsDisplay';
import BeamDiagram from '../components/BeamDiagram';
import { BeamInputs } from '../utils/validators';
import { CalculationResult } from '../utils/beamCalculations';

interface CalculationState {
  isLoading: boolean;
  result: CalculationResult | null;
  error: string | null;
  inputs: BeamInputs | null;
}

const HomePage: React.FC = () => {
  const [calculation, setCalculation] = useState<CalculationState>({
    isLoading: false,
    result: null,
    error: null,
    inputs: null
  });

  const handleBeamAnalysis = async (inputs: BeamInputs) => {
    setCalculation({
      isLoading: true,
      result: null,
      error: null,
      inputs: null
    });

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Calculation failed');
      }

      if (data.success) {
        setCalculation({
          isLoading: false,
          result: data.result,
          error: null,
          inputs: inputs
        });
      } else {
        throw new Error(data.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setCalculation({
        isLoading: false,
        result: null,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        inputs: null
      });
    }
  };

  const handleNewAnalysis = () => {
    setCalculation({
      isLoading: false,
      result: null,
      error: null,
      inputs: null
    });
  };

  return (
    <>
      <Head>
        <title>Concrete Beam Designer - Structural Analysis Tool</title>
        <meta name="description" content="Professional concrete beam design tool for civil engineers. Analyze beam capacity, perform moment balance calculations, and generate engineering reports per ACI 318." />
        <meta name="keywords" content="concrete beam design, structural analysis, ACI 318, moment capacity, civil engineering, reinforced concrete" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="author" content="Concrete Beam Designer" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Concrete Beam Designer - Structural Analysis Tool" />
        <meta property="og:description" content="Professional concrete beam design tool for civil engineers" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Concrete Beam Designer" />
        <meta name="twitter:description" content="Professional concrete beam design tool for civil engineers" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 3h18v4H3V3zm0 6h18v2H3V9zm0 4h18v2H3v-2zm0 4h18v4H3v-4z"/>
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Concrete Beam Designer</h1>
                    <p className="text-xs text-gray-500">ACI 318 Structural Analysis</p>
                  </div>
                </div>
              </div>

              {calculation.result && (
                <button
                  onClick={handleNewAnalysis}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  New Analysis
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!calculation.result && !calculation.isLoading && !calculation.error && (
            <>
              {/* Introduction */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Professional Concrete Beam Analysis
                </h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Analyze concrete beam capacity using moment balance calculations per ACI 318 requirements.
                  Enter beam parameters below to generate a comprehensive engineering report with design recommendations.
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="engineering-card p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">ACI 318 Compliant</h3>
                  <p className="text-sm text-gray-600">
                    All calculations follow ACI 318 building code requirements with proper safety factors and code references.
                  </p>
                </div>

                <div className="engineering-card p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2.5-9H19V1h-2v1H7V1H5v1H3.5C2.67 2 2 2.67 2 3.5v15C2 19.33 2.67 20 3.5 20h17c.83 0 1.5-.67 1.5-1.5v-15C22 2.67 21.33 2 20.5 2z"/>
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Detailed Analysis</h3>
                  <p className="text-sm text-gray-600">
                    Complete step-by-step calculations with strain compatibility, force equilibrium, and capacity checks.
                  </p>
                </div>

                <div className="engineering-card p-6 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Professional Reports</h3>
                  <p className="text-sm text-gray-600">
                    Generate comprehensive engineering reports with visual diagrams and design recommendations.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Input Form */}
          {!calculation.result && !calculation.isLoading && !calculation.error && (
            <BeamInputForm
              onSubmit={handleBeamAnalysis}
              isLoading={calculation.isLoading}
            />
          )}

          {/* Loading State */}
          {calculation.isLoading && (
            <div className="engineering-card p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyzing Beam Capacity</h3>
                <p className="text-gray-600">
                  Performing moment balance calculations and verifying ACI 318 requirements...
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {calculation.error && (
            <div className="engineering-card p-6">
              <div className="result-danger">
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6 text-current" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="font-bold">Analysis Error</h3>
                    <p>{calculation.error}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <button
                  onClick={handleNewAnalysis}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Results */}
          {calculation.result && calculation.inputs && (
            <div className="space-y-8">
              {/* Results Display */}
              <ResultsDisplay result={calculation.result} />

              {/* Beam Diagram */}
              <BeamDiagram
                width={calculation.inputs.width}
                height={calculation.inputs.height}
                effectiveDepth={calculation.inputs.effectiveDepth}
                neutralAxisDepth={calculation.result.neutralAxisDepth}
                stressBlockDepth={calculation.result.stressBlockDepth}
                tensionSteelArea={calculation.inputs.tensionSteelArea}
                compressionSteelArea={calculation.inputs.compressionSteelArea}
                compressionSteelDepth={calculation.inputs.compressionSteelDepth}
              />
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">About</h4>
                <p className="text-sm text-gray-600">
                  Professional concrete beam design tool for civil engineers.
                  Performs structural analysis per ACI 318 requirements.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Code Compliance</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• ACI 318-19 Building Code</li>
                  <li>• Moment Balance Method</li>
                  <li>• Strain Compatibility</li>
                  <li>• Safety Factor Requirements</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Disclaimer</h4>
                <p className="text-sm text-gray-600">
                  This tool is for preliminary design only.
                  Always verify results with manual calculations and consult local building codes.
                </p>
              </div>
            </div>

            <div className="border-t mt-8 pt-6 text-center text-sm text-gray-500">
              <p>&copy; 2026 Concrete Beam Designer. Professional structural analysis tool.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default HomePage;