import { NextApiRequest, NextApiResponse } from 'next';
import { BeamInputs, validateBeamInputs } from '../../utils/validators';
import { analyzeBeamCapacity, CalculationResult } from '../../utils/beamCalculations';
import { validateMaterialProperties } from '../../utils/materialProperties';

export interface CalculateApiRequest {
  inputs: BeamInputs;
}

export interface CalculateApiResponse {
  success: boolean;
  result?: CalculationResult;
  error?: string;
  validationErrors?: string[];
  validationWarnings?: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CalculateApiResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({
      success: false,
      error: 'Method not allowed. Only POST requests are accepted.'
    });
    return;
  }

  try {
    // Validate request body
    if (!req.body || typeof req.body !== 'object') {
      res.status(400).json({
        success: false,
        error: 'Invalid request body. Expected JSON object with beam inputs.'
      });
      return;
    }

    const { inputs } = req.body as CalculateApiRequest;

    // Validate that inputs are provided
    if (!inputs || typeof inputs !== 'object') {
      res.status(400).json({
        success: false,
        error: 'Invalid or missing beam inputs.'
      });
      return;
    }

    // Convert any string numbers to actual numbers
    const sanitizedInputs: BeamInputs = {
      width: Number(inputs.width),
      height: Number(inputs.height),
      effectiveDepth: Number(inputs.effectiveDepth),
      concreteStrength: Number(inputs.concreteStrength),
      steelYieldStrength: Number(inputs.steelYieldStrength),
      appliedMoment: Number(inputs.appliedMoment),
      tensionSteelArea: Number(inputs.tensionSteelArea),
      compressionSteelArea: inputs.compressionSteelArea ? Number(inputs.compressionSteelArea) : 0,
      compressionSteelDepth: inputs.compressionSteelDepth ? Number(inputs.compressionSteelDepth) : 50
    };

    // Validate numerical inputs
    const numericFields: (keyof BeamInputs)[] = [
      'width', 'height', 'effectiveDepth', 'concreteStrength',
      'steelYieldStrength', 'appliedMoment', 'tensionSteelArea'
    ];

    for (const field of numericFields) {
      const value = sanitizedInputs[field];
      if (isNaN(value as number) || !isFinite(value as number)) {
        res.status(400).json({
          success: false,
          error: `Invalid value for ${field}. Must be a valid number.`
        });
        return;
      }
    }

    // Validate beam inputs comprehensively
    const validation = validateBeamInputs(sanitizedInputs);

    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        error: 'Beam input validation failed.',
        validationErrors: validation.errors,
        validationWarnings: validation.warnings
      });
      return;
    }

    // Additional material property validation
    const materialValidation = validateMaterialProperties(
      sanitizedInputs.concreteStrength,
      sanitizedInputs.steelYieldStrength
    );

    if (!materialValidation.isValid) {
      res.status(400).json({
        success: false,
        error: 'Material property validation failed.',
        validationErrors: materialValidation.errors,
        validationWarnings: validation.warnings
      });
      return;
    }

    // Perform structural analysis
    const startTime = Date.now();
    const result = analyzeBeamCapacity(sanitizedInputs);
    const calculationTime = Date.now() - startTime;

    // Log calculation for monitoring (in production, use proper logging)
    console.log(`Beam calculation completed in ${calculationTime}ms`, {
      isAdequate: result.isAdequate,
      phiMn: result.phiMn,
      safetyFactor: result.safetyFactor,
      timestamp: new Date().toISOString()
    });

    // Return successful result
    res.status(200).json({
      success: true,
      result: {
        ...result,
        // Add some metadata
        calculationTime,
        timestamp: new Date().toISOString(),
        apiVersion: '1.0'
      } as CalculationResult,
      validationWarnings: validation.warnings.length > 0 ? validation.warnings : undefined
    });

  } catch (error) {
    // Log error for debugging (in production, use proper error logging)
    console.error('Beam calculation error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('convergence') || error.message.includes('iteration')) {
        res.status(422).json({
          success: false,
          error: 'Analysis failed to converge. Please check input values and try again.'
        });
        return;
      }

      if (error.message.includes('division by zero') || error.message.includes('undefined')) {
        res.status(422).json({
          success: false,
          error: 'Invalid calculation parameters. Please verify all input values.'
        });
        return;
      }
    }

    // Generic server error
    res.status(500).json({
      success: false,
      error: 'Internal server error during beam analysis. Please try again.'
    });
  }
}

// Helper function for input sanitization and validation
function sanitizeAndValidateNumber(
  value: any,
  fieldName: string,
  min?: number,
  max?: number
): { isValid: boolean; value?: number; error?: string } {

  if (value === undefined || value === null || value === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }

  const numValue = Number(value);

  if (isNaN(numValue) || !isFinite(numValue)) {
    return { isValid: false, error: `${fieldName} must be a valid number` };
  }

  if (min !== undefined && numValue < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min}` };
  }

  if (max !== undefined && numValue > max) {
    return { isValid: false, error: `${fieldName} cannot exceed ${max}` };
  }

  return { isValid: true, value: numValue };
}

// Export for testing
export { sanitizeAndValidateNumber };