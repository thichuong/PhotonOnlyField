import { HelpCircle } from 'lucide-react';
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

      {/* Lake Analogy Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 lg:p-8 backdrop-blur-md">
        <div className="flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-3">
            <span className="px-3 py-1 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 rounded-lg text-xs font-mono font-bold w-fit">
              {t.qftDeepDive.lakeAnalogyBadge}
            </span>
            <h3 className="text-xl font-bold text-white">
              {t.qftDeepDive.lakeAnalogyTitle}
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              {t.qftDeepDive.lakeAnalogyIntro}
            </p>
            <ul className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold shrink-0">{t.qftDeepDive.lakePoint1Title}</span>
                <span>{t.qftDeepDive.lakePoint1Text}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold shrink-0">{t.qftDeepDive.lakePoint2Title}</span>
                <span>{t.qftDeepDive.lakePoint2Text}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold shrink-0">{t.qftDeepDive.lakePoint3Title}</span>
                <span>{t.qftDeepDive.lakePoint3Text}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Why do we detect it as a particle? */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-3">
            <span className="px-3 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-mono font-bold w-fit">
              {t.qftDeepDive.detectorQuestionBadge}
            </span>
            <h3 className="text-xl font-bold text-white">
              {t.qftDeepDive.detectorQuestionTitle}
            </h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              {t.qftDeepDive.detectorQuestionIntro}
            </p>
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
              {t.qftDeepDive.detectorRuleText}
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              {t.qftDeepDive.detectorConclusion}
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
