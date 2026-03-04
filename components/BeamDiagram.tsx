import React from 'react';

export interface BeamDiagramProps {
  width: number;          // mm
  height: number;         // mm
  effectiveDepth: number; // mm
  neutralAxisDepth: number; // mm
  stressBlockDepth: number; // mm
  tensionSteelArea: number; // mm²
  compressionSteelArea?: number; // mm²
  compressionSteelDepth?: number; // mm
  className?: string;
}

const BeamDiagram: React.FC<BeamDiagramProps> = ({
  width,
  height,
  effectiveDepth,
  neutralAxisDepth,
  stressBlockDepth,
  tensionSteelArea,
  compressionSteelArea = 0,
  compressionSteelDepth = 50,
  className = ''
}) => {
  // SVG dimensions and scaling
  const svgWidth = 400;
  const svgHeight = 300;
  const margin = 40;

  // Calculate scale factors
  const maxDimension = Math.max(width, height);
  const scale = Math.min((svgWidth - 2 * margin) / width, (svgHeight - 2 * margin) / height);

  // Scaled dimensions
  const scaledWidth = width * scale;
  const scaledHeight = height * scale;
  const scaledEffectiveDepth = effectiveDepth * scale;
  const scaledNeutralAxis = neutralAxisDepth * scale;
  const scaledStressBlock = stressBlockDepth * scale;
  const scaledCompressionSteelDepth = compressionSteelDepth * scale;

  // Position calculations
  const beamX = (svgWidth - scaledWidth) / 2;
  const beamY = (svgHeight - scaledHeight) / 2;
  const neutralAxisY = beamY + scaledNeutralAxis;
  const stressBlockHeight = scaledStressBlock;
  const effectiveDepthY = beamY + scaledEffectiveDepth;
  const compressionSteelY = beamY + scaledCompressionSteelDepth;

  // Calculate reinforcement representation
  const estimateBarCount = (area: number) => Math.max(2, Math.min(8, Math.ceil(area / 300)));
  const tensionBarCount = estimateBarCount(tensionSteelArea);
  const compressionBarCount = compressionSteelArea > 0 ? estimateBarCount(compressionSteelArea) : 0;

  return (
    <div className={`engineering-card p-6 ${className}`}>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Cross-Section Analysis</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Beam Cross-Section */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-3">Beam Section</h4>
          <svg width={svgWidth} height={svgHeight} className="border border-gray-200 rounded">
            {/* Beam outline */}
            <rect
              x={beamX}
              y={beamY}
              width={scaledWidth}
              height={scaledHeight}
              fill="none"
              stroke="black"
              strokeWidth="2"
            />

            {/* Stress block */}
            <rect
              x={beamX}
              y={beamY}
              width={scaledWidth}
              height={stressBlockHeight}
              fill="rgba(220, 38, 38, 0.3)"
              stroke="rgba(220, 38, 38, 0.6)"
              strokeWidth="1"
            />

            {/* Neutral axis line */}
            <line
              x1={beamX - 10}
              y1={neutralAxisY}
              x2={beamX + scaledWidth + 10}
              y2={neutralAxisY}
              stroke="blue"
              strokeWidth="2"
              strokeDasharray="5,5"
            />

            {/* Effective depth line */}
            <line
              x1={beamX}
              y1={effectiveDepthY}
              x2={beamX + scaledWidth}
              y2={effectiveDepthY}
              stroke="green"
              strokeWidth="1"
              strokeDasharray="3,3"
            />

            {/* Tension steel bars */}
            {Array.from({ length: tensionBarCount }, (_, i) => {
              const x = beamX + scaledWidth * 0.15 + (i * (scaledWidth * 0.7)) / (tensionBarCount - 1);
              return (
                <circle
                  key={`tension-${i}`}
                  cx={x}
                  cy={effectiveDepthY}
                  r="4"
                  fill="black"
                  stroke="white"
                  strokeWidth="1"
                />
              );
            })}

            {/* Compression steel bars (if any) */}
            {compressionBarCount > 0 &&
              Array.from({ length: compressionBarCount }, (_, i) => {
                const x = beamX + scaledWidth * 0.15 + (i * (scaledWidth * 0.7)) / (compressionBarCount - 1);
                return (
                  <circle
                    key={`compression-${i}`}
                    cx={x}
                    cy={compressionSteelY}
                    r="3"
                    fill="gray"
                    stroke="white"
                    strokeWidth="1"
                  />
                );
              })}

            {/* Dimension lines and labels */}
            {/* Width dimension */}
            <g>
              <line x1={beamX} y1={beamY - 20} x2={beamX + scaledWidth} y2={beamY - 20} stroke="gray" strokeWidth="1" />
              <line x1={beamX} y1={beamY - 25} x2={beamX} y2={beamY - 15} stroke="gray" strokeWidth="1" />
              <line x1={beamX + scaledWidth} y1={beamY - 25} x2={beamX + scaledWidth} y2={beamY - 15} stroke="gray" strokeWidth="1" />
              <text x={beamX + scaledWidth / 2} y={beamY - 25} textAnchor="middle" fontSize="12" fill="gray">
                {width} mm
              </text>
            </g>

            {/* Height dimension */}
            <g>
              <line x1={beamX - 20} y1={beamY} x2={beamX - 20} y2={beamY + scaledHeight} stroke="gray" strokeWidth="1" />
              <line x1={beamX - 25} y1={beamY} x2={beamX - 15} y2={beamY} stroke="gray" strokeWidth="1" />
              <line x1={beamX - 25} y1={beamY + scaledHeight} x2={beamX - 15} y2={beamY + scaledHeight} stroke="gray" strokeWidth="1" />
              <text x={beamX - 30} y={beamY + scaledHeight / 2} textAnchor="middle" fontSize="12" fill="gray" transform={`rotate(-90, ${beamX - 30}, ${beamY + scaledHeight / 2})`}>
                {height} mm
              </text>
            </g>

            {/* Labels */}
            <text x={beamX + scaledWidth + 15} y={neutralAxisY + 3} fontSize="12" fill="blue">
              N.A. (c = {neutralAxisDepth.toFixed(0)} mm)
            </text>
            <text x={beamX + scaledWidth + 15} y={effectiveDepthY + 3} fontSize="12" fill="green">
              d = {effectiveDepth} mm
            </text>
            <text x={beamX + scaledWidth / 2} y={beamY + stressBlockHeight / 2} textAnchor="middle" fontSize="10" fill="red">
              0.85f'c
            </text>
          </svg>
        </div>

        {/* Strain Diagram */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-3">Strain Distribution</h4>
          <svg width={svgWidth} height={svgHeight} className="border border-gray-200 rounded">
            {/* Strain diagram background */}
            <rect x={50} y={beamY} width="200" height={scaledHeight} fill="rgba(0, 0, 0, 0.05)" stroke="gray" strokeWidth="1" />

            {/* Strain diagram triangle */}
            <polygon
              points={`50,${beamY} 150,${beamY} 150,${neutralAxisY} 50,${neutralAxisY}`}
              fill="rgba(220, 38, 38, 0.2)"
              stroke="red"
              strokeWidth="1"
            />

            {/* Strain lines */}
            <line x1="50" y1={beamY} x2="50" y2={beamY + scaledHeight} stroke="black" strokeWidth="2" />
            <line x1="150" y1={beamY} x2="150" y2={neutralAxisY} stroke="red" strokeWidth="2" />
            <line x1="50" y1={neutralAxisY} x2="250" y2={effectiveDepthY} stroke="blue" strokeWidth="2" />

            {/* Strain values */}
            <text x="160" y={beamY + 10} fontSize="11" fill="red">εc = 0.003</text>
            <text x="160" y={neutralAxisY + 3} fontSize="11" fill="blue">ε = 0</text>
            <text x="260" y={effectiveDepthY} fontSize="11" fill="blue">
              εs = {(neutralAxisDepth > 0 ? ((effectiveDepth - neutralAxisDepth) * 0.003 / neutralAxisDepth) : 0).toFixed(4)}
            </text>

            {/* Neutral axis indicator */}
            <line x1="40" y1={neutralAxisY} x2="260" y2={neutralAxisY} stroke="blue" strokeWidth="1" strokeDasharray="3,3" />

            {/* Labels */}
            <text x="30" y={beamY + 10} fontSize="11" fill="gray">Compression</text>
            <text x="30" y={beamY + scaledHeight - 5} fontSize="11" fill="gray">Tension</text>
          </svg>
        </div>
      </div>

      {/* Section Properties Summary */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 p-3 rounded text-center">
          <div className="text-lg font-bold text-gray-900">{(width * height / 1000).toFixed(0)}</div>
          <div className="text-xs text-gray-600">Gross Area (cm²)</div>
        </div>
        <div className="bg-gray-50 p-3 rounded text-center">
          <div className="text-lg font-bold text-gray-900">{tensionSteelArea}</div>
          <div className="text-xs text-gray-600">As (mm²)</div>
        </div>
        <div className="bg-gray-50 p-3 rounded text-center">
          <div className="text-lg font-bold text-gray-900">{((tensionSteelArea / (width * effectiveDepth)) * 100).toFixed(2)}%</div>
          <div className="text-xs text-gray-600">Reinf. Ratio</div>
        </div>
        <div className="bg-gray-50 p-3 rounded text-center">
          <div className="text-lg font-bold text-gray-900">{(neutralAxisDepth / effectiveDepth).toFixed(2)}</div>
          <div className="text-xs text-gray-600">c/d Ratio</div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-300 border border-red-600"></div>
          <span>Compression stress block</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-black rounded-full"></div>
          <span>Tension steel</span>
        </div>
        {compressionSteelArea > 0 && (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
            <span>Compression steel</span>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <div className="w-4 h-1 border-b-2 border-blue-500 border-dashed"></div>
          <span>Neutral axis</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-1 border-b border-green-500 border-dashed"></div>
          <span>Effective depth</span>
        </div>
      </div>
    </div>
  );
};

export default BeamDiagram;