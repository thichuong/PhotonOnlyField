import { useState } from 'react';
import type { FieldSettings, SimulationMode } from './types/physics';
import { QuantumFieldCanvas } from './components/canvas/QuantumFieldCanvas';
import { FieldControls } from './components/controls/FieldControls';
import { TimelineSection } from './components/timeline/TimelineSection';
import { DoubleSlitLab } from './components/experiments/DoubleSlitLab';
import { PhotoelectricLab } from './components/experiments/PhotoelectricLab';
import { FockStateLab } from './components/experiments/FockStateLab';
import { QFTDeepDive } from './components/explainer/QFTDeepDive';
import {
  Sparkles,
  Waves,
  Calendar,
  FlaskConical,
  BookOpen,
  Atom,
} from 'lucide-react';

export function App() {
  const [fieldSettings, setFieldSettings] = useState<FieldSettings>({
    mode: 'qft-field',
    vacuumFluctuations: true,
    waveFrequency: 1.2,
    amplitude: 1.0,
    speed: 1.0,
    photonEnergy: 1.5,
    showWireframe: false,
    colorScheme: 'quantum-cyan',
    damping: 0.95,
  });

  const [activeLabTab, setActiveLabTab] = useState<'double-slit' | 'photoelectric' | 'fock-state'>('double-slit');

  const handleSettingsChange = (newSettings: Partial<FieldSettings>) => {
    setFieldSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleSelectPreset = (mode: SimulationMode) => {
    setFieldSettings((prev) => ({ ...prev, mode }));
    // Cuộn mượt lên canvas mô phỏng nếu đang ở xa
    const visualizerEl = document.getElementById('visualizer-section');
    if (visualizerEl) {
      visualizerEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Atom className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h1 className="font-black text-base lg:text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
                Photon: Only Field
              </h1>
              <p className="text-[10px] text-slate-400 font-mono -mt-0.5">
                Bản Chất Trường Lượng Tử (QFT)
              </p>
            </div>
          </div>

          {/* Quick Nav Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs text-slate-400 font-medium bg-slate-900/60 p-1 rounded-xl border border-slate-800">
            <a
              href="#visualizer-section"
              className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <Waves className="w-3.5 h-3.5 text-cyan-400" />
              <span>Mô Phỏng 3D</span>
            </a>
            <a
              href="#timeline-section"
              className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              <span>Dòng Thời Gian</span>
            </a>
            <a
              href="#labs-section"
              className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />
              <span>Phòng Thí Nghiệm</span>
            </a>
            <a
              href="#qft-deep-dive"
              className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Bản Chất QFT</span>
            </a>
          </nav>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 lg:px-8 py-8 w-full flex flex-col gap-14">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center gap-4 py-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Khám phá vật lý lượng tử hiện đại</span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Photon không phải hạt bi bay đi.<br />
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 bg-clip-text text-transparent">
              Vũ trụ chỉ có các Trường.
            </span>
          </h2>

          <p className="text-slate-400 text-sm lg:text-base leading-relaxed">
            Trong Thuyết Trường Lượng Tử (Quantum Field Theory - QFT), không gian ngập tràn Trường Điện Từ.
            Photon thực chất là một gói sóng dao động (quantum excitation) của trường này. Hãy quan sát và tương tác để cảm nhận vẻ đẹp của thực tại.
          </p>
        </div>

        {/* 1. Main 3D Simulation Viewport */}
        <section id="visualizer-section" className="flex flex-col gap-5 scroll-mt-24">
          <QuantumFieldCanvas
            settings={fieldSettings}
            onSettingsChange={handleSettingsChange}
          />
          <FieldControls
            settings={fieldSettings}
            onChange={handleSettingsChange}
          />
        </section>

        {/* 2. Historical Timeline & Paradigm Shifts */}
        <section id="timeline-section" className="scroll-mt-24">
          <TimelineSection
            onSelectPreset={handleSelectPreset}
            currentMode={fieldSettings.mode}
          />
        </section>

        {/* 3. Virtual Interactive Laboratories */}
        <section id="labs-section" className="flex flex-col gap-6 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-widest">
                <FlaskConical className="w-4 h-4" />
                <span>Thí nghiệm kiểm chứng</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight mt-1">
                Phòng Thí Nghiệm Tương Tác Ảo
              </h2>
            </div>

            {/* Lab Switcher Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs">
              <button
                onClick={() => setActiveLabTab('double-slit')}
                className={`px-3.5 py-2 rounded-xl font-medium transition-all ${
                  activeLabTab === 'double-slit'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                1. Khe Kép Photon Đơn Lẻ
              </button>
              <button
                onClick={() => setActiveLabTab('photoelectric')}
                className={`px-3.5 py-2 rounded-xl font-medium transition-all ${
                  activeLabTab === 'photoelectric'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                2. Hiệu Ứng Quang Điện
              </button>
              <button
                onClick={() => setActiveLabTab('fock-state')}
                className={`px-3.5 py-2 rounded-xl font-medium transition-all ${
                  activeLabTab === 'fock-state'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                3. Trạng Thái Fock |n⟩
              </button>
            </div>
          </div>

          {/* Render Active Lab */}
          {activeLabTab === 'double-slit' && <DoubleSlitLab />}
          {activeLabTab === 'photoelectric' && <PhotoelectricLab />}
          {activeLabTab === 'fock-state' && <FockStateLab />}
        </section>

        {/* 4. Deep Dive Conceptual Explanation */}
        <section id="qft-deep-dive" className="scroll-mt-24">
          <QFTDeepDive />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-8 px-4 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Atom className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400 font-semibold">Photon: Only Field</span>
            <span>— Trực quan hóa Thuyết Trường Lượng Tử</span>
          </div>

          <div className="italic text-slate-400">
            "There are no particles, there are only fields." — Art Hobson, American Journal of Physics
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
