import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  Sparkles,
  Sliders,
  Split,
  Eye,
  BookOpen,
  HelpCircle,
  GitBranch,
  Ruler,
} from 'lucide-react';
import { useLanguage } from '../../i18n';
import { useInView } from '../../hooks/useInView';

interface FlyingPulse {
  id: number;
  progress: number; // 0 to 1
  speed: number;
  targetDetector: 'D1' | 'D2';
  whichPathNoBS2: 'd1' | 'd2';
}

interface HitEffect {
  x: number;
  y: number;
  color: string;
  radius: number;
  maxRadius: number;
  opacity: number;
  label: string;
}

export const MachZehnderLab: React.FC = () => {
  const { t } = useLanguage();
  const { ref: containerRef, isSimulating } = useInView<HTMLDivElement>();
  const [phaseShiftDeg, setPhaseShiftDeg] = useState<number>(0); // 0 to 360 degrees
  const [hasBS2, setHasBS2] = useState<boolean>(true);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [countD1, setCountD1] = useState<number>(0);
  const [countD2, setCountD2] = useState<number>(0);
  const [lastHit, setLastHit] = useState<'D1' | 'D2' | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const pulsesRef = useRef<FlyingPulse[]>([]);
  const hitsRef = useRef<HitEffect[]>([]);
  const lastHitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Store live values in refs for animation loop
  const hasBS2Ref = useRef<boolean>(hasBS2);
  hasBS2Ref.current = hasBS2;

  const phaseShiftDegRef = useRef<number>(phaseShiftDeg);
  phaseShiftDegRef.current = phaseShiftDeg;

  const phaseRad = (phaseShiftDeg * Math.PI) / 180;

  // Theoretical detection probabilities
  const probD1 = hasBS2 ? Math.pow(Math.cos(phaseRad / 2), 2) : 0.5;
  const probD2 = hasBS2 ? Math.pow(Math.sin(phaseRad / 2), 2) : 0.5;

  const probD1Ref = useRef<number>(probD1);
  probD1Ref.current = probD1;

  const totalHits = countD1 + countD2;
  const deltaPathWavelength = (phaseShiftDeg / 360).toFixed(2);

  // Create a new photon pulse with accurate quantum outcome assignment
  const spawnPhoton = useCallback(() => {
    const isCurrentBS2 = hasBS2Ref.current;
    const currentProbD1 = probD1Ref.current;

    let target: 'D1' | 'D2';
    const chosenPath: 'd1' | 'd2' = Math.random() < 0.5 ? 'd1' : 'd2';

    if (isCurrentBS2) {
      // Interference determines target detector: cos²(Δφ/2) vs sin²(Δφ/2)
      target = Math.random() < currentProbD1 ? 'D1' : 'D2';
    } else {
      // Which-path measurement: Arm d1 goes straight to D1, Arm d2 goes straight to D2
      target = chosenPath === 'd1' ? 'D1' : 'D2';
    }

    pulsesRef.current.push({
      id: Math.random(),
      progress: 0,
      speed: 0.016,
      targetDetector: target,
      whichPathNoBS2: chosenPath,
    });
  }, []);

  const fireSinglePhoton = () => {
    spawnPhoton();
  };

  // Continuous emission loop - paused when out of view
  useEffect(() => {
    if (!isRunning || !isSimulating) return;
    const interval = setInterval(() => {
      if (pulsesRef.current.length < 15) {
        spawnPhoton();
      }
    }, 240);

    return () => clearInterval(interval);
  }, [isRunning, isSimulating, spawnPhoton]);

  // Optical bench animation & canvas rendering - paused when out of view
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isSimulating) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMounted = true;

    const render = () => {
      if (!isMounted || !isSimulating) return;

      const w = canvas.width;
      const h = canvas.height;

      // Optical coordinates for compact 580 x 300 canvas
      const sX = 45, sY = 220;
      const bs1X = 155, bs1Y = 220;
      const m1X = 155, m1Y = 88;
      const m2X = 355, m2Y = 220;
      const bs2X = 355, bs2Y = 88;
      const d1X = 495, d1Y = 88;
      const d2X = 355, d2Y = 26;
      const psX = 355, psY = 154; // Phase shifter center

      // 1. Advance pulses & handle hits
      const currentBS2 = hasBS2Ref.current;
      const activePulses: FlyingPulse[] = [];

      for (let i = 0; i < pulsesRef.current.length; i++) {
        const pulse = pulsesRef.current[i];
        const prevProg = pulse.progress;
        pulse.progress += pulse.speed;

        // Wheeler Delayed-Choice check at BS2 intersection (progress ~ 0.75)
        if (prevProg < 0.75 && pulse.progress >= 0.75) {
          if (currentBS2) {
            pulse.targetDetector = Math.random() < probD1Ref.current ? 'D1' : 'D2';
          } else {
            pulse.targetDetector = pulse.whichPathNoBS2 === 'd1' ? 'D1' : 'D2';
          }
        }

        // Arrival at detector (progress >= 1.0)
        if (pulse.progress >= 1.0) {
          if (pulse.targetDetector === 'D1') {
            setCountD1((c) => c + 1);
            hitsRef.current.push({
              x: d1X,
              y: d1Y,
              color: '#10b981',
              radius: 5,
              maxRadius: 32,
              opacity: 1,
              label: '+1 D₁',
            });
            setLastHit('D1');
          } else {
            setCountD2((c) => c + 1);
            hitsRef.current.push({
              x: d2X,
              y: d2Y,
              color: '#a855f7',
              radius: 5,
              maxRadius: 32,
              opacity: 1,
              label: '+1 D₂',
            });
            setLastHit('D2');
          }

          if (lastHitTimeoutRef.current) clearTimeout(lastHitTimeoutRef.current);
          lastHitTimeoutRef.current = setTimeout(() => {
            setLastHit(null);
          }, 320);
        } else {
          activePulses.push(pulse);
        }
      }
      pulsesRef.current = activePulses;

      // Update hit effects
      hitsRef.current = hitsRef.current
        .map((hit) => ({
          ...hit,
          radius: hit.radius + 1.2,
          opacity: hit.opacity - 0.04,
        }))
        .filter((hit) => hit.opacity > 0);

      // 2. Clear canvas with dark space gradient
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, w, h);

      // Subtle background grid dots
      ctx.fillStyle = 'rgba(51, 65, 85, 0.22)';
      for (let gx = 15; gx < w; gx += 25) {
        for (let gy = 15; gy < h; gy += 25) {
          ctx.fillRect(gx, gy, 1, 1);
        }
      }

      // 3. Draw Optical Beam Guides
      // Segment: Emitter -> BS1
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(sX, sY);
      ctx.lineTo(bs1X, bs1Y);
      ctx.stroke();

      // Arm d1 (Path A - Upper: BS1 -> M1 -> BS2)
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(bs1X, bs1Y);
      ctx.lineTo(m1X, m1Y);
      ctx.lineTo(bs2X, bs2Y);
      ctx.stroke();

      // Arm d2 (Path B - Lower: BS1 -> M2 -> BS2)
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(bs1X, bs1Y);
      ctx.lineTo(m2X, m2Y);
      ctx.lineTo(bs2X, bs2Y);
      ctx.stroke();

      // Output beams from BS2:
      // Path towards D1 (horizontal)
      ctx.strokeStyle = currentBS2 ? '#10b981' : '#06b6d4';
      ctx.lineWidth = 1.8;
      ctx.setLineDash(currentBS2 ? [] : [3, 3]);
      ctx.beginPath();
      ctx.moveTo(bs2X, bs2Y);
      ctx.lineTo(d1X - 16, d1Y);
      ctx.stroke();

      // Path towards D2 (vertical)
      ctx.strokeStyle = currentBS2 ? '#a855f7' : '#eab308';
      ctx.beginPath();
      ctx.moveTo(bs2X, bs2Y);
      ctx.lineTo(d2X, d2Y + 16);
      ctx.stroke();
      ctx.setLineDash([]);

      // 4. Optical Arm Labels (Clear d1 & d2 distinction)
      // Label Arm d1 (Upper)
      ctx.font = '9.5px ui-monospace, monospace';
      ctx.fillStyle = '#67e8f9';
      ctx.fillText('Nhánh d₁ (Đường A: L₁)', bs1X + 10, m1Y - 12);

      // Dimension guide line for d1
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(bs1X + 8, m1Y - 4);
      ctx.lineTo(bs2X - 8, m1Y - 4);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label Arm d2 (Lower)
      ctx.fillStyle = '#fde047';
      ctx.fillText('Nhánh d₂ (Đường B: L₂ = L₁ + Δd)', bs1X + 10, m2Y + 22);

      // Dimension guide line for d2
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(bs1X + 8, m2Y + 10);
      ctx.lineTo(m2X - 8, m2Y + 10);
      ctx.stroke();
      ctx.setLineDash([]);

      // 5. Draw Optical Elements
      // Laser Emitter S
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.fillRect(sX - 28, sY - 12, 28, 24);
      ctx.strokeRect(sX - 28, sY - 12, 28, 24);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(sX, sY, 2.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.font = '8.5px monospace';
      ctx.fillText('Laser S', sX - 26, sY - 16);

      // Beam Splitter 1 (BS1 50:50)
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(bs1X - 13, bs1Y + 13);
      ctx.lineTo(bs1X + 13, bs1Y - 13);
      ctx.stroke();
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '9px monospace';
      ctx.fillText('BS₁', bs1X - 8, bs1Y + 25);

      // Mirror 1 (M1)
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(m1X - 13, m1Y - 13);
      ctx.lineTo(m1X + 13, m1Y + 13);
      ctx.stroke();
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText('Gương M₁', m1X - 20, m1Y - 18);

      // Mirror 2 (M2)
      ctx.beginPath();
      ctx.moveTo(m2X - 13, m2Y - 13);
      ctx.lineTo(m2X + 13, m2Y + 13);
      ctx.stroke();
      ctx.fillText('Gương M₂', m2X - 20, m2Y + 25);

      // Phase Shifter on Arm d2
      ctx.fillStyle = 'rgba(234, 179, 8, 0.2)';
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 1.5;
      ctx.fillRect(psX - 14, psY - 16, 28, 32);
      ctx.strokeRect(psX - 14, psY - 16, 28, 32);
      ctx.fillStyle = '#fef08a';
      ctx.font = '9px ui-monospace, monospace';
      ctx.fillText(`Δφ=${phaseShiftDegRef.current}°`, psX + 18, psY - 3);
      ctx.fillStyle = '#facc15';
      ctx.font = '8.5px monospace';
      ctx.fillText(`Δd=${deltaPathWavelength}λ`, psX + 18, psY + 10);

      // Beam Splitter 2 (BS2)
      if (currentBS2) {
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(bs2X - 13, bs2Y + 13);
        ctx.lineTo(bs2X + 13, bs2Y - 13);
        ctx.stroke();
        ctx.fillStyle = '#67e8f9';
        ctx.font = '9px monospace';
        ctx.fillText('BS₂ (Gắn)', bs2X - 16, bs2Y + 24);
      } else {
        // BS2 Removed slot
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([2.5, 2.5]);
        ctx.strokeRect(bs2X - 12, bs2Y - 12, 24, 24);
        ctx.setLineDash([]);
        ctx.fillStyle = '#fb7185';
        ctx.font = '8.5px monospace';
        ctx.fillText('BS₂ (Tháo)', bs2X - 20, bs2Y + 24);
      }

      // 6. Draw Distinct Detectors D1 and D2
      // Detector 1 (D1) - Horizontal Output
      const isD1Active = lastHit === 'D1';
      ctx.fillStyle = isD1Active ? '#064e3b' : '#022c22';
      ctx.strokeStyle = isD1Active ? '#34d399' : '#10b981';
      ctx.lineWidth = isD1Active ? 2.2 : 1.5;
      // Sensor body
      ctx.fillRect(d1X - 14, d1Y - 20, 32, 40);
      ctx.strokeRect(d1X - 14, d1Y - 20, 32, 40);
      // Aperture lens
      ctx.fillStyle = isD1Active ? '#6ee7b7' : '#059669';
      ctx.fillRect(d1X - 16, d1Y - 11, 3, 22);
      // Labels
      ctx.fillStyle = '#6ee7b7';
      ctx.font = 'bold 11px ui-monospace, monospace';
      ctx.fillText('D₁', d1X - 2, d1Y - 5);
      ctx.font = '8.5px monospace';
      ctx.fillStyle = '#a7f3d0';
      ctx.fillText(currentBS2 ? 'cos²' : '50%', d1X - 9, d1Y + 9);
      ctx.fillText('Max', d1X - 6, d1Y + 28);

      // Detector 2 (D2) - Vertical Output
      const isD2Active = lastHit === 'D2';
      ctx.fillStyle = isD2Active ? '#4c1d95' : '#2e1065';
      ctx.strokeStyle = isD2Active ? '#c084fc' : '#a855f7';
      ctx.lineWidth = isD2Active ? 2.2 : 1.5;
      // Sensor body
      ctx.fillRect(d2X - 20, d2Y - 14, 40, 30);
      ctx.strokeRect(d2X - 20, d2Y - 14, 40, 30);
      // Aperture lens
      ctx.fillStyle = isD2Active ? '#d8b4fe' : '#7e22ce';
      ctx.fillRect(d2X - 11, d2Y + 16, 22, 3);
      // Labels
      ctx.fillStyle = '#d8b4fe';
      ctx.font = 'bold 11px ui-monospace, monospace';
      ctx.fillText('D₂', d2X - 7, d2Y - 2);
      ctx.font = '8.5px monospace';
      ctx.fillStyle = '#e9d5ff';
      ctx.fillText(currentBS2 ? 'sin²' : '50%', d2X - 10, d2Y + 8);
      ctx.fillText('Min', d2X + 24, d2Y + 3);

      // 7. Render Quantum Field Wavepackets / Photons in Flight
      pulsesRef.current.forEach((pulse) => {
        const p = pulse.progress;

        // Stage 1: Laser S -> BS1 (p: 0 -> 0.25)
        if (p <= 0.25) {
          const t1 = p / 0.25;
          const px = sX + (bs1X - sX) * t1;
          const py = sY;

          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 7;
          ctx.beginPath();
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
        // Stage 2: Dual Field Arms (p: 0.25 -> 0.75)
        else if (p <= 0.75) {
          const t2 = (p - 0.25) / 0.5;

          if (currentBS2) {
            // Quantum Superposition across both arms
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

            ctx.fillStyle = 'rgba(6, 182, 212, 0.9)';
            ctx.shadowColor = '#06b6d4';
            ctx.shadowBlur = 7;
            ctx.beginPath();
            ctx.arc(pAx, pAy, 3.8, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'rgba(234, 179, 8, 0.9)';
            ctx.shadowColor = '#eab308';
            ctx.shadowBlur = 7;
            ctx.beginPath();
            ctx.arc(pBx, pBy, 3.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          } else {
            // Which-Path
            if (pulse.whichPathNoBS2 === 'd1') {
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
              ctx.fillStyle = '#06b6d4';
              ctx.shadowColor = '#06b6d4';
              ctx.shadowBlur = 7;
              ctx.beginPath();
              ctx.arc(pAx, pAy, 4, 0, Math.PI * 2);
              ctx.fill();
              ctx.shadowBlur = 0;
            } else {
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
              ctx.fillStyle = '#eab308';
              ctx.shadowColor = '#eab308';
              ctx.shadowBlur = 7;
              ctx.beginPath();
              ctx.arc(pBx, pBy, 4, 0, Math.PI * 2);
              ctx.fill();
              ctx.shadowBlur = 0;
            }
          }
        }
        // Stage 3: Post BS2 to Detectors D1 or D2 (p: 0.75 -> 1.0)
        else {
          const t3 = (p - 0.75) / 0.25;

          if (pulse.targetDetector === 'D1') {
            const px = bs2X + (d1X - bs2X) * t3;
            const py = bs2Y;
            ctx.fillStyle = '#10b981';
            ctx.shadowColor = '#10b981';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          } else {
            const px = bs2X;
            const py = bs2Y + (d2Y - bs2Y) * t3;
            ctx.fillStyle = '#a855f7';
            ctx.shadowColor = '#a855f7';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      });

      // 8. Render Detection Hit Shockwaves & Particles
      hitsRef.current.forEach((hit) => {
        ctx.save();
        ctx.strokeStyle = hit.color;
        ctx.lineWidth = 1.8;
        ctx.globalAlpha = Math.max(0, hit.opacity);
        ctx.beginPath();
        ctx.arc(hit.x, hit.y, hit.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = hit.color;
        ctx.font = 'bold 10px ui-monospace, monospace';
        ctx.fillText(hit.label, hit.x - 12, hit.y - hit.radius - 3);
        ctx.restore();
      });

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);
    return () => {
      isMounted = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (lastHitTimeoutRef.current) clearTimeout(lastHitTimeoutRef.current);
    };
  }, [lastHit, isSimulating]);

  const handleReset = () => {
    setCountD1(0);
    setCountD2(0);
    pulsesRef.current = [];
    hitsRef.current = [];
    setLastHit(null);
    setIsRunning(false);
  };

  return (
    <div
      id="lab-mach-zehnder"
      ref={containerRef}
      className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-8 flex flex-col gap-6 backdrop-blur-md shadow-2xl scroll-mt-28"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '750px' }}
    >
      {/* 1. Lab Header */}
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

        {/* Counter Displays with live flash indicator */}
        <div className="flex items-center gap-3">
          {/* Detector 1 Card */}
          <div
            className={`bg-slate-950 px-4 py-2.5 rounded-xl border transition-all duration-200 flex items-center gap-3 ${
              lastHit === 'D1'
                ? 'border-emerald-400 bg-emerald-950/40 shadow-lg shadow-emerald-500/25 scale-105'
                : 'border-slate-800'
            }`}
          >
            <div className={`w-3 h-3 rounded-full ${lastHit === 'D1' ? 'bg-emerald-300 animate-ping' : 'bg-emerald-500'}`} />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-mono font-medium">
                Đầu dò D₁ (cos² Δφ/2)
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-lg font-black text-emerald-300">{countD1}</span>
                <span className="font-mono text-xs text-slate-400">
                  ({totalHits > 0 ? ((countD1 / totalHits) * 100).toFixed(0) : 0}%)
                </span>
                <span className="text-[10px] text-emerald-500/80 font-mono">
                  [LT: {(probD1 * 100).toFixed(0)}%]
                </span>
              </div>
            </div>
          </div>

          {/* Detector 2 Card */}
          <div
            className={`bg-slate-950 px-4 py-2.5 rounded-xl border transition-all duration-200 flex items-center gap-3 ${
              lastHit === 'D2'
                ? 'border-purple-400 bg-purple-950/40 shadow-lg shadow-purple-500/25 scale-105'
                : 'border-slate-800'
            }`}
          >
            <div className={`w-3 h-3 rounded-full ${lastHit === 'D2' ? 'bg-purple-300 animate-ping' : 'bg-purple-500'}`} />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-mono font-medium">
                Đầu dò D₂ (sin² Δφ/2)
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-lg font-black text-purple-300">{countD2}</span>
                <span className="font-mono text-xs text-slate-400">
                  ({totalHits > 0 ? ((countD2 / totalHits) * 100).toFixed(0) : 0}%)
                </span>
                <span className="text-[10px] text-purple-400/80 font-mono">
                  [LT: {(probD2 * 100).toFixed(0)}%]
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CHÚ THÍCH & HƯỚNG DẪN QUAN SÁT (ĐỌC TRƯỚC KHI THỰC NGHIỆM) */}
      <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800/90 flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            Lý Thuyết Giao Thoa Kế & Nghịch Lý Lựa Chọn Trễ Wheeler
          </h4>
        </div>

        {/* 4 Explanatory Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* How It Works */}
          <div className="bg-slate-900/70 p-4 rounded-xl border border-emerald-500/20 flex flex-col gap-2">
            <span className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>{t.labs.machZehnder.howItWorksTitle}</span>
            </span>
            <p className="text-slate-300 text-xs leading-relaxed">
              {t.labs.machZehnder.howItWorksDesc}
            </p>
          </div>

          {/* Wheeler Delayed Choice */}
          <div className="bg-slate-900/70 p-4 rounded-xl border border-amber-500/20 flex flex-col gap-2">
            <span className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{t.labs.machZehnder.delayedChoiceTitle}</span>
            </span>
            <p className="text-slate-300 text-xs leading-relaxed">
              {t.labs.machZehnder.delayedChoiceDesc}
            </p>
          </div>

          {/* Single Wavepacket Nature */}
          <div className="bg-slate-900/70 p-4 rounded-xl border border-purple-500/20 flex flex-col gap-2">
            <span className="font-bold text-purple-300 flex items-center gap-1.5 text-xs">
              <HelpCircle className="w-4 h-4 text-purple-400" />
              <span>{t.labs.machZehnder.whyWavepacketTitle}</span>
            </span>
            <p className="text-slate-300 text-xs leading-relaxed">
              {t.labs.machZehnder.whyWavepacketDesc}
            </p>
          </div>

          {/* QFT Insight */}
          <div className="bg-slate-900/70 p-4 rounded-xl border border-cyan-500/20 flex flex-col gap-2">
            <span className="font-bold text-cyan-300 flex items-center gap-1.5 text-xs">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>{t.labs.machZehnder.qftInsightTitle}</span>
            </span>
            <p className="text-slate-300 text-xs leading-relaxed">
              {t.labs.machZehnder.qftInsightBody}
            </p>
          </div>
        </div>
      </div>

      {/* 2-Column Main Section: Column 1 (Canvas) & Column 2 (Bảng Quang Lộ d1 & d2 Card) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Column 1: Optical Bench Canvas */}
        <div className="lg:col-span-7 xl:col-span-7 relative bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner min-h-[300px]">
          <canvas
            ref={canvasRef}
            width={560}
            height={290}
            className="w-full h-full object-contain"
          />

          {/* Overlay Banner */}
          <div className="absolute top-2.5 left-3 text-[10px] font-mono text-slate-300 bg-slate-900/90 px-2.5 py-1 rounded-md border border-slate-800 flex items-center gap-1.5 backdrop-blur-sm pointer-events-none">
            {hasBS2 ? (
              <span className="text-cyan-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>{t.labs.machZehnder.hasBS2Title}</span>
              </span>
            ) : (
              <span className="text-rose-300 flex items-center gap-1">
                <Eye className="w-3 h-3 text-rose-400" />
                <span>{t.labs.machZehnder.noBS2Title}</span>
              </span>
            )}
          </div>
        </div>

        {/* Column 2: Bảng Quang Lộ d1 & d2 Card */}
        <div className="lg:col-span-5 xl:col-span-5 bg-slate-950/80 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between gap-4 shadow-xl">
          {/* Card Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <GitBranch className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Bảng Phân Tích Quang Lộ</h4>
                <span className="text-[10px] font-mono text-slate-400">So sánh quang trình d₁ & d₂</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-yellow-500/10 border border-yellow-500/30 text-yellow-300">
              Δd = {deltaPathWavelength} λ
            </span>
          </div>

          {/* Detailed Arms d1 & d2 Comparison */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Nhánh d1 */}
            <div className="bg-slate-900/70 p-3 rounded-xl border border-cyan-500/20 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  Nhánh d₁ (Đường A)
                </span>
                <span className="text-[10px] font-mono text-slate-400">Chuẩn</span>
              </div>
              <div className="text-[11px] font-mono text-slate-300">
                Quang trình: <span className="text-white font-bold">L₀</span>
              </div>
              <div className="text-[10px] text-slate-400 leading-tight">
                Qua gương M₁, pha chuẩn φ₁ = 0
              </div>
            </div>

            {/* Nhánh d2 */}
            <div className="bg-slate-900/70 p-3 rounded-xl border border-amber-500/20 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Nhánh d₂ (Đường B)
                </span>
                <span className="text-[10px] font-mono text-amber-400 font-bold">+{deltaPathWavelength}λ</span>
              </div>
              <div className="text-[11px] font-mono text-slate-300">
                Quang trình: <span className="text-white font-bold">L₀ + Δd</span>
              </div>
              <div className="text-[10px] text-slate-400 leading-tight">
                Bộ dời pha Δφ = <span className="text-yellow-300 font-bold">{phaseShiftDeg}°</span>
              </div>
            </div>
          </div>

          {/* Probability & Detection Bars */}
          <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-800 flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-cyan-400" />
                <span>{hasBS2 ? 'Trạng Thái Tái Can Nhiễu (Tại BS₂)' : 'Trạng Thái Which-Path (Đã gỡ BS₂)'}</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {hasBS2 ? 'P₁ + P₂ = 100%' : '50% / 50%'}
              </span>
            </div>

            {/* D1 Progress */}
            <div>
              <div className="flex justify-between text-[11px] font-mono mb-1">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span>D₁ (cos² Δφ/2):</span>
                  <span className="text-slate-400 font-normal">{countD1} photon</span>
                </span>
                <span className="text-emerald-300 font-bold">
                  {(probD1 * 100).toFixed(1)}% <span className="text-slate-400 font-normal">({totalHits > 0 ? ((countD1 / totalHits) * 100).toFixed(0) : 0}% TT)</span>
                </span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${probD1 * 100}%` }}
                />
              </div>
            </div>

            {/* D2 Progress */}
            <div>
              <div className="flex justify-between text-[11px] font-mono mb-1">
                <span className="text-purple-400 font-bold flex items-center gap-1">
                  <span>D₂ (sin² Δφ/2):</span>
                  <span className="text-slate-400 font-normal">{countD2} photon</span>
                </span>
                <span className="text-purple-300 font-bold">
                  {(probD2 * 100).toFixed(1)}% <span className="text-slate-400 font-normal">({totalHits > 0 ? ((countD2 / totalHits) * 100).toFixed(0) : 0}% TT)</span>
                </span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-300"
                  style={{ width: `${probD2 * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Physical Insight Footer */}
          <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed font-mono">
            {hasBS2 ? (
              <span>
                💡 <span className="text-cyan-300 font-semibold">QFT:</span> Hiệu quang lộ{' '}
                <span className="text-yellow-300">Δd = {deltaPathWavelength}λ</span> tạo độ lệch pha{' '}
                <span className="text-yellow-300">Δφ = {phaseShiftDeg}°</span>, can nhiễu tăng cường tại D₁ và triệt tiêu tại D₂.
              </span>
            ) : (
              <span>
                ⚠️ <span className="text-rose-300 font-semibold">Wheeler:</span> Gỡ BS₂ loại bỏ giao thoa. Photon chỉ đi d₁ ➔ D₁ hoặc d₂ ➔ D₂ với xác suất đồng đều 50/50.
              </span>
            )}
          </div>
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
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-md shadow-rose-500/20 hover:bg-rose-500/30'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            <span>{hasBS2 ? 'Gỡ BS₂ (Wheeler Which-Path)' : 'Lắp lại BS₂ (Tái kết hợp)'}</span>
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title={t.labs.machZehnder.clearCounts}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Phase Slider & Path Difference (Δd = d2 - d1) */}
        <div className="md:col-span-5 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 flex flex-col justify-center gap-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-yellow-400" />
              <span>{t.labs.machZehnder.phaseShiftLabel}</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-cyan-300 text-xs font-semibold bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800">
                Δd = {deltaPathWavelength}λ
              </span>
              <span className="font-mono text-yellow-300 font-bold text-sm">{phaseShiftDeg}°</span>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            step="1"
            value={phaseShiftDeg}
            onChange={(e) => {
              setPhaseShiftDeg(parseInt(e.target.value));
              handleReset();
            }}
            className="accent-yellow-400 h-2 bg-slate-900 rounded-lg cursor-pointer w-full"
          />
        </div>
      </div>
    </div>
  );
};
