/**
 * Input Validation Module
 * Validates user input for concrete beam design calculations
 */

export interface BeamInputs {
  width: number;        // Beam width (mm)
  height: number;       // Beam height (mm)
  effectiveDepth: number; // Effective depth to tension steel (mm)
  concreteStrength: number; // Concrete compressive strength fc' (MPa)
  steelYieldStrength: number; // Steel yield strength fy (MPa)
  appliedMoment: number; // Applied factored moment Mu (kN·m)
  tensionSteelArea: number; // Tension steel area As (mm²)
  compressionSteelArea?: number; // Compression steel area As' (mm²) - optional
  compressionSteelDepth?: number; // Depth to compression steel d' (mm) - optional
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Comprehensive input validation for beam design parameters
 */
export function validateBeamInputs(inputs: BeamInputs): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate beam geometry
  if (inputs.width <= 0) {
    errors.push("Beam width must be positive");
  } else if (inputs.width < 150) {
    warnings.push("Beam width less than 150mm may be impractical");
  } else if (inputs.width > 1500) {
    warnings.push("Beam width greater than 1500mm should be verified for construction feasibility");
  }

  if (inputs.height <= 0) {
    errors.push("Beam height must be positive");
  } else if (inputs.height < 200) {
    warnings.push("Beam height less than 200mm may be inadequate for structural requirements");
  }

  if (inputs.effectiveDepth <= 0) {
    errors.push("Effective depth must be positive");
  } else if (inputs.effectiveDepth >= inputs.height) {
    errors.push("Effective depth must be less than total height");
  } else if (inputs.effectiveDepth < inputs.height - 100) {
    warnings.push("Large difference between height and effective depth - verify cover requirements");
  }

  // Validate material properties
  if (inputs.concreteStrength <= 0) {
    errors.push("Concrete strength must be positive");
  } else if (inputs.concreteStrength < 17) {
    warnings.push("Concrete strength below 17 MPa may not meet minimum requirements");
  } else if (inputs.concreteStrength > 100) {
    warnings.push("High strength concrete (>100 MPa) requires special design considerations");
  }

  if (inputs.steelYieldStrength <= 0) {
    errors.push("Steel yield strength must be positive");
  } else if (inputs.steelYieldStrength < 300) {
    warnings.push("Steel yield strength below 300 MPa is uncommon for structural applications");
  } else if (inputs.steelYieldStrength > 700) {
    warnings.push("Very high strength steel (>700 MPa) requires special design considerations");
  }

  // Validate applied loading
  if (inputs.appliedMoment < 0) {
    errors.push("Applied moment cannot be negative");
  } else if (inputs.appliedMoment === 0) {
    warnings.push("Zero applied moment - no flexural capacity check needed");
  }

  // Validate steel reinforcement
  if (inputs.tensionSteelArea <= 0) {
    errors.push("Tension steel area must be positive");
  }

  // Check minimum reinforcement ratio per ACI 318
  const minReinforcementRatio = Math.max(
    1.4 / inputs.steelYieldStrength, // ACI 318-19 Eq. 9.6.1.2a
    Math.sqrt(inputs.concreteStrength) / (4 * inputs.steelYieldStrength) // ACI 318-19 Eq. 9.6.1.2b
  );
  const actualRatio = inputs.tensionSteelArea / (inputs.width * inputs.effectiveDepth);

  if (actualRatio < minReinforcementRatio) {
    warnings.push(
      `Reinforcement ratio (${(actualRatio * 100).toFixed(3)}%) is below minimum required ` +
      `(${(minReinforcementRatio * 100).toFixed(3)}%) per ACI 318`
    );
  }

  // Check maximum reinforcement ratio (75% of balanced ratio)
  const balancedRatio = calculateBalancedReinforcementRatio(
    inputs.concreteStrength,
    inputs.steelYieldStrength
  );
  const maxRatio = 0.75 * balancedRatio;

  if (actualRatio > maxRatio) {
    errors.push(
      `Reinforcement ratio (${(actualRatio * 100).toFixed(3)}%) exceeds maximum allowed ` +
      `(${(maxRatio * 100).toFixed(3)}%) per ACI 318`
    );
  }

