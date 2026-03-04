/**
 * Beam Calculations Module
 * Core moment balance analysis per ACI 318 requirements
 */

import {
  getConcreteProperties,
  getSteelProperties,
  calculateSteelStrain,
  calculateSteelStress,
  getStrengthReductionFactor,
  isTensionControlled
} from './materialProperties';
import { BeamInputs } from './validators';

export interface CalculationResult {
  isAdequate: boolean;
  phiMn: number;           // Design moment capacity (kN·m)
  Mu: number;             // Applied moment (kN·m)
  safetyFactor: number;   // φMn / Mu
  neutralAxisDepth: number; // c (mm)
  stressBlockDepth: number; // a (mm)
  tensionStrain: number;   // εs
  compressionStrain: number; // εc
  isTensionControlled: boolean;
  phi: number;            // Strength reduction factor
  calculationSteps: CalculationStep[];
  materialProperties: MaterialSummary;
  recommendations: string[];
}

export interface CalculationStep {
  step: number;
  description: string;
  formula: string;
  calculation: string;
  result: string;
  reference: string;
}

export interface MaterialSummary {
  concrete: {
    fc: number;
    Ec: number;
    beta1: number;
  };
  steel: {
    fy: number;
    Es: number;
  };
}

/**
 * Main beam analysis function
 * Performs complete moment capacity analysis per ACI 318
 */
export function analyzeBeamCapacity(inputs: BeamInputs): CalculationResult {
  const steps: CalculationStep[] = [];
  const recommendations: string[] = [];

  // Material properties
  const concrete = getConcreteProperties(inputs.concreteStrength);
  const steel = getSteelProperties(inputs.steelYieldStrength);

  steps.push({
    step: 1,
    description: "Determine material properties",
    formula: "fc' = given, fy = given, Es = 200,000 MPa, β₁ = f(fc')",
    calculation: `fc' = ${inputs.concreteStrength} MPa, fy = ${inputs.steelYieldStrength} MPa`,
    result: `β₁ = ${concrete.beta1.toFixed(3)}, Ec = ${(concrete.Ec/1000).toFixed(0)} GPa`,
    reference: "ACI 318-19 Ch. 19, 20"
  });

  // Calculate neutral axis depth using force equilibrium
  const analysisResult = calculateNeutralAxis(inputs, concrete, steel, steps);

  if (!analysisResult.converged) {
    return {
      isAdequate: false,
      phiMn: 0,
      Mu: inputs.appliedMoment,
      safetyFactor: 0,
      neutralAxisDepth: 0,
      stressBlockDepth: 0,
      tensionStrain: 0,
      compressionStrain: 0.003,
      isTensionControlled: false,
      phi: 0,
      calculationSteps: steps,
      materialProperties: {
        concrete: { fc: concrete.fc, Ec: concrete.Ec, beta1: concrete.beta1 },
        steel: { fy: steel.fy, Es: steel.Es }
      },
      recommendations: ["Analysis did not converge. Check input values."]
    };
  }

  const c = analysisResult.c;
  const a = c * concrete.beta1;

  // Calculate strains
  const tensionStrain = calculateSteelStrain(c, inputs.effectiveDepth);
  const compressionStrain = 0.003; // Assumed at ultimate

  steps.push({
    step: steps.length + 1,
    description: "Calculate steel strain at ultimate limit state",
    formula: "εs = εc × (d - c) / c",
    calculation: `εs = 0.003 × (${inputs.effectiveDepth} - ${c.toFixed(1)}) / ${c.toFixed(1)}`,
    result: `εs = ${tensionStrain.toFixed(6)}`,
    reference: "ACI 318-19 22.2.1.3"
  });

  // Check tension-controlled behavior
  const tensionControlled = isTensionControlled(c, inputs.effectiveDepth);
  const phi = getStrengthReductionFactor(c, inputs.effectiveDepth);

  steps.push({
    step: steps.length + 1,
    description: "Verify tension-controlled behavior",
    formula: "εt ≥ 0.005 for φ = 0.9",
    calculation: `εt = ${tensionStrain.toFixed(6)} ${tensionControlled ? '≥' : '<'} 0.005`,
    result: tensionControlled ? "Tension-controlled" : "Not tension-controlled",
    reference: "ACI 318-19 21.2.2"
  });

  // Calculate nominal moment capacity
  const Mn = calculateNominalMoment(inputs, c, concrete, steel, steps);
  const phiMn = phi * Mn;
  const phiMnKnm = phiMn / 1e6; // Convert to kN·m

  steps.push({
    step: steps.length + 1,
    description: "Apply strength reduction factor",
    formula: "φMn = φ × Mn",
    calculation: `φMn = ${phi} × ${(Mn/1e6).toFixed(1)}`,
    result: `φMn = ${phiMnKnm.toFixed(1)} kN·m`,
    reference: "ACI 318-19 21.2.1"
  });

  // Safety check
  const safetyFactor = phiMnKnm / inputs.appliedMoment;
  const isAdequate = phiMnKnm >= inputs.appliedMoment;

  steps.push({
    step: steps.length + 1,
    description: "Check adequacy",
    formula: "φMn ≥ Mu",
    calculation: `${phiMnKnm.toFixed(1)} ${isAdequate ? '≥' : '<'} ${inputs.appliedMoment}`,
    result: isAdequate ? "ADEQUATE" : "INADEQUATE",
    reference: "ACI 318-19 9.1.1"
  });

  // Generate recommendations
  generateRecommendations(inputs, analysisResult, phi, safetyFactor, isAdequate, recommendations);

  return {
    isAdequate,
    phiMn: phiMnKnm,
    Mu: inputs.appliedMoment,
    safetyFactor,
    neutralAxisDepth: c,
    stressBlockDepth: a,
    tensionStrain,
    compressionStrain,
    isTensionControlled: tensionControlled,
    phi,
    calculationSteps: steps,
    materialProperties: {
      concrete: { fc: concrete.fc, Ec: concrete.Ec, beta1: concrete.beta1 },
      steel: { fy: steel.fy, Es: steel.Es }
    },
    recommendations
  };
}

