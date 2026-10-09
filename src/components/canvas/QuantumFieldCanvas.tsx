import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import type { FieldSettings } from '../../types/physics';
import { Play, Pause, RotateCcw, Plus, Sparkles, Info } from 'lucide-react';
import { useLanguage } from '../../i18n';

interface QuantumFieldCanvasProps {
  settings: FieldSettings;
  onSettingsChange?: (newSettings: Partial<FieldSettings>) => void;
  className?: string;
  triggerInjectPhoton?: number;
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

interface ClickImpact {
  x: number;
  y: number;
  time: number;
  amplitude: number;
}

interface RippleMarker {
  mesh: THREE.Mesh;
  startTime: number;
  duration: number;
  maxScale: number;
}

export function getFieldSpectrumColors(freq: number) {
  const f = Math.max(0.4, Math.min(3.0, freq || 0.6));
  let crest: [number, number, number];
  let mid: [number, number, number];
  let trough: [number, number, number];
  let ringColor: number;

  if (f <= 0.6) {
    // 0.4 PHz (Amber/Red, ~1.66 eV) to 0.6 PHz (Quantum Cyan, ~2.48 eV)
    const t = (f - 0.4) / 0.2;
    crest = [1.0 - t * 0.8, 0.85 + t * 0.1, 0.2 + t * 0.8];
    mid = [0.95 - t * 0.9, 0.45 + t * 0.2, 0.05 + t * 0.9];
    trough = [0.6 - t * 0.15, 0.1 + t * 0.05, 0.05 + t * 0.9];
    ringColor = t < 0.5 ? 0xfbbf24 : 0x38bdf8;
  } else if (f <= 0.9) {
    // 0.6 PHz (Quantum Cyan, ~2.48 eV) to 0.9 PHz (Electric Violet, ~3.72 eV)
    const t = (f - 0.6) / 0.3;
    crest = [0.2 + t * 0.65, 0.95 - t * 0.45, 1.0];
    mid = [0.05 + t * 0.55, 0.65 - t * 0.5, 0.95 + t * 0.03];
    trough = [0.45 - t * 0.15, 0.15 - t * 0.1, 0.95 - t * 0.25];
    ringColor = t < 0.5 ? 0x38bdf8 : 0xa855f7;
  } else {
    // 0.9 PHz (Electric Violet) to 3.0 PHz (Extreme Ultraviolet / Magenta, ~12.4 eV)
    const t = Math.min(1, (f - 0.9) / 2.1);
    crest = [0.85 + t * 0.13, 0.5 - t * 0.15, 1.0 - t * 0.05];
    mid = [0.6 + t * 0.15, 0.15 - t * 0.07, 0.98];
    trough = [0.3 + t * 0.05, 0.05 - t * 0.03, 0.7 - t * 0.05];
    ringColor = t < 0.5 ? 0xa855f7 : 0xd946ef;
  }

  return { crest, mid, trough, ringColor };
}

export const QuantumFieldCanvas: React.FC<QuantumFieldCanvasProps> = ({
  settings,
  onSettingsChange,
  className = '',
  triggerInjectPhoton,
}) => {
  const { t } = useLanguage();
  const mountRef = useRef<HTMLDivElement>(null);
  const energyDisplayRef = useRef<HTMLSpanElement>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [photonList, setPhotonList] = useState<PhotonPacket[]>([]);

  // Refs for high-performance animation loop (avoiding loop teardown & re-renders)
  const isPlayingRef = useRef<boolean>(true);
  const settingsRef = useRef<FieldSettings>(settings);
  const photonListRef = useRef<PhotonPacket[]>([]);
  const clickImpactsRef = useRef<ClickImpact[]>([]);
  const basePositionsRef = useRef<Float32Array | null>(null);
  const rippleMarkersRef = useRef<RippleMarker[]>([]);

  // Synchronize state and props to refs
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    photonListRef.current = photonList;
  }, [photonList]);

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const planeMeshRef = useRef<THREE.Mesh | null>(null);
  const particleGroupRef = useRef<THREE.Group | null>(null);
  const classicalBallsRef = useRef<THREE.Mesh[]>([]);

  // Camera Orbit state
  const isDraggingRef = useRef<boolean>(false);
  const dragDistanceRef = useRef<number>(0);
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
    const curSettings = settingsRef.current;
    const newPacket: PhotonPacket = {
      id: Date.now() + Math.random(),
      x: -16,
      y: (Math.random() - 0.5) * 6,
      energy: curSettings.photonEnergy || 1.5,
      speed: 7.0 * curSettings.speed,
      wavelength: 2.2 / (curSettings.waveFrequency || 1.2),
      width: 3.2,
      createdAt: elapsedTimeRef.current,
    };
    setPhotonList((prev) => {
      const updated = [...prev.slice(-6), newPacket];
      photonListRef.current = updated;
      return updated;
    });
  }, []);

  // Watch for external photon injection trigger (e.g. from Guided Tour)
  useEffect(() => {
    if (triggerInjectPhoton && triggerInjectPhoton > 0) {
      handleInjectPhoton();
    }
  }, [triggerInjectPhoton, handleInjectPhoton]);

  // Trigger field excitation at exact local grid coordinates (x, y)
  const triggerFieldExcitation = useCallback((localX: number, localY: number) => {
    const curSettings = settingsRef.current;
    const now = elapsedTimeRef.current;

    // Record impact for wave equation
    const newImpact: ClickImpact = {
      x: localX,
      y: localY,
      time: now,
      amplitude: 2.2 * curSettings.amplitude,
    };
    clickImpactsRef.current = [...clickImpactsRef.current.slice(-5), newImpact];

    // Visual ripple ring feedback on grid
    if (planeMeshRef.current) {
      const ringGeo = new THREE.RingGeometry(0.15, 0.4, 32);
      const { ringColor } = getFieldSpectrumColors(curSettings.waveFrequency || 0.6);
      const ringMat = new THREE.MeshBasicMaterial({
        color: ringColor,
        transparent: true,
        opacity: 0.95,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.set(localX, localY, 0.08); // Float slightly above the plane
      planeMeshRef.current.add(ringMesh);

      rippleMarkersRef.current.push({
        mesh: ringMesh,
        startTime: now,
        duration: 1.2,
        maxScale: 10,
      });
    }
  }, []);

  // Handle double-click on field to perturb with 100% precision
  const handleFieldDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mountRef.current || !cameraRef.current || !planeMeshRef.current) return;

    // Ignore if user was dragging camera
    if (dragDistanceRef.current > 6) return;

    const rect = mountRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);

    const mesh = planeMeshRef.current;
    mesh.updateMatrixWorld();

    // Transform ray into local space of the plane mesh
    const inverseMatrix = mesh.matrixWorld.clone().invert();
    const localRay = raycaster.ray.clone().applyMatrix4(inverseMatrix);

    // In PlaneGeometry's local space, the unperturbed grid lies exactly on z = 0 with normal (0, 0, 1)
    const localPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const localIntersect = new THREE.Vector3();

    if (localRay.intersectPlane(localPlane, localIntersect)) {
      const halfSize = 16; // Grid 32x32 spans -16 to +16
      if (Math.abs(localIntersect.x) <= halfSize && Math.abs(localIntersect.y) <= halfSize) {
        triggerFieldExcitation(localIntersect.x, localIntersect.y);
      }
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

    // Lighting
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

    // Reference Grid
    const gridHelper = new THREE.GridHelper(36, 36, 0x0ea5e9, 0x1e293b);
    gridHelper.position.y = -5.5;
    scene.add(gridHelper);

    // Mesh Field Grid (Plane with subdivisions)
    const gridSize = 32;
    const segments = 90;
    const geometry = new THREE.PlaneGeometry(gridSize, gridSize, segments, segments);

    // Cache unperturbed base vertex positions (x, y) for ultra-fast loop
    const posAttribute = geometry.attributes.position;
    const count = posAttribute.count;
    const baseCoords = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      baseCoords[i * 2] = posAttribute.getX(i);
      baseCoords[i * 2 + 1] = posAttribute.getY(i);
    }
    basePositionsRef.current = baseCoords;

    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      colors[i * 3] = 0.05;     // R
      colors[i * 3 + 1] = 0.7;  // G
      colors[i * 3 + 2] = 0.95; // B
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      vertexColors: true,
      wireframe: settingsRef.current.showWireframe,
      roughness: 0.35,
      metalness: 0.05,
      flatShading: true,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2.3; // Tilt toward camera
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

    // Initial photon packet in QFT mode
    const initialPacket: PhotonPacket = {
      id: 1,
      x: -12,
      y: 0,
      energy: 1.5,
      speed: 6.0,
      wavelength: 2.0,
      width: 3.5,
      createdAt: 0,
    };
    setPhotonList([initialPacket]);
    photonListRef.current = [initialPacket];

    // Responsive container resize observer
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

    return () => {
      resizeObserver.disconnect();
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      sphereGeo.dispose();
      sphereMat.dispose();
      if (mountNode && renderer.domElement) {
        mountNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update wireframe property without recreating geometry or scene
  useEffect(() => {
    if (planeMeshRef.current) {
      (planeMeshRef.current.material as THREE.MeshStandardMaterial).wireframe = settings.showWireframe;
    }
  }, [settings.showWireframe]);

  // Main High-Performance Render Loop
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

      if (!isPlayingRef.current) {
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
        return;
      }

      const curSettings = settingsRef.current;
      const now = performance.now();
      const delta = Math.min((now - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = now;
      elapsedTimeRef.current += delta;
      const time = elapsedTimeRef.current;

      updateCameraPos();

      const isNewtonMode = curSettings.mode === 'classical-particle';
      const isMaxwellMode = curSettings.mode === 'classical-wave';
      const isQftMode = curSettings.mode === 'qft-field';

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
          ball.position.x += 0.15 * curSettings.speed;
          if (ball.position.x > 16) {
            ball.position.x = -16;
            ball.position.y = Math.sin(idx * 1.5 + time) * 6;
          }
        });
      }

      // Update ripple markers
      const activeMarkers: RippleMarker[] = [];
      const markers = rippleMarkersRef.current;
      for (let m = 0; m < markers.length; m++) {
        const marker = markers[m];
        const age = time - marker.startTime;
        if (age < marker.duration) {
          const progress = age / marker.duration;
          const currentScale = 1 + progress * marker.maxScale;
          marker.mesh.scale.set(currentScale, currentScale, 1);
          (marker.mesh.material as THREE.MeshBasicMaterial).opacity = (1 - progress) * 0.9;
          activeMarkers.push(marker);
        } else {
          // Dispose expired marker
          if (planeMeshRef.current) {
            planeMeshRef.current.remove(marker.mesh);
          }
          marker.mesh.geometry.dispose();
          (marker.mesh.material as THREE.Material).dispose();
        }
      }
      rippleMarkersRef.current = activeMarkers;

      // Wave Field Mesh Update (Maxwell or QFT mode)
      if (planeMeshRef.current && !isNewtonMode && basePositionsRef.current) {
        const mesh = planeMeshRef.current;
        const geometry = mesh.geometry;
        const pos = geometry.attributes.position;
        const col = geometry.attributes.color;
        const count = pos.count;
        const posArray = pos.array as Float32Array;
        const colArray = col.array as Float32Array;
        const baseCoords = basePositionsRef.current;

        // Base frequency and wave parameters
        const omega = (curSettings.waveFrequency || 1.2) * 3.5 * curSettings.speed;
        const kWave = 0.8;
        const baseAmp = curSettings.amplitude * 1.2;

        let totalCenterEnergy = 0;

        // Pre-filter active wavepackets
        let activePackets = photonListRef.current;
        if (isQftMode && activePackets.length === 0) {
          const loopT = (time * 1.5) % 6.5;
          activePackets = [
            {
              id: 0,
              x: -16,
              y: 0,
              energy: curSettings.photonEnergy || 1.5,
              speed: 6.0 * curSettings.speed,
              wavelength: 2.2 / (curSettings.waveFrequency || 1.2),
              width: 3.2,
              createdAt: time - loopT,
            },
          ];
        }

        // Pre-filter valid packets within visible bounds
        const validPackets: Array<{
          currentX: number;
          y: number;
          speed: number;
          wavelength: number;
          width: number;
          amplitudeFactor: number;
          dt: number;
        }> = [];

        if (isQftMode) {
          for (let p = 0; p < activePackets.length; p++) {
            const packet = activePackets[p];
            const dt = time - packet.createdAt;
            const currentX = packet.x + dt * packet.speed;
            if (currentX > -22 && currentX < 22) {
              validPackets.push({
                currentX,
                y: packet.y,
                speed: packet.speed,
                wavelength: packet.wavelength,
                width: packet.width,
                amplitudeFactor: baseAmp * 2.6 * packet.energy,
                dt,
              });
            }
          }
        }

        // Pre-filter active click impacts to eliminate dead impacts before vertex loop
        const activeImpacts: Array<{
          x: number;
          y: number;
          dt: number;
          waveRadius: number;
          decayedAmp: number;
        }> = [];

        if (isQftMode) {
          const rawImpacts = clickImpactsRef.current;
          for (let k = 0; k < rawImpacts.length; k++) {
            const imp = rawImpacts[k];
            const dt = time - imp.time;
            if (dt > 0 && dt < 4.5) {
              activeImpacts.push({
                x: imp.x,
                y: imp.y,
                dt,
                waveRadius: dt * 6.5,
                decayedAmp: imp.amplitude * Math.exp(-dt * 0.8),
              });
            }
          }
        }

        const hasVacuum = isQftMode && curSettings.vacuumFluctuations;
        const invNormZFactor = 1 / (baseAmp * 2.2 + 0.1);
        const { crest, mid, trough } = getFieldSpectrumColors(curSettings.waveFrequency || 0.6);

        // Highly-optimized hot loop across all vertices using direct typed arrays
        for (let i = 0; i < count; i++) {
          const x = baseCoords[i * 2];
          const y = baseCoords[i * 2 + 1];
          let z = 0;

          if (isMaxwellMode) {
            z = baseAmp * Math.sin(kWave * x - omega * time);
            z += (baseAmp * 0.3) * Math.sin(kWave * 1.8 * x - omega * 1.8 * time + y * 0.3);
          } else if (isQftMode) {
            // Vacuum fluctuations
            if (hasVacuum) {
              const vacNoise1 = Math.sin(x * 1.6 + time * 4.2) * Math.cos(y * 1.8 - time * 3.7);
              const vacNoise2 = Math.sin(x * 3.1 - time * 5.9 + y * 2.7) * 0.45;
              const vacNoise3 = Math.cos(x * 0.7 + y * 1.3 + time * 2.1) * 0.3;
              z += (vacNoise1 + vacNoise2 + vacNoise3) * 0.28 * curSettings.amplitude;
            }

            // Click Disturbances (Accurate localized ripples)
            for (let k = 0; k < activeImpacts.length; k++) {
              const imp = activeImpacts[k];
              const dx = x - imp.x;
              const dy = y - imp.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const ringDist = dist - imp.waveRadius;
              const ripple = Math.exp(-(ringDist * ringDist) * 0.5) * Math.cos(dist * 2.5 - imp.dt * 10);
              z += ripple * imp.decayedAmp;
            }

            // Localized Photon Wave Packets
            for (let p = 0; p < validPackets.length; p++) {
              const packet = validPackets[p];
              const dx = x - packet.currentX;
              const dy = y - packet.y;
              const r2 = dx * dx + dy * dy;

              const envelope = Math.exp(-r2 / (2 * packet.width * packet.width));
              const carrier = Math.cos((2 * Math.PI / packet.wavelength) * dx - (packet.speed * 2.5) * packet.dt);
              z += envelope * carrier * packet.amplitudeFactor;
            }
          }

          // Direct typed array write for z position
          posArray[i * 3 + 2] = z;

          if (Math.abs(x) < 1.0 && Math.abs(y) < 1.0) {
            totalCenterEnergy += Math.abs(z);
          }

          // Dynamic spectral vertex color grading matching excitation energy level
          const normZ = Math.max(-1, Math.min(1, z * invNormZFactor));
          const intensity = Math.abs(normZ);
          const cIndex = i * 3;

          if (z > 0.4) {
            colArray[cIndex] = Math.min(1, crest[0] + intensity * (1 - crest[0]) * 0.5);
            colArray[cIndex + 1] = Math.min(1, crest[1] + intensity * (1 - crest[1]) * 0.5);
            colArray[cIndex + 2] = Math.min(1, crest[2] + intensity * (1 - crest[2]) * 0.5);
          } else if (z < -0.3) {
            colArray[cIndex] = trough[0] * (1 - intensity * 0.2);
            colArray[cIndex + 1] = trough[1] * (1 - intensity * 0.2);
            colArray[cIndex + 2] = trough[2] * (1 - intensity * 0.2);
          } else {
            colArray[cIndex] = mid[0] * 0.85 + intensity * 0.15;
            colArray[cIndex + 1] = mid[1] * 0.85 + (1 - intensity) * 0.15;
            colArray[cIndex + 2] = mid[2] * 0.85 + intensity * 0.15;
          }
        }

        pos.needsUpdate = true;
        col.needsUpdate = true;

        // Zero-lag Direct DOM Update for HUD Inspector (completely avoids React re-render overhead)
        if (time - lastEnergyUpdateRef.current > 0.1) {
          lastEnergyUpdateRef.current = time;
          const energyValue = (totalCenterEnergy / 12).toFixed(2);
          if (energyDisplayRef.current) {
            energyDisplayRef.current.textContent = `${energyValue} ℏω`;
          }
        }
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Mouse Orbit Camera Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    isDraggingRef.current = true;
    dragDistanceRef.current = 0;
    prevMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - prevMousePos.current.x;
    const deltaY = e.clientY - prevMousePos.current.y;
    dragDistanceRef.current += Math.abs(deltaX) + Math.abs(deltaY);
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
      onDoubleClick={handleFieldDoubleClick}
    >
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating HUD Header */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl border border-cyan-500/40 pointer-events-auto shadow-lg shadow-cyan-950/40">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400" />
            <span className="text-xs uppercase tracking-wider font-bold text-cyan-300 font-mono">
              {t.canvas.hudBadge}
            </span>
          </div>

          <div className="h-4 w-px bg-slate-700 mx-1" />

          <span className="text-xs text-slate-300 font-medium">
            {t.canvas.hudSub}
          </span>
        </div>

        {/* Top-Right Quick Stats */}
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/60 pointer-events-auto text-xs text-slate-300 shadow-md">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{t.canvas.pointEnergyDensity}</span>
          <span ref={energyDisplayRef} className="font-mono text-cyan-300 font-bold">
            0.00 ℏω
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
            title={isPlaying ? t.canvas.pause : t.canvas.play}
          >
            {isPlaying ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
            <span>{isPlaying ? t.canvas.pause : t.canvas.play}</span>
          </button>

          <button
            onClick={handleResetCamera}
            className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1 text-xs font-medium"
            title={t.canvas.resetViewTitle}
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span>{t.canvas.resetView}</span>
          </button>

          {settings.mode === 'qft-field' && (
            <button
              onClick={handleInjectPhoton}
              className="px-3.5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5 text-xs animate-pulse"
              title={t.canvas.injectPhotonTitle}
            >
              <Plus className="w-4 h-4" />
              <span>{t.canvas.injectPhoton}</span>
            </button>
          )}
        </div>

        {/* Interactive Tip Banner */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-slate-900/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-800">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>{t.canvas.orbitHint}</span>
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
              title={t.canvas.vacuumNoiseTitle}
            >
              {t.canvas.vacuumNoise} {settings.vacuumFluctuations ? t.controls.vacuumOn : t.controls.vacuumOff}
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
            title={t.canvas.wireframeTitle}
          >
            {t.canvas.wireframe}
          </button>
        </div>
      </div>
    </div>
  );
};

