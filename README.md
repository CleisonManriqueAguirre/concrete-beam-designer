# Concrete Beam Designer

A professional web application for civil engineers to design concrete beams with structural analysis capabilities. Performs moment balance calculations per ACI 318 requirements.

## 🏗️ Features

- **ACI 318 Compliant Analysis**: Complete moment capacity analysis following ACI 318-19 building code requirements
- **Interactive Engineering Interface**: Professional form with input validation and engineering units
- **Visual Cross-Section Display**: Beam diagrams showing stress blocks, neutral axis, and strain distribution
- **Comprehensive Reports**: Step-by-step calculations with code references and design recommendations
- **Real-time Validation**: Input validation with warnings and engineering best practices
- **Professional Export**: Print reports and export calculation data

## 🔬 Structural Analysis

### Capabilities
- Moment balance analysis using strain compatibility
- Neutral axis calculation with iterative force equilibrium
- ACI 318 stress block parameters (β₁ factors)
- Steel strain verification for tension-controlled behavior
- Strength reduction factor application (φ = 0.9 for flexure)
- Minimum and maximum reinforcement ratio checks

### Code Compliance
- ACI 318-19 Building Code Requirements
- Strain compatibility assumptions (εc = 0.003)
- Material property calculations (Ec = 4700√fc')
- Safety factor requirements (φMn ≥ Mu)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd concrete-beam-designer
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## 🌐 Deployment

### Vercel Deployment (Recommended)

This application is optimized for Vercel deployment:

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy to Vercel:
```bash
vercel
```

3. Follow the prompts to configure your deployment

### Environment Variables

No environment variables are required for basic operation. All calculations run client-side and server-side without external dependencies.

## 📋 Usage

### Basic Analysis

1. **Enter Beam Geometry**:
   - Width (mm)
   - Height (mm)
   - Effective depth to tension steel (mm)

2. **Specify Material Properties**:
   - Concrete compressive strength f'c (MPa)
   - Steel yield strength fy (MPa)

3. **Define Loading**:
   - Applied factored moment Mu (kN·m)

4. **Input Reinforcement**:
   - Tension steel area As (mm²)
   - Optional compression steel area A's (mm²)

5. Click "Analyze Beam Capacity" to generate results

### Example Calculations

The application includes pre-configured examples:
- **Small Beam**: 250×400mm with light reinforcement
- **Medium Beam**: 300×600mm with typical reinforcement
- **Large Beam**: 400×800mm with heavy reinforcement

## 🧮 Technical Details

### Architecture
- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes (serverless functions)
- **Calculations**: Custom TypeScript modules for structural analysis
- **Deployment**: Vercel (optimized for serverless)

### Key Modules

- `utils/beamCalculations.ts` - Core moment balance analysis
- `utils/materialProperties.ts` - Concrete and steel property functions
- `utils/validators.ts` - Input validation and engineering checks
- `components/BeamInputForm.tsx` - Professional input interface
- `components/ResultsDisplay.tsx` - Engineering report display
- `components/BeamDiagram.tsx` - Visual beam representation

### Calculation Method

The analysis follows the ACI 318 moment balance approach:

1. **Force Equilibrium**: Cc = Ts
   - Compression force: Cc = 0.85 × fc' × a × b
   - Tension force: Ts = As × fs

2. **Strain Compatibility**:
   - εc = 0.003 at extreme compression fiber
   - εs = εc × (d - c) / c for steel strain

3. **Moment Capacity**:
   - Mn = Ts × (d - a/2)
   - φMn = φ × Mn (φ = 0.9 for tension-controlled)

4. **Adequacy Check**: φMn ≥ Mu

## ⚠️ Disclaimer

This tool is for preliminary design and educational purposes only. Always:

- Verify results with manual calculations
- Consult local building codes and standards
- Obtain professional engineering review for actual construction
- Consider additional factors like shear, deflection, and constructability

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for:

- Additional ACI 318 provisions
- Enhanced input validation
- Additional export formats
- UI/UX improvements
- Performance optimizations

## 📧 Support

For questions or support, please open an issue in the GitHub repository.

---

**Built for Civil Engineers, by Engineers** 🏗️

*Professional structural analysis tools for modern engineering practice*
