import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Zap, Sparkles, Sliders, Split, Eye, BookOpen, HelpCircle } from 'lucide-react';
import { useLanguage } from '../../i18n';

interface FlyingPulse {
  progress: number; // 0 to 1
  id: number;
}

export const MachZehnderLab: React.FC = () => {
  const { t } = useLanguage();
  const [phaseShiftDeg, setPhaseShiftDeg] = useState<number>(0); // 0 to 360 degrees
  const [hasBS2, setHasBS2] = useState<boolean>(true);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [countD1, setCountD1] = useState<number>(0);
  const [countD2, setCountD2] = useState<number>(0);
  const [flyingPulses, setFlyingPulses] = useState<FlyingPulse[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const phaseRad = (phaseShiftDeg * Math.PI) / 180;

  // Theoretical detection probabilities
  const probD1 = hasBS2 ? Math.pow(Math.cos(phaseRad / 2), 2) : 0.5;
  const probD2 = hasBS2 ? Math.pow(Math.sin(phaseRad / 2), 2) : 0.5;

  const totalHits = countD1 + countD2;

  // Trigger one detection event
  const registerPhotonDetection = useCallback(() => {
    const rand = Math.random();
    if (rand < probD1) {
      setCountD1((c) => c + 1);
    } else {
      setCountD2((c) => c + 1);
    }
  }, [probD1]);

  const fireSinglePhoton = () => {
    setFlyingPulses((prev) => [...prev, { progress: 0, id: Math.random() }]);
    registerPhotonDetection();
  };

  // Continuous loop
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setFlyingPulses((prev) => [...prev.slice(-12), { progress: 0, id: Math.random() }]);
      registerPhotonDetection();
    }, 180);

    return () => clearInterval(interval);
  }, [isRunning, registerPhotonDetection]);

  // Pulse animation & Optical Bench Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMounted = true;

    const render = () => {
      if (!isMounted) return;

      // Update pulses
      setFlyingPulses((prev) =>
        prev
          .map((p) => ({ ...p, progress: p.progress + 0.03 }))
          .filter((p) => p.progress <= 1)
      );

      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, w, h);

      // Optical coordinates
      const sX = 50, sY = h / 2 + 55;
      const bs1X = 180, bs1Y = sY;
      const m1X = bs1X, m1Y = sY - 110;
      const m2X = bs1X + 180, m2Y = sY;
      const bs2X = m2X, bs2Y = m1Y;
      const d1X = bs2X + 90, d1Y = bs2Y;
      const d2X = bs2X, d2Y = bs2Y - 70;

      // 1. Draw Optical Beam Lines (Dotted when idle)
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);

      // Emitter to BS1
      ctx.beginPath(); ctx.moveTo(sX, sY); ctx.lineTo(bs1X, bs1Y); ctx.stroke();
      // Path A: BS1 -> M1 -> BS2
      ctx.beginPath(); ctx.moveTo(bs1X, bs1Y); ctx.lineTo(m1X, m1Y); ctx.lineTo(bs2X, bs2Y); ctx.stroke();
      // Path B: BS1 -> M2 -> BS2
      ctx.beginPath(); ctx.moveTo(bs1X, bs1Y); ctx.lineTo(m2X, m2Y); ctx.lineTo(bs2X, bs2Y); ctx.stroke();
      // BS2 to Detectors
      ctx.beginPath(); ctx.moveTo(bs2X, bs2Y); ctx.lineTo(d1X, d1Y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bs2X, bs2Y); ctx.lineTo(d2X, d2Y); ctx.stroke();
      ctx.setLineDash([]);

      // 2. Draw Optical Elements
      // Source Emitter S
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 8;
      ctx.fillRect(sX - 18, sY - 10, 22, 20);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#f8fafc';
      ctx.font = '9px monospace';
      ctx.fillText('Laser', sX - 16, sY + 24);

      // Beam Splitter 1 (BS1 50:50)
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(bs1X - 14, bs1Y + 14);
      ctx.lineTo(bs1X + 14, bs1Y - 14);
      ctx.stroke();
      ctx.fillStyle = '#67e8f9';
      ctx.fillText('BS₁', bs1X - 10, bs1Y + 28);

      // Mirror 1 (M1)
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(m1X - 14, m1Y - 14);
      ctx.lineTo(m1X + 14, m1Y + 14);
      ctx.stroke();
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText('Gương M₁', m1X - 22, m1Y - 20);

      // Mirror 2 (M2)
      ctx.beginPath();
      ctx.moveTo(m2X - 14, m2Y - 14);
      ctx.lineTo(m2X + 14, m2Y + 14);
      ctx.stroke();
      ctx.fillText('Gương M₂', m2X - 22, m2Y + 28);

      // Phase Shifter on Path B (between M2 and BS2)
      const psY = (m2Y + bs2Y) / 2;
      ctx.fillStyle = 'rgba(234, 179, 8, 0.25)';
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 1.5;
      ctx.fillRect(m2X - 12, psY - 15, 24, 30);
      ctx.strokeRect(m2X - 12, psY - 15, 24, 30);
      ctx.fillStyle = '#facc15';
      ctx.fillText(`Δφ=${phaseShiftDeg}°`, m2X + 16, psY + 4);

      // Beam Splitter 2 (BS2) or Removed
      if (hasBS2) {
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(bs2X - 14, bs2Y + 14);
        ctx.lineTo(bs2X + 14, bs2Y - 14);
        ctx.stroke();
        ctx.fillStyle = '#67e8f9';
        ctx.fillText('BS₂ (Gắn)', bs2X - 18, bs2Y + 28);
      } else {
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([2, 2]);
        ctx.strokeRect(bs2X - 12, bs2Y - 12, 24, 24);
        ctx.setLineDash([]);
        ctx.fillStyle = '#fb7185';
        ctx.fillText('BS₂ (Đã gỡ)', bs2X - 25, bs2Y + 28);
      }

      // Detector 1 (D1)
      ctx.fillStyle = '#10b981';
      ctx.shadowColor = '#059669';
      ctx.shadowBlur = countD1 > 0 ? 8 : 0;
      ctx.fillRect(d1X, d1Y - 14, 16, 28);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#6ee7b7';
      ctx.fillText('D₁', d1X + 2, d1Y - 20);

      // Detector 2 (D2)
      ctx.fillStyle = '#a855f7';
      ctx.shadowColor = '#7e22ce';
      ctx.shadowBlur = countD2 > 0 ? 8 : 0;
      ctx.fillRect(d2X - 14, d2Y - 16, 28, 16);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#d8b4fe';
      ctx.fillText('D₂', d2X - 20, d2Y - 22);

      // 3. Render Flying Quantum Field Wavepackets
      flyingPulses.forEach((pulse) => {
        const p = pulse.progress;

        // Stage 1: Emitter to BS1 (p: 0 to 0.25)
        if (p <= 0.25) {
          const t1 = p / 0.25;
          const px = sX + (bs1X - sX) * t1;
          const py = sY;
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(px, py, 4.5, 0, Math.PI * 2);
          ctx.fill();
        }
        // Stage 2: Dual Field Paths (p: 0.25 to 0.75)
        else if (p <= 0.75) {
          const t2 = (p - 0.25) / 0.5;

          // Upper Path A: BS1 -> M1 -> BS2
          let pAx = bs1X, pAy = bs1Y;
          if (t2 < 0.5) {
            const subT = t2 / 0.5;
            pAx = bs1X;
            pAy = bs1Y + (m1Y - bs1Y) * subT;
          } else {
            const subT = (t2 - 0.5) / 0.5;
            pAx = m1X + (bs2X - m1X) * subT;
            pAy = m1Y;
          }

          // Lower Path B: BS1 -> M2 -> BS2
          let pBx = bs1X, pBy = bs1Y;
          if (t2 < 0.5) {
            const subT = t2 / 0.5;
            pBx = bs1X + (m2X - bs1X) * subT;
            pBy = bs1Y;
          } else {
            const subT = (t2 - 0.5) / 0.5;
            pBx = m2X;
            pBy = m2Y + (bs2Y - m2Y) * subT;
          }

          // Draw dual simultaneous field excitations (QFT Superposition!)
          ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
          ctx.beginPath();
          ctx.arc(pAx, pAy, 3.8, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = 'rgba(234, 179, 8, 0.8)';
          ctx.beginPath();
          ctx.arc(pBx, pBy, 3.8, 0, Math.PI * 2);
          ctx.fill();
        }
        // Stage 3: Post BS2 Recombination towards Detectors (p: 0.75 to 1.0)
        else {
          const t3 = (p - 0.75) / 0.25;

          if (probD1 >= probD2) {
            const px = bs2X + (d1X - bs2X) * t3;
            const py = bs2Y;
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, Math.PI * 2);
            ctx.fill();
          } else {
            const px = bs2X;
            const py = bs2Y + (d2Y - bs2Y) * t3;
            ctx.fillStyle = '#a855f7';
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });
      ctx.shadowBlur = 0;

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);
    return () => {
      isMounted = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [flyingPulses, hasBS2, phaseShiftDeg, probD1, probD2, countD1, countD2]);

  const handleReset = () => {
    setCountD1(0);
    setCountD2(0);
    setFlyingPulses([]);
    setIsRunning(false);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-8 flex flex-col gap-6 backdrop-blur-md shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 rounded-lg text-xs font-mono font-bold">
            {t.labs.machZehnder.badge}
          </span>
          <h3 className="text-xl lg:text-2xl font-black text-white mt-2">
            {t.labs.machZehnder.title}
          </h3>
          <p className="text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
            {t.labs.machZehnder.description}
          </p>
        </div>

        {/* Counter Displays */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 font-mono">D₁ (cos² Δφ/2)</span>
              <span className="font-mono text-base font-bold text-emerald-300">
                {countD1} ({totalHits > 0 ? ((countD1 / totalHits) * 100).toFixed(0) : 0}%)
              </span>
            </div>
          </div>

          <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-400" />
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 font-mono">D₂ (sin² Δφ/2)</span>
              <span className="font-mono text-base font-bold text-purple-300">
                {countD2} ({totalHits > 0 ? ((countD2 / totalHits) * 100).toFixed(0) : 0}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Optical Bench Canvas */}
      <div className="relative w-full h-[320px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex flex-col items-center justify-center">
        <canvas
          ref={canvasRef}
          width={800}
          height={320}
          className="w-full h-full object-cover"
        />

        {/* Overlay Banner */}
        <div className="absolute top-3 left-4 text-[11px] font-mono text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800 flex items-center gap-2">
          {hasBS2 ? (
            <span className="text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t.labs.machZehnder.hasBS2Title}</span>
            </span>
          ) : (
            <span className="text-rose-300 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-rose-400" />
              <span>{t.labs.machZehnder.noBS2Title}</span>
            </span>
          )}
        </div>
      </div>

      {/* Controls & Wheeler Delayed-Choice Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Buttons & BS2 Toggle */}
        <div className="md:col-span-7 flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isRunning ? t.labs.machZehnder.pauseFire : t.labs.machZehnder.continuousFire}</span>
          </button>

          <button
            onClick={fireSinglePhoton}
            disabled={isRunning}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>{t.labs.machZehnder.fireSinglePhoton}</span>
          </button>

          {/* Toggle BS2 (Wheeler Delayed Choice trigger) */}
          <button
            onClick={() => {
              setHasBS2(!hasBS2);
              handleReset();
            }}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              hasBS2
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-md shadow-rose-500/20'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            <span>{hasBS2 ? 'Gỡ BS₂ (Wheeler Test)' : 'Lắp lại BS₂'}</span>
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title={t.labs.machZehnder.clearCounts}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Phase Slider & Presets */}
        <div className="md:col-span-5 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-yellow-400" />
              <span>{t.labs.machZehnder.phaseShiftLabel}</span>
            </span>
            <span className="font-mono text-yellow-300 font-bold text-sm">{phaseShiftDeg}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            step="5"
            value={phaseShiftDeg}
            onChange={(e) => {
              setPhaseShiftDeg(parseInt(e.target.value));
              handleReset();
            }}
            className="accent-yellow-400 h-1.5 bg-slate-900 rounded-lg cursor-pointer w-full"
          />
          {/* Quick Phase Presets */}
          <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-800/80">
            <button
              onClick={() => {
                setPhaseShiftDeg(0);
                handleReset();
              }}
              className={`px-2 py-0.5 rounded-md text-[10px] font-mono transition-colors cursor-pointer ${
                phaseShiftDeg === 0
                  ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              0° (D₁=100%)
            </button>
            <button
              onClick={() => {
                setPhaseShiftDeg(90);
                handleReset();
              }}
              className={`px-2 py-0.5 rounded-md text-[10px] font-mono transition-colors cursor-pointer ${
                phaseShiftDeg === 90
                  ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              90° (50/50)
            </button>
            <button
              onClick={() => {
                setPhaseShiftDeg(180);
                handleReset();
              }}
              className={`px-2 py-0.5 rounded-md text-[10px] font-mono transition-colors cursor-pointer ${
                phaseShiftDeg === 180
                  ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              180° (D₂=100%)
            </button>
          </div>
        </div>
      </div>

      {/* Explainer Cards: Delayed Choice & QFT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="bg-slate-950/80 p-4.5 rounded-2xl border border-slate-800 flex flex-col gap-2">
          <span className="font-bold text-amber-300 flex items-center gap-1.5 text-sm">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{t.labs.machZehnder.delayedChoiceTitle}</span>
          </span>
          <p className="text-slate-300 text-sm leading-relaxed">
            {t.labs.machZehnder.delayedChoiceDesc}
          </p>
        </div>

        <div className="bg-slate-950/80 p-4.5 rounded-2xl border border-slate-800 flex flex-col gap-2">
          <span className="font-bold text-cyan-300 flex items-center gap-1.5 text-sm">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>{t.labs.machZehnder.qftInsightTitle}</span>
          </span>
          <p className="text-slate-300 text-sm leading-relaxed">
            {t.labs.machZehnder.qftInsightBody}
          </p>
        </div>
      </div>

      {/* Additional Educational Insights: Phase Interference & Wavepacket Nature */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="bg-slate-950/80 p-4.5 rounded-2xl border border-slate-800 flex flex-col gap-2">
          <span className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>{t.labs.machZehnder.howItWorksTitle}</span>
          </span>
          <p className="text-slate-300 text-xs leading-relaxed">
            {t.labs.machZehnder.howItWorksDesc}
          </p>
        </div>

        <div className="bg-slate-950/80 p-4.5 rounded-2xl border border-slate-800 flex flex-col gap-2">
          <span className="font-bold text-purple-300 flex items-center gap-1.5 text-xs">
            <HelpCircle className="w-4 h-4 text-purple-400" />
            <span>{t.labs.machZehnder.whyWavepacketTitle}</span>
          </span>
          <p className="text-slate-300 text-xs leading-relaxed">
            {t.labs.machZehnder.whyWavepacketDesc}
          </p>
        </div>
      </div>
    </div>
  );
};

