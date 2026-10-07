import { useState } from 'react';
import { TIMELINE_MILESTONES } from '../../data/timelineData';
import type { SimulationMode } from '../../types/physics';
import { MathFormula } from '../common/MathFormula';
import { Calendar, User, BookOpen, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface TimelineSectionProps {
  onSelectPreset: (mode: SimulationMode) => void;
  currentMode: SimulationMode;
}

export const TimelineSection: React.FC<TimelineSectionProps> = ({
  onSelectPreset,
  currentMode,
}) => {
  const [selectedId, setSelectedId] = useState<string>(TIMELINE_MILESTONES[2].id); // Mặc định chọn Maxwell hoặc Dirac

  const activeMilestone = TIMELINE_MILESTONES.find((m) => m.id === selectedId) || TIMELINE_MILESTONES[0];

  return (
    <section className="my-16 flex flex-col gap-8">
      {/* Section Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-widest">
          <Calendar className="w-4 h-4" />
          <span>Tiến trình lịch sử tư tưởng khoa học</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Từ "Viên bi hạt" tới "Trường lượng tử": Ánh sáng là gì?
        </h2>
        <p className="text-slate-400 max-w-3xl text-sm leading-relaxed">
          Nhân loại đã mất hơn 300 năm, qua nhiều cuộc tranh luận nảy lửa giữa các bộ óc vĩ đại nhất, để nhận ra: Ánh sáng không phải là hạt chuyển động trong không gian rỗng, mà bản thân không gian được dệt nên từ các trường lượng tử dao động.
        </p>
      </div>

      {/* Horizontal Milestone Selector Bar */}
      <div className="relative">
        <div className="overflow-x-auto pb-4 pt-2 no-scrollbar">
          <div className="flex items-center gap-3 min-w-max">
            {TIMELINE_MILESTONES.map((item, index) => {
              const isSelected = item.id === selectedId;
              const isCurrentPreset = item.simulationPreset === currentMode;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedId(item.id);
                    onSelectPreset(item.simulationPreset);
                  }}
                  className={`group relative flex flex-col text-left p-3.5 rounded-xl border transition-all duration-200 w-52 shrink-0 ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-400 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                      Năm {item.year}
                    </span>
                    <span className="text-[10px] text-slate-500">#{index + 1}</span>
                  </div>

                  <div className="font-semibold text-sm text-slate-200 group-hover:text-white line-clamp-1 mt-1">
                    {item.scientist}
                  </div>

                  <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {item.theoryName}
                  </div>

                  {isCurrentPreset && (
                    <div className="mt-2.5 flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Đang chiếu 3D</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detailed Selected Milestone Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
        {/* Subtle background glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Left Column: Core Narrative & Theory */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 rounded-lg text-xs font-mono font-bold">
                Năm {activeMilestone.year}
              </span>
              <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-medium">
                {activeMilestone.era}
              </span>
              <span className="px-3 py-1 bg-purple-500/15 border border-purple-500/30 text-purple-300 rounded-lg text-xs font-medium">
                {activeMilestone.theoryName}
              </span>
            </div>

            <h3 className="text-2xl lg:text-3xl font-black text-white leading-tight">
              {activeMilestone.title}
            </h3>

            <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
              <User className="w-4 h-4 text-cyan-400" />
              <span>{activeMilestone.scientist}</span>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed mt-2">
              {activeMilestone.fullExplanation}
            </p>

            {activeMilestone.quote && (
              <blockquote className="border-l-2 border-cyan-400 pl-4 py-1 italic text-xs text-slate-400 my-2 bg-slate-950/40 rounded-r-lg">
                "{activeMilestone.quote}"
              </blockquote>
            )}
          </div>

          {/* Paradigm Shift Alert */}
          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl flex flex-col gap-1.5">
            <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 uppercase tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bước nhảy nhận thức (Paradigm Shift)</span>
            </div>
            <div className="text-xs text-slate-300 leading-normal">
              {activeMilestone.paradigmShift}
            </div>
          </div>
        </div>

        {/* Right Column: Experiment & Math Formula */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-6 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5">
          <div className="flex flex-col gap-4">
            {/* Key Formula */}
            <div className="flex flex-col gap-1.5">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Công thức toán học cốt lõi
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center overflow-x-auto">
                <MathFormula math={activeMilestone.formulaLatex} block className="text-lg text-cyan-300" />
              </div>
              <div className="text-[11px] text-slate-400 leading-snug mt-1">
                {activeMilestone.formulaMeaning}
              </div>
            </div>

            {/* Key Experiment */}
            <div className="flex flex-col gap-1.5 pt-3 border-t border-slate-800/80">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                <span>Thí nghiệm bản lề</span>
              </div>
              <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded-xl border border-slate-800/50">
                {activeMilestone.keyExperiment}
              </div>
            </div>
          </div>

          {/* Action button to sync 3D canvas */}
          <button
            onClick={() => onSelectPreset(activeMilestone.simulationPreset)}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
          >
            <span>Kích hoạt mô hình "{activeMilestone.scientist}" trên Canvas 3D</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