interface NeutralAxisResult {
  c: number;
  converged: boolean;
  iterations: number;
}

/**
 * Calculate neutral axis depth using iterative approach
 * Balances compression and tension forces
 */
function calculateNeutralAxis(
  inputs: BeamInputs,
  concrete: any,
  steel: any,
  steps: CalculationStep[]
): NeutralAxisResult {
  const { width, effectiveDepth, tensionSteelArea } = inputs;
  const { fc, beta1 } = concrete;
  const { fy, Es } = steel;

  // Initial guess for neutral axis depth
  let c = effectiveDepth * 0.3; // Start with 30% of effective depth
  const tolerance = 0.001;
  const maxIterations = 100;
  let iteration = 0;

  steps.push({
    step: steps.length + 1,
    description: "Solve for neutral axis depth using force equilibrium",
    formula: "Cc = Ts → 0.85fc'ab = Asfs",
    calculation: "Iterative solution for force balance",
    result: "Starting iterations...",
    reference: "ACI 318-19 22.2.2"
  });

  while (iteration < maxIterations) {
    iteration++;

    // Calculate stress block depth
    const a = c * beta1;

    // Check if stress block is within beam height
    if (a > inputs.height) {
      c = inputs.height / beta1 * 0.95; // Reduce c
      continue;
    }

    // Calculate compression force
    const Cc = 0.85 * fc * a * width;

    // Calculate tension steel strain and stress
    const steelStrain = calculateSteelStrain(c, effectiveDepth);
    const steelStress = calculateSteelStress(steelStrain, fy, Es);
    const Ts = tensionSteelArea * steelStress;

    // Check force balance
    const forceImbalance = Math.abs(Cc - Ts);
    const relativeError = forceImbalance / Math.max(Cc, Ts);

    if (relativeError < tolerance) {
      steps.push({
        step: steps.length + 1,
        description: "Force equilibrium achieved",
        formula: "Cc = Ts",
        calculation: `${Cc.toFixed(0)} N = ${Ts.toFixed(0)} N`,
        result: `c = ${c.toFixed(1)} mm, a = ${a.toFixed(1)} mm (${iteration} iterations)`,
        reference: "Converged solution"
      });

      return { c, converged: true, iterations: iteration };
    }

    // Update neutral axis depth
    if (Cc > Ts) {
      // Too much compression, reduce c
      c *= 0.95;
    } else {
      // Too much tension, increase c
      c *= 1.05;
    }

    // Bounds checking
    c = Math.max(10, Math.min(c, effectiveDepth * 0.9));
  }

  // Failed to converge
  steps.push({
    step: steps.length + 1,
    description: "Force equilibrium solution",
    formula: "Cc = Ts",
    calculation: "Failed to converge",
    result: `Did not converge after ${maxIterations} iterations`,
    reference: "Solution error"
  });

  return { c: 0, converged: false, iterations: maxIterations };
}

