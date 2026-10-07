import { useState } from 'react';
import { MathFormula } from '../common/MathFormula';
import { Plus, Minus, Zap } from 'lucide-react';
import { useLanguage } from '../../i18n';

export const FockStateLab: React.FC = () => {
  const { t } = useLanguage();
  const [photonNumber, setPhotonNumber] = useState<number>(1); // n photon

  const maxPhotons = 5;
  const omega = 1.0; // standard frequency
  const totalEnergy = (photonNumber + 0.5) * omega; // E = (n + 1/2) hbar omega

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

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-8 flex flex-col gap-6 backdrop-blur-md shadow-2xl">
      {/* Lab Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 rounded-lg text-xs font-mono font-bold">
            {t.labs.fockState.badge}
          </span>
          <h3 className="text-xl lg:text-2xl font-black text-white mt-2">
            {t.labs.fockState.title}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {t.labs.fockState.description}
          </p>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs flex items-center gap-3">
          <div className="font-mono text-center">
            <div className="text-[10px] text-slate-400">{t.labs.fockState.hamiltonianTitle}</div>
            <div className="text-cyan-300 font-bold text-sm mt-0.5">
              <MathFormula math="\hat{H} = \hbar\omega \left(a^\dagger a + \frac{1}{2}\right)" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Energy Ladder Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Harmonic Oscillator Potential Well & Energy Rungs */}
        <div className="lg:col-span-7 bg-slate-950 rounded-2xl border border-slate-800 p-6 h-[340px] relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{t.labs.fockState.potentialWellTitle}</span>
            <span className="font-mono text-cyan-300 font-bold">
              {t.labs.fockState.currentStateLabel} |{photonNumber}⟩
            </span>
          </div>

          {/* Energy Rungs SVG */}
          <div className="relative flex-1 flex items-center justify-center my-2">
            <svg viewBox="0 0 400 220" className="w-full h-full max-h-56">
              {/* Parabolic Potential Well Curve */}
              <path
                d="M 50 20 Q 200 215 350 20"
                fill="none"
                stroke="#334155"
                strokeWidth="2.5"
                strokeDasharray="4 4"
              />

              {/* Energy Levels */}
              {[0, 1, 2, 3, 4, 5].map((lvl) => {
                const yPos = 185 - lvl * 32;
                const halfWidth = 50 + lvl * 18;
                const isCurrent = lvl === photonNumber;

                return (
                  <g key={lvl} className="transition-all duration-300">
                    {/* Energy Horizontal Rung */}
                    <line
                      x1={200 - halfWidth}
                      y1={yPos}
                      x2={200 + halfWidth}
                      y2={yPos}
                      stroke={isCurrent ? '#06b6d4' : '#475569'}
                      strokeWidth={isCurrent ? '3.5' : '1.5'}
                      className={isCurrent ? 'filter drop-shadow-[0_0_8px_#06b6d4]' : ''}
                    />

                    {/* Level Label */}
                    <text
                      x={200 + halfWidth + 8}
                      y={yPos + 4}
                      fill={isCurrent ? '#38bdf8' : '#64748b'}
                      fontSize="11"
                      fontFamily="monospace"
                      fontWeight={isCurrent ? 'bold' : 'normal'}
                    >
                      {lvl === 0 ? t.labs.fockState.vacuumStateLabel : `n=${lvl} ${t.labs.fockState.photonLevelLabel}`}
                    </text>

                    {/* Energy Value Formula Label */}
                    <text
                      x={200 - halfWidth - 55}
                      y={yPos + 4}
                      fill={isCurrent ? '#38bdf8' : '#475569'}
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      {(lvl + 0.5).toFixed(1)} ℏω
                    </text>

                    {/* Glowing Quantum Wave Packet on Current Level */}
                    {isCurrent && (
                      <circle
                        cx={200}
                        cy={yPos}
                        r={6}
                        fill="#06b6d4"
                        className="animate-ping"
                      />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Bottom explanation */}
          <div className="text-[11px] text-slate-400 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <span>
              {photonNumber === 0 ? (
                <span className="text-amber-300 font-semibold">
                  {t.labs.fockState.vacuumExplanation}
                </span>
              ) : (
                <span className="text-cyan-300">
                  {t.labs.fockState.excitedExplanation}
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Right: Quantum Operators (Creation / Annihilation) */}
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
              className="p-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/40 text-cyan-200 font-medium text-xs flex items-center justify-between transition-all disabled:opacity-40"
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/30 text-cyan-300">
                  <Plus className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold">{t.labs.fockState.creationTitle}</div>
                  <div className="text-[10px] text-slate-400">{t.labs.fockState.creationDesc}</div>
                </div>
              </div>
              <span className="font-mono text-xs">a†|{photonNumber}⟩</span>
            </button>

            {/* Annihilation Operator Button a */}
            <button
              onClick={handleRemovePhoton}
              disabled={photonNumber <= 0}
              className="p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 font-medium text-xs flex items-center justify-between transition-all disabled:opacity-40"
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400">
                  <Minus className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold">{t.labs.fockState.annihilationTitle}</div>
                  <div className="text-[10px] text-slate-400">{t.labs.fockState.annihilationDesc}</div>
                </div>
              </div>
              <span className="font-mono text-xs">a|{photonNumber}⟩</span>
            </button>
          </div>

          {/* Energy Summary Table */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">{t.labs.fockState.photonCountSummary}</span>
              <span className="font-mono font-bold text-cyan-300 text-base">{photonNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">{t.labs.fockState.vacuumZpeSummary}</span>
              <span className="font-mono text-slate-300">0.5 ℏω</span>
            </div>
            <div className="h-px bg-slate-800 my-1" />
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
