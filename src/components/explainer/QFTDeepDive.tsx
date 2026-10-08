import React from 'react';
import { HelpCircle, Layers, Radio, Sparkles } from 'lucide-react';
import { useLanguage } from '../../i18n';

export const QFTDeepDive: React.FC = () => {
  const { t } = useLanguage();
  return (
    <section className="my-16 flex flex-col gap-10">
      {/* Title */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-widest">
          <HelpCircle className="w-4 h-4" />
          <span>{t.qftDeepDive.headerBadge}</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          {t.qftDeepDive.mainTitle}
        </h2>
        <p className="text-slate-400 max-w-3xl text-sm leading-relaxed">
          {t.qftDeepDive.description}
        </p>
      </div>

      {/* Core Conceptual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 lg:p-8 backdrop-blur-md">
        {/* 1. Field Nature */}
        <div className="flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-3">
            <span className="px-3 py-1 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 rounded-lg text-xs font-mono font-bold w-fit flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>{t.qftDeepDive.fieldNatureBadge}</span>
            </span>
            <h3 className="text-xl lg:text-2xl font-bold text-white">
              {t.qftDeepDive.fieldNatureTitle}
            </h3>
            <p className="text-slate-200 text-sm lg:text-base leading-relaxed">
              {t.qftDeepDive.fieldNatureIntro}
            </p>
            <ul className="space-y-3 text-sm text-slate-200 leading-relaxed mt-1">
              <li className="flex flex-col gap-1 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <span className="text-cyan-300 font-bold text-sm lg:text-base">{t.qftDeepDive.fieldPoint1Title}</span>
                <span className="text-slate-200 text-xs lg:text-sm leading-relaxed">{t.qftDeepDive.fieldPoint1Text}</span>
              </li>
              <li className="flex flex-col gap-1 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <span className="text-cyan-300 font-bold text-sm lg:text-base">{t.qftDeepDive.fieldPoint2Title}</span>
                <span className="text-slate-200 text-xs lg:text-sm leading-relaxed">{t.qftDeepDive.fieldPoint2Text}</span>
              </li>
              <li className="flex flex-col gap-1 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <span className="text-cyan-300 font-bold text-sm lg:text-base">{t.qftDeepDive.fieldPoint3Title}</span>
                <span className="text-slate-200 text-xs lg:text-sm leading-relaxed">{t.qftDeepDive.fieldPoint3Text}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 2. Local Interaction & Detection */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 lg:p-7 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-3">
            <span className="px-3 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-mono font-bold w-fit flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5" />
              <span>{t.qftDeepDive.detectorQuestionBadge}</span>
            </span>
            <h3 className="text-xl lg:text-2xl font-bold text-white">
              {t.qftDeepDive.detectorQuestionTitle}
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              {t.qftDeepDive.detectorQuestionIntro}
            </p>
            <div className="bg-slate-900/90 p-4 lg:p-5 rounded-xl border border-slate-800 text-sm lg:text-base text-cyan-200 leading-relaxed font-medium">
              {t.qftDeepDive.detectorRuleText}
            </div>
            <p className="text-slate-300 text-xs lg:text-sm leading-relaxed">
              {t.qftDeepDive.detectorConclusion}
            </p>
          </div>

          {/* 3. Duality Resolution Banner */}
          <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col gap-2.5 bg-gradient-to-r from-purple-950/30 to-slate-900/40 p-4 lg:p-5 rounded-xl border border-purple-500/20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm lg:text-base font-bold text-purple-300">
                {t.qftDeepDive.dualityResolutionTitle}
              </span>
            </div>
            <p className="text-xs lg:text-sm text-slate-200 leading-relaxed">
              {t.qftDeepDive.dualityResolutionText}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Deep Dive: Quantum Vacuum Fluctuations */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/40 border border-cyan-500/40 rounded-3xl p-6 lg:p-10 backdrop-blur-md flex flex-col gap-6 shadow-2xl">
        <div className="flex flex-col gap-3">
          <span className="px-3 py-1 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 rounded-lg text-xs font-mono font-bold w-fit flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-cyan-400" />
            <span>{t.qftDeepDive.vacuumFluctuationsBadge}</span>
          </span>
          <h3 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
            {t.qftDeepDive.vacuumFluctuationsTitle}
          </h3>
          <p className="text-slate-200 text-base lg:text-lg leading-relaxed max-w-4xl font-normal">
            {t.qftDeepDive.vacuumFluctuationsIntro}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl flex flex-col gap-3 shadow-lg">
            <span className="text-sm lg:text-base font-bold text-cyan-300">
              {t.qftDeepDive.vacuumPoint1Title}
            </span>
            <p className="text-xs lg:text-sm text-slate-200 leading-relaxed">
              {t.qftDeepDive.vacuumPoint1Text}
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl flex flex-col gap-3 shadow-lg">
            <span className="text-sm lg:text-base font-bold text-purple-300">
              {t.qftDeepDive.vacuumPoint2Title}
            </span>
            <p className="text-xs lg:text-sm text-slate-200 leading-relaxed">
              {t.qftDeepDive.vacuumPoint2Text}
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl flex flex-col gap-3 shadow-lg">
            <span className="text-sm lg:text-base font-bold text-emerald-300">
              {t.qftDeepDive.vacuumPoint3Title}
            </span>
            <p className="text-xs lg:text-sm text-slate-200 leading-relaxed">
              {t.qftDeepDive.vacuumPoint3Text}
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-white">
          {t.qftDeepDive.tableTitle}
        </h3>

        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs bg-slate-900/60">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-4">{t.qftDeepDive.thCriteria}</th>
                <th className="p-4 text-amber-300">{t.qftDeepDive.thNewton}</th>
                <th className="p-4 text-purple-300">{t.qftDeepDive.thMaxwell}</th>
                <th className="p-4 text-cyan-300">{t.qftDeepDive.thQft}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              <tr>
                <td className="p-4 font-semibold text-slate-200">{t.qftDeepDive.row1Criteria}</td>
                <td className="p-4">{t.qftDeepDive.row1Newton}</td>
                <td className="p-4">{t.qftDeepDive.row1Maxwell}</td>
                <td className="p-4 text-cyan-200 font-medium">{t.qftDeepDive.row1Qft}</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-200">{t.qftDeepDive.row2Criteria}</td>
                <td className="p-4">{t.qftDeepDive.row2Newton}</td>
                <td className="p-4">{t.qftDeepDive.row2Maxwell}</td>
                <td className="p-4 text-cyan-200 font-medium">{t.qftDeepDive.row2Qft}</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-200">{t.qftDeepDive.row3Criteria}</td>
                <td className="p-4">{t.qftDeepDive.row3Newton}</td>
                <td className="p-4">{t.qftDeepDive.row3Maxwell}</td>
                <td className="p-4 text-cyan-200 font-medium">{t.qftDeepDive.row3Qft}</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-200">{t.qftDeepDive.row4Criteria}</td>
                <td className="p-4 text-rose-400">{t.qftDeepDive.row4Newton}</td>
                <td className="p-4 text-emerald-400">{t.qftDeepDive.row4Maxwell}</td>
                <td className="p-4 text-emerald-400 font-medium">{t.qftDeepDive.row4Qft}</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-200">{t.qftDeepDive.row5Criteria}</td>
                <td className="p-4 text-rose-400">{t.qftDeepDive.row5Newton}</td>
                <td className="p-4 text-rose-400">{t.qftDeepDive.row5Maxwell}</td>
                <td className="p-4 text-emerald-400 font-medium">{t.qftDeepDive.row5Qft}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
