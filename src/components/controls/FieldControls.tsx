import React from 'react';
import type { FieldSettings } from '../../types/physics';
import { MathFormula } from '../common/MathFormula';
import { Zap, Activity, Waves, Sparkles, ShieldCheck, Eye } from 'lucide-react';
import { useLanguage } from '../../i18n';

interface FieldControlsProps {
  settings: FieldSettings;
  onChange: (newSettings: Partial<FieldSettings>) => void;
}

export const FieldControls: React.FC<FieldControlsProps> = ({ settings, onChange }) => {
  const { t } = useLanguage();
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-5">
      {/* Paradigm Core Banner - Photon: Only Field */}
      <div className="bg-gradient-to-r from-cyan-950/60 via-slate-900 to-purple-950/40 border border-cyan-500/30 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                {t.controls.bannerTitle}
              </h3>
              <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs rounded-full font-mono font-semibold">
                {t.controls.bannerBadge}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-2xl">
              {t.controls.bannerDescription}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          <button
            onClick={() => onChange({ vacuumFluctuations: !settings.vacuumFluctuations })}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-medium border transition-all flex items-center gap-2 ${
              settings.vacuumFluctuations
                ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-200 shadow-md shadow-cyan-500/10'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t.controls.vacuumFluctuations}: {settings.vacuumFluctuations ? t.controls.vacuumOn : t.controls.vacuumOff}</span>
          </button>
        </div>
      </div>

      {/* Vacuum Fluctuation Physical Context */}
      {settings.vacuumFluctuations && (
        <div className="bg-cyan-950/40 border border-cyan-500/30 rounded-xl p-3 md:p-3.5 text-xs md:text-sm text-cyan-100/90 leading-relaxed flex items-start sm:items-center gap-2.5 shadow-sm">
          <Activity className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 sm:mt-0" />
          <span>{t.controls.vacuumFluctuationsExplainer}</span>
        </div>
      )}

      {/* Numerical Sliders & Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-1">
        {/* Unified: Excitation Frequency (ν) & Dynamic Energy Spectrum (E = hν) */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-300 flex items-center gap-1.5 font-medium">
              <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{t.controls.excitationFreq} & {t.controls.energySpectrumTitle}</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-cyan-300 font-bold">{settings.waveFrequency.toFixed(1)} PHz</span>
              <span className={`px-2 py-0.5 rounded-md text-xs font-mono font-semibold border ${
                settings.waveFrequency < 0.5
                  ? 'text-amber-300 bg-amber-500/20 border-amber-500/40'
                  : settings.waveFrequency < 0.75
                  ? 'text-cyan-300 bg-cyan-500/20 border-cyan-500/40'
                  : settings.waveFrequency < 1.1
                  ? 'text-purple-300 bg-purple-500/20 border-purple-500/40'
                  : 'text-fuchsia-300 bg-fuchsia-500/20 border-fuchsia-500/40'
              }`}>
                {settings.waveFrequency < 0.5
                  ? t.controls.spectrumAmber
                  : settings.waveFrequency < 0.75
                  ? t.controls.spectrumCyan
                  : settings.waveFrequency < 1.1
                  ? t.controls.spectrumViolet
                  : t.controls.spectrumUV}
              </span>
            </div>
          </div>

          {/* Integrated Spectrum Slider */}
          <div className="relative flex items-center my-0.5">
            <div className="absolute inset-x-0 h-2.5 rounded-full bg-gradient-to-r from-amber-500 via-cyan-400 via-purple-500 to-fuchsia-500 opacity-90 shadow-inner pointer-events-none" />
            <input
              type="range"
              min="0.4"
              max="3.0"
              step="0.1"
              value={settings.waveFrequency}
              onChange={(e) => onChange({ waveFrequency: parseFloat(e.target.value) })}
              className="relative w-full h-2.5 bg-transparent appearance-none cursor-pointer z-10 accent-white"
            />
          </div>

          <div className="flex justify-between text-xs text-slate-400 font-mono">
            <span>0.4 PHz ({t.controls.lowEnergyWave})</span>
            <span className="hidden sm:inline">0.6 PHz (Cyan ~ 500 nm)</span>
            <span>3.0 PHz ({t.controls.highEnergyWave})</span>
          </div>
        </div>

        {/* Amplitude & Wireframe Toggle */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 flex items-center gap-1.5 font-medium">
              <Waves className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>{t.controls.fieldAmplitude}</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-purple-300 font-bold">{settings.amplitude.toFixed(1)} a.u.</span>
              <button
                onClick={() => onChange({ showWireframe: !settings.showWireframe })}
                className={`text-xs font-mono flex items-center gap-1 px-2.5 py-0.5 rounded border transition-colors ${
                  settings.showWireframe
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
                title={t.controls.wireframe3D}
              >
                <Eye className="w-3 h-3" />
                <span>{t.controls.wireframe3D}</span>
              </button>
            </div>
          </div>

          <input
            type="range"
            min="0.3"
            max="2.5"
            step="0.1"
            value={settings.amplitude}
            onChange={(e) => onChange({ amplitude: parseFloat(e.target.value) })}
            className="w-full accent-purple-400 h-2 bg-slate-800 rounded-lg cursor-pointer my-0.5"
          />

          <div className="flex justify-between text-xs text-slate-400">
            <span>{t.controls.gentleRipple}</span>
            <span>{t.controls.strongExcitation}</span>
          </div>
        </div>
      </div>

      {/* Physics Insight Banner */}
      <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-slate-300">
            {t.controls.photonEnergyFormula}
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-cyan-300">
          <MathFormula math="E = h\nu = \hbar\omega" />
          <span className="text-slate-400">|</span>
          <span className="text-emerald-400">E ≈ {(settings.waveFrequency * 4.14).toFixed(2)} eV</span>
        </div>
      </div>
    </div>
  );
};
