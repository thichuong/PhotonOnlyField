import React from 'react';
import type { FieldSettings } from '../../types/physics';
import { MathFormula } from '../common/MathFormula';
import { Zap, Activity, Waves, Sparkles, Palette, ShieldCheck, Eye } from 'lucide-react';

interface FieldControlsProps {
  settings: FieldSettings;
  onChange: (newSettings: Partial<FieldSettings>) => void;
}

export const FieldControls: React.FC<FieldControlsProps> = ({ settings, onChange }) => {
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
                Bản Chất Hiện Đại: Thuyết Trường Lượng Tử (QFT)
              </h3>
              <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] rounded-full font-mono font-semibold">
                PHOTON: ONLY FIELD
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-2xl">
              Không có "viên bi photon" nào bay đi trong chân không. Toàn bộ vũ trụ là một mạng lưới các <strong>Trường Lượng Tử</strong> liên tục. Mỗi photon bạn nhìn thấy thực chất là một gói năng lượng kích thích dao động (<span className="text-cyan-300 font-mono">excitation state |n⟩</span>) của trường điện từ.
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
            <span>Dao động chân không: {settings.vacuumFluctuations ? 'BẬT' : 'TẮT'}</span>
          </button>
        </div>
      </div>

      {/* Numerical Sliders & Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1">
        {/* Frequency & Energy */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tần số kích thích (ν)</span>
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
            <span>Sóng dài (Năng lượng thấp)</span>
            <span>Sóng ngắn (Năng lượng cao)</span>
          </div>
        </div>

        {/* Amplitude */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Waves className="w-3.5 h-3.5 text-purple-400" />
              <span>Biên độ dao động trường (A)</span>
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
            <span>Gợn nhẹ</span>
            <span>Kích thích mạnh</span>
          </div>
        </div>

        {/* Color Scheme & Wireframe */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              <span>Giao diện trường</span>
            </span>
            <button
              onClick={() => onChange({ showWireframe: !settings.showWireframe })}
              className={`text-[11px] font-mono flex items-center gap-1 px-2 py-0.5 rounded border transition-colors ${
                settings.showWireframe
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Lưới 3D</span>
            </button>
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
      <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-slate-300">
            Năng lượng của 1 gói sóng lượng tử (1 Photon excitation):
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