  // Validate compression steel (if provided)
  if (inputs.compressionSteelArea !== undefined) {
    if (inputs.compressionSteelArea < 0) {
      errors.push("Compression steel area cannot be negative");
    }

    if (inputs.compressionSteelDepth === undefined && inputs.compressionSteelArea > 0) {
      errors.push("Compression steel depth must be provided when compression steel area is specified");
    }

    if (inputs.compressionSteelDepth !== undefined) {
      if (inputs.compressionSteelDepth <= 0) {
        errors.push("Compression steel depth must be positive");
      } else if (inputs.compressionSteelDepth >= inputs.effectiveDepth) {
        errors.push("Compression steel depth must be less than effective depth");
      }
    }
  }

  // Check practical spacing considerations
  const barDiameter = estimateBarDiameter(inputs.tensionSteelArea);
  const estimatedBars = Math.ceil(inputs.tensionSteelArea / (Math.PI * Math.pow(barDiameter/2, 2)));
  const minSpacing = Math.max(25, barDiameter, 25); // 25mm minimum or bar diameter
  const requiredWidth = estimatedBars * barDiameter + (estimatedBars - 1) * minSpacing + 2 * 40; // 40mm cover each side

  if (requiredWidth > inputs.width) {
    warnings.push(
      `Beam width may be insufficient for proper bar spacing. ` +
      `Estimated ${estimatedBars} #${barDiameter}mm bars require ~${requiredWidth}mm width`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Calculate balanced reinforcement ratio per ACI 318
 */
function calculateBalancedReinforcementRatio(fc: number, fy: number): number {
  const Es = 200000; // MPa
  const beta1 = fc <= 28 ? 0.85 : Math.max(0.65, 0.85 - 0.05 * (fc - 28) / 7);
  const ecu = 0.003; // Ultimate concrete strain
  const ey = fy / Es; // Yield strain of steel

  // Balanced neutral axis ratio
  const cb_over_d = ecu / (ecu + ey);

  // Balanced reinforcement ratio
  const rho_b = (0.85 * fc * beta1 * cb_over_d) / fy;

  return rho_b;
}

/**
 * Estimate bar diameter based on total steel area
 * Returns diameter in mm
 */
function estimateBarDiameter(totalArea: number): number {
  // Common bar sizes and their areas (mm²)
  const barSizes = [
    { diameter: 10, area: 78.5 },
    { diameter: 12, area: 113.1 },
    { diameter: 16, area: 201.1 },
    { diameter: 20, area: 314.2 },
    { diameter: 25, area: 490.9 },
    { diameter: 32, area: 804.2 }
  ];

  // Find the bar size that would give reasonable number of bars (2-8 bars)
  for (const bar of barSizes) {
    const numBars = totalArea / bar.area;
    if (numBars >= 2 && numBars <= 8) {
      return bar.diameter;
    }
  }

  // Default to 20mm if no good fit found
  return 20;
}

/**
 * Validate numerical input ranges
 */
export function validateNumberInput(
  value: number,
  name: string,
  min?: number,
  max?: number,
  allowZero: boolean = false
): string[] {
  const errors: string[] = [];

  if (isNaN(value) || !isFinite(value)) {
    errors.push(`${name} must be a valid number`);
    return errors;
  }

  if (!allowZero && value === 0) {
    errors.push(`${name} cannot be zero`);
  }

  if (min !== undefined && value < min) {
    errors.push(`${name} must be at least ${min}`);
  }

  if (max !== undefined && value > max) {
    errors.push(`${name} cannot exceed ${max}`);
  }

  return errors;
}

/**
 * Convert units helper functions
 */
export const UnitConverters = {
  // Convert kN·m to N·mm for internal calculations
  momentToNmm: (momentKnm: number) => momentKnm * 1e6,

  // Convert N·mm to kN·m for display
  momentToKnm: (momentNmm: number) => momentNmm / 1e6,

  // Convert MPa to N/mm² (they're the same, but for clarity)
  mpaToNmm2: (mpa: number) => mpa,

  // Validate unit consistency
  validateUnits: (inputs: BeamInputs) => {
    const warnings: string[] = [];

    // Check if dimensions seem to be in wrong units
    if (inputs.width < 10 || inputs.height < 10) {
      warnings.push("Dimensions appear very small - ensure they are in millimeters");
    }

    if (inputs.width > 10000 || inputs.height > 10000) {
      warnings.push("Dimensions appear very large - ensure they are in millimeters");
    }

    return warnings;
  }
};