import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  Sparkles,
  Flame,
  Radio,
  BookOpen,
  HelpCircle,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
} from 'lucide-react';
import { useLanguage } from '../../i18n';
import { useInView } from '../../hooks/useInView';
import { MathFormula } from '../common/MathFormula';

export type HBTSourceType = 'single-photon' | 'laser' | 'thermal';
export type HBTEmissionMode = 'pulsed' | 'cw';

interface FlyingPhoton {
  id: number;
  x: number;
  y: number;
  target: 'd1' | 'd2' | 'absorbed';
  stage: 'source-to-bs' | 'bs-to-detector';
  color: string;
  speed: number;
  progress: number; // 0 to 1
}

interface DetectorHitEffect {
  detector: 'd1' | 'd2';
  timestamp: number;
}

const HISTOGRAM_BINS = 41; // Bins from -10ns to +10ns (center bin is index 20, tau = 0)
const TAU_MAX_NS = 10;

export const HBTLab: React.FC = () => {
  const { language, t } = useLanguage();
  const { ref: containerRef, isSimulating } = useInView<HTMLDivElement>();

  // State
  const [sourceType, setSourceType] = useState<HBTSourceType>('single-photon');
  const [emissionMode, setEmissionMode] = useState<HBTEmissionMode>('pulsed');
  const [pulseRate, setPulseRate] = useState<number>(10); // Hz or arbitrary speed
  const [darkCountRate, setDarkCountRate] = useState<number>(0.02); // 0.0 to 0.20 (0% to 20%)
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Statistics counters
  const [totalEmissions, setTotalEmissions] = useState<number>(0);
  const [d1Clicks, setD1Clicks] = useState<number>(0);
  const [d2Clicks, setD2Clicks] = useState<number>(0);
  const [coincidencesAtZero, setCoincidencesAtZero] = useState<number>(0);

  // Histogram data array (bins representing tau from -TAU_MAX_NS to +TAU_MAX_NS)
  const [histogram, setHistogram] = useState<number[]>(() => new Array(HISTOGRAM_BINS).fill(0));

  // Accordion details toggle
  const [showDetails, setShowDetails] = useState<boolean>(false);

  // Canvas refs
  const benchCanvasRef = useRef<HTMLCanvasElement>(null);
  const graphCanvasRef = useRef<HTMLCanvasElement>(null);

  // Animation & simulation refs
  const animationFrameRef = useRef<number | null>(null);
  const flyingPhotonsRef = useRef<FlyingPhoton[]>([]);
  const lastHitsRef = useRef<DetectorHitEffect[]>([]);
  const pulseIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync state values to refs for 60fps render loop
  const sourceTypeRef = useRef(sourceType);
  const darkCountRateRef = useRef(darkCountRate);
  const tRef = useRef(t);
  const languageRef = useRef(language);

  useEffect(() => {
    sourceTypeRef.current = sourceType;
    darkCountRateRef.current = darkCountRate;
    tRef.current = t;
    languageRef.current = language;
  }, [sourceType, darkCountRate, t, language]);

  // Clear all statistics & histogram data
  const handleClearData = useCallback(() => {
    setHistogram(new Array(HISTOGRAM_BINS).fill(0));
    setTotalEmissions(0);
    setD1Clicks(0);
    setD2Clicks(0);
    setCoincidencesAtZero(0);
    flyingPhotonsRef.current = [];
    lastHitsRef.current = [];
  }, []);

  // Compute calculated g^(2)(0) consistently from experimental counters
  // Standard Pulsed HBT Formula: g^(2)(0) = (N_12 * N_pulse) / (N_1 * N_2)
  const centerBin = Math.floor(HISTOGRAM_BINS / 2);
  let sideSum = 0;
  let sideBinsCount = 0;
  for (let i = 0; i < HISTOGRAM_BINS; i++) {
    if (Math.abs(i - centerBin) >= 4) {
      sideSum += histogram[i];
      sideBinsCount++;
    }
  }
  const averageSideCount = sideBinsCount > 0 && sideSum > 0 ? sideSum / sideBinsCount : 0;

  const calculatedG2Zero =
    totalEmissions > 0 && d1Clicks > 0 && d2Clicks > 0
      ? ((coincidencesAtZero * totalEmissions) / (d1Clicks * d2Clicks)).toFixed(2)
      : '0.00';

  // Apply scenario presets
  const applyPreset = useCallback(
    (presetKey: 'ideal-quantum' | 'real-lab' | 'laser' | 'thermal') => {
      handleClearData();
      if (presetKey === 'ideal-quantum') {
        setSourceType('single-photon');
        setDarkCountRate(0.0);
        setPulseRate(12);
        setIsRunning(true);
      } else if (presetKey === 'real-lab') {
        setSourceType('single-photon');
        setDarkCountRate(0.03);
        setPulseRate(12);
        setIsRunning(true);
      } else if (presetKey === 'laser') {
        setSourceType('laser');
        setDarkCountRate(0.02);
        setPulseRate(12);
        setIsRunning(true);
      } else if (presetKey === 'thermal') {
        setSourceType('thermal');
        setDarkCountRate(0.02);
        setPulseRate(12);
        setIsRunning(true);
      }
    },
    [handleClearData]
  );

  // Trigger one discrete pulse event with quantum-accurate statistics
  const firePulse = useCallback(() => {
    const currentSource = sourceTypeRef.current;
    const currentDark = darkCountRateRef.current;
    const pulseId = Math.random();

    setTotalEmissions((prev) => prev + 1);

    // Determine photon color based on source
    const color =
      currentSource === 'single-photon' ? '#06b6d4' : currentSource === 'laser' ? '#a855f7' : '#f97316';

    let photonCount = 1;
    if (currentSource === 'single-photon') {
      // Fock |1> state: Exactly 1 photon per emission
      photonCount = 1;
    } else if (currentSource === 'laser') {
      // Coherent State: Poisson photon statistics (mean mu = 1.0)
      let count = 0;
      let pPois = 1.0;
      const lPois = Math.exp(-1.0);
      do {
        count++;
        pPois *= Math.random();
      } while (pPois > lPois);
      photonCount = count - 1;
    } else {
      // Thermal State: Bose-Einstein Super-Poissonian distribution (mean mu = 1.0)
      const u = Math.random();
      photonCount = Math.floor(Math.log(1 - u) / Math.log(0.5));
    }

    // Distribute photons independently at 50:50 Beam Splitter
    let d1PhotonCount = 0;
    let d2PhotonCount = 0;

    for (let i = 0; i < Math.max(1, photonCount); i++) {
      const pathChoice: 'd1' | 'd2' = Math.random() < 0.5 ? 'd1' : 'd2';
      if (photonCount > 0) {
        if (pathChoice === 'd1') d1PhotonCount++;
        else d2PhotonCount++;
      }

      // Visual photon wavepacket animation
      flyingPhotonsRef.current.push({
        id: pulseId + i * 0.1,
        x: 0,
        y: 0,
        target: pathChoice,
        stage: 'source-to-bs',
        color,
        speed: 0.02,
        progress: -i * 0.04,
      });
    }

    // APD detector trigger with dark counts
    const d1Dark = Math.random() < currentDark;
    const d2Dark = Math.random() < currentDark;
    const d1Hit = d1PhotonCount > 0 || d1Dark;
    const d2Hit = d2PhotonCount > 0 || d2Dark;

    setTimeout(() => {
      if (d1Hit) setD1Clicks((c) => c + 1);
      if (d2Hit) setD2Clicks((c) => c + 1);

      const isCoincidence = d1Hit && d2Hit;
      if (isCoincidence) {
        setCoincidencesAtZero((c) => c + 1);
      }

      // Update histogram bins
      setHistogram((prev) => {
        const next = [...prev];
        // 1. Center bin (tau = 0) tracks physical joint clicks within same pulse
        if (isCoincidence) {
          next[centerBin] += 1;
        }

        // 2. Side bins represent accidental coincidence events between consecutive independent pulses
        // Physical accidental coincidence probability per pulse is P(D1) * P(D2)
        const pAccidental = (d1Hit ? 0.6 : 0.2) * (d2Hit ? 0.6 : 0.2);
        if (Math.random() < pAccidental) {
          // Select a random bin from side bins excluding center region
          const sideOffset = Math.floor(Math.random() * (HISTOGRAM_BINS - 8));
          const targetBin = sideOffset < (centerBin - 4) ? sideOffset : sideOffset + 8;
          if (targetBin >= 0 && targetBin < HISTOGRAM_BINS) {
            next[targetBin] += 1;
          }
        }
        return next;
      });
    }, 500);
  }, [centerBin]);

  // Continuous emission timer
  useEffect(() => {
    if (!isRunning || !isSimulating) {
      if (pulseIntervalRef.current) clearInterval(pulseIntervalRef.current);
      return;
    }

    const baseIntervalMs = Math.max(60, Math.floor(1000 / pulseRate));
    const intervalMs = emissionMode === 'cw' ? Math.floor(baseIntervalMs * 0.8) : baseIntervalMs;

    pulseIntervalRef.current = setInterval(() => {
      firePulse();
    }, intervalMs);

    return () => {
      if (pulseIntervalRef.current) clearInterval(pulseIntervalRef.current);
    };
  }, [isRunning, isSimulating, pulseRate, emissionMode, firePulse]);

  // Optical bench animation loop (60 FPS Canvas)
  useEffect(() => {
    if (!isSimulating) return;

    let isSubscribed = true;

    const renderBench = () => {
      if (!isSubscribed) return;
      const canvas = benchCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      // Clear with deep space dark slate background
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, w, h);

      // Optical Bench Coordinates (Optimized for 230px canvas)
      const sourceX = 55;
      const sourceY = 135;
      const filterX = 130;
      const bsX = 235;
      const bsY = sourceY;
      const d1X = bsX;
      const d1Y = 46; // Vertical Reflected Arm
      const d2X = w - 65;
      const d2Y = bsY; // Horizontal Transmitted Arm

      // 1. Draw Optical Axis Guideline (Dashed)
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);

      // Horizontal beam path
      ctx.beginPath();
      ctx.moveTo(sourceX, sourceY);
      ctx.lineTo(d2X, d2Y);
      ctx.stroke();

      // Vertical reflected path to D1
      ctx.beginPath();
      ctx.moveTo(bsX, bsY);
      ctx.lineTo(d1X, d1Y);
      ctx.stroke();
      ctx.setLineDash([]);

      const isVi = languageRef.current === 'vi';

      // 2. Draw Emitter Source
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.fillRect(sourceX - 35, sourceY - 24, 48, 48);
      ctx.strokeRect(sourceX - 35, sourceY - 24, 48, 48);

      // Emitter aperture lens
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(sourceX + 13, sourceY - 10, 5, 20);

      // Emitter Label (Bilingual)
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 12px ui-monospace, monospace';
      const emitterName =
        sourceTypeRef.current === 'single-photon'
          ? 'NV Center'
          : sourceTypeRef.current === 'laser'
            ? 'Laser'
            : isVi
              ? 'Nhiệt'
              : 'Thermal';
      ctx.fillText(emitterName, sourceX - 30, sourceY + 36);

      // 3. Draw Bandpass Filter (Narrowband spectral filter - Bilingual)
      ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.fillRect(filterX - 6, sourceY - 18, 12, 36);
      ctx.strokeRect(filterX - 6, sourceY - 18, 12, 36);
      ctx.fillStyle = '#34d399';
      ctx.font = '12px ui-monospace, monospace';
      const filterName = isVi ? 'Bộ lọc' : 'Filter';
      ctx.fillText(filterName, filterX - (isVi ? 20 : 16), sourceY + 30);

      // 4. Draw 50:50 Non-Polarizing Beam Splitter (NPBS) Cube
      ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      const bsSize = 34;
      ctx.fillRect(bsX - bsSize / 2, bsY - bsSize / 2, bsSize, bsSize);
      ctx.strokeRect(bsX - bsSize / 2, bsY - bsSize / 2, bsSize, bsSize);

      // Splitting internal interface at 45 degrees
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(bsX - bsSize / 2, bsY + bsSize / 2);
      ctx.lineTo(bsX + bsSize / 2, bsY - bsSize / 2);
      ctx.stroke();

      ctx.fillStyle = '#e0f2fe';
      ctx.font = 'bold 12px ui-monospace, monospace';
      ctx.fillText('NPBS 50:50', bsX - 34, bsY + 32);

      // 5. Draw Detectors D1 and D2 (SPAD Avalanche Photodiodes)
      // Detector 1 (D1 - Start Channel)
      ctx.fillStyle = '#064e3b';
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.fillRect(d1X - 22, d1Y - 18, 44, 28);
      ctx.strokeRect(d1X - 22, d1Y - 18, 44, 28);
      // Diode sensor window
      ctx.fillStyle = '#34d399';
      ctx.fillRect(d1X - 12, d1Y + 10, 24, 4);

      ctx.fillStyle = '#a7f3d0';
      ctx.font = 'bold 12px ui-monospace, monospace';
      ctx.fillText('D₁ (Start)', d1X + 12, d1Y - 22);

      // Detector 2 (D2 - Stop Channel)
      ctx.fillStyle = '#4c1d95';
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      ctx.fillRect(d2X - 10, d2Y - 20, 28, 42);
      ctx.strokeRect(d2X - 10, d2Y - 20, 28, 42);
      // Diode sensor window
      ctx.fillStyle = '#c084fc';
      ctx.fillRect(d2X - 14, d2Y - 10, 4, 20);

      ctx.fillStyle = '#e9d5ff';
      ctx.font = 'bold 12px ui-monospace, monospace';
      ctx.fillText('D₂ (Stop)', d2X - 24, d2Y + 34);

      // 6. Correlator Time Delay Indicator: Δt = t₂ - t₁ (Top-right corner)
      const tagW = 105;
      const tagH = 24;
      const tagX = w - tagW - 14;
      const tagY = 12;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      if (typeof ctx.roundRect === 'function') {
        ctx.beginPath();
        ctx.roundRect(tagX, tagY, tagW, tagH, 6);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillRect(tagX, tagY, tagW, tagH);
        ctx.strokeRect(tagX, tagY, tagW, tagH);
      }

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px ui-monospace, monospace';
      ctx.fillText('Δt = t₂ - t₁', tagX + 12, tagY + 16);

      // 7. Update & Draw Flying Photons
      const activePhotons: FlyingPhoton[] = [];
      const currentPhotons = flyingPhotonsRef.current;

      for (const p of currentPhotons) {
        p.progress += p.speed;

        if (p.stage === 'source-to-bs') {
          p.x = sourceX + 18 + p.progress * (bsX - (sourceX + 18));
          p.y = sourceY;

          if (p.progress >= 1.0) {
            p.stage = 'bs-to-detector';
            p.progress = 0;
          }
          activePhotons.push(p);
        } else if (p.stage === 'bs-to-detector') {
          if (p.target === 'd1') {
            // Move vertically up to D1
            p.x = bsX;
            p.y = bsY - p.progress * (bsY - (d1Y + 12));
          } else {
            // Move horizontally right to D2
            p.x = bsX + p.progress * (d2X - 12 - bsX);
            p.y = bsY;
          }

          if (p.progress < 1.0) {
            activePhotons.push(p);
          } else {
            // Photon hit detector! Add hit flash effect
            lastHitsRef.current.push({
              detector: p.target === 'd1' ? 'd1' : 'd2',
              timestamp: Date.now(),
            });
          }
        }

        // Draw the localized quantum wavepacket
        ctx.save();
        const grad = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, 14);
        grad.addColorStop(0, p.color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
        ctx.fill();

        // Wave ripples inside packet
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      flyingPhotonsRef.current = activePhotons;

      // 9. Draw Hit Flash Effects at Detectors
      const now = Date.now();
      lastHitsRef.current = lastHitsRef.current.filter((hit) => now - hit.timestamp < 350);

      for (const hit of lastHitsRef.current) {
        const hx = hit.detector === 'd1' ? d1X : d2X;
        const hy = hit.detector === 'd1' ? d1Y : d2Y;
        const alpha = 1 - (now - hit.timestamp) / 350;

        ctx.save();
        ctx.strokeStyle = hit.detector === 'd1' ? `rgba(52, 211, 153, ${alpha})` : `rgba(192, 132, 252, ${alpha})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(hx, hy, 18 * (1 - alpha * 0.4), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(renderBench);
    };

    animationFrameRef.current = requestAnimationFrame(renderBench);

    return () => {
      isSubscribed = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isSimulating]);

  // Histogram & g^(2)(tau) canvas rendering
  useEffect(() => {
    const canvas = graphCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Background
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, w, h);

    const padLeft = 46;
    const padRight = 20;
    const padTop = 22;
    const padBottom = 34;

    const plotW = w - padLeft - padRight;
    const plotH = h - padTop - padBottom;

    // Calculate max count for dynamic scaling
    const maxCount = Math.max(10, ...histogram);

    // 1. Draw Non-Classical Shaded Region (g^(2) < 1)
    // The classical threshold line corresponds to averageSideCount
    const classicalLimitY =
      averageSideCount > 0 ? padTop + plotH - (averageSideCount / maxCount) * plotH : padTop + plotH * 0.5;

    if (classicalLimitY < padTop + plotH) {
      ctx.fillStyle = 'rgba(6, 182, 212, 0.08)';
      ctx.fillRect(padLeft, classicalLimitY, plotW, padTop + plotH - classicalLimitY);

      // Label inside non-classical zone
      ctx.fillStyle = '#06b6d4';
      ctx.font = 'bold 12px ui-monospace, monospace';
      ctx.fillText(t.labs.hbt.nonClassicalZone, padLeft + 10, padTop + plotH - 10);
    }

    // 2. Draw Classical Boundary Guideline at g^(2) = 1 (Dashed Red Line)
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(padLeft, classicalLimitY);
    ctx.lineTo(padLeft + plotW, classicalLimitY);
    ctx.stroke();
    ctx.setLineDash([]);

    const classicalBoundaryLabel = language === 'vi' ? 'g⁽²⁾=1 (Cổ điển)' : 'g⁽²⁾=1 (Classical)';
    ctx.fillText(classicalBoundaryLabel, padLeft + plotW - 110, classicalLimitY - 5);

    // 3. Draw Grid Lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;

    // Horizontal grid
    for (let i = 0; i <= 3; i++) {
      const gy = padTop + (plotH / 3) * i;
      ctx.beginPath();
      ctx.moveTo(padLeft, gy);
      ctx.lineTo(padLeft + plotW, gy);
      ctx.stroke();

      const labelVal = Math.round(maxCount * (1 - i / 3));
      ctx.fillStyle = '#64748b';
      ctx.font = '12px ui-monospace, monospace';
      ctx.fillText(labelVal.toString(), padLeft - 34, gy + 4);
    }

    // Center vertical tau = 0 line
    const centerLineX = padLeft + plotW / 2;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(centerLineX, padTop);
    ctx.lineTo(centerLineX, padTop + plotH);
    ctx.stroke();
    ctx.setLineDash([]);

    // 4. Draw Histogram Bars N(tau)
    const barWidth = plotW / HISTOGRAM_BINS;

    for (let i = 0; i < HISTOGRAM_BINS; i++) {
      const count = histogram[i];
      const barH = (count / maxCount) * plotH;
      const bx = padLeft + i * barWidth;
      const by = padTop + plotH - barH;

      // Color coding:
      // Center bin (tau = 0) highlighted prominently
      const isCenter = i === centerBin;

      if (isCenter) {
        ctx.fillStyle =
          sourceType === 'single-photon' ? '#10b981' : sourceType === 'laser' ? '#a855f7' : '#f97316';
      } else {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
      }

      ctx.fillRect(bx + 1, by, barWidth - 2, barH);

      if (isCenter && count > 0) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(bx + 1, by, barWidth - 2, barH);
      }
    }

    // 5. Draw Theoretical g^(2)(tau) Curve Overlay
    ctx.strokeStyle =
      sourceType === 'single-photon' ? '#34d399' : sourceType === 'laser' ? '#c084fc' : '#fb923c';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    for (let i = 0; i < HISTOGRAM_BINS; i++) {
      const tau = ((i - centerBin) / centerBin) * TAU_MAX_NS;
      const px = padLeft + (i + 0.5) * barWidth;

      let theoreticalG2 = 1.0;
      if (sourceType === 'single-photon') {
        // Dip to ~0 (or dark count floor)
        const darkFloor = darkCountRate;
        theoreticalG2 = 1.0 - (1.0 - darkFloor) * Math.exp(-Math.abs(tau) / 1.8);
      } else if (sourceType === 'laser') {
        theoreticalG2 = 1.0;
      } else {
        // Peak to 2.0
        theoreticalG2 = 1.0 + Math.exp(-Math.abs(tau) / 1.5);
      }

      const curveVal = averageSideCount > 0 ? theoreticalG2 * averageSideCount : theoreticalG2 * (maxCount * 0.5);
      const py = padTop + plotH - (curveVal / maxCount) * plotH;

      if (i === 0) ctx.moveTo(px, Math.max(padTop, Math.min(padTop + plotH, py)));
      else ctx.lineTo(px, Math.max(padTop, Math.min(padTop + plotH, py)));
    }
    ctx.stroke();

    // 6. Draw Axes & Labels
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop);
    ctx.lineTo(padLeft, padTop + plotH);
    ctx.lineTo(padLeft + plotW, padTop + plotH);
    ctx.stroke();

    // Tau ticks (-10, -5, 0, +5, +10)
    const tauTicks = [-10, -5, 0, 5, 10];
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px ui-monospace, monospace';

    for (const tVal of tauTicks) {
      const frac = (tVal + TAU_MAX_NS) / (2 * TAU_MAX_NS);
      const tx = padLeft + frac * plotW;
      ctx.beginPath();
      ctx.moveTo(tx, padTop + plotH);
      ctx.lineTo(tx, padTop + plotH + 5);
      ctx.stroke();

      const label = tVal === 0 ? '0' : `${tVal > 0 ? '+' : ''}${tVal}ns`;
      ctx.fillText(label, tx - (tVal === 0 ? 4 : 14), padTop + plotH + 16);
    }

    // Axis titles (Bilingual)
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 12px ui-sans-serif, system-ui';
    const tauAxisTitle =
      language === 'vi'
        ? 'τ = t₂ - t₁ (Độ trễ thời gian nanosecond)'
        : 'τ = t₂ - t₁ (Time delay in nanoseconds)';
    ctx.fillText(tauAxisTitle, padLeft + plotW / 2 - (language === 'vi' ? 120 : 110), padTop + plotH + 30);

    ctx.save();
    ctx.translate(14, padTop + plotH / 2 + 40);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(t.labs.hbt.coincidenceCountLabel, 0, 0);
    ctx.restore();
  }, [histogram, averageSideCount, darkCountRate, sourceType, centerBin, t, language]);

  // Non-classical verdict styling
  const numG2 = parseFloat(calculatedG2Zero);
  const isNonClassical = numG2 < 0.6;
  const isThermal = numG2 > 1.25;

  return (
    <div
      ref={containerRef}
      id="lab-hbt"
      className="scroll-mt-24 p-4 lg:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl flex flex-col gap-3.5"
    >
      {/* 1. Compact Header with Title, Badge & Presets */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.labs.hbt.badge}</span>
            </div>
            <h3 className="text-lg lg:text-xl font-black text-white tracking-tight">
              {t.labs.hbt.title}
            </h3>
          </div>
          <p className="text-sm text-slate-300 mt-1 leading-relaxed font-normal">
            {t.labs.hbt.description}
          </p>
        </div>

        {/* Experimental Presets as Compact Chips */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <span className="text-xs font-mono text-slate-400 uppercase mr-1 hidden sm:inline">
            {language === 'vi' ? 'Kịch bản:' : 'Presets:'}
          </span>
          <button
            type="button"
            onClick={() => applyPreset('ideal-quantum')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
              sourceType === 'single-photon' && darkCountRate === 0
                ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/50 shadow-sm'
                : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'vi' ? 'Lý tưởng (g⁽²⁾=0)' : 'Ideal (g⁽²⁾=0)'}</span>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('real-lab')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
              sourceType === 'single-photon' && darkCountRate > 0
                ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/50 shadow-sm'
                : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'vi' ? 'Lab thực tế' : 'Real Lab'}</span>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('laser')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
              sourceType === 'laser'
                ? 'bg-purple-500/20 text-purple-200 border-purple-500/50 shadow-sm'
                : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span>{language === 'vi' ? 'Laser Poisson' : 'Poisson Laser'}</span>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('thermal')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
              sourceType === 'thermal'
                ? 'bg-amber-500/20 text-amber-200 border-amber-500/50 shadow-sm'
                : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'vi' ? 'Nhiệt (Bunching)' : 'Thermal (Bunching)'}</span>
          </button>
        </div>
      </div>

      {/* 2. Dual-Panel Visualizer Layout (Compact 230px height) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {/* Panel 1: Optical Bench Canvas */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              {t.labs.hbt.benchTitle}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              60 FPS Engine
            </span>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
            <canvas
              ref={benchCanvasRef}
              width={540}
              height={230}
              className="w-full h-auto block"
            />
            {/* Quick annotation tag (Bilingual) */}
            <div className="absolute top-2 left-2 bg-slate-900/90 backdrop-blur-md px-2.5 py-0.5 rounded-lg border border-slate-800 text-xs text-slate-300 font-mono flex items-center gap-1.5 pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>
                {sourceType === 'single-photon'
                  ? (language === 'vi' ? 'Fock |1⟩ (1 photon/xung)' : 'Fock |1⟩ (1 photon/pulse)')
                  : sourceType === 'laser'
                    ? 'Laser |α⟩ (Poisson)'
                    : (language === 'vi' ? 'Nhiệt (Bose)' : 'Thermal (Bose)')}
              </span>
            </div>
          </div>
        </div>

        {/* Panel 2: Coincidence Histogram Canvas */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              {t.labs.hbt.graphTitle}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {t.labs.hbt.measuredDataLegend}
            </span>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
            <canvas
              ref={graphCanvasRef}
              width={540}
              height={230}
              className="w-full h-auto block"
            />
          </div>
        </div>
      </div>

      {/* Quick Explanatory Note for Δt = t₂ - t₁ */}
      <div className="px-3.5 py-2 rounded-xl bg-cyan-950/30 border border-cyan-500/20 flex items-center gap-2.5 text-xs text-slate-200">
        <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
        <span className="font-medium leading-relaxed">
          <strong className="text-cyan-300 font-bold font-mono">Δt = t₂ - t₁: </strong>
          {t.labs.hbt.deltaTPurposeHint}
        </span>
      </div>

      {/* 3. PRIMARY COMMAND & METRIC BAR: Simulation Action Buttons + g⁽²⁾(0) Measurement */}
      <div className="p-3 lg:p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg">
        {/* Left: Action Control Buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-start">
          <button
            type="button"
            onClick={() => setIsRunning(!isRunning)}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" />
                <span>{t.labs.hbt.pauseFire}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{t.labs.hbt.continuousFire}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={firePulse}
            disabled={isRunning}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-cyan-600 hover:bg-cyan-500 text-slate-950 flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <Zap className="w-4 h-4 text-slate-950 fill-current" />
            <span>{t.labs.hbt.fireSinglePulse}</span>
          </button>

          <button
            type="button"
            onClick={handleClearData}
            className="px-3 py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 cursor-pointer transition-all"
            title={t.labs.hbt.clearData}
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">{t.labs.hbt.clearData}</span>
          </button>
        </div>

        {/* Right: Prominent g^(2)(0) Measurement Badge */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end bg-slate-900/90 px-3.5 py-2 rounded-xl border border-slate-800">
          <div className="flex flex-col text-right">
            <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">
              {t.labs.hbt.statG2ZeroCalculated}
            </span>
            <div className="text-xl lg:text-2xl font-black font-mono tracking-tight leading-none my-0.5">
              <span
                className={
                  isNonClassical
                    ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]'
                    : isThermal
                      ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]'
                      : 'text-purple-400'
                }
              >
                g⁽²⁾(0) = {calculatedG2Zero}
              </span>
            </div>
          </div>

          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
              isNonClassical
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : isThermal
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
            }`}
          >
            {isNonClassical
              ? t.labs.hbt.nonClassicalVerdict
              : isThermal
                ? t.labs.hbt.bunchingVerdict
                : t.labs.hbt.classicalVerdict}
          </span>
        </div>
      </div>

      {/* 4. Live Statistics (Compact 4-column strip) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            {t.labs.hbt.statTotalEmissions}
          </span>
          <span className="text-sm font-black text-white font-mono">
            {totalEmissions.toLocaleString()}
          </span>
        </div>

        <div className="px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
          <span className="text-xs text-emerald-400 font-mono">
            {t.labs.hbt.statDetector1Hits}
          </span>
          <span className="text-sm font-black text-emerald-300 font-mono">
            {d1Clicks.toLocaleString()}
          </span>
        </div>

        <div className="px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
          <span className="text-xs text-purple-400 font-mono">
            {t.labs.hbt.statDetector2Hits}
          </span>
          <span className="text-sm font-black text-purple-300 font-mono">
            {d2Clicks.toLocaleString()}
          </span>
        </div>

        <div className="px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
          <span className="text-xs text-rose-400 font-mono">
            {t.labs.hbt.statCoincidencesZero}
          </span>
          <span className="text-sm font-black text-rose-300 font-mono">
            {coincidencesAtZero.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 5. Compact Settings Strip (3 columns in 1 row) */}
      <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
        {/* Source Selection & Mode Toggle */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              {t.labs.hbt.sourceSelectLabel}
            </label>
            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setEmissionMode('pulsed')}
                className={`px-2 py-0.5 rounded text-xs font-bold transition-all cursor-pointer ${
                  emissionMode === 'pulsed'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {language === 'vi' ? 'Xung' : 'Pulsed'}
              </button>
              <button
                type="button"
                onClick={() => setEmissionMode('cw')}
                className={`px-2 py-0.5 rounded text-xs font-bold transition-all cursor-pointer ${
                  emissionMode === 'cw'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                CW
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setSourceType('single-photon')}
              className={`py-1.5 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                sourceType === 'single-photon'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Fock |1⟩
            </button>
            <button
              type="button"
              onClick={() => setSourceType('laser')}
              className={`py-1.5 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                sourceType === 'laser'
                  ? 'bg-purple-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Laser |α⟩
            </button>
            <button
              type="button"
              onClick={() => setSourceType('thermal')}
              className={`py-1.5 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                sourceType === 'thermal'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {language === 'vi' ? 'Nhiệt' : 'Thermal'}
            </button>
          </div>
        </div>

        {/* Pulse Repetition Rate Slider */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              {t.labs.hbt.rateLabel}
            </label>
            <span className="text-xs font-mono text-cyan-400 font-bold">
              {pulseRate} {language === 'vi' ? 'xung/s' : 'pulses/s'}
            </span>
          </div>
          <input
            type="range"
            min={2}
            max={25}
            step={1}
            value={pulseRate}
            onChange={(e) => setPulseRate(Number(e.target.value))}
            className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-xs text-slate-400 font-mono">
            <span>{language === 'vi' ? 'Chậm (2 Hz)' : 'Slow (2 Hz)'}</span>
            <span>{language === 'vi' ? 'Nhanh (25 Hz)' : 'Fast (25 Hz)'}</span>
          </div>
        </div>

        {/* APD Dark Count Noise Slider */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              {t.labs.hbt.darkCountLabel}
            </label>
            <span className="text-xs font-mono text-rose-400 font-bold">
              {(darkCountRate * 100).toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min={0.0}
            max={0.2}
            step={0.01}
            value={darkCountRate}
            onChange={(e) => setDarkCountRate(Number(e.target.value))}
            className="w-full accent-rose-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-xs text-slate-400 font-mono">
            <span>{language === 'vi' ? 'Lý tưởng (0%)' : 'Ideal (0%)'}</span>
            <span>{language === 'vi' ? 'Nhiễu cao (20%)' : 'High Noise (20%)'}</span>
          </div>
        </div>
      </div>

      {/* 6. Deep Dive Educational Accordion */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-900/60 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5 text-cyan-400 text-sm font-bold">
            <BookOpen className="w-4 h-4" />
            <span>{t.labs.hbt.theorySectionTitle}</span>
          </div>
          {showDetails ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showDetails && (
          <div className="px-5 pb-5 pt-2 flex flex-col gap-5 border-t border-slate-800/80">
            {/* Card 0: Purpose of Delta t = t2 - t1 */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2.5">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span>{t.labs.hbt.deltaTPurposeTitle}</span>
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                {t.labs.hbt.deltaTPurposeDesc}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-1">
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col gap-1">
                  <span className="text-xs font-bold text-rose-300 font-mono">
                    {language === 'vi' ? '● Sóng cổ điển (Tại Δt = 0):' : '● Classical Wave (At Δt = 0):'}
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    {language === 'vi'
                      ? 'Sóng liên tục bị chia đôi tại NPBS 50:50. Cả 2 nhánh đều có năng lượng nên D₁ và D₂ thường xuyên cùng kích hoạt tại Δt = 0 (g⁽²⁾(0) ≥ 1).'
                      : 'Continuous wave splits evenly at 50:50 NPBS. Both arms carry power, so D₁ and D₂ frequently click together at Δt = 0 (g⁽²⁾(0) ≥ 1).'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col gap-1">
                  <span className="text-xs font-bold text-emerald-300 font-mono">
                    {language === 'vi' ? '● Hạt lượng tử Fock |1⟩ (Tại Δt = 0):' : '● Quantum Fock |1⟩ (At Δt = 0):'}
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    {language === 'vi'
                      ? 'Một photon đơn lẻ (hν) không thể bị chẻ làm đôi. Nó chỉ đi vào D₁ HOẶC D₂, do đó không bao giờ có trùng phùng tại Δt = 0 (N(0) = 0, g⁽²⁾(0) = 0).'
                      : 'A single photon (hν) cannot be split. It triggers either D₁ OR D₂, strictly yielding zero coincidences at Δt = 0 (N(0) = 0, g⁽²⁾(0) = 0).'}
                  </p>
                </div>
              </div>
            </div>

            {/* Card 1: Cauchy-Schwarz classical inequality */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>{t.labs.hbt.cauchySchwarzTitle}</span>
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                {t.labs.hbt.cauchySchwarzDesc}
              </p>
              <div className="my-1.5 p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200">
                <MathFormula math="g^{(2)}(0) = \frac{\langle I^2(t) \rangle}{\langle I(t) \rangle^2} = 1 + \frac{\sigma_I^2}{\langle I \rangle^2} \ge 1" />
              </div>
            </div>

            {/* Card 2: QFT Fock state annihilation operators */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>{t.labs.hbt.qftFockTitle}</span>
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                {t.labs.hbt.qftFockDesc}
              </p>
              <div className="my-1.5 p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200">
                <MathFormula math="g^{(2)}(0) = \frac{\langle 1 | \hat{a}^\dagger \hat{a}^\dagger \hat{a} \hat{a} | 1 \rangle}{\langle 1 | \hat{a}^\dagger \hat{a} | 1 \rangle^2} = \frac{\langle 1 | \hat{a}^\dagger \hat{a}^\dagger \hat{a} | 0 \rangle}{1^2} = \frac{0}{1} \equiv 0" />
              </div>
            </div>

            {/* Card 3: Semiclassical Photoelectric Contrast */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>{t.labs.hbt.semiclassicalContrastTitle}</span>
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                {t.labs.hbt.semiclassicalContrastDesc}
              </p>
            </div>

            {/* Card 4: Historical Journey */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-purple-400" />
                <span>{t.labs.hbt.historyTitle}</span>
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                {t.labs.hbt.historyDesc}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
