import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus, Zap, Eye, Sparkles, Layers, BookOpen, HelpCircle } from 'lucide-react';
import { useLanguage } from '../../i18n';
import { useInView } from '../../hooks/useInView';

type ViewMode = 'wavefunction' | 'probability' | 'quadrature';

export const FockStateLab: React.FC = () => {
  const { t } = useLanguage();
  const { ref: containerRef, isSimulating } = useInView<HTMLDivElement>();

  const [photonNumber, setPhotonNumber] = useState<number>(1); // n = 0 to 5
  const [viewMode, setViewMode] = useState<ViewMode>('wavefunction');
  const [timePhase, setTimePhase] = useState<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);

  const maxPhotons = 5;
  const omega = 1.0;
  const totalEnergy = (photonNumber + 0.5) * omega; // E = (n + 1/2) hbar omega

  // Phase animation loop for wavefunction time evolution exp(-i E_n t) - paused when out of view
  useEffect(() => {
    if (!isSimulating) return;

    let isMounted = true;
    const animate = () => {
      if (!isMounted || !isSimulating) return;
      phaseRef.current += 0.05 * (photonNumber + 0.5);
      setTimePhase(phaseRef.current);
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      isMounted = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [photonNumber, isSimulating]);

  // Hermite polynomial evaluation H_n(x)
  const hermite = (n: number, x: number): number => {
    switch (n) {
      case 0: return 1;
      case 1: return 2 * x;
      case 2: return 4 * x * x - 2;
      case 3: return 8 * Math.pow(x, 3) - 12 * x;
      case 4: return 16 * Math.pow(x, 4) - 48 * x * x + 12;
      case 5: return 32 * Math.pow(x, 5) - 160 * Math.pow(x, 3) + 120 * x;
      default: return 1;
    }
  };

  // Normalization factor 1 / sqrt(2^n * n! * sqrt(pi))
  const normFactor = (n: number): number => {
    const factorials = [1, 1, 2, 6, 24, 120];
    const fact = factorials[n] || 1;
    return 1 / Math.sqrt(Math.pow(2, n) * fact * Math.sqrt(Math.PI));
  };

  // Spatial wavefunction psi_n(x)
  const psi = (n: number, x: number): number => {
    return normFactor(n) * hermite(n, x) * Math.exp(-(x * x) / 2);
  };

  const handleAddPhoton = () => {
    if (photonNumber < maxPhotons) {
      setPhotonNumber((n) => n + 1);
    }
  };

  const handleRemovePhoton = () => {
    if (photonNumber > 0) {
      setPhotonNumber((n) => n - 1);
    }
  };

  // Render Harmonic Potential Well with Dynamic Wavefunctions
  const renderHarmonicWell = () => {
    const width = 440;
    const height = 260;
    const originX = width / 2;
    const baseY = 230;
    const levelHeight = 32;

    const cosPhase = Math.cos(timePhase);

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-56">
        {/* Parabolic Potential Well Curve V(x) = 1/2 k x^2 */}
        <path
          d="M 50 25 Q 220 250 390 25"
          fill="none"
          stroke="#334155"
          strokeWidth="2.5"
          strokeDasharray="4 4"
        />
        <text x="395" y="32" fill="#64748b" fontSize="9" fontFamily="monospace">V(x) = ½ω²x²</text>

        {/* Energy Levels Rungs (n = 0 to 5) */}
        {[0, 1, 2, 3, 4, 5].map((lvl) => {
          const yPos = baseY - lvl * levelHeight - 18;
          const halfWidth = 52 + lvl * 18;
          const isCurrent = lvl === photonNumber;

          // Generate waveform points on current level
          const points: string[] = [];
          const step = 2.0;
          const xMax = 3.2;

          for (let px = -halfWidth; px <= halfWidth; px += step) {
            const normX = (px / halfWidth) * xMax;
            const waveVal = psi(lvl, normX);

            let offset = 0;
            if (viewMode === 'wavefunction') {
              offset = isCurrent ? waveVal * 28 * cosPhase : waveVal * 16;
            } else if (viewMode === 'probability') {
              offset = Math.pow(waveVal, 2) * 44;
            }

            const canvasX = originX + px;
            const canvasY = yPos - offset;
            points.push(`${canvasX.toFixed(1)},${canvasY.toFixed(1)}`);
          }

          return (
            <g key={lvl}>
              {/* Level Line */}
              <line
                x1={originX - halfWidth}
                y1={yPos}
                x2={originX + halfWidth}
                y2={yPos}
                stroke={isCurrent ? '#06b6d4' : '#334155'}
                strokeWidth={isCurrent ? 2 : 1}
              />

              {/* Energy Label */}
              <text
                x={originX - halfWidth - 8}
                y={yPos + 4}
                fill={isCurrent ? '#22d3ee' : '#64748b'}
                fontSize="9"
                fontFamily="monospace"
                textAnchor="end"
                fontWeight={isCurrent ? 'bold' : 'normal'}
              >
                |{lvl}⟩ ({lvl + 0.5}ℏω)
              </text>

              {/* Waveform curve */}
              <polyline
                points={points.join(' ')}
                fill="none"
                stroke={
                  isCurrent
                    ? viewMode === 'probability'
                      ? '#10b981'
                      : '#38bdf8'
                    : '#1e293b'
                }
                strokeWidth={isCurrent ? 2.5 : 1}
              />
            </g>
          );
        })}
      </svg>
    );
  };

  // Render Quadrature Phase Space X - P (Uncertainty Circle / Doughnut)
  const renderQuadraturePhaseSpace = () => {
    const width = 360;
    const height = 240;
    const originX = width / 2;
    const originY = height / 2;
    const radius = 25 + photonNumber * 18;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-56">
        {/* Phase Space Axes */}
        <line x1="20" y1={originY} x2={width - 20} y2={originY} stroke="#334155" strokeWidth="1" />
        <line x1={originX} y1="20" x2={originX} y2={height - 20} stroke="#334155" strokeWidth="1" />
        <text x={width - 15} y={originY - 6} fill="#64748b" fontSize="10" fontFamily="monospace">{t.labs.fockState.electricQuad}</text>
        <text x={originX + 6} y="25" fill="#64748b" fontSize="10" fontFamily="monospace">{t.labs.fockState.magneticQuad}</text>

        {/* Uncertainty Region: Concentric Circle for Fock State (Completely indeterminate phase) */}
        <circle
          cx={originX}
          cy={originY}
          r={radius}
          fill="none"
          stroke="#a855f7"
          strokeWidth="12"
          strokeOpacity="0.45"
        />

        {/* Sharp core */}
        <circle
          cx={originX}
          cy={originY}
          r={radius}
          fill="none"
          stroke="#c084fc"
          strokeWidth="2"
          strokeDasharray="4 3"
        />

        <text x={originX} y={height - 15} fill="#c084fc" fontSize="9" fontFamily="monospace" textAnchor="middle">
          {t.labs.fockState.phaseUncertaintyFormula}
        </text>
      </svg>
    );
  };

  return (
    <div
      id="lab-fock-state"
      ref={containerRef}
      className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-8 flex flex-col gap-6 backdrop-blur-md shadow-2xl scroll-mt-28"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '750px' }}
    >
      {/* 1. Lab Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 rounded-lg text-xs font-mono font-bold">
            {t.labs.fockState.badge}
          </span>
          <h3 className="text-xl lg:text-2xl font-black text-white mt-2">
            {t.labs.fockState.title}
          </h3>
          <p className="text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
            {t.labs.fockState.description}
          </p>
        </div>

        <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 text-xs flex flex-col justify-center">
          <div className="text-xs text-cyan-400 font-bold uppercase tracking-wider">
            {t.labs.fockState.hamiltonianTitle}
          </div>
          <div className="text-slate-300 text-xs mt-0.5 font-mono font-medium">
            Ĥ = ℏω (â†â + ½) ⇒ E = ({photonNumber} + ½)ℏω = {totalEnergy.toFixed(1)} ℏω
          </div>
        </div>
      </div>

      {/* 2. CHÚ THÍCH & ĐỊNH HƯỚNG QUAN SÁT (ĐỌC TRƯỚC KHI THỰC NGHIỆM) */}
      <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800/90 flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            {t.labs.fockState.guideTitle}
          </h4>
        </div>

        {/* Explanatory Cards: Ladder Analogy & ZPE Deep Dive */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/70 border border-amber-500/20 flex flex-col gap-2">
            <span className="font-bold text-amber-300 flex items-center gap-2 text-sm">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>{t.labs.fockState.ladderAnalogyTitle}</span>
            </span>
            <p className="text-slate-300 text-xs leading-relaxed">
              {t.labs.fockState.ladderAnalogyDesc}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-cyan-500/20 flex flex-col gap-2">
            <span className="font-bold text-cyan-300 flex items-center gap-2 text-sm">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>{t.labs.fockState.zpeDeepDiveTitle}</span>
            </span>
            <p className="text-slate-300 text-xs leading-relaxed">
              {t.labs.fockState.zpeDeepDiveDesc}
            </p>
          </div>
        </div>

        {/* 3 View Modes Guide */}
        <div className="pt-2 border-t border-slate-800/70 flex flex-col gap-2.5">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.labs.fockState.viewModeGuideTitle}</span>
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-cyan-500/20 text-cyan-200 leading-relaxed">
              {t.labs.fockState.viewWaveDesc}
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-emerald-500/20 text-emerald-200 leading-relaxed">
              {t.labs.fockState.viewProbDesc}
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-purple-500/20 text-purple-200 leading-relaxed">
              {t.labs.fockState.viewQuadDesc}
            </div>
          </div>
        </div>

        {/* Phase uncertainty note */}
        <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center gap-2 leading-relaxed">
          <span className="font-semibold text-cyan-300 shrink-0">{t.labs.fockState.phaseUncertaintyLabel}:</span>
          <span>{t.labs.fockState.phaseUncertaintyDesc}</span>
        </div>
      </div>

      {/* 3. KHU VỰC MÔ PHỎNG TƯƠNG TÁC */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Harmonic Oscillator Potential Well / Phase Space Visualizer */}
        <div className="lg:col-span-7 bg-slate-950 rounded-2xl border border-slate-800 p-5 min-h-[420px] relative flex flex-col justify-between gap-3 shadow-inner">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{t.labs.fockState.potentialWellTitle}</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-cyan-300 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {t.labs.fockState.currentStateLabel} |{photonNumber}⟩
              </span>
            </div>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-1.5 self-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs z-10">
            <button
              onClick={() => setViewMode('wavefunction')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'wavefunction' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>{t.labs.fockState.viewModeWavefunction}</span>
            </button>
            <button
              onClick={() => setViewMode('probability')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'probability' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3 h-3 text-emerald-400" />
              <span>{t.labs.fockState.viewModeProbability}</span>
            </button>
            <button
              onClick={() => setViewMode('quadrature')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'quadrature' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3 h-3 text-purple-400" />
              <span>{t.labs.fockState.viewModeQuadrature}</span>
            </button>
          </div>

          {/* Canvas Component */}
          <div className="flex-1 flex items-center justify-center my-1">
            {viewMode === 'quadrature' ? renderQuadraturePhaseSpace() : renderHarmonicWell()}
          </div>

          {/* Bottom explanation */}
          <div className="text-xs sm:text-sm text-slate-300 bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 leading-relaxed shrink-0">
            {photonNumber === 0 ? (
              <span className="text-amber-300 font-medium">
                {t.labs.fockState.vacuumExplanation}
              </span>
            ) : (
              <span className="text-cyan-300 font-medium">
                {t.labs.fockState.excitedExplanation}
              </span>
            )}
            <span className="font-mono text-xs text-slate-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 whitespace-nowrap self-start sm:self-auto shrink-0 shadow-sm">
              {photonNumber === 0 ? 'H₀(x) = 1' : `H_${photonNumber}(x) (${photonNumber} ${t.labs.fockState.nodeCountSuffix})`}
            </span>
          </div>
        </div>

        {/* Right: Ladder Operators & Energy Summary */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>{t.labs.fockState.diracOperatorsTitle}</span>
            </span>

            {/* Creation Operator Button a dagger */}
            <button
              onClick={handleAddPhoton}
              disabled={photonNumber >= maxPhotons}
              className="p-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/40 text-cyan-200 font-medium text-xs flex items-center justify-between transition-all disabled:opacity-40 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/30 text-cyan-300">
                  <Plus className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold">{t.labs.fockState.creationTitle}</div>
                  <div className="text-xs text-slate-400">{t.labs.fockState.creationDesc}</div>
                </div>
              </div>
              <span className="font-mono text-xs">â†|{photonNumber}⟩ = √{photonNumber + 1}|{photonNumber + 1}⟩</span>
            </button>

            {/* Annihilation Operator Button a */}
            <button
              onClick={handleRemovePhoton}
              disabled={photonNumber <= 0}
              className="p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 font-medium text-xs flex items-center justify-between transition-all disabled:opacity-40 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400">
                  <Minus className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold">{t.labs.fockState.annihilationTitle}</div>
                  <div className="text-xs text-slate-400">{t.labs.fockState.annihilationDesc}</div>
                </div>
              </div>
              <span className="font-mono text-xs">
                {photonNumber > 0 ? `â|${photonNumber}⟩ = √${photonNumber}|${photonNumber - 1}⟩` : 'â|0⟩ = 0'}
              </span>
            </button>
          </div>

          {/* Energy Summary Table */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs flex flex-col gap-2.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">{t.labs.fockState.photonCountSummary}</span>
              <span className="font-mono font-bold text-cyan-300 text-base">{photonNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">{t.labs.fockState.vacuumZpeSummary}</span>
              <span className="font-mono text-amber-300 font-bold">{t.labs.fockState.invariantVacuum}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">{t.labs.fockState.excitationEnergyLabel}</span>
              <span className="font-mono text-cyan-300 font-bold">{photonNumber}.0 ℏω</span>
            </div>
            <div className="h-px bg-slate-800 my-0.5" />
            <div className="flex justify-between items-center font-bold">
              <span className="text-slate-200">{t.labs.fockState.totalFieldEnergySummary}</span>
              <span className="font-mono text-emerald-400 text-base">{totalEnergy.toFixed(1)} ℏω</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
