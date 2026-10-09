import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, X, CheckCircle, Compass, Zap } from 'lucide-react';
import { useLanguage } from '../../i18n';

interface StoryModeTourProps {
  onClose: () => void;
  onApplyStep: (stepIndex: number) => void;
}

export const StoryModeTour: React.FC<StoryModeTourProps> = ({
  onClose,
  onApplyStep,
}) => {
  const { t } = useLanguage();
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const steps = t.tour.steps;
  const currentStep = steps[currentStepIndex];

  // Kích hoạt bước đầu tiên khi component mount
  useEffect(() => {
    onApplyStep(0);
  }, [onApplyStep]);

  if (!currentStep) return null;

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      onApplyStep(nextIndex);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      onApplyStep(prevIndex);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-cyan-950/50 flex flex-col gap-5 text-slate-100 relative">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: '16s' }} />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold block">
                {t.tour.tourBadge}
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {t.tour.tourTitle}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={t.tour.closeBtn}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress indicator */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-1">
            {steps.map((s, idx) => (
              <div
                key={s.step}
                className={`h-1.5 rounded-full transition-all duration-300 flex-1 ${
                  idx === currentStepIndex
                    ? 'bg-cyan-400'
                    : idx < currentStepIndex
                    ? 'bg-cyan-600/70'
                    : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-mono text-slate-400 shrink-0 pl-2">
            {t.tour.stepIndicator} {currentStepIndex + 1}/{steps.length}
          </span>
        </div>

        {/* Step Content */}
        <div className="flex flex-col gap-3.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold">
              {currentStep.badge}
            </span>
          </div>

          <h4 className="text-lg sm:text-xl font-bold text-white leading-snug">
            {currentStep.title}
          </h4>

          <p className="text-sm text-slate-200 leading-relaxed font-normal">
            {currentStep.description}
          </p>

          {/* Key Takeaway Box */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2 text-sm text-cyan-200">
            <span className="font-semibold text-cyan-400 flex items-center gap-1.5 uppercase font-mono text-xs tracking-wider">
              <CheckCircle className="w-4 h-4" />
              {t.tour.takeawayLabel}
            </span>
            <p className="leading-relaxed text-slate-100 font-medium text-sm">
              {currentStep.takeaway}
            </p>
          </div>

          {/* Action Hint */}
          <div className="flex items-center gap-2 text-xs font-mono text-purple-300 bg-purple-950/30 px-3.5 py-2.5 rounded-xl border border-purple-500/20">
            <Zap className="w-4 h-4 text-purple-400 shrink-0" />
            <span>{currentStep.actionHint}</span>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 border transition-all ${
              currentStepIndex === 0
                ? 'opacity-40 border-transparent text-slate-500 cursor-not-allowed'
                : 'border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.tour.prevBtn}</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-400/20 cursor-pointer transition-all border border-cyan-300"
          >
            <span>
              {currentStepIndex === steps.length - 1 ? t.tour.finishBtn : t.tour.nextBtn}
            </span>
            {currentStepIndex === steps.length - 1 ? (
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            ) : (
              <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
