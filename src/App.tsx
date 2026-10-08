import { useState, useCallback, useEffect } from 'react';
import type { FieldSettings } from './types/physics';
import { QuantumFieldCanvas } from './components/canvas/QuantumFieldCanvas';
import { FieldControls } from './components/controls/FieldControls';
import { TimelineSection } from './components/timeline/TimelineSection';
import { DoubleSlitLab } from './components/experiments/DoubleSlitLab';
import { PhotoelectricLab } from './components/experiments/PhotoelectricLab';
import { FockStateLab } from './components/experiments/FockStateLab';
import { CasimirLab } from './components/experiments/CasimirLab';
import { MachZehnderLab } from './components/experiments/MachZehnderLab';
import { QFTDeepDive } from './components/explainer/QFTDeepDive';
import { MisconceptionsSection } from './components/explainer/MisconceptionsSection';
import { StoryModeTour } from './components/tour/StoryModeTour';
import { LanguageProvider, useLanguage } from './i18n';
import { LanguageSwitcher } from './components/common/LanguageSwitcher';
import {
  Sparkles,
  Waves,
  Calendar,
  FlaskConical,
  BookOpen,
  Atom,
  HelpCircle,
  Compass,
} from 'lucide-react';

function MainApp() {
  const { t } = useLanguage();
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

  type LabTabId = 'lab-double-slit' | 'lab-photoelectric' | 'lab-fock-state' | 'lab-casimir' | 'lab-mach-zehnder';
  const [activeLabTab, setActiveLabTab] = useState<LabTabId>('lab-double-slit');
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [photonInjectTrigger, setPhotonInjectTrigger] = useState<number>(0);

  const scrollToLab = useCallback((labId: LabTabId) => {
    setActiveLabTab(labId);
    const element = document.getElementById(labId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Update active lab indicator on scroll
  useEffect(() => {
    const labIds: LabTabId[] = [
      'lab-double-slit',
      'lab-photoelectric',
      'lab-fock-state',
      'lab-casimir',
      'lab-mach-zehnder',
    ];

    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveLabTab(entry.target.id as LabTabId);
          }
        });
      },
      {
        rootMargin: '-15% 0px -65% 0px',
        threshold: 0,
      }
    );

    labIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleSettingsChange = (newSettings: Partial<FieldSettings>) => {
    setFieldSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleTourStep = useCallback((stepIndex: number) => {
    if (stepIndex === 0) {
      // Step 1: Classical Newton Particles
      setFieldSettings((prev) => ({
        ...prev,
        mode: 'classical-particle',
        vacuumFluctuations: false,
      }));
    } else if (stepIndex === 1) {
      // Step 2: Active Quantum Vacuum
      setFieldSettings((prev) => ({
        ...prev,
        mode: 'qft-field',
        vacuumFluctuations: true,
        waveFrequency: 1.2,
        amplitude: 1.0,
      }));
    } else if (stepIndex === 2) {
      // Step 3: Inject Photon Excitation Packet
      setFieldSettings((prev) => ({
        ...prev,
        mode: 'qft-field',
        vacuumFluctuations: true,
      }));
      setPhotonInjectTrigger(Date.now());
    } else if (stepIndex === 3) {
      // Step 4: Detection & Localized Interaction
      setFieldSettings((prev) => ({
        ...prev,
        mode: 'qft-field',
        vacuumFluctuations: true,
      }));
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
              <Atom className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h1 className="font-black text-base lg:text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
                {t.nav.title}
              </h1>
              <p className="text-[10px] text-slate-400 font-mono -mt-0.5">
                {t.nav.tagline}
              </p>
            </div>
          </div>

          {/* Quick Nav Links & Language Switcher */}
          <div className="flex items-center gap-2.5">
            <nav className="hidden md:flex items-center gap-1 text-xs text-slate-400 font-medium bg-slate-900/60 p-1 rounded-xl border border-slate-800">
              <a
                href="#visualizer-section"
                className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <Waves className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t.nav.sim3D}</span>
              </a>
              <a
                href="#myths-section"
                className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>{t.nav.myths}</span>
              </a>
              <a
                href="#timeline-section"
                className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                <span>{t.nav.timeline}</span>
              </a>
              <a
                href="#labs-section"
                className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.nav.labs}</span>
              </a>
              <a
                href="#qft-deep-dive"
                className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.nav.qftDeepDive}</span>
              </a>
            </nav>

            <button
              type="button"
              onClick={() => setIsTourOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-400 text-slate-950 hover:bg-cyan-300 text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              <Compass className="w-3.5 h-3.5 text-slate-950" />
              <span>Tour 3'</span>
            </button>

            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 lg:px-8 py-8 w-full flex flex-col gap-14">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center gap-5 py-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.hero.badge}</span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            {t.hero.mainTitleLine1}<br />
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 bg-clip-text text-transparent">
              {t.hero.mainTitleLine2}
            </span>
          </h2>

          <p className="text-slate-400 text-sm lg:text-base leading-relaxed">
            {t.hero.description}
          </p>

          {/* Interactive CTAs for Beginners - Larger, Clean Non-Gradient Tour Button */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
            <button
              type="button"
              onClick={() => setIsTourOpen(true)}
              className="px-7 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-extrabold text-sm sm:text-base bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-xl shadow-cyan-400/20 flex items-center gap-2.5 cursor-pointer transition-all active:scale-95 border border-cyan-300"
            >
              <Compass className="w-5 h-5 text-slate-950" />
              <span>{t.hero.startTourBtn}</span>
            </button>
            <a
              href="#myths-section"
              className="px-6 sm:px-7 py-3.5 sm:py-4 rounded-2xl font-bold text-sm sm:text-base bg-slate-900/90 hover:bg-slate-800 text-slate-100 border-2 border-slate-700/80 hover:border-rose-400/60 shadow-xl flex items-center gap-2.5 cursor-pointer transition-all active:scale-95"
            >
              <HelpCircle className="w-5 h-5 text-rose-400" />
              <span>{t.hero.readMythsBtn}</span>
            </a>
          </div>
        </div>

        {/* 1. Main 3D Simulation Viewport */}
        <section id="visualizer-section" className="flex flex-col gap-5 scroll-mt-24">
          <QuantumFieldCanvas
            settings={fieldSettings}
            onSettingsChange={handleSettingsChange}
            triggerInjectPhoton={photonInjectTrigger}
          />
          <FieldControls
            settings={fieldSettings}
            onChange={handleSettingsChange}
          />
        </section>

        {/* 2. Myth Busters: Debunking Classical Misconceptions */}
        <MisconceptionsSection />

        {/* 2. Historical Timeline & Paradigm Shifts (Vertical Storyline) */}
        <section id="timeline-section" className="scroll-mt-24">
          <TimelineSection />
        </section>

        {/* 3. Virtual Interactive Laboratories */}
        <section id="labs-section" className="flex flex-col gap-8 scroll-mt-24">
          <div className="sticky top-16 z-30 bg-slate-950/95 backdrop-blur-md py-3.5 -my-2 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-widest">
                <FlaskConical className="w-4 h-4" />
                <span>{t.labs.headerBadge}</span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mt-0.5">
                {t.labs.sectionTitle}
              </h2>
            </div>

            {/* Quick Jump Anchor Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 text-xs shadow-lg">
              <button
                onClick={() => scrollToLab('lab-double-slit')}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                  activeLabTab === 'lab-double-slit'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                1. {t.labs.tabDoubleSlit}
              </button>
              <button
                onClick={() => scrollToLab('lab-photoelectric')}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                  activeLabTab === 'lab-photoelectric'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                2. {t.labs.tabPhotoelectric}
              </button>
              <button
                onClick={() => scrollToLab('lab-fock-state')}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                  activeLabTab === 'lab-fock-state'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                3. {t.labs.tabFockState}
              </button>
              <button
                onClick={() => scrollToLab('lab-casimir')}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                  activeLabTab === 'lab-casimir'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                4. {t.labs.tabCasimir}
              </button>
              <button
                onClick={() => scrollToLab('lab-mach-zehnder')}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                  activeLabTab === 'lab-mach-zehnder'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                5. {t.labs.tabMachZehnder}
              </button>
            </div>
          </div>

          {/* Render All 5 Labs in Sequence (Vertical Scroll Flow) */}
          <div className="flex flex-col gap-10">
            <DoubleSlitLab />
            <PhotoelectricLab />
            <FockStateLab />
            <CasimirLab />
            <MachZehnderLab />
          </div>
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
            <span className="text-slate-400 font-semibold">{t.footer.title}</span>
            <span>— {t.footer.sub}</span>
          </div>

          <div className="italic text-slate-400">
            {t.footer.hobsonQuote}
          </div>
        </div>
      </footer>

      {/* Story Mode Walkthrough Modal for Beginners */}
      {isTourOpen && (
        <StoryModeTour
          onClose={() => setIsTourOpen(false)}
          onApplyStep={handleTourStep}
        />
      )}
    </div>
  );
}

export function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}

export default App;
