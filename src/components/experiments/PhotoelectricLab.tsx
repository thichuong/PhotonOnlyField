import React, { useState } from 'react';
import { Sun, AlertCircle, CheckCircle, Activity, Scale, Compass, Sparkles, BookOpen } from 'lucide-react';
import { useLanguage } from '../../i18n';
import { useInView } from '../../hooks/useInView';

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
  const { ref: containerRef } = useInView<HTMLDivElement>();

  const [wavelength, setWavelength] = useState<number>(420); // nm
  const [selectedMetal, setSelectedMetal] = useState<MetalTarget>(METALS[0]);
  const [intensity, setIntensity] = useState<number>(3); // 1 to 5
  const [voltage, setVoltage] = useState<number>(0.0); // -4.0V to +2.0V
  const [activeGraphTab, setActiveGraphTab] = useState<'iv' | 'kmax'>('iv');
  const [showClassicalComparison, setShowClassicalComparison] = useState<boolean>(true);

  // E = hc / lambda (in eV): hc ≈ 1239.84 eV.nm
  const photonEnergy = 1239.84 / wavelength;
  const frequencyPHz = (299792458 / (wavelength * 1e-9)) / 1e15; // in PHz (10^15 Hz)
  const canEject = photonEnergy >= selectedMetal.workFunction;
  const kineticEnergy = canEject ? photonEnergy - selectedMetal.workFunction : 0;
  const stoppingPotential = kineticEnergy; // in Volts (eV / e = V)

  // Photocurrent calculation
  const saturationCurrent = intensity * 15; // microAmperes (uA)
  let photocurrent = 0;
  if (canEject) {
    if (voltage <= -stoppingPotential) {
      photocurrent = 0;
    } else if (voltage < 0.8) {
      const factor = Math.min(1, Math.max(0, (voltage + stoppingPotential) / (stoppingPotential + 0.8)));
      photocurrent = saturationCurrent * Math.pow(factor, 0.7);
    } else {
      photocurrent = saturationCurrent;
    }
  }

  // Color mapping from wavelength
  const getColorFromWavelength = (wl: number) => {
    if (wl >= 640) return { bg: 'bg-red-500', hex: '#ef4444', name: t.labs.photoelectric.colors.red };
    if (wl >= 590) return { bg: 'bg-orange-500', hex: '#f97316', name: t.labs.photoelectric.colors.orange };
    if (wl >= 560) return { bg: 'bg-yellow-400', hex: '#facc15', name: t.labs.photoelectric.colors.yellow };
    if (wl >= 490) return { bg: 'bg-emerald-500', hex: '#10b981', name: t.labs.photoelectric.colors.green };
    if (wl >= 430) return { bg: 'bg-cyan-400', hex: '#06b6d4', name: t.labs.photoelectric.colors.cyan };
    if (wl >= 380) return { bg: 'bg-purple-500', hex: '#a855f7', name: t.labs.photoelectric.colors.purple };
    return { bg: 'bg-indigo-700', hex: '#6366f1', name: t.labs.photoelectric.colors.uv };
  };

  const currentColor = getColorFromWavelength(wavelength);

  // SVG Coordinates for I-V Curve
  const renderIVCurve = () => {
    const width = 320;
    const height = 150;
    const originX = 140; // V = 0V
    const originY = 125; // I = 0 uA
    const scaleX = 35; // 35px per Volt
    const scaleY = 1.1; // scale for current

    const points: string[] = [];
    for (let v = -4.0; v <= 2.0; v += 0.1) {
      let currentVal = 0;
      if (canEject) {
        if (v <= -stoppingPotential) {
          currentVal = 0;
        } else if (v < 0.8) {
          const factor = Math.min(1, Math.max(0, (v + stoppingPotential) / (stoppingPotential + 0.8)));
          currentVal = saturationCurrent * Math.pow(factor, 0.7);
        } else {
          currentVal = saturationCurrent;
        }
      }
      const px = originX + v * scaleX;
      const py = originY - currentVal * scaleY;
      points.push(`${px.toFixed(1)},${py.toFixed(1)}`);
    }

    const currentMarkerX = originX + voltage * scaleX;
    const currentMarkerY = originY - photocurrent * scaleY;
    const stoppingMarkerX = originX - stoppingPotential * scaleX;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        {/* Axes */}
        <line x1="20" y1={originY} x2={width - 20} y2={originY} stroke="#334155" strokeWidth="1.5" />
        <line x1={originX} y1="15" x2={originX} y2={height - 10} stroke="#334155" strokeWidth="1.5" />

        {/* Axis labels */}
        <text x={width - 15} y={originY + 12} fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="end">V (V)</text>
        <text x={originX + 6} y="22" fill="#64748b" fontSize="9" fontFamily="monospace">I (μA)</text>
        <text x={originX - 6} y={originY + 12} fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="end">0</text>

        {/* Voltage tick marks */}
        {[-3, -2, -1, 1, 2].map((tick) => (
          <g key={tick}>
            <line x1={originX + tick * scaleX} y1={originY - 3} x2={originX + tick * scaleX} y2={originY + 3} stroke="#475569" />
            <text x={originX + tick * scaleX} y={originY + 12} fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">{tick}</text>
          </g>
        ))}

        {/* Stopping potential marker */}
        {canEject && stoppingPotential > 0.05 && (
          <g>
            <line x1={stoppingMarkerX} y1={originY - 8} x2={stoppingMarkerX} y2={originY + 8} stroke="#f43f5e" strokeWidth="2" strokeDasharray="2 2" />
            <text x={stoppingMarkerX} y={originY - 12} fill="#f43f5e" fontSize="8" fontFamily="monospace" textAnchor="middle">
              -V₀ ({(-stoppingPotential).toFixed(2)}V)
            </text>
          </g>
        )}

        {/* I-V curve line */}
        <polyline points={points.join(' ')} fill="none" stroke="#06b6d4" strokeWidth="2.5" />

        {/* Current working point */}
        <circle cx={currentMarkerX} cy={currentMarkerY} r="4.5" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
      </svg>
    );
  };

  // SVG Coordinates for K_max vs Frequency (nu)
  const renderKmaxCurve = () => {
    const width = 320;
    const height = 150;
    const originX = 50;
    const originY = 125;
    const scaleNu = 130; // px per PHz
    const scaleK = 22; // px per eV

    // Nu threshold
    const nu0 = (selectedMetal.workFunction * 1.60218e-19) / 6.626e-34 / 1e15; // in PHz

    // Line from nu0 to nuMax = 1.6 PHz
    const nuMax = 1.6;
    const x0 = originX + nu0 * scaleNu;
    const y0 = originY;
    const xMax = originX + nuMax * scaleNu;
    const kMaxVal = 4.135667 * (nuMax - nu0);
    const yMax = originY - kMaxVal * scaleK;

    const currentX = originX + frequencyPHz * scaleNu;
    const currentY = originY - kineticEnergy * scaleK;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        {/* Axes */}
        <line x1={originX} y1={originY} x2={width - 20} y2={originY} stroke="#334155" strokeWidth="1.5" />
        <line x1={originX} y1="15" x2={originX} y2={originY + 10} stroke="#334155" strokeWidth="1.5" />

        <text x={width - 15} y={originY + 12} fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="end">ν (PHz)</text>
        <text x={originX + 6} y="22" fill="#64748b" fontSize="9" fontFamily="monospace">K_max (eV)</text>

        {/* Threshold frequency point */}
        <circle cx={x0} cy={y0} r="3" fill="#f59e0b" />
        <text x={x0} y={originY + 13} fill="#fbbf24" fontSize="8" fontFamily="monospace" textAnchor="middle">ν₀</text>

        {/* Straight line K = h*nu - Phi */}
        {x0 < width && (
          <line x1={x0} y1={y0} x2={xMax} y2={yMax} stroke="#10b981" strokeWidth="2.5" />
        )}

        {/* Active point marker */}
        {canEject && (
          <circle cx={currentX} cy={currentY} r="4.5" fill="#34d399" stroke="#059669" strokeWidth="2" />
        )}

        {/* Slope label */}
        <text x={width - 25} y={35} fill="#34d399" fontSize="12" fontFamily="monospace" textAnchor="end">
          {t.labs.photoelectric.planckConstantSlope}
        </text>
      </svg>
    );
  };

  return (
    <div
      id="lab-photoelectric"
      ref={containerRef}
      className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-8 flex flex-col gap-6 backdrop-blur-md shadow-2xl scroll-mt-28"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '750px' }}
    >
      {/* 1. Lab Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 bg-purple-500/15 border border-purple-500/30 text-purple-300 rounded-lg text-xs font-mono font-bold">
            {t.labs.photoelectric.badge}
          </span>
          <h3 className="text-xl lg:text-2xl font-black text-white mt-2">
            {t.labs.photoelectric.title}
          </h3>
          <p className="text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
            {t.labs.photoelectric.description}
          </p>
        </div>

        <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 text-xs flex flex-col justify-center">
          <div className="text-xs text-cyan-400 font-bold uppercase tracking-wider">
            {t.labs.photoelectric.formulaTitle}
          </div>
          <div className="text-slate-300 text-xs mt-0.5 font-mono font-medium">
            K_max = hν − Φ = {photonEnergy.toFixed(2)}eV − {selectedMetal.workFunction}eV = {kineticEnergy.toFixed(2)}eV
          </div>
        </div>
      </div>

      {/* 2. CHÚ THÍCH & ĐỊNH HƯỚNG QUAN SÁT (ĐỌC TRƯỚC KHI THỰC NGHIỆM) */}
      <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800/90 flex flex-col gap-4">
        {/* 3 Core Concepts Explanatory Card */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            {t.labs.photoelectric.keyConceptsTitle} & {t.labs.photoelectric.guideTitle}
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-cyan-500/20 flex flex-col gap-1.5">
            <span className="font-bold text-cyan-300 text-xs">
              {t.labs.photoelectric.conceptWavelengthTitle}
            </span>
            <p className="text-slate-300 leading-relaxed">
              {t.labs.photoelectric.conceptWavelengthDesc}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-purple-500/20 flex flex-col gap-1.5">
            <span className="font-bold text-purple-300 text-xs">
              {t.labs.photoelectric.conceptIntensityTitle}
            </span>
            <p className="text-slate-300 leading-relaxed">
              {t.labs.photoelectric.conceptIntensityDesc}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-amber-500/20 flex flex-col gap-1.5">
            <span className="font-bold text-amber-300 text-xs">
              {t.labs.photoelectric.conceptVoltageTitle}
            </span>
            <p className="text-slate-300 leading-relaxed">
              {t.labs.photoelectric.conceptVoltageDesc}
            </p>
          </div>
        </div>

        {/* Classical Wave vs Quantum QFT Comparison Card */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-400" />
              <span>{t.labs.photoelectric.modelComparisonTitle}</span>
            </span>
            <button
              onClick={() => setShowClassicalComparison(!showClassicalComparison)}
              className="text-xs text-slate-400 hover:text-cyan-300 font-medium cursor-pointer transition-colors"
            >
              {showClassicalComparison ? t.labs.photoelectric.collapseDetails : t.labs.photoelectric.expandDetails}
            </button>
          </div>

          {showClassicalComparison && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs animate-in fade-in duration-300">
              <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-900/40 flex flex-col gap-2">
                <span className="font-bold text-rose-300 flex items-center gap-1.5 text-xs">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>{t.labs.photoelectric.classicalTheoryLabel}</span>
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {t.labs.photoelectric.classicalExplanation}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-900/40 flex flex-col gap-2">
                <span className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t.labs.photoelectric.quantumTheoryLabel}</span>
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {t.labs.photoelectric.quantumExplanation}
                </p>
              </div>

              {/* Semiclassical Academic Caveat Card */}
              <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 flex flex-col gap-1.5 md:col-span-2">
                <span className="font-bold text-purple-300 flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>{t.labs.photoelectric.academicCaveatTitle}</span>
                </span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {t.labs.photoelectric.academicCaveatDesc}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Interactive Presets */}
        <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <span className="font-bold text-slate-300 flex items-center gap-1.5 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.labs.photoelectric.quickGuideTitle}:</span>
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setWavelength(240);
                setSelectedMetal(METALS[0]);
                setIntensity(3);
                setVoltage(0.0);
              }}
              className="px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-medium transition-all cursor-pointer"
            >
              {t.labs.photoelectric.presetUV}
            </button>
            <button
              onClick={() => {
                setWavelength(700);
                setSelectedMetal(METALS[0]);
                setIntensity(5);
                setVoltage(0.0);
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-medium transition-all cursor-pointer"
            >
              {t.labs.photoelectric.presetRed}
            </button>
            <button
              onClick={() => {
                setWavelength(360);
                setSelectedMetal(METALS[0]);
                setIntensity(3);
                const ePhot = 1239.84 / 360;
                const vStop = parseFloat((-(ePhot - METALS[0].workFunction)).toFixed(1));
                setVoltage(vStop);
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-medium transition-all cursor-pointer"
            >
              {t.labs.photoelectric.presetStopping}
            </button>
          </div>
        </div>
      </div>

      {/* 3. KHU VỰC MÔ PHỎNG TƯƠNG TÁC */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Phototube Chamber Visualizer */}
        <div className="lg:col-span-7 bg-slate-950 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between min-h-[350px]">
          <div className="flex items-center justify-between border-b border-slate-900 pb-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {t.labs.photoelectric.vacuumTube}
            </span>
            <span className="text-xs font-mono text-cyan-400">
              λ = {wavelength} nm ({currentColor.name})
            </span>
          </div>

          {/* Chamber Graphic Area */}
          <div className="relative flex items-center justify-between py-6 px-2 my-auto">
            {/* Light Source Torch */}
            <div className="flex flex-col items-center">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg transition-colors cursor-pointer"
                style={{ backgroundColor: currentColor.hex }}
              >
                <Sun className="w-5 h-5 text-slate-950 animate-spin" style={{ animationDuration: '8s' }} />
              </div>
              <span className="text-xs text-slate-400 mt-1">{t.labs.photoelectric.lightSource}</span>
            </div>

            {/* Incident Photon Packets */}
            <div className="flex-1 flex flex-col justify-around h-24 px-3 overflow-hidden">
              {Array.from({ length: intensity }).map((_, idx) => (
                <div key={idx} className="relative flex items-center">
                  <div
                    className="h-1.5 rounded-full animate-pulse transition-all"
                    style={{
                      width: '36px',
                      backgroundColor: currentColor.hex,
                      boxShadow: `0 0 10px ${currentColor.hex}`,
                    }}
                  />
                  <span className="text-xs font-mono text-slate-400 ml-1.5">hν</span>
                </div>
              ))}
            </div>

            {/* Cathode Target */}
            <div className="flex flex-col items-center">
              <div className="w-5 h-36 bg-gradient-to-b from-slate-300 via-slate-100 to-slate-400 rounded-lg shadow-md border border-slate-300 relative flex items-center justify-center">
                <span className="text-xs font-bold text-slate-950 -rotate-90 whitespace-nowrap">
                  {t.labs.photoelectric.metals[selectedMetal.nameKey]}
                </span>
              </div>
              <span className="text-xs text-slate-400 mt-1 font-mono">Φ={selectedMetal.workFunction}eV</span>
            </div>

            {/* Ejected Electrons Flying across gap */}
            <div className="flex-1 flex flex-col justify-around h-28 px-3">
              {canEject && photocurrent > 0 ? (
                Array.from({ length: intensity }).map((_, idx) => (
                  <div key={idx} className="flex items-center animate-pulse">
                    <div className="w-4 h-4 rounded-full bg-cyan-400 text-slate-950 text-xs font-bold flex items-center justify-center shadow-md shadow-cyan-400/80">
                      e⁻
                    </div>
                    <div
                      className="h-0.5 ml-1 transition-all"
                      style={{
                        backgroundColor: voltage < 0 ? '#f43f5e' : '#06b6d4',
                        width: '75%',
                      }}
                    />
                  </div>
                ))
              ) : canEject && voltage <= -stoppingPotential ? (
                <div className="text-center text-xs text-rose-400 font-mono italic">
                  {t.labs.photoelectric.stoppingNote}
                </div>
              ) : (
                <div className="text-center text-xs text-rose-400 font-mono italic">
                  {t.labs.photoelectric.noElectronsEjected}
                </div>
              )}
            </div>

            {/* Anode Collector Plate */}
            <div className="flex flex-col items-center">
              <div className="w-4 h-36 bg-slate-700 rounded-lg border border-slate-600 flex items-center justify-center">
                <span className="text-xs text-slate-400 -rotate-90 font-mono">Anode</span>
              </div>
              <span className="text-xs text-slate-400 mt-1 font-mono">
                {voltage >= 0 ? `+${voltage.toFixed(1)}V` : `${voltage.toFixed(1)}V`}
              </span>
            </div>
          </div>

          {/* Bottom Live Meter Displays */}
          <div className="flex items-center justify-between text-xs pt-2.5 border-t border-slate-900 bg-slate-950/60">
            <div className="flex items-center gap-2">
              {canEject && photocurrent > 0 ? (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              )}
              <span className={canEject && photocurrent > 0 ? 'text-emerald-300 font-semibold text-sm' : 'text-rose-300 font-semibold text-sm'}>
                {canEject
                  ? `${t.labs.photoelectric.ejectedStatus}: K_max = ${kineticEnergy.toFixed(2)} eV`
                  : t.labs.photoelectric.insufficientStatus}
              </span>
            </div>

            {/* Live Photocurrent Ammeter */}
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400 text-xs">{t.labs.photoelectric.photocurrentLabel}</span>
              <span className="font-mono font-bold text-cyan-300 text-xs">{photocurrent.toFixed(1)} μA</span>
            </div>
          </div>
        </div>

        {/* Right: Scientific Analysis Graphs & Stopping Voltage Slider */}
        <div className="lg:col-span-5 bg-slate-950 rounded-2xl border border-slate-800 p-4 min-h-[350px] flex flex-col justify-between gap-2">
          {/* Graph Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t.labs.photoelectric.experimentalGraphsTitle}</span>
            </span>

            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl text-xs">
              <button
                onClick={() => setActiveGraphTab('iv')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  activeGraphTab === 'iv'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.labs.photoelectric.graphTabIV}
              </button>
              <button
                onClick={() => setActiveGraphTab('kmax')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  activeGraphTab === 'kmax'
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.labs.photoelectric.graphTabKmax}
              </button>
            </div>
          </div>

          {/* Active Graph Canvas */}
          <div className="flex-1 flex items-center justify-center py-1">
            {activeGraphTab === 'iv' ? renderIVCurve() : renderKmaxCurve()}
          </div>

          {/* Applied Voltage Slider */}
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-medium">{t.labs.photoelectric.voltageLabel}</span>
              <span className={`font-mono font-bold ${voltage <= -stoppingPotential && canEject ? 'text-rose-400' : 'text-cyan-300'}`}>
                {voltage >= 0 ? `+${voltage.toFixed(1)}` : voltage.toFixed(1)} V
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {t.labs.photoelectric.stoppingPotentialLabel} -{stoppingPotential.toFixed(2)} V
              </span>
            </div>
            <input
              type="range"
              min="-4.0"
              max="2.0"
              step="0.1"
              value={voltage}
              onChange={(e) => setVoltage(parseFloat(e.target.value))}
              className="accent-cyan-400 h-1.5 bg-slate-950 rounded-lg cursor-pointer w-full"
            />
          </div>
        </div>
      </div>

      {/* 4. Bộ Tham Số & Điều Khiển Thực Nghiệm */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metal Selection */}
        <div className="flex flex-col gap-1.5 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
          <label className="text-xs font-semibold text-slate-300">{t.labs.photoelectric.selectMetalLabel}</label>
          <div className="grid grid-cols-2 gap-1.5 mt-1">
            {METALS.map((metal) => (
              <button
                key={metal.symbol}
                onClick={() => setSelectedMetal(metal)}
                className={`p-2 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  selectedMetal.symbol === metal.symbol
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-bold text-slate-200 text-xs">{t.labs.photoelectric.metals[metal.nameKey]}</div>
                <div className="text-xs text-slate-400 font-mono">Φ = {metal.workFunction} eV</div>
              </button>
            ))}
          </div>
        </div>

        {/* Wavelength Slider */}
        <div className="flex flex-col justify-between bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
          <div>
            <div className="flex justify-between text-xs mb-1">
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
              className="w-full accent-cyan-400 h-2 bg-slate-900 rounded-lg cursor-pointer mt-2"
            />
            <div className="flex justify-between text-xs text-slate-400 font-mono mt-1">
              <span>{t.labs.photoelectric.uvShortWave}</span>
              <span>{t.labs.photoelectric.redLongWave}</span>
            </div>
          </div>

          <div className="flex justify-between text-xs font-mono pt-2 border-t border-slate-800/80">
            <span className="text-slate-400">{t.labs.photoelectric.energyPerPhoton}</span>
            <span className="text-cyan-300 font-bold">{photonEnergy.toFixed(2)} eV</span>
          </div>
        </div>

        {/* Intensity Slider */}
        <div className="flex flex-col justify-between bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
          <div>
            <div className="flex justify-between text-xs mb-1">
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
              className="w-full accent-purple-400 h-2 bg-slate-900 rounded-lg cursor-pointer mt-2"
            />
            <div className="text-xs text-slate-400 mt-2 leading-relaxed">
              {t.labs.photoelectric.intensityHint}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
