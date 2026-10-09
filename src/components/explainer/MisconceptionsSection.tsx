import React from 'react';
import { HelpCircle, AlertOctagon, Lightbulb, Waves, Sparkles } from 'lucide-react';
import { useLanguage } from '../../i18n';

export const MisconceptionsSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="myths-section" className="scroll-mt-24 flex flex-col gap-8 my-4">
      {/* Section Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-widest">
          <HelpCircle className="w-4 h-4" />
          <span>{t.myths.headerBadge}</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          {t.myths.sectionTitle}
        </h2>
        <p className="text-slate-400 max-w-3xl text-sm leading-relaxed">
          {t.myths.sectionDescription}
        </p>
      </div>

      {/* Myth Cards Grid: Always open and fully visible */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {t.myths.items.map((item, index) => {
          return (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl flex flex-col justify-between overflow-hidden transition-all hover:border-slate-700 hover:shadow-2xl hover:shadow-slate-950/40"
            >
              {/* Header / Myth Title */}
              <div className="p-5 pb-4 flex items-start gap-3.5 border-b border-slate-800/80 bg-slate-950/40">
                <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0 font-mono text-xs font-bold mt-0.5">
                  #{index + 1}
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <span className="text-xs uppercase font-mono tracking-wider font-bold text-rose-400 flex items-center gap-1">
                    <AlertOctagon className="w-3.5 h-3.5" />
                    {t.myths.mythBadge}
                  </span>
                  <h3 className="text-base font-bold text-white leading-snug">
                    {item.myth}
                  </h3>
                </div>
              </div>

              {/* Card Details Body (Always Rendered) */}
              <div className="p-5 flex flex-col gap-4 flex-1 justify-between">
                <div className="flex flex-col gap-3.5">
                  {/* 1. QFT Reality */}
                  <div className="bg-slate-950/80 rounded-xl p-4 border border-cyan-500/25 flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-cyan-300 text-xs font-semibold">
                      <Lightbulb className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{t.myths.realityBadge}</span>
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed font-normal">
                      {item.reality}
                    </p>
                  </div>

                  {/* 2. Everyday Analogy */}
                  <div className="bg-slate-950/60 rounded-xl p-4 border border-purple-500/25 flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-purple-300 text-xs font-semibold">
                      <Waves className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>{t.myths.analogyBadge}</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed italic">
                      "{item.analogy}"
                    </p>
                  </div>
                </div>

                {/* 3. Takeaway Truth - No truncate, full multiline text wrapping */}
                <div className="bg-slate-950/90 p-3.5 rounded-xl border border-cyan-500/30 flex items-start gap-2.5 text-sm text-cyan-200 font-mono leading-relaxed mt-1">
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span className="break-words font-medium">{item.qftTruth}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

