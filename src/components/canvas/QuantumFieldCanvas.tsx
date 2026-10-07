import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import type { FieldSettings } from '../../types/physics';
import { Play, Pause, RotateCcw, Plus, Sparkles, Info } from 'lucide-react';

interface QuantumFieldCanvasProps {
  settings: FieldSettings;
  onSettingsChange?: (newSettings: Partial<FieldSettings>) => void;
  className?: string;
}

interface PhotonPacket {
  id: number;
  x: number;
  y: number;
  energy: number;
  speed: number;
  wavelength: number;
  width: number;
  createdAt: number;
}

export const QuantumFieldCanvas: React.FC<QuantumFieldCanvasProps> = ({
  settings,
  onSettingsChange,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [photonList, setPhotonList] = useState<PhotonPacket[]>([]);
  const [clickImpacts, setClickImpacts] = useState<Array<{ x: number; y: number; time: number; amplitude: number }>>([]);
  const [inspectedEnergy, setInspectedEnergy] = useState<number>(0);

  // References to preserve Three.js state across renders
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const planeMeshRef = useRef<THREE.Mesh | null>(null);
  const particleGroupRef = useRef<THREE.Group | null>(null);
  const classicalBallsRef = useRef<THREE.Mesh[]>([]);

  // Camera Orbit state
  const isDraggingRef = useRef<boolean>(false);
  const prevMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraAngle = useRef<{ theta: number; phi: number; radius: number }>({
    theta: Math.PI / 4,
    phi: Math.PI / 3.4,
    radius: 34,
  });

  const lastTimeRef = useRef<number>(0);
  const elapsedTimeRef = useRef<number>(0);
  const lastEnergyUpdateRef = useRef<number>(0);

  // Inject a photon wave packet
  const handleInjectPhoton = useCallback(() => {
    const newPacket: PhotonPacket = {
      id: Date.now() + Math.random(),
      x: -16,
      y: (Math.random() - 0.5) * 6,
      energy: settings.photonEnergy || 1.5,
      speed: 7.0 * settings.speed,
      wavelength: 2.2 / (settings.waveFrequency || 1.2),
      width: 3.2,
      createdAt: elapsedTimeRef.current,
    };
    setPhotonList((prev) => [...prev.slice(-6), newPacket]); // giữ tối đa 7 photon đồng thời
  }, [settings.photonEnergy, settings.speed, settings.waveFrequency]);

  // Click on field to perturb
  const handleFieldClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mountRef.current || !cameraRef.current || !sceneRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);
    
    // Intersect with ground plane
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersectPoint = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(groundPlane, intersectPoint)) {
      setClickImpacts((prev) => [
        ...prev.slice(-4),
        {
          x: intersectPoint.x,
          y: intersectPoint.y,
          time: elapsedTimeRef.current,
          amplitude: 1.8 * settings.amplitude,
        },
      ]);
    }
  };

  // Setup Three.js Scene
  useEffect(() => {
    if (!mountRef.current) return;
    const mountNode = mountRef.current;

    const width = mountNode.clientWidth || 800;
    const height = mountNode.clientHeight || 580;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712);
    // Subtle fog that maintains depth without washing out the mesh
    scene.fog = new THREE.FogExp2(0x030712, 0.005);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    rendererRef.current = renderer;

    mountNode.appendChild(renderer.domElement);

    // Multi-point dynamic lighting
    const ambientLight = new THREE.AmbientLight(0xe0f2fe, 1.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 2.8);
    dirLight1.position.set(12, 28, 24);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa855f7, 2.2);
    dirLight2.position.set(-15, 20, -10);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x06b6d4, 4.0, 60);
    pointLight.position.set(0, 12, 8);
    scene.add(pointLight);

    // Subtle spatial reference grid
    const gridHelper = new THREE.GridHelper(36, 36, 0x0ea5e9, 0x1e293b);
    gridHelper.position.y = -5.5;
    scene.add(gridHelper);

    // Setup Mesh Field Grid (Plane with subdivisions)
    const gridSize = 32;
    const segments = 90;
    const geometry = new THREE.PlaneGeometry(gridSize, gridSize, segments, segments);
    
    // Store original positions for math calculations
    const posAttribute = geometry.attributes.position;
    const count = posAttribute.count;
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      colors[i * 3] = 0.05;     // R
      colors[i * 3 + 1] = 0.7;  // G
      colors[i * 3 + 2] = 0.95; // B
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Low metalness ensures vibrant vertex color diffusion
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      vertexColors: true,
      wireframe: settings.showWireframe,
      roughness: 0.35,
      metalness: 0.05,
      flatShading: true,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2.3; // Angle toward viewer
    scene.add(mesh);
    planeMeshRef.current = mesh;

    // Classical Newton Particles Group
    const classicalGroup = new THREE.Group();
    scene.add(classicalGroup);
    particleGroupRef.current = classicalGroup;

    const sphereGeo = new THREE.SphereGeometry(0.55, 24, 24);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.0,
      roughness: 0.2,
      metalness: 0.1,
    });

    const balls: THREE.Mesh[] = [];
    for (let i = 0; i < 8; i++) {
      const ball = new THREE.Mesh(sphereGeo, sphereMat);
      ball.position.set(-16 + i * 4, (Math.random() - 0.5) * 8, 2);
      classicalGroup.add(ball);
      balls.push(ball);
    }
    classicalBallsRef.current = balls;

    // Start with 1 photon in QFT mode
    setPhotonList([
      {
        id: 1,
        x: -12,
        y: 0,
        energy: 1.5,
        speed: 6.0,
        wavelength: 2.0,
        width: 3.5,
        createdAt: 0,
      },
    ]);

    // Handle Window & Container Resize with ResizeObserver
    const handleResize = () => {
      if (!mountNode || !renderer || !camera) return;
      const w = mountNode.clientWidth || 800;
      const h = mountNode.clientHeight || 580;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(mountNode);
    window.addEventListener('resize', handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (mountNode && renderer.domElement) {
        mountNode.removeChild(renderer.domElement);
      }
    };
  }, [settings.showWireframe]);

  // Update wireframe property when changed
  useEffect(() => {
    if (planeMeshRef.current) {
      (planeMeshRef.current.material as THREE.MeshStandardMaterial).wireframe = settings.showWireframe;
    }
  }, [settings.showWireframe]);

  // Main Render Loop
  useEffect(() => {
    let animationFrameId: number;

    const updateCameraPos = () => {
      if (!cameraRef.current) return;
      const { theta, phi, radius } = cameraAngle.current;
      const x = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.cos(theta);
      cameraRef.current.position.set(x, y, z);
      cameraRef.current.lookAt(0, -1, 0);
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isPlaying) {
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
        return;
      }

      const now = performance.now();
      const delta = Math.min((now - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = now;
      elapsedTimeRef.current += delta;
      const time = elapsedTimeRef.current;

      updateCameraPos();

      const isNewtonMode = settings.mode === 'classical-particle';
      const isMaxwellMode = settings.mode === 'classical-wave';
      const isQftMode = settings.mode === 'qft-field';

      // Visibility toggles
      if (particleGroupRef.current) {
        particleGroupRef.current.visible = isNewtonMode;
      }
      if (planeMeshRef.current) {
        planeMeshRef.current.visible = !isNewtonMode;
      }

      // Classical Newton ball animation
      if (isNewtonMode && classicalBallsRef.current.length > 0) {
        classicalBallsRef.current.forEach((ball, idx) => {
          ball.position.x += 0.15 * settings.speed;
          if (ball.position.x > 16) {
            ball.position.x = -16;
            ball.position.y = (Math.sin(idx * 1.5 + time) * 6);
          }
        });
      }

      // Wave Field Mesh Update (Maxwell or QFT mode)
      if (planeMeshRef.current && (!isNewtonMode)) {
        const geometry = planeMeshRef.current.geometry;
        const pos = geometry.attributes.position;
        const col = geometry.attributes.color;
        const count = pos.count;

        // Base frequency and wave speed
        const omega = (settings.waveFrequency || 1.2) * 3.5 * settings.speed;
        const kWave = 0.8;
        const baseAmp = settings.amplitude * 1.2;

        let totalCenterEnergy = 0;

        // If no photon wavepackets currently visible in QFT mode, provide recurring loop packet
        let activePackets = photonList;
        if (isQftMode && activePackets.length === 0) {
          const loopT = (time * 1.5) % 6.5;
          activePackets = [
            {
              id: 0,
              x: -16,
              y: 0,
              energy: settings.photonEnergy || 1.5,
              speed: 6.0 * settings.speed,
              wavelength: 2.2 / (settings.waveFrequency || 1.2),
              width: 3.2,
              createdAt: time - loopT,
            },
          ];
        }

        for (let i = 0; i < count; i++) {
          const x = pos.getX(i);
          const y = pos.getY(i);
          let z = 0;

          if (isMaxwellMode) {
            // Maxwell: Infinite continuous sinusoidal electromagnetic wave
            z = baseAmp * Math.sin(kWave * x - omega * time);
            // Add slight harmonic
            z += (baseAmp * 0.3) * Math.sin(kWave * 1.8 * x - omega * 1.8 * time + y * 0.3);
          } else if (isQftMode) {
            // QFT: Field Vacuum Fluctuations (Zero-Point Energy / quantum noise)
            if (settings.vacuumFluctuations) {
              const vacNoise1 = Math.sin(x * 1.6 + time * 4.2) * Math.cos(y * 1.8 - time * 3.7);
              const vacNoise2 = Math.sin(x * 3.1 - time * 5.9 + y * 2.7) * 0.45;
              const vacNoise3 = Math.cos(x * 0.7 + y * 1.3 + time * 2.1) * 0.3;
              z += (vacNoise1 + vacNoise2 + vacNoise3) * 0.28 * settings.amplitude;
            }

            // Click Disturbances (Field perturbations)
            clickImpacts.forEach((impact) => {
              const dt = time - impact.time;
              if (dt > 0 && dt < 4.5) {
                const dist = Math.hypot(x - impact.x, y - impact.y);
                const waveRadius = dt * 6.5;
                const ringDist = dist - waveRadius;
                const ripple = Math.exp(-(ringDist * ringDist) / 2.0) * Math.cos(dist * 2.5 - dt * 10);
                const decay = Math.exp(-dt * 0.8);
                z += ripple * impact.amplitude * decay;
              }
            });

            // Localized Photon Wave Packets
            activePackets.forEach((packet) => {
              const dt = time - packet.createdAt;
              const currentX = packet.x + dt * packet.speed;
              
              // Only compute if within visible field
              if (currentX > -22 && currentX < 22) {
                const dx = x - currentX;
                const dy = y - packet.y;
                const r2 = dx * dx + dy * dy;

                // Gaussian envelope + Carrier frequency
                const envelope = Math.exp(-r2 / (2 * packet.width * packet.width));
                const carrier = Math.cos((2 * Math.PI / packet.wavelength) * dx - (packet.speed * 2.5) * dt);

                z += envelope * carrier * (baseAmp * 2.6 * packet.energy);
              }
            });
          }

          pos.setZ(i, z);

          // Calculate energy density at center for inspector
          if (Math.abs(x) < 1.0 && Math.abs(y) < 1.0) {
            totalCenterEnergy += Math.abs(z);
          }

          // Dynamic Color Grading based on height z (Excitation intensity)
          const normZ = Math.max(-1, Math.min(1, z / (baseAmp * 2.2 + 0.1)));
          const intensity = Math.abs(normZ);

          if (settings.colorScheme === 'quantum-cyan') {
            // Neon cyan to purple with glowing crests
            if (z > 0.4) {
              // Wave crest: glowing cyan-white
              col.setXYZ(i, 0.2 + intensity * 0.75, 0.85 + intensity * 0.15, 1.0);
            } else if (z < -0.3) {
              // Wave trough: deep electric violet
              col.setXYZ(i, 0.55 + intensity * 0.45, 0.15, 0.95);
            } else {
              // Baseline / vacuum: bright tech cyan
              col.setXYZ(i, 0.05 + intensity * 0.2, 0.65 + (1 - intensity) * 0.25, 0.95);
            }
          } else if (settings.colorScheme === 'energy-amber') {
            // Golden amber to incandescent orange
            if (z > 0.4) {
              col.setXYZ(i, 1.0, 0.9, 0.3 + intensity * 0.5);
            } else {
              col.setXYZ(i, 0.95, 0.45 + (1 - intensity) * 0.35, 0.05 + intensity * 0.2);
            }
          } else {
            // Violet electric
            if (z > 0.4) {
              col.setXYZ(i, 0.95, 0.6, 1.0);
            } else {
              col.setXYZ(i, 0.65 + intensity * 0.35, 0.15 + (1 - intensity) * 0.25, 0.98);
            }
          }
        }

        pos.needsUpdate = true;
        col.needsUpdate = true;
        geometry.computeVertexNormals();

        // Throttle state update to avoid re-rendering every frame (60fps -> ~10fps)
        if (time - lastEnergyUpdateRef.current > 0.1) {
          lastEnergyUpdateRef.current = time;
          setInspectedEnergy(totalCenterEnergy / 12);
        }
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, settings, photonList, clickImpacts]);

  // Mouse Orbit Camera Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    isDraggingRef.current = true;
    prevMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - prevMousePos.current.x;
    const deltaY = e.clientY - prevMousePos.current.y;
    prevMousePos.current = { x: e.clientX, y: e.clientY };

    cameraAngle.current.theta -= deltaX * 0.008;
    cameraAngle.current.phi = Math.max(
      0.2,
      Math.min(Math.PI / 2.05, cameraAngle.current.phi - deltaY * 0.008)
    );
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    cameraAngle.current.radius = Math.max(
      15,
      Math.min(65, cameraAngle.current.radius + e.deltaY * 0.03)
    );
  };

  const handleResetCamera = () => {
    cameraAngle.current = {
      theta: Math.PI / 4,
      phi: Math.PI / 3.2,
      radius: 36,
    };
  };

  return (
    <div
      className={`relative w-full h-[580px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl select-none group ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onDoubleClick={handleFieldClick}
    >
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating HUD Header */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="flex items-center gap-3 bg-slate-900/85 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700/60 pointer-events-auto shadow-lg">
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full animate-ping ${
                settings.mode === 'qft-field'
                  ? 'bg-cyan-400'
                  : settings.mode === 'classical-wave'
                  ? 'bg-purple-400'
                  : 'bg-amber-400'
              }`}
            />
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-300">
              {settings.mode === 'qft-field'
                ? 'Trường Lượng Tử (QFT Mode)'
                : settings.mode === 'classical-wave'
                ? 'Sóng Điện Từ (Maxwell Mode)'
                : 'Hạt Cơ Học (Newton Corpuscular)'}
            </span>
          </div>

          <div className="h-4 w-px bg-slate-700 mx-1" />

          <span className="text-xs text-slate-400">
            {settings.mode === 'qft-field'
              ? 'Photon = Dao động trường'
              : settings.mode === 'classical-wave'
              ? 'Sóng E & B liên tục'
              : 'Viên bi bắn theo đường đạn'}
          </span>
        </div>

        {/* Top-Right Quick Stats */}
        <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 pointer-events-auto text-xs text-slate-300">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Năng lượng điểm (x=0):</span>
          <span className="font-mono text-cyan-300 font-bold">
            {inspectedEnergy.toFixed(2)} ℏω
          </span>
        </div>
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left Action Buttons */}
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/60 shadow-xl">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1.5 text-xs font-medium"
            title={isPlaying ? 'Tạm dừng' : 'Tiếp tục'}
          >
            {isPlaying ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
            <span>{isPlaying ? 'Tạm dừng' : 'Chạy'}</span>
          </button>

          <button
            onClick={handleResetCamera}
            className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1 text-xs font-medium"
            title="Đặt lại góc nhìn camera"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span>Góc nhìn</span>
          </button>

          {settings.mode === 'qft-field' && (
            <button
              onClick={handleInjectPhoton}
              className="px-3.5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5 text-xs animate-pulse"
              title="Kích thích trường tạo một photon mới"
            >
              <Plus className="w-4 h-4" />
              <span>Phát 1 Photon (a†|0⟩)</span>
            </button>
          )}
        </div>

        {/* Interactive Tip Banner */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-slate-900/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-800">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>Kéo chuột để xoay 360° | Cuộn chuột để zoom | Nhấp đúp vào mặt lưới để tạo sóng</span>
        </div>

        {/* Right Toggle Controls */}
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/60 shadow-xl text-xs">
          {settings.mode === 'qft-field' && (
            <button
              onClick={() =>
                onSettingsChange?.({
                  vacuumFluctuations: !settings.vacuumFluctuations,
                })
              }
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                settings.vacuumFluctuations
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Bật/Tắt dao động chân không lượng tử"
            >
              Nhiễu chân không: {settings.vacuumFluctuations ? 'BẬT' : 'TẮT'}
            </button>
          )}

          <button
            onClick={() =>
              onSettingsChange?.({
                showWireframe: !settings.showWireframe,
              })
            }
            className={`px-3 py-2 rounded-lg font-medium transition-colors ${
              settings.showWireframe
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Bật/Tắt hiển thị lưới dây"
          >
            Lưới wireframe
          </button>
        </div>
      </div>
    </div>
  );
};
