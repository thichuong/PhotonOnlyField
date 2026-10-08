import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Zap, Sparkles, Eye, Waves, Radio, BookOpen, Sliders } from 'lucide-react';
import { useLanguage } from '../../i18n';
import { useInView } from '../../hooks/useInView';

interface HitPoint {
  x: number;
  y: number;
  id: number;
}

type SlitMode = 'both' | 'left' | 'right';

export const DoubleSlitLab: React.FC = () => {
  const { t } = useLanguage();
  const { ref: containerRef, isSimulating } = useInView<HTMLDivElement>();

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [photonHits, setPhotonHits] = useState<HitPoint[]>([]);
  const [totalPhotons, setTotalPhotons] = useState<number>(0);
  const [firingMode, setFiringMode] = useState<'single' | 'stream'>('stream');
  const [slitDistance, setSlitDistance] = useState<number>(36); // um
  const [slitMode, setSlitMode] = useState<SlitMode>('both');
  const [whichWayDetector, setWhichWayDetector] = useState<boolean>(false);
  const [showWaveChamber, setShowWaveChamber] = useState<boolean>(true);

  const screenCanvasRef = useRef<HTMLCanvasElement>(null);
  const chamberCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const chamberWavePhase = useRef<number>(0);

  // Intensity distribution function
  const computeIntensity = useCallback((screenX: number): number => {
    const lambda = 12;
    const d = slitDistance;
    const a = 9; // slit width
    const theta = screenX / 240;

    const sinc = (val: number) => (Math.abs(val) < 1e-4 ? 1 : Math.sin(val) / val);
    const slitOffset = (d / 2) / 250;

    const leftDiffraction = Math.pow(sinc((Math.PI * a * Math.sin(theta + slitOffset)) / lambda), 2);
    const rightDiffraction = Math.pow(sinc((Math.PI * a * Math.sin(theta - slitOffset)) / lambda), 2);

    if (slitMode === 'left') {
      return leftDiffraction;
    }
    if (slitMode === 'right') {
      return rightDiffraction;
    }

    // Both slits open
    if (whichWayDetector) {
      // Coherence destroyed: Classical probability sum P = P1 + P2 (No cross interference term)
      return 0.5 * leftDiffraction + 0.5 * rightDiffraction;
    }

    // Quantum field superposition: E = E1 + E2 => I = |E1 + E2|^2
    const beta = (Math.PI * d * Math.sin(theta)) / lambda;
    const alpha = (Math.PI * a * Math.sin(theta)) / lambda;
    return Math.pow(Math.cos(beta), 2) * Math.pow(sinc(alpha), 2);
  }, [slitDistance, slitMode, whichWayDetector]);

  // Rejection sampling for individual photon hit points
  const sampleInterferencePoint = useCallback((width: number, height: number): { x: number; y: number } => {
    for (let attempts = 0; attempts < 100; attempts++) {
      const screenX = (Math.random() - 0.5) * (width * 0.85);
      const intensity = computeIntensity(screenX);

      if (Math.random() < intensity) {
        return {
          x: width / 2 + screenX,
          y: height / 2 + (Math.random() - 0.5) * (height * 0.72),
        };
      }
    }
    return { x: width / 2, y: height / 2 };
  }, [computeIntensity]);

  const fireSinglePhoton = () => {
    if (!screenCanvasRef.current) return;
    const w = screenCanvasRef.current.width;
    const h = screenCanvasRef.current.height;
    const hit = sampleInterferencePoint(w, h);
    setPhotonHits((prev) => [...prev.slice(-3000), { ...hit, id: Math.random() }]);
    setTotalPhotons((c) => c + 1);
  };

  // Continuous fire loop - paused when not simulating (out of view or background tab)
  useEffect(() => {
    if (!isRunning || !isSimulating) return;

    const interval = setInterval(() => {
      if (!screenCanvasRef.current) return;
      const w = screenCanvasRef.current.width;
      const h = screenCanvasRef.current.height;
      const newBatch: HitPoint[] = [];
      const batchSize = firingMode === 'stream' ? 14 : 1;

      for (let i = 0; i < batchSize; i++) {
        const hit = sampleInterferencePoint(w, h);
        newBatch.push({ ...hit, id: Math.random() });
      }

      setPhotonHits((prev) => [...prev.slice(-3500), ...newBatch]);
      setTotalPhotons((c) => c + batchSize);
    }, firingMode === 'stream' ? 40 : 250);

    return () => clearInterval(interval);
  }, [isRunning, isSimulating, firingMode, sampleInterferencePoint]);

  // Render Detector Screen Canvas
  useEffect(() => {
    const canvas = screenCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle background grid
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Center reference line
    ctx.strokeStyle = '#06b6d433';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw detected discrete photon dots
    photonHits.forEach((p) => {
      ctx.fillStyle = whichWayDetector ? 'rgba(244, 63, 94, 0.45)' : 'rgba(6, 182, 212, 0.45)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw analytical envelope line at bottom
    ctx.strokeStyle = whichWayDetector ? '#f43f5e' : '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const bottomBase = canvas.height - 20;
    for (let x = 0; x < canvas.width; x += 3) {
      const screenX = x - canvas.width / 2;
      const intensity = computeIntensity(screenX);
      const y = bottomBase - intensity * 50;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [photonHits, computeIntensity, whichWayDetector]);

  // Dynamic Wavefront Animation Loop in Chamber - paused when out of view
  useEffect(() => {
    const canvas = chamberCanvasRef.current;
    if (!canvas || !showWaveChamber || !isSimulating) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMounted = true;

    const renderChamber = () => {
      if (!isMounted || !isSimulating) return;

      chamberWavePhase.current += 0.08;
      const phase = chamberWavePhase.current;

      const w = canvas.width;
      const h = canvas.height;

      // Dark chamber background
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, w, h);

      const barrierX = w * 0.42;
      const screenX = w * 0.95;
      const sourceX = 35;
      const sourceY = h / 2;

      const slitSeparationPx = (slitDistance / 60) * 50;
      const slitAY = h / 2 - slitSeparationPx / 2;
      const slitBY = h / 2 + slitSeparationPx / 2;
      const slitGap = 10;

      // 1. Draw source wave ripples (from source to barrier)
      const numSourceRings = 12;
      for (let r = 0; r < numSourceRings; r++) {
        const radius = ((r * 18 + phase * 14) % (barrierX - sourceX));
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(sourceX, sourceY, radius, -Math.PI / 2.5, Math.PI / 2.5);
        ctx.stroke();
      }

      // Emitter point icon
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(sourceX, sourceY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // 2. Draw Barrier Wall
      ctx.fillStyle = '#1e293b';
      // Top section
      ctx.fillRect(barrierX - 4, 0, 8, slitAY - slitGap / 2);
      // Middle section
      ctx.fillRect(barrierX - 4, slitAY + slitGap / 2, 8, (slitBY - slitGap / 2) - (slitAY + slitGap / 2));
      // Bottom section
      ctx.fillRect(barrierX - 4, slitBY + slitGap / 2, 8, h - (slitBY + slitGap / 2));

      // Slit cover indicators if single slit
      if (slitMode === 'right') {
        ctx.fillStyle = '#ef4444aa';
        ctx.fillRect(barrierX - 4, slitAY - slitGap / 2, 8, slitGap);
      }
      if (slitMode === 'left') {
        ctx.fillStyle = '#ef4444aa';
        ctx.fillRect(barrierX - 4, slitBY - slitGap / 2, 8, slitGap);
      }

      // 3. Draw Diffracted / Interfering Wavefronts after slits
      const maxDist = screenX - barrierX;
      const numRipples = 16;

      const hasSlitA = slitMode === 'both' || slitMode === 'left';
      const hasSlitB = slitMode === 'both' || slitMode === 'right';

      if (hasSlitA) {
        for (let r = 0; r < numRipples; r++) {
          const radius = ((r * 16 + phase * 14) % maxDist);
          ctx.strokeStyle = whichWayDetector ? 'rgba(244, 63, 94, 0.3)' : 'rgba(56, 189, 248, 0.3)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(barrierX, slitAY, radius, -Math.PI / 2.2, Math.PI / 2.2);
          ctx.stroke();
        }
      }

      if (hasSlitB) {
        for (let r = 0; r < numRipples; r++) {
          const radius = ((r * 16 + phase * 14) % maxDist);
          ctx.strokeStyle = whichWayDetector ? 'rgba(244, 63, 94, 0.3)' : 'rgba(168, 85, 247, 0.3)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(barrierX, slitBY, radius, -Math.PI / 2.2, Math.PI / 2.2);
          ctx.stroke();
        }
      }

      // 4. Which-Way Detector Visual Icon
      if (whichWayDetector) {
        ctx.fillStyle = '#f43f5e';
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(barrierX + 16, slitAY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Detector laser pointer line
        ctx.strokeStyle = '#f43f5e88';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(barrierX + 16, slitAY);
        ctx.lineTo(barrierX, slitAY);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 5. Target Screen Line
      ctx.fillStyle = '#334155';
      ctx.fillRect(screenX, 10, 4, h - 20);

      animationFrameRef.current = requestAnimationFrame(renderChamber);
    };

    animationFrameRef.current = requestAnimationFrame(renderChamber);

    return () => {
      isMounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [showWaveChamber, slitDistance, slitMode, whichWayDetector, isSimulating]);

  const handleReset = () => {
    setPhotonHits([]);
    setTotalPhotons(0);
    setIsRunning(false);
  };

  return (
    <div
      id="lab-double-slit"
      ref={containerRef}
      className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-8 flex flex-col gap-6 backdrop-blur-md shadow-2xl scroll-mt-28"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '750px' }}
    >
      {/* 1. Lab Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 rounded-lg text-xs font-mono font-bold">
            {t.labs.doubleSlit.badge}
          </span>
          <h3 className="text-xl lg:text-2xl font-black text-white mt-2">
            {t.labs.doubleSlit.title}
          </h3>
          <p className="text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
            {t.labs.doubleSlit.description}
          </p>
        </div>

        {/* Counter */}
        <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-mono">{t.labs.doubleSlit.photonsInteracted}</span>
            <span className="font-mono text-lg font-bold text-cyan-300">{totalPhotons.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 2. CHÚ THÍCH & ĐỊNH HƯỚNG QUAN SÁT (ĐỌC TRƯỚC KHI THỰC NGHIỆM) */}
      <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800/90 flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            {t.labs.doubleSlit.qftInsightTitle} & Hướng Dẫn Quan Sát
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed text-slate-300">
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-cyan-500/20 flex flex-col gap-2">
            <span className="font-bold text-cyan-300 flex items-center gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Bản Chất Trường QFT (Không Phải Viên Bi Chia Đôi)</span>
            </span>
            <p className="text-slate-300 leading-relaxed">
              {t.labs.doubleSlit.qftInsightBody}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-purple-500/20 flex flex-col gap-2">
            <span className="font-bold text-purple-300 flex items-center gap-1.5 text-xs">
              <Eye className="w-3.5 h-3.5 text-purple-400" />
              <span>Hiện Tượng Quan Trọng Cần Kiểm Chứng</span>
            </span>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li>
                <strong className="text-white">Bắn từng photon đơn lẻ:</strong> Mỗi hạt va chạm tại 1 điểm ngẫu nhiên, nhưng sau hàng trăm hạt sẽ tự tích lũy thành các vân giao thoa!
              </li>
              <li>
                <strong className="text-white">Bật cảm biến Which-Way:</strong> Khi đo photon đi qua khe nào, hiện tượng kết hợp pha bị phá hủy ngay lập tức, chuyển thành phân bố cổ điển.
              </li>
              <li>
                <strong className="text-white">Khoảng cách 2 khe (d):</strong> Càng xa nhau, các dải vân càng co cụm lại gần nhau hơn theo công thức $i = \lambda D / d$.
              </li>
            </ul>
          </div>
        </div>

        {/* Slit Distance Slider */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-800/60 text-xs">
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-300 font-medium">{t.labs.doubleSlit.slitDistanceLabel}:</span>
            <span className="font-mono text-cyan-300 font-bold">{slitDistance} μm</span>
          </div>
          <input
            type="range"
            min="20"
            max="60"
            value={slitDistance}
            onChange={(e) => {
              setSlitDistance(parseInt(e.target.value));
              handleReset();
            }}
            className="accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer flex-1 max-w-sm"
          />
        </div>
      </div>

      {/* Which-Way Active Alert Notice */}
      {whichWayDetector && (
        <div className="bg-rose-950/40 border border-rose-500/40 px-4 py-3 rounded-xl text-sm text-rose-300 flex items-center gap-2.5 leading-relaxed">
          <Eye className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{t.labs.doubleSlit.whichWayActiveNotice}</span>
        </div>
      )}

      {/* 3. KHU VỰC MÔ PHỎNG TƯƠNG TÁC */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Visualizer 1: Wavefront Propagation Chamber */}
        <div className="relative h-[280px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex flex-col items-center justify-center">
          <canvas
            ref={chamberCanvasRef}
            width={500}
            height={280}
            className="w-full h-full object-cover"
          />
          <button
            onClick={() => setShowWaveChamber(!showWaveChamber)}
            className="absolute top-3 left-3 text-[10px] font-mono text-cyan-300 bg-slate-900/80 hover:bg-slate-800 px-2 py-1 rounded-md border border-slate-800 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Waves className="w-3 h-3 text-cyan-400" />
            <span>{t.labs.doubleSlit.wavefrontToggle}</span>
          </button>
          {whichWayDetector && (
            <div className="absolute top-3 right-3 text-[10px] font-mono text-rose-300 bg-rose-950/80 px-2 py-1 rounded-md border border-rose-800 flex items-center gap-1">
              <Eye className="w-3 h-3 text-rose-400" />
              <span>Which-Way ON</span>
            </div>
          )}
        </div>

        {/* Visualizer 2: Detector Screen & |psi|^2 Density */}
        <div className="relative h-[280px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex flex-col items-center justify-center">
          <canvas
            ref={screenCanvasRef}
            width={500}
            height={280}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-1 rounded-md border border-slate-800 flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-purple-400" />
            <span>{t.labs.doubleSlit.detectorScreen}</span>
          </div>
          <div className="absolute bottom-3 right-3 text-[10px] font-mono text-purple-400 bg-slate-900/80 px-2 py-1 rounded-md border border-slate-800">
            {t.labs.doubleSlit.probabilityDensity}
          </div>
          {totalPhotons === 0 && (
            <div className="absolute text-center text-xs text-slate-500 pointer-events-none px-4">
              {t.labs.doubleSlit.emptyHint}
            </div>
          )}
        </div>
      </div>

      {/* 4. Bộ Điều Khiển Tương Tác */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Left: Fire Buttons */}
        <div className="md:col-span-6 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isRunning ? t.labs.doubleSlit.pauseFire : t.labs.doubleSlit.continuousFire}</span>
          </button>

          <button
            onClick={fireSinglePhoton}
            disabled={isRunning}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>{t.labs.doubleSlit.fireSingle}</span>
          </button>

          <button
            onClick={() => setFiringMode(firingMode === 'stream' ? 'single' : 'stream')}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium border border-slate-700 cursor-pointer"
          >
            {t.labs.doubleSlit.firingRate} {firingMode === 'stream' ? t.labs.doubleSlit.rateFast : t.labs.doubleSlit.rateSingle}
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title={t.labs.doubleSlit.clearTooltip}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Slit Config & Which-Way Toggle */}
        <div className="md:col-span-6 flex flex-wrap items-center justify-end gap-2.5">
          {/* Slit mode selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => {
                setSlitMode('both');
                handleReset();
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                slitMode === 'both' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.labs.doubleSlit.slitsBoth}
            </button>
            <button
              onClick={() => {
                setSlitMode('left');
                handleReset();
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                slitMode === 'left' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.labs.doubleSlit.slitLeftOnly}
            </button>
            <button
              onClick={() => {
                setSlitMode('right');
                handleReset();
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                slitMode === 'right' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.labs.doubleSlit.slitRightOnly}
            </button>
          </div>

          {/* Which-Way Detector Button */}
          <button
            onClick={() => {
              setWhichWayDetector(!whichWayDetector);
              handleReset();
            }}
            disabled={slitMode !== 'both'}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              whichWayDetector
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-md shadow-rose-500/20'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            } disabled:opacity-30`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{t.labs.doubleSlit.whichWayLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
