import React, { useState, useEffect, useCallback } from 'react';
import {
  Scale,
  Sparkles,
  AlertTriangle,
  Atom,
  Orbit,
  BookOpen,
  Layers,
  Radio,
  Infinity as InfinityIcon,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '../../i18n';
import { MathFormula } from '../common/MathFormula';

type PerspectivePillarId =
  | 'perspective-ontology'
  | 'perspective-vacuum'
  | 'perspective-semiclassical'
  | 'perspective-beyond';

export const ModernPerspectivesSection: React.FC = () => {
  const { t } = useLanguage();
  const [activePillar, setActivePillar] = useState<PerspectivePillarId>('perspective-ontology');

  const mp = t.modernPerspectives;
  const { pillars } = mp;

  const scrollToPillar = useCallback((pillarId: PerspectivePillarId) => {
    setActivePillar(pillarId);
    const element = document.getElementById(pillarId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Scroll-spy: Sync active tab with user's vertical scroll position
  useEffect(() => {
    const pillarIds: PerspectivePillarId[] = [
      'perspective-ontology',
      'perspective-vacuum',
      'perspective-semiclassical',
      'perspective-beyond',
    ];

    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActivePillar(entry.target.id as PerspectivePillarId);
          }
        });
      },
      {
        rootMargin: '-15% 0px -65% 0px',
        threshold: 0,
      }
    );

    pillarIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section id="modern-perspectives-section" className="flex flex-col gap-8 scroll-mt-24 my-10">
      {/* 1. Sticky Navigation Bar & Header (Tương tự phần Phòng Thí Nghiệm) */}
      <div className="sticky top-16 z-30 bg-slate-950/95 backdrop-blur-md py-3.5 -my-2 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold uppercase tracking-widest">
            <Scale className="w-4 h-4" />
            <span>{mp.headerBadge}</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mt-0.5">
            {mp.sectionTitle}
          </h2>
        </div>

        {/* Quick Jump Anchor Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 text-xs shadow-lg">
          <button
            type="button"
            onClick={() => scrollToPillar('perspective-ontology')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activePillar === 'perspective-ontology'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>{mp.tabOntology}</span>
          </button>

          <button
            type="button"
            onClick={() => scrollToPillar('perspective-vacuum')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activePillar === 'perspective-vacuum'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>{mp.tabVacuumCrisis}</span>
          </button>

          <button
            type="button"
            onClick={() => scrollToPillar('perspective-semiclassical')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activePillar === 'perspective-semiclassical'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>{mp.tabSemiclassical}</span>
          </button>

          <button
            type="button"
            onClick={() => scrollToPillar('perspective-beyond')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activePillar === 'perspective-beyond'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Orbit className="w-3.5 h-3.5 text-emerald-400" />
            <span>{mp.tabBeyondQft}</span>
          </button>
        </div>
      </div>

      {/* Description Intro Banner */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 text-slate-300 text-sm lg:text-base leading-relaxed">
        {mp.sectionDescription}
      </div>

      {/* 2. Render All 4 Pillars in Sequence (Vertical Scroll Flow) */}
      <div className="flex flex-col gap-10">
        {/* PILLAR 1: ONTOLOGY (WEINBERG VS HOBSON & HAAG) */}
        <div
          id="perspective-ontology"
          className="scroll-mt-28 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 lg:p-9 backdrop-blur-md shadow-2xl flex flex-col gap-6"
        >
          {/* Header */}
          <div className="flex flex-col gap-2">
            <span className="px-3 py-1 bg-purple-500/15 border border-purple-500/30 text-purple-300 rounded-lg text-xs font-mono font-bold w-fit flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>{pillars.ontology.badge}</span>
            </span>
            <h3 className="text-2xl lg:text-3xl font-black text-white">
              {pillars.ontology.title}
            </h3>
            <p className="text-purple-300 text-sm font-medium">
              {pillars.ontology.subtitle}
            </p>
            <p className="text-slate-200 text-sm lg:text-base leading-relaxed mt-1">
              {pillars.ontology.intro}
            </p>
          </div>

          {/* 2-Column Comparison: Hobson vs Weinberg */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Hobson View */}
            <div className="bg-slate-950/70 border border-purple-500/30 rounded-2xl p-5 flex flex-col gap-3">
              <span className="text-purple-300 font-bold text-sm lg:text-base flex items-center gap-2">
                <Radio className="w-4 h-4 text-purple-400" />
                <span>{pillars.ontology.hobsonViewTitle}</span>
              </span>
              <p className="text-slate-200 text-sm leading-relaxed">
                {pillars.ontology.hobsonViewText}
              </p>
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 mt-auto">
                <MathFormula math="|n\rangle = \frac{(a^\dagger)^n}{\sqrt{n!}} |0\rangle" className="text-center text-xs" />
              </div>
            </div>

            {/* Weinberg View */}
            <div className="bg-slate-950/70 border border-cyan-500/30 rounded-2xl p-5 flex flex-col gap-3">
              <span className="text-cyan-300 font-bold text-sm lg:text-base flex items-center gap-2">
                <Atom className="w-4 h-4 text-cyan-400" />
                <span>{pillars.ontology.weinbergViewTitle}</span>
              </span>
              <p className="text-slate-200 text-sm leading-relaxed">
                {pillars.ontology.weinbergViewText}
              </p>
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 mt-auto">
                <MathFormula math="U(\Lambda, a) |p, \sigma\rangle = \sum_{\sigma'} D_{\sigma'\sigma}(W) |\Lambda p, \sigma'\rangle" className="text-center text-xs" />
              </div>
            </div>
          </div>

          {/* In-depth Mathematical Warnings: Haag & Non-localization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl flex flex-col gap-2">
              <span className="text-amber-300 font-bold text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>{pillars.ontology.haagTheoremTitle}</span>
              </span>
              <p className="text-slate-200 text-sm leading-relaxed">
                {pillars.ontology.haagTheoremText}
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl flex flex-col gap-2">
              <span className="text-rose-300 font-bold text-sm flex items-center gap-2">
                <InfinityIcon className="w-4 h-4 text-rose-400" />
                <span>{pillars.ontology.localizationTitle}</span>
              </span>
              <p className="text-slate-200 text-sm leading-relaxed">
                {pillars.ontology.localizationText}
              </p>
            </div>
          </div>

          {/* Takeaway Box */}
          <div className="bg-purple-950/30 border border-purple-500/40 rounded-2xl p-4.5 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <p className="text-purple-200 font-medium text-sm leading-relaxed">
              {pillars.ontology.takeaway}
            </p>
          </div>
        </div>

        {/* PILLAR 2: VACUUM CRISIS (JAFFE CASIMIR & 10^120 PROBLEM) */}
        <div
          id="perspective-vacuum"
          className="scroll-mt-28 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 lg:p-9 backdrop-blur-md shadow-2xl flex flex-col gap-6"
        >
          {/* Header */}
          <div className="flex flex-col gap-2">
            <span className="px-3 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-mono font-bold w-fit flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{pillars.vacuumCrisis.badge}</span>
            </span>
            <h3 className="text-2xl lg:text-3xl font-black text-white">
              {pillars.vacuumCrisis.title}
            </h3>
            <p className="text-amber-300 text-sm font-medium">
              {pillars.vacuumCrisis.subtitle}
            </p>
            <p className="text-slate-200 text-sm lg:text-base leading-relaxed mt-1">
              {pillars.vacuumCrisis.intro}
            </p>
          </div>

          {/* 2-Column: Standard Casimir vs Jaffe van der Waals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-slate-950/70 border border-amber-500/30 rounded-2xl p-5 flex flex-col gap-3">
              <span className="text-amber-300 font-bold text-sm lg:text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>{pillars.vacuumCrisis.casimirStandardTitle}</span>
              </span>
              <p className="text-slate-200 text-sm leading-relaxed">
                {pillars.vacuumCrisis.casimirStandardText}
              </p>
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 mt-auto">
                <MathFormula math="\frac{F}{A} = -\frac{\pi^2 \hbar c}{240 d^4} \quad (ZPE \text{ mode counting})" className="text-center text-xs" />
              </div>
            </div>

            <div className="bg-slate-950/70 border border-rose-500/30 rounded-2xl p-5 flex flex-col gap-3">
              <span className="text-rose-300 font-bold text-sm lg:text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-400" />
                <span>{pillars.vacuumCrisis.jaffeCritiqueTitle}</span>
              </span>
              <p className="text-slate-200 text-sm leading-relaxed">
                {pillars.vacuumCrisis.jaffeCritiqueText}
              </p>
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 mt-auto">
                <MathFormula math="\lim_{e \to 0} F_{\text{Casimir}} = 0 \quad (\text{Relativistic van der Waals})" className="text-center text-xs" />
              </div>
            </div>
          </div>

          {/* Cosmological Crisis Full-Width Highlight Card */}
          <div className="bg-gradient-to-r from-rose-950/40 via-slate-950/80 to-amber-950/30 border border-rose-500/40 rounded-2xl p-5 flex flex-col gap-3 shadow-xl">
            <span className="text-rose-300 font-black text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <span>{pillars.vacuumCrisis.cosmologicalCrisisTitle}</span>
            </span>
            <p className="text-slate-200 text-sm leading-relaxed">
              {pillars.vacuumCrisis.cosmologicalCrisisText}
            </p>
            <div className="bg-slate-950/90 p-3.5 rounded-xl border border-slate-800/80">
              <MathFormula math="\frac{\rho_{\text{QFT ZPE}}}{\rho_{\text{Dark Energy Obs}}} \approx 10^{120} \quad \left(\text{Thảm họa Hằng số Vũ trụ}\right)" className="text-center text-xs" />
            </div>
          </div>

          {/* Takeaway Box */}
          <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-4.5 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-amber-200 font-medium text-sm leading-relaxed">
              {pillars.vacuumCrisis.takeaway}
            </p>
          </div>
        </div>

        {/* PILLAR 3: SEMICLASSICAL VS QUANTUM (LAMB-SCULLY & ANTI-BUNCHING) */}
        <div
          id="perspective-semiclassical"
          className="scroll-mt-28 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 lg:p-9 backdrop-blur-md shadow-2xl flex flex-col gap-6"
        >
          {/* Header */}
          <div className="flex flex-col gap-2">
            <span className="px-3 py-1 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 rounded-lg text-xs font-mono font-bold w-fit flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5" />
              <span>{pillars.semiclassical.badge}</span>
            </span>
            <h3 className="text-2xl lg:text-3xl font-black text-white">
              {pillars.semiclassical.title}
            </h3>
            <p className="text-cyan-300 text-sm font-medium">
              {pillars.semiclassical.subtitle}
            </p>
            <p className="text-slate-200 text-sm lg:text-base leading-relaxed mt-1">
              {pillars.semiclassical.intro}
            </p>
          </div>

          {/* Semiclassical (Lamb-Scully) vs True Quantum Proofs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Lamb-Scully Card */}
            <div className="bg-slate-950/70 border border-cyan-500/30 rounded-2xl p-5 flex flex-col gap-3">
              <span className="text-cyan-300 font-bold text-sm lg:text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>{pillars.semiclassical.lambScullyTitle}</span>
              </span>
              <p className="text-slate-200 text-sm leading-relaxed">
                {pillars.semiclassical.lambScullyText}
              </p>
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 mt-auto">
                <MathFormula math="H_{\text{int}} = -e \vec{r} \cdot \vec{E}_{\text{classical}}(t) \implies \text{Rate} \propto |\langle f | \vec{r} | i \rangle|^2" className="text-center text-xs" />
              </div>
            </div>

            {/* Antibunching Card */}
            <div className="bg-slate-950/70 border border-emerald-500/30 rounded-2xl p-5 flex flex-col gap-3">
              <span className="text-emerald-300 font-bold text-sm lg:text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>{pillars.semiclassical.antibunchingTitle}</span>
              </span>
              <p className="text-slate-200 text-sm leading-relaxed">
                {pillars.semiclassical.antibunchingText}
              </p>
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 mt-auto">
                <MathFormula math="g^{(2)}(0) = \frac{\langle a^\dagger a^\dagger a a \rangle}{\langle a^\dagger a \rangle^2} < 1 \quad (\text{Trường Lượng Tử Thuần})" className="text-center text-xs" />
              </div>
            </div>
          </div>

          {/* Bell Entanglement Card */}
          <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl flex flex-col gap-2">
            <span className="text-purple-300 font-bold text-sm flex items-center gap-2">
              <Atom className="w-4 h-4 text-purple-400" />
              <span>{pillars.semiclassical.bellEntanglementTitle}</span>
            </span>
            <p className="text-slate-200 text-sm leading-relaxed">
              {pillars.semiclassical.bellEntanglementText}
            </p>
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800/80 mt-1">
              <MathFormula math="|\psi\rangle = \frac{1}{\sqrt{2}}(|H\rangle_A |H\rangle_B + |V\rangle_A |V\rangle_B) \implies S = 2\sqrt{2} > 2" className="text-center text-xs" />
            </div>
          </div>

          {/* Takeaway Box */}
          <div className="bg-cyan-950/30 border border-cyan-500/40 rounded-2xl p-4.5 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-cyan-200 font-medium text-sm leading-relaxed">
              {pillars.semiclassical.takeaway}
            </p>
          </div>
        </div>

        {/* PILLAR 4: BEYOND QFT (DECOHERENCE, STRING, LQG, HOLOGRAPHY) */}
        <div
          id="perspective-beyond"
          className="scroll-mt-28 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 lg:p-9 backdrop-blur-md shadow-2xl flex flex-col gap-6"
        >
          {/* Header */}
          <div className="flex flex-col gap-2">
            <span className="px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-mono font-bold w-fit flex items-center gap-1.5">
              <Orbit className="w-3.5 h-3.5" />
              <span>{pillars.beyondQft.badge}</span>
            </span>
            <h3 className="text-2xl lg:text-3xl font-black text-white">
              {pillars.beyondQft.title}
            </h3>
            <p className="text-emerald-300 text-sm font-medium">
              {pillars.beyondQft.subtitle}
            </p>
            <p className="text-slate-200 text-sm lg:text-base leading-relaxed mt-1">
              {pillars.beyondQft.intro}
            </p>
          </div>

          {/* 4 Cards Grid for Beyond QFT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Decoherence */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 flex flex-col gap-2.5">
              <span className="text-emerald-300 font-bold text-sm lg:text-base flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span>{pillars.beyondQft.decoherenceTitle}</span>
              </span>
              <p className="text-slate-200 text-sm leading-relaxed">
                {pillars.beyondQft.decoherenceText}
              </p>
            </div>

            {/* String Theory */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 flex flex-col gap-2.5">
              <span className="text-purple-300 font-bold text-sm lg:text-base flex items-center gap-2">
                <Orbit className="w-4 h-4 text-purple-400" />
                <span>{pillars.beyondQft.stringTheoryTitle}</span>
              </span>
              <p className="text-slate-200 text-sm leading-relaxed">
                {pillars.beyondQft.stringTheoryText}
              </p>
            </div>

            {/* Loop Quantum Gravity */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 flex flex-col gap-2.5">
              <span className="text-amber-300 font-bold text-sm lg:text-base flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>{pillars.beyondQft.loopGravityTitle}</span>
              </span>
              <p className="text-slate-200 text-sm leading-relaxed">
                {pillars.beyondQft.loopGravityText}
              </p>
            </div>

            {/* Holography / AdS-CFT */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 flex flex-col gap-2.5">
              <span className="text-cyan-300 font-bold text-sm lg:text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>{pillars.beyondQft.holographyTitle}</span>
              </span>
              <p className="text-slate-200 text-sm leading-relaxed">
                {pillars.beyondQft.holographyText}
              </p>
            </div>
          </div>

          {/* Takeaway Box */}
          <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-4.5 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-emerald-200 font-medium text-sm leading-relaxed">
              {pillars.beyondQft.takeaway}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
