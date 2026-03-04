/**
 * Material Properties Module
 * Handles concrete and steel material properties per ACI 318
 */

export interface ConcreteProperties {
  fc: number; // Concrete compressive strength (MPa)
  Ec: number; // Concrete modulus of elasticity (MPa)
  beta1: number; // Stress block factor
  maxStrainConcrete: number; // Maximum concrete strain (0.003)
}

export interface SteelProperties {
  fy: number; // Steel yield strength (MPa)
  Es: number; // Steel modulus of elasticity (MPa)
  minStrainTension: number; // Minimum tension strain for tension-controlled (0.005)
}

/**
 * Calculate concrete properties based on compressive strength
 * Per ACI 318 requirements
 */
export function getConcreteProperties(fc: number): ConcreteProperties {
  // Concrete modulus of elasticity: Ec = 4700√fc' (MPa)
  const Ec = 4700 * Math.sqrt(fc);

  // Beta1 factor per ACI 318-19 Section 22.2.2.4.3
  let beta1: number;
  if (fc <= 28) {
    beta1 = 0.85;
  } else if (fc <= 56) {
    beta1 = 0.85 - 0.05 * (fc - 28) / 7;
  } else {
    beta1 = 0.65;
  }

  return {
    fc,
    Ec,
    beta1,
    maxStrainConcrete: 0.003 // ACI 318 assumption
  };
}

/**
 * Get standard steel properties
 * Default to Grade 420 steel (fy = 420 MPa)
 */
export function getSteelProperties(fy: number = 420): SteelProperties {
  return {
    fy,
    Es: 200000, // Steel modulus of elasticity (MPa)
    minStrainTension: 0.005 // ACI 318 requirement for tension-controlled
  };
}

/**
 * Calculate steel strain based on section analysis
 */
export function calculateSteelStrain(
  c: number,    // Neutral axis depth from extreme compression fiber (mm)
  d: number,    // Effective depth to tension steel (mm)
  ec: number = 0.003  // Concrete strain at extreme compression fiber
): number {
  // From strain compatibility: εs = εc * (d - c) / c
  return ec * (d - c) / c;
}

/**
 * Determine if steel has yielded based on strain
 */
export function hasSteelYielded(strain: number, fy: number, Es: number): boolean {
  const yieldStrain = fy / Es;
  return Math.abs(strain) >= yieldStrain;
}

/**
 * Calculate steel stress based on strain (elastic-plastic model)
 */
export function calculateSteelStress(strain: number, fy: number, Es: number): number {
  const yieldStrain = fy / Es;

  if (Math.abs(strain) <= yieldStrain) {
    // Elastic range
    return Es * strain;
  } else {
    // Yielded - return yield stress with appropriate sign
    return Math.sign(strain) * fy;
  }
}

/**
 * Check if section is tension-controlled per ACI 318
 * Tension-controlled if εt ≥ 0.005
 */
export function isTensionControlled(
  c: number,    // Neutral axis depth (mm)
  d: number,    // Effective depth (mm)
  ec: number = 0.003  // Concrete strain
): boolean {
  const tensionStrain = calculateSteelStrain(c, d, ec);
  return tensionStrain >= 0.005;
}

/**
 * Get strength reduction factor (phi) per ACI 318
 */
export function getStrengthReductionFactor(
  c: number,
  d: number,
  ec: number = 0.003
): number {
  if (isTensionControlled(c, d, ec)) {
    return 0.9; // Tension-controlled sections
  } else {
    // Compression-controlled or transition zone
    // For simplicity, use 0.65 for compression-controlled
    // In practice, this would be interpolated for transition zone
    return 0.65;
  }
}

/**
 * Material property validation
 */
export function validateMaterialProperties(fc: number, fy: number): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Concrete strength validation
  if (fc <= 0) {
    errors.push("Concrete strength must be positive");
  }
  if (fc < 17) {
    errors.push("Concrete strength should be at least 17 MPa for structural use");
  }
  if (fc > 100) {
    errors.push("Concrete strength over 100 MPa requires special consideration");
  }

  // Steel strength validation
  if (fy <= 0) {
    errors.push("Steel yield strength must be positive");
  }
  if (fy < 300) {
    errors.push("Steel yield strength should be at least 300 MPa");
  }
  if (fy > 700) {
    errors.push("Steel yield strength over 700 MPa requires special consideration");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}