import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Zap, Sparkles } from 'lucide-react';
import { useLanguage } from '../../i18n';

interface HitPoint {
  x: number;
  y: number;
  id: number;
}

export const DoubleSlitLab: React.FC = () => {
  const { t } = useLanguage();
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [photonHits, setPhotonHits] = useState<HitPoint[]>([]);
  const [totalPhotons, setTotalPhotons] = useState<number>(0);
  const [firingMode, setFiringMode] = useState<'single' | 'stream'>('stream');
  const [slitDistance, setSlitDistance] = useState<number>(35); // khoảng cách khe
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Probability distribution for double slit interference:
  // I(theta) = cos^2(pi * d * sin(theta) / lambda) * sinc^2(pi * a * sin(theta) / lambda)
  const sampleInterferencePoint = useCallback((width: number, height: number): { x: number; y: number } => {
    // Rejection sampling
    const lambda = 12;
    const d = slitDistance;
    const a = 8; // slit width

    for (let attempts = 0; attempts < 100; attempts++) {
      const screenX = (Math.random() - 0.5) * (width * 0.85);
      const theta = screenX / 250; // angle approximation

      const beta = (Math.PI * d * Math.sin(theta)) / lambda;
      const alpha = (Math.PI * a * Math.sin(theta)) / lambda;

      const sinc = alpha === 0 ? 1 : Math.sin(alpha) / alpha;
      const intensity = Math.pow(Math.cos(beta), 2) * Math.pow(sinc, 2);

      if (Math.random() < intensity) {
        return {
          x: width / 2 + screenX,
          y: height / 2 + (Math.random() - 0.5) * (height * 0.75),
        };
      }
    }
    return { x: width / 2, y: height / 2 };
  }, [slitDistance]);

  const fireSinglePhoton = () => {
    if (!canvasRef.current) return;
    const w = canvasRef.current.width;
    const h = canvasRef.current.height;
    const hit = sampleInterferencePoint(w, h);
    setPhotonHits((prev) => [...prev.slice(-2500), { ...hit, id: Math.random() }]);
    setTotalPhotons((c) => c + 1);
  };

  // Auto fire loop
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      if (!canvasRef.current) return;
      const w = canvasRef.current.width;
      const h = canvasRef.current.height;
      const newBatch: HitPoint[] = [];
      const batchSize = firingMode === 'stream' ? 12 : 1;

      for (let i = 0; i < batchSize; i++) {
        const hit = sampleInterferencePoint(w, h);
        newBatch.push({ ...hit, id: Math.random() });
      }

      setPhotonHits((prev) => [...prev.slice(-3000), ...newBatch]);
      setTotalPhotons((c) => c + batchSize);
    }, firingMode === 'stream' ? 40 : 250);

    return () => clearInterval(interval);
  }, [isRunning, firingMode, sampleInterferencePoint]);

  // Render on 2D Screen Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < canvas.width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Center vertical marker
    ctx.strokeStyle = '#06b6d433';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw detected photon spots
    photonHits.forEach((p) => {
      ctx.fillStyle = 'rgba(6, 182, 212, 0.45)';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;

    // Intensity histogram bar at the bottom
    const bins = 60;
    const binCounts = new Array(bins).fill(0);
    const binWidth = canvas.width / bins;

    photonHits.forEach((p) => {
      const binIdx = Math.floor(p.x / binWidth);
      if (binIdx >= 0 && binIdx < bins) {
        binCounts[binIdx]++;
      }
    });

    const maxCount = Math.max(...binCounts, 1);
    ctx.fillStyle = 'rgba(168, 85, 247, 0.5)';
    binCounts.forEach((count, idx) => {
      const barHeight = (count / maxCount) * 50;
      ctx.fillRect(idx * binWidth, canvas.height - barHeight, binWidth - 1, barHeight);
    });
  }, [photonHits]);

  const handleReset = () => {
    setPhotonHits([]);
    setTotalPhotons(0);
    setIsRunning(false);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-8 flex flex-col gap-6 backdrop-blur-md shadow-2xl">
      {/* Lab Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 rounded-lg text-xs font-mono font-bold">
            {t.labs.doubleSlit.badge}
          </span>
          <h3 className="text-xl lg:text-2xl font-black text-white mt-2">
            {t.labs.doubleSlit.title}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
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

      {/* Screen Canvas Visualizer */}
      <div className="relative w-full h-[320px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex flex-col items-center justify-center">
        <canvas
          ref={canvasRef}
          width={800}
          height={320}
          className="w-full h-full object-cover"
        />

        {/* Screen overlay labels */}
        <div className="absolute top-3 left-4 text-[11px] font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
          {t.labs.doubleSlit.detectorScreen}
        </div>

        <div className="absolute bottom-3 right-4 text-[10px] font-mono text-purple-400 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
          {t.labs.doubleSlit.probabilityDensity}
        </div>

        {totalPhotons === 0 && (
          <div className="absolute text-center text-xs text-slate-500 pointer-events-none">
            {t.labs.doubleSlit.emptyHint}
          </div>
        )}
      </div>

      {/* Controls & Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-6 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
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
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 disabled:opacity-40"
          >
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>{t.labs.doubleSlit.fireSingle}</span>
          </button>

          <button
            onClick={() => setFiringMode(firingMode === 'stream' ? 'single' : 'stream')}
            className="px-3 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700"
            title="Tốc độ bắn"
          >
            {t.labs.doubleSlit.firingRate} {firingMode === 'stream' ? t.labs.doubleSlit.rateFast : t.labs.doubleSlit.rateSingle}
          </button>

          <button
            onClick={handleReset}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title={t.labs.doubleSlit.clearTooltip}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="md:col-span-6 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{t.labs.doubleSlit.slitDistanceLabel}</span>
            <span className="font-mono text-cyan-300">{slitDistance} μm</span>
            <input
              type="range"
              min="20"
              max="60"
              value={slitDistance}
              onChange={(e) => {
                setSlitDistance(parseInt(e.target.value));
                setPhotonHits([]);
                setTotalPhotons(0);
              }}
              className="accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer ml-2"
            />
          </div>
          <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.labs.doubleSlit.qftInsightTitle}</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-300">
            {t.labs.doubleSlit.qftInsightBody}
          </p>
        </div>
      </div>
    </div>
  );
};
