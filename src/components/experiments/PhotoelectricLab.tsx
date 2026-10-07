import { useState } from 'react';
import { MathFormula } from '../common/MathFormula';
import { Sun, AlertCircle, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../i18n';

interface MetalTarget {
  nameKey: 'cesium' | 'potassium' | 'sodium' | 'zinc' | 'copper';
  workFunction: number; // in eV
  symbol: string;
}

const METALS: MetalTarget[] = [
  { nameKey: 'cesium', symbol: 'Cs', workFunction: 2.14 },
  { nameKey: 'potassium', symbol: 'K', workFunction: 2.30 },
  { nameKey: 'sodium', symbol: 'Na', workFunction: 2.36 },
  { nameKey: 'zinc', symbol: 'Zn', workFunction: 4.30 },
  { nameKey: 'copper', symbol: 'Cu', workFunction: 4.70 },
];

export const PhotoelectricLab: React.FC = () => {
  const { t } = useLanguage();
  const [wavelength, setWavelength] = useState<number>(450); // nm
  const [selectedMetal, setSelectedMetal] = useState<MetalTarget>(METALS[0]);
  const [intensity, setIntensity] = useState<number>(3); // số photon phát xạ

  // E = hc / lambda (in eV): hc ≈ 1240 eV.nm
  const photonEnergy = 1239.84 / wavelength;
  const canEject = photonEnergy >= selectedMetal.workFunction;
  const kineticEnergy = canEject ? photonEnergy - selectedMetal.workFunction : 0;

  // Color mapping from wavelength
  const getColorFromWavelength = (wl: number) => {
    if (wl >= 650) return { bg: 'bg-red-500', hex: '#ef4444', name: t.labs.photoelectric.colors.red };
    if (wl >= 590) return { bg: 'bg-orange-500', hex: '#f97316', name: t.labs.photoelectric.colors.orange };
    if (wl >= 560) return { bg: 'bg-yellow-400', hex: '#facc15', name: t.labs.photoelectric.colors.yellow };
    if (wl >= 490) return { bg: 'bg-emerald-500', hex: '#10b981', name: t.labs.photoelectric.colors.green };
    if (wl >= 430) return { bg: 'bg-cyan-400', hex: '#06b6d4', name: t.labs.photoelectric.colors.cyan };
    if (wl >= 380) return { bg: 'bg-purple-500', hex: '#a855f7', name: t.labs.photoelectric.colors.purple };
    return { bg: 'bg-indigo-700', hex: '#4338ca', name: t.labs.photoelectric.colors.uv };
  };

  const currentColor = getColorFromWavelength(wavelength);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-8 flex flex-col gap-6 backdrop-blur-md shadow-2xl">
      {/* Lab Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 bg-purple-500/15 border border-purple-500/30 text-purple-300 rounded-lg text-xs font-mono font-bold">
            {t.labs.photoelectric.badge}
          </span>
          <h3 className="text-xl lg:text-2xl font-black text-white mt-2">
            {t.labs.photoelectric.title}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {t.labs.photoelectric.description}
          </p>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs flex items-center gap-3">
          <div className="font-mono text-center">
            <div className="text-[10px] text-slate-400">{t.labs.photoelectric.formulaTitle}</div>
            <div className="text-cyan-300 font-bold text-sm mt-0.5">
              <MathFormula math="K_{\max} = h\nu - \Phi" />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Simulation Bench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Visual Chamber */}
        <div className="lg:col-span-7 bg-slate-950 rounded-2xl border border-slate-800 p-6 h-[320px] relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{t.labs.photoelectric.vacuumTube}</span>
            <span className="font-mono text-cyan-300">
              {t.labs.photoelectric.wavelengthLabel} {wavelength} nm ({currentColor.name})
            </span>
          </div>

          {/* Graphical visualization of photon beams hitting cathode */}
          <div className="relative flex-1 flex items-center justify-between px-8">
            {/* Light Source Torch */}
            <div className="flex flex-col items-center">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-colors"
                style={{ backgroundColor: currentColor.hex }}
              >
                <Sun className="w-6 h-6 text-slate-950 animate-spin" style={{ animationDuration: '8s' }} />
              </div>
              <span className="text-[10px] text-slate-400 mt-1">{t.labs.photoelectric.lightSource}</span>
            </div>

            {/* Flying Photons to Target */}
            <div className="flex-1 flex flex-col justify-around h-24 px-4 overflow-hidden">
              {Array.from({ length: intensity }).map((_, idx) => (
                <div key={idx} className="relative flex items-center">
                  <div
                    className="h-1.5 rounded-full animate-pulse transition-all"
                    style={{
                      width: '40px',
                      backgroundColor: currentColor.hex,
                      boxShadow: `0 0 12px ${currentColor.hex}`,
                    }}
                  />
                  <span className="text-[9px] font-mono text-slate-400 ml-2">hν</span>
                </div>
              ))}
            </div>

            {/* Metal Target Cathode */}
            <div className="flex flex-col items-center">
              <div className="w-6 h-36 bg-gradient-to-b from-slate-400 via-slate-200 to-slate-400 rounded-lg shadow-md border border-slate-300 relative flex items-center justify-center">
                <span className="text-[10px] font-bold text-slate-950 -rotate-90 whitespace-nowrap">
                  {t.labs.photoelectric.metals[selectedMetal.nameKey]}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1">{t.labs.photoelectric.workFunctionPrefix}{selectedMetal.workFunction}eV</span>
            </div>

            {/* Ejected Electrons */}
            <div className="flex-1 flex flex-col justify-around h-24 px-4">
              {canEject ? (
                Array.from({ length: intensity }).map((_, idx) => (
                  <div key={idx} className="flex items-center animate-pulse">
                    <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 text-slate-950 text-[9px] font-bold flex items-center justify-center shadow-md shadow-cyan-400/80">
                      e⁻
                    </div>
                    <div className="h-0.5 bg-cyan-400/50 flex-1 ml-1" />
                  </div>
                ))
              ) : (
                <div className="text-center text-[11px] text-rose-400 font-mono italic">
                  {t.labs.photoelectric.noElectronsEjected}
                </div>
              )}
            </div>

            {/* Anode Collector */}
            <div className="w-4 h-36 bg-slate-700 rounded-lg border border-slate-600" />
          </div>

          {/* Status Message */}
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-900">
            <div className="flex items-center gap-2">
              {canEject ? (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              )}
              <span className={canEject ? 'text-emerald-300 font-semibold' : 'text-rose-300 font-semibold'}>
                {canEject
                  ? `${t.labs.photoelectric.ejectedStatus} K = ${kineticEnergy.toFixed(2)} eV`
                  : `${t.labs.photoelectric.insufficientStatus} (${photonEnergy.toFixed(2)} eV < ${selectedMetal.workFunction} eV)`}
              </span>
            </div>
          </div>
        </div>

        {/* Right Parameter Controls */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Metal Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">{t.labs.photoelectric.selectMetalLabel}</label>
            <div className="grid grid-cols-2 gap-2">
              {METALS.map((metal) => (
                <button
                  key={metal.symbol}
                  onClick={() => setSelectedMetal(metal)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    selectedMetal.symbol === metal.symbol
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold text-slate-200">{t.labs.photoelectric.metals[metal.nameKey]}</div>
                  <div className="text-[10px] text-slate-500">Φ = {metal.workFunction} eV</div>
                </button>
              ))}
            </div>
          </div>

          {/* Wavelength Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">{t.labs.photoelectric.lightWavelengthLabel}</span>
              <span className="font-mono text-cyan-300 font-bold">{wavelength} nm</span>
            </div>
            <input
              type="range"
              min="200"
              max="750"
              step="10"
              value={wavelength}
              onChange={(e) => setWavelength(parseInt(e.target.value))}
              className="w-full accent-cyan-400 h-2 bg-slate-950 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>{t.labs.photoelectric.uvShortWave}</span>
              <span>{t.labs.photoelectric.redLongWave}</span>
            </div>
          </div>

          {/* Intensity Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">{t.labs.photoelectric.intensityLabel}</span>
              <span className="font-mono text-purple-300 font-bold">{intensity} {t.labs.photoelectric.photonsPerWave}</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={intensity}
              onChange={(e) => setIntensity(parseInt(e.target.value))}
              className="w-full accent-purple-400 h-2 bg-slate-950 rounded-lg cursor-pointer"
            />
            <div className="text-[10px] text-slate-500">
              {t.labs.photoelectric.intensityHint}
            </div>
          </div>

          {/* Energy Breakdown */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">{t.labs.photoelectric.energyPerPhoton}</span>
              <span className="font-mono font-bold text-cyan-300">{photonEnergy.toFixed(2)} eV</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">{t.labs.photoelectric.workFunction}</span>
              <span className="font-mono font-bold text-slate-300">{selectedMetal.workFunction} eV</span>
            </div>
            <div className="h-px bg-slate-800 my-1" />
            <div className="flex justify-between font-bold">
              <span className="text-slate-300">{t.labs.photoelectric.maxKineticEnergy}</span>
              <span className="font-mono text-emerald-400">{kineticEnergy.toFixed(2)} eV</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
