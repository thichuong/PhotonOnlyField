import type { FieldSettings } from '../../types/physics';
import { MathFormula } from '../common/MathFormula';
import { Sliders, Zap, Activity, Waves, CircleDot, Sparkles, Palette } from 'lucide-react';

interface FieldControlsProps {
  settings: FieldSettings;
  onChange: (newSettings: Partial<FieldSettings>) => void;
}

export const FieldControls: React.FC<FieldControlsProps> = ({ settings, onChange }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-5">
      {/* Mode Selector */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Mô hình lý thuyết (Paradigm)</span>
          </label>
          <span className="text-xs text-slate-500">Chọn góc nhìn vật lý</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {/* Newton Button */}
          <button
            onClick={() => onChange({ mode: 'classical-particle' })}
            className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
              settings.mode === 'classical-particle'
                ? 'bg-amber-500/15 border-amber-500/60 shadow-lg shadow-amber-500/10 text-amber-200'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <div className={`p-2 rounded-lg ${settings.mode === 'classical-particle' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-700/50 text-slate-400'}`}>
              <CircleDot className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">1. Hạt Newton (1704)</div>
              <div className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                Ánh sáng là các hạt bi nhỏ bay trong không gian rỗng.
              </div>
            </div>
          </button>

          {/* Maxwell Button */}
          <button
            onClick={() => onChange({ mode: 'classical-wave' })}
            className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
              settings.mode === 'classical-wave'
                ? 'bg-purple-500/15 border-purple-500/60 shadow-lg shadow-purple-500/10 text-purple-200'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <div className={`p-2 rounded-lg ${settings.mode === 'classical-wave' ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-700/50 text-slate-400'}`}>
              <Waves className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">2. Sóng Maxwell (1865)</div>
              <div className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                Sóng điện từ liên tục lan truyền trên trường E & B.
              </div>
            </div>
          </button>

          {/* QFT Button */}
          <button
            onClick={() => onChange({ mode: 'qft-field' })}
            className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
              settings.mode === 'qft-field'
                ? 'bg-cyan-500/20 border-cyan-400 shadow-xl shadow-cyan-500/20 text-cyan-200 ring-1 ring-cyan-400/50'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <div className={`p-2 rounded-lg ${settings.mode === 'qft-field' ? 'bg-cyan-500/30 text-cyan-300' : 'bg-slate-700/50 text-slate-400'}`}>
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <span>3. Trường QFT (Hiện đại)</span>
                <span className="px-1.5 py-0.2 bg-cyan-500/30 text-[9px] rounded-full text-cyan-200 font-mono">CHÍNH XÁC</span>
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5 leading-tight">
                Photon = Dao động lượng tử của Trường Điện Từ.
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Numerical Sliders & Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2 border-t border-slate-800">
        {/* Frequency */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tần số sóng (ν)</span>
            </span>
            <span className="font-mono text-cyan-300 font-bold">{settings.waveFrequency.toFixed(1)} GHz</span>
          </div>
          <input
            type="range"
            min="0.4"
            max="3.0"
            step="0.1"
            value={settings.waveFrequency}
            onChange={(e) => onChange({ waveFrequency: parseFloat(e.target.value) })}
            className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Sóng dài (Hồng ngoại)</span>
            <span>Sóng ngắn (Tử ngoại)</span>
          </div>
        </div>

        {/* Amplitude */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Waves className="w-3.5 h-3.5 text-purple-400" />
              <span>Biên độ kích thích (A)</span>
            </span>
            <span className="font-mono text-purple-300 font-bold">{settings.amplitude.toFixed(1)} a.u.</span>
          </div>
          <input
            type="range"
            min="0.3"
            max="2.5"
            step="0.1"
            value={settings.amplitude}
            onChange={(e) => onChange({ amplitude: parseFloat(e.target.value) })}
            className="w-full accent-purple-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Kích thích yếu</span>
            <span>Kích thích mạnh</span>
          </div>
        </div>

        {/* Speed / Color scheme */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              <span>Bảng màu trường năng lượng</span>
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => onChange({ colorScheme: 'quantum-cyan' })}
              className={`py-1.5 px-2 text-[11px] rounded-lg border font-medium transition-all ${
                settings.colorScheme === 'quantum-cyan'
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              Cyan Neon
            </button>
            <button
              onClick={() => onChange({ colorScheme: 'electric-violet' })}
              className={`py-1.5 px-2 text-[11px] rounded-lg border font-medium transition-all ${
                settings.colorScheme === 'electric-violet'
                  ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              Tử Ngoại
            </button>
            <button
              onClick={() => onChange({ colorScheme: 'energy-amber' })}
              className={`py-1.5 px-2 text-[11px] rounded-lg border font-medium transition-all ${
                settings.colorScheme === 'energy-amber'
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              Hổ Phách
            </button>
          </div>
        </div>
      </div>

      {/* Physics Insight Banner */}
      <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-slate-300">
            Năng lượng của 1 gói sóng lượng tử (1 Photon mode):
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-cyan-300">
          <MathFormula math="E = h\nu = \hbar\omega" />
          <span>≈ {(settings.waveFrequency * 4.14).toFixed(2)} eV</span>
        </div>
      </div>
    </div>
  );
};
