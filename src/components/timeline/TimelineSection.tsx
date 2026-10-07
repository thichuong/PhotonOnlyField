import React from 'react';
import { TIMELINE_MILESTONES } from '../../data/timelineData';
import { MathFormula } from '../common/MathFormula';
import { MiniParticleCanvas } from '../canvas/MiniParticleCanvas';
import { MiniWaveCanvas } from '../canvas/MiniWaveCanvas';
import {
  Calendar,
  User,
  Sparkles,
  ArrowDown,
  Atom,
  Quote,
  CheckCircle,
} from 'lucide-react';

export const TimelineSection: React.FC = () => {
  return (
    <section className="my-16 flex flex-col gap-10">
      {/* Section Header */}
      <div className="flex flex-col gap-3 max-w-3xl">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-widest">
          <Calendar className="w-4 h-4" />
          <span>Tiến trình lịch sử tư tưởng khoa học (300 năm tiến hóa)</span>
        </div>
        <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
          Hành trình nhận thức: Ánh sáng thực sự là gì?
        </h2>
        <p className="text-slate-400 text-sm lg:text-base leading-relaxed">
          Cuộn xuống dọc theo dòng thời gian để xem các nhà khoa học vĩ đại đã từng bước phá vỡ định kiến về "hạt cô lập" ra sao, dẫn tới chân lý của Thuyết Trường Lượng Tử: <strong className="text-cyan-300">Vũ trụ chỉ có các Trường</strong>.
        </p>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-1">
          <ArrowDown className="w-4 h-4 text-cyan-400 animate-bounce" />
          <span>Lướt xuống để xem liên tục toàn bộ tiến trình</span>
        </div>
      </div>

      {/* Vertical Timeline Container */}
      <div className="relative border-l-2 border-slate-800 ml-4 md:ml-8 pl-6 md:pl-10 space-y-16">
        {TIMELINE_MILESTONES.map((item, index) => {
          // Xác định loại mô phỏng 3D mini gắn kèm tương ứng với mốc
          const hasParticleSim = item.id === 'newton-1704';
          const hasInterferenceSim = item.id === 'young-1801';
          const hasPlaneWaveSim = item.id === 'maxwell-1865';
          const isQftPinnacle = item.id === 'dirac-1927' || item.id === 'feynman-1948';

          return (
            <div key={item.id} className="relative group">
              {/* Timeline Node Bullet Point */}
              <div
                className={`absolute -left-[35px] md:-left-[51px] top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  isQftPinnacle
                    ? 'bg-cyan-500 border-cyan-300 shadow-lg shadow-cyan-500/50 text-slate-950 ring-4 ring-cyan-500/20'
                    : 'bg-slate-900 border-cyan-500/60 text-cyan-400'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isQftPinnacle ? 'bg-slate-950' : 'bg-cyan-400'
                  }`}
                />
              </div>

              {/* Card Container */}
              <div
                className={`rounded-3xl p-6 lg:p-8 border transition-all duration-300 backdrop-blur-md relative overflow-hidden ${
                  isQftPinnacle
                    ? 'bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-cyan-950/30 border-cyan-500/40 shadow-2xl shadow-cyan-950/40'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header Meta Info */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 rounded-xl text-xs font-mono font-bold">
                      Năm {item.year}
                    </span>
                    <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-xl text-xs font-medium">
                      {item.era}
                    </span>
                    <span className="px-3 py-1 bg-purple-500/15 border border-purple-500/30 text-purple-300 rounded-xl text-xs font-medium">
                      {item.theoryName}
                    </span>
                  </div>

                  <span className="text-xs font-mono text-slate-500">
                    Cột mốc #{index + 1}
                  </span>
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Narrative & Insights */}
                  <div
                    className={`${
                      hasParticleSim || hasInterferenceSim || hasPlaneWaveSim
                        ? 'lg:col-span-7'
                        : 'lg:col-span-8'
                    } flex flex-col gap-4`}
                  >
                    <div>
                      <h3 className="text-2xl font-black text-white leading-tight">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-2 text-slate-300 text-sm font-semibold mt-1.5">
                        <User className="w-4 h-4 text-cyan-400" />
                        <span>{item.scientist}</span>
                      </div>
                    </div>

                    <p className="text-slate-300 text-sm leading-relaxed">
                      {item.fullExplanation}
                    </p>

                    {item.quote && (
                      <div className="bg-slate-950/60 border-l-2 border-cyan-400 p-3.5 rounded-r-xl text-xs text-slate-300 italic flex items-start gap-2.5">
                        <Quote className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span>"{item.quote}"</span>
                      </div>
                    )}

                    {/* Paradigm Shift Alert */}
                    <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl flex flex-col gap-1.5">
                      <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 uppercase tracking-wide">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Bước nhảy nhận thức (Paradigm Shift)</span>
                      </div>
                      <div className="text-xs text-slate-300 leading-normal">
                        {item.paradigmShift}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Embedded 3D Simulation or Math Formula */}
                  <div
                    className={`${
                      hasParticleSim || hasInterferenceSim || hasPlaneWaveSim
                        ? 'lg:col-span-5'
                        : 'lg:col-span-4'
                    } flex flex-col gap-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5`}
                  >
                    {/* Embedded 3D Sim if applicable */}
                    {hasParticleSim && (
                      <div className="flex flex-col gap-2">
                        <div className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Atom className="w-3.5 h-3.5" />
                          <span>Mô phỏng 3D: Các hạt Newton</span>
                        </div>
                        <MiniParticleCanvas />
                      </div>
                    )}

                    {hasInterferenceSim && (
                      <div className="flex flex-col gap-2">
                        <div className="text-[11px] font-semibold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Atom className="w-3.5 h-3.5" />
                          <span>Mô phỏng 3D: Sóng giao thoa hai khe</span>
                        </div>
                        <MiniWaveCanvas type="interference" />
                      </div>
                    )}

                    {hasPlaneWaveSim && (
                      <div className="flex flex-col gap-2">
                        <div className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Atom className="w-3.5 h-3.5" />
                          <span>Mô phỏng 3D: Sóng trường điện từ</span>
                        </div>
                        <MiniWaveCanvas type="plane-wave" />
                      </div>
                    )}

                    {/* For QFT / Pinnacle */}
                    {isQftPinnacle && (
                      <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3.5 text-xs text-cyan-200 flex flex-col gap-2">
                        <div className="flex items-center gap-1.5 font-bold text-cyan-300">
                          <CheckCircle className="w-4 h-4 text-cyan-400" />
                          <span>Kết luận đỉnh cao của vật lý</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          Quan sát mô phỏng 3D chính ở đầu trang: Toàn bộ hạt photon chỉ là gói sóng kích thích (excitation) trên mặt phẳng Trường Lượng Tử.
                        </p>
                      </div>
                    )}

                    {/* Core Mathematical Formula */}
                    <div className="flex flex-col gap-1.5">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Công thức toán học cốt lõi
                      </div>
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-center overflow-x-auto">
                        <MathFormula
                          math={item.formulaLatex}
                          block
                          className="text-base text-cyan-300"
                        />
                      </div>
                      <div className="text-[11px] text-slate-400 leading-snug">
                        {item.formulaMeaning}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
