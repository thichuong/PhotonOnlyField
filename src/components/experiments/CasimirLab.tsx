import React, { useState, useEffect, useRef } from 'react';
import { Gauge, Sparkles, AlertCircle, ArrowLeftRight, Layers, BookOpen, HelpCircle } from 'lucide-react';
import { useLanguage } from '../../i18n';
import { useInView } from '../../hooks/useInView';

export const CasimirLab: React.FC = () => {
  const { t } = useLanguage();
  const { ref: containerRef, isSimulating } = useInView<HTMLDivElement>();

  const [distanceNm, setDistanceNm] = useState<number>(60); // 20nm to 180nm
  const [modelMode, setModelMode] = useState<'qft' | 'classical'>('qft');
  const animationFrameRef = useRef<number | null>(null);
  const wavePhaseRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Casimir Force calculation: F/A = - (pi^2 * hbar * c) / (240 * d^4)
  const calculateForceNanoNewtons = (d: number): number => {
    if (modelMode === 'classical') return 0;
    const baseD = 60;
    const baseForce = 45; // nN at 60nm
    const force = baseForce * Math.pow(baseD / d, 4);
    return Math.min(force, 9999);
  };

  const currentForceNn = calculateForceNanoNewtons(distanceNm);

  // Number of standing wave modes allowed in cavity d
  const allowedModesInside = modelMode === 'classical' ? 0 : Math.max(1, Math.floor(distanceNm / 25));
  const freeModesOutside = modelMode === 'classical' ? 0 : 24;

  // Animation loop for field fluctuations inside & outside - paused when out of view
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isSimulating) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMounted = true;

    const render = () => {
      if (!isMounted || !isSimulating) return;
      wavePhaseRef.current += 0.08;
      const phase = wavePhaseRef.current;

      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, w, h);

      // Plate geometry
      const centerX = w / 2;
      const gapPx = 30 + ((distanceNm - 20) / 160) * 190;
      const plateWidth = 14;
      const plate1X = centerX - gapPx / 2 - plateWidth;
      const plate2X = centerX + gapPx / 2;

      // 1. Outside fluctuations (Left side)
      if (modelMode === 'qft') {
        const numOuterWaves = 8;
        for (let i = 0; i < numOuterWaves; i++) {
          const y = (h / (numOuterWaves + 1)) * (i + 1);
          const freq = 0.05 + (i % 4) * 0.03;
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          for (let x = 10; x <= plate1X; x += 3) {
            const waveY = y + Math.sin(x * freq + phase * (1 + (i % 3) * 0.5)) * 9;
            if (x === 10) ctx.moveTo(x, waveY);
            else ctx.lineTo(x, waveY);
          }
          ctx.stroke();
        }

        // Outside fluctuations (Right side)
        for (let i = 0; i < numOuterWaves; i++) {
          const y = (h / (numOuterWaves + 1)) * (i + 1);
          const freq = 0.05 + ((i + 2) % 4) * 0.03;
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          for (let x = plate2X + plateWidth; x <= w - 10; x += 3) {
            const waveY = y + Math.sin(x * freq - phase * (1 + (i % 3) * 0.5)) * 9;
            if (x === plate2X + plateWidth) ctx.moveTo(x, waveY);
            else ctx.lineTo(x, waveY);
          }
          ctx.stroke();
        }

        // Outside Radiation Pressure inward force arrows
        const arrowLength = Math.min(28, 12 + (currentForceNn / 60));
        ctx.fillStyle = '#38bdf8';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;

        // Arrows pushing Plate 1 to right
        [h * 0.25, h * 0.5, h * 0.75].forEach((ay) => {
          const startX = plate1X - arrowLength - 8;
          const endX = plate1X - 4;
          ctx.beginPath();
          ctx.moveTo(startX, ay);
          ctx.lineTo(endX, ay);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(endX, ay);
          ctx.lineTo(endX - 5, ay - 4);
          ctx.lineTo(endX - 5, ay + 4);
          ctx.closePath();
          ctx.fill();
        });

        // Arrows pushing Plate 2 to left
        [h * 0.25, h * 0.5, h * 0.75].forEach((ay) => {
          const startX = plate2X + plateWidth + arrowLength + 8;
          const endX = plate2X + plateWidth + 4;
          ctx.beginPath();
          ctx.moveTo(startX, ay);
          ctx.lineTo(endX, ay);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(endX, ay);
          ctx.lineTo(endX + 5, ay - 4);
          ctx.lineTo(endX + 5, ay + 4);
          ctx.closePath();
          ctx.fill();
        });
      }

      // 2. Standing waves inside cavity (between plates)
      if (modelMode === 'qft') {
        const innerH = h * 0.8;
        const startY = h * 0.1;
        for (let m = 1; m <= allowedModesInside; m++) {
          const y = startY + (innerH / (allowedModesInside + 1)) * m;
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.7)';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          for (let x = plate1X + plateWidth; x <= plate2X; x += 2) {
            const relX = (x - (plate1X + plateWidth)) / gapPx;
            const standingAmp = Math.sin(relX * Math.PI * m) * Math.cos(phase * m * 1.5) * 11;
            if (x === plate1X + plateWidth) ctx.moveTo(x, y + standingAmp);
            else ctx.lineTo(x, y + standingAmp);
          }
          ctx.stroke();
        }
      }

      // 3. Draw Conductive Metal Plates
      // Plate 1
      ctx.fillStyle = '#64748b';
      ctx.fillRect(plate1X, 20, plateWidth, h - 40);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(plate1X, 20, plateWidth, h - 40);

      // Plate 2
      ctx.fillStyle = '#64748b';
      ctx.fillRect(plate2X, 20, plateWidth, h - 40);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(plate2X, 20, plateWidth, h - 40);

      // Plate labels
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Plate 1', plate1X + plateWidth / 2, 14);
      ctx.fillText('Plate 2', plate2X + plateWidth / 2, 14);

      // Gap distance indicator line
      ctx.strokeStyle = '#38bdf888';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(plate1X + plateWidth, h - 12);
      ctx.lineTo(plate2X, h - 12);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`d = ${distanceNm} nm`, centerX, h - 5);

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      isMounted = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [distanceNm, modelMode, currentForceNn, allowedModesInside, freeModesOutside, isSimulating]);

  return (
    <div
      id="lab-casimir"
      ref={containerRef}
      className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-8 flex flex-col gap-6 backdrop-blur-md shadow-2xl scroll-mt-28"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '750px' }}
    >
      {/* 1. Lab Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-mono font-bold">
            {t.labs.casimir.badge}
          </span>
          <h3 className="text-xl lg:text-2xl font-black text-white mt-2">
            {t.labs.casimir.title}
          </h3>
          <p className="text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
            {t.labs.casimir.description}
          </p>
        </div>

        {/* Live Casimir Force Meter */}
        <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 flex items-center gap-3">
          <Gauge className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-mono">{t.labs.casimir.forceMeasureLabel}</span>
            <span className="font-mono text-xl font-black text-amber-300">
              {modelMode === 'classical' ? '0.00 nN' : `${currentForceNn.toFixed(1)} nN`}
            </span>
          </div>
        </div>
      </div>

      {/* 2. CHÚ THÍCH & ĐỊNH HƯỚNG QUAN SÁT (ĐỌC TRƯỚC KHI THỰC NGHIỆM) */}
      <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800/90 flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            Bản Chất Lực Casimir & Hướng Dẫn Định Hướng
          </h4>
        </div>

        {/* Explanatory Cards: Standing Wave Cavity, 1/d^4 Scaling, Why Attractive Force */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Guitar String Analogy */}
          <div className="bg-slate-900/70 p-4 rounded-xl border border-amber-500/20 flex flex-col gap-2">
            <span className="font-bold text-amber-300 flex items-center gap-2 text-xs">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>{t.labs.casimir.standingWaveAnalogyTitle}</span>
            </span>
            <p className="text-slate-300 text-xs leading-relaxed">
              {t.labs.casimir.standingWaveAnalogyDesc}
            </p>
          </div>

          {/* 1/d^4 Scaling */}
          <div className="bg-slate-900/70 p-4 rounded-xl border border-cyan-500/20 flex flex-col gap-2">
            <span className="font-bold text-cyan-300 flex items-center gap-2 text-xs">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>{t.labs.casimir.forceScalingTitle}</span>
            </span>
            <p className="text-slate-300 text-xs leading-relaxed">
              {t.labs.casimir.forceScalingDesc}
            </p>
          </div>

          {/* Why Attract */}
          <div className="bg-slate-900/70 p-4 rounded-xl border border-emerald-500/20 flex flex-col gap-2">
            <span className="font-bold text-emerald-300 flex items-center gap-2 text-xs">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span>{t.labs.casimir.whyAttractTitle}</span>
            </span>
            <p className="text-slate-300 text-xs leading-relaxed">
              {t.labs.casimir.whyAttractDesc}
            </p>
          </div>
        </div>

        {/* Formula & Physical Insight */}
        <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-800 flex flex-col gap-1.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <span className="text-amber-400 font-bold uppercase tracking-wider">{t.labs.casimir.forceFormulaTitle}</span>
              <span className="font-mono text-cyan-300 font-bold">F/A = −(π²ℏc)/(240d⁴)</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed mt-1">
              {modelMode === 'qft' ? t.labs.casimir.qftVacuumDesc : t.labs.casimir.classicalVacuumDesc}
            </p>
          </div>

          <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-800 flex flex-col gap-1.5">
            <div className="font-semibold text-cyan-300 flex items-center gap-1.5 text-xs pb-1 border-b border-slate-800">
              <AlertCircle className="w-4 h-4 text-cyan-400" />
              <span>{t.labs.casimir.qftInsightTitle}</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-300 mt-1">
              {t.labs.casimir.qftInsightBody}
            </p>
          </div>
        </div>
      </div>

      {/* 3. KHU VỰC MÔ PHỎNG TƯƠNG TÁC */}
      <div className="relative w-full h-[320px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex flex-col items-center justify-center">
        <canvas
          ref={canvasRef}
          width={800}
          height={320}
          className="w-full h-full object-cover"
        />

        {/* Labels Overlay */}
        <div className="absolute top-3 left-4 text-[10px] font-mono text-cyan-300 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800 flex items-center gap-1.5">
          <Layers className="w-3 h-3 text-cyan-400" />
          <span>{t.labs.casimir.modeCountOutside} {freeModesOutside} (Tất cả λ)</span>
        </div>

        <div className="absolute top-3 right-4 text-[10px] font-mono text-amber-300 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>{t.labs.casimir.modeCountInside} {allowedModesInside} (λ_n = 2d/n)</span>
        </div>
      </div>

      {/* 4. Controls: Distance Slider & Mode Toggle */}
      <div className="bg-slate-950/70 p-4.5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Distance Slider */}
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t.labs.casimir.plateDistanceLabel}:</span>
            </span>
            <span className="font-mono text-cyan-300 font-bold text-sm">{distanceNm} nm</span>
          </div>
          <input
            type="range"
            min="20"
            max="180"
            step="2"
            value={distanceNm}
            onChange={(e) => setDistanceNm(parseInt(e.target.value))}
            className="accent-cyan-400 h-2 bg-slate-900 rounded-lg cursor-pointer w-full"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>20 nm (Lực cực mạnh ∝ 1/d⁴)</span>
            <span>180 nm (Lực yếu dần về 0)</span>
          </div>
        </div>

        {/* Model Toggle: Classical vs QFT */}
        <div className="flex items-center gap-3 pt-2 md:pt-0 border-t md:border-t-0 md:border-l border-slate-800 md:pl-5">
          <span className="text-xs text-slate-400 shrink-0">{t.labs.casimir.classicalVacuumToggle}:</span>
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setModelMode('qft')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
                modelMode === 'qft'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Chân Không QFT (ZPE)
            </button>
            <button
              onClick={() => setModelMode('classical')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
                modelMode === 'classical'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Chân Không Cổ Điển (Rỗng)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