/**
 * Calculate nominal moment capacity
 */
function calculateNominalMoment(
  inputs: BeamInputs,
  c: number,
  concrete: any,
  steel: any,
  steps: CalculationStep[]
): number {
  const { width, effectiveDepth, tensionSteelArea } = inputs;
  const { fc, beta1 } = concrete;
  const { fy, Es } = steel;

  const a = c * beta1;

  // Calculate forces
  const Cc = 0.85 * fc * a * width;
  const steelStrain = calculateSteelStrain(c, effectiveDepth);
  const steelStress = calculateSteelStress(steelStrain, fy, Es);
  const Ts = tensionSteelArea * steelStress;

  // Calculate moment arms
  const leverArm = effectiveDepth - a/2;
  const Mn = Ts * leverArm;

  steps.push({
    step: steps.length + 1,
    description: "Calculate nominal moment capacity",
    formula: "Mn = Ts × (d - a/2)",
    calculation: `Mn = ${Ts.toFixed(0)} × (${effectiveDepth} - ${a.toFixed(1)}/2)`,
    result: `Mn = ${(Mn/1e6).toFixed(1)} kN·m`,
    reference: "ACI 318-19 22.2.2.1"
  });

  return Mn;
}

/**
 * Generate design recommendations
 */
function generateRecommendations(
  inputs: BeamInputs,
  analysisResult: NeutralAxisResult,
  phi: number,
  safetyFactor: number,
  isAdequate: boolean,
  recommendations: string[]
): void {
  if (!isAdequate) {
    recommendations.push("Section is inadequate. Consider one of the following:");

    if (safetyFactor < 0.7) {
      recommendations.push("• Significantly increase beam dimensions or steel reinforcement");
    } else {
      recommendations.push("• Increase tension steel area");
      recommendations.push("• Increase beam width or effective depth");
    }

    recommendations.push("• Use higher strength concrete or steel");
    recommendations.push("• Add compression steel if ductility allows");
  } else {
    if (safetyFactor > 2.0) {
      recommendations.push("Section is over-designed. Consider:");
      recommendations.push("• Reducing steel reinforcement for economy");
      recommendations.push("• Using smaller beam dimensions");
    } else if (safetyFactor > 1.3) {
      recommendations.push("Section has adequate capacity with reasonable safety margin");
    } else {
      recommendations.push("Section is adequate but with minimal safety margin");
      recommendations.push("Consider increasing capacity for robustness");
    }
  }

  // Ductility recommendations
  if (phi < 0.9) {
    recommendations.push("• Section may not be tension-controlled - verify ductility requirements");
  }

  // Practical considerations
  const reinforcementRatio = inputs.tensionSteelArea / (inputs.width * inputs.effectiveDepth);
  if (reinforcementRatio < 0.005) {
    recommendations.push("• Low reinforcement ratio - check minimum steel requirements");
  }
  if (reinforcementRatio > 0.025) {
    recommendations.push("• High reinforcement ratio - verify constructability and cover requirements");
  }
}

/**
 * Quick capacity check without full analysis
 */
export function quickCapacityCheck(inputs: BeamInputs): {
  estimatedCapacity: number;
  isLikelyAdequate: boolean;
} {
  // Simplified analysis assuming yielded steel and reasonable neutral axis
  const assumedLeverArm = inputs.effectiveDepth * 0.85;
  const Ts = inputs.tensionSteelArea * inputs.steelYieldStrength;
  const estimatedMn = Ts * assumedLeverArm;
  const estimatedPhiMn = 0.9 * estimatedMn / 1e6; // Convert to kN·m

  return {
    estimatedCapacity: estimatedPhiMn,
    isLikelyAdequate: estimatedPhiMn >= inputs.appliedMoment
  };
}