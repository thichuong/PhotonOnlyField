import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface MiniWaveCanvasProps {
  className?: string;
  type?: 'interference' | 'plane-wave';
}

export const MiniWaveCanvas: React.FC<MiniWaveCanvasProps> = ({
  className = '',
  type = 'interference',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 220;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050811);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 10, 14);
    camera.lookAt(0, -1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 2.0);
    dirLight.position.set(5, 12, 8);
    scene.add(dirLight);

    // Mesh mặt sóng dao động
    const gridSegX = 64;
    const gridSegY = 48;
    const planeGeo = new THREE.PlaneGeometry(16, 12, gridSegX, gridSegY);

    const colors = new Float32Array(planeGeo.attributes.position.count * 3);
    for (let i = 0; i < planeGeo.attributes.position.count; i++) {
      colors[i * 3] = 0.1;
      colors[i * 3 + 1] = 0.6;
      colors[i * 3 + 2] = 0.9;
    }
    planeGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const planeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      vertexColors: true,
      wireframe: false,
      roughness: 0.3,
      metalness: 0.1,
      flatShading: true,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.rotation.x = -Math.PI / 2.2;
    scene.add(mesh);

    const originalPositions = Float32Array.from(planeGeo.attributes.position.array);

    let animationId: number;
    let isVisible = true;
    let elapsedTime = 0;
    let lastTime = performance.now();

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    observer.observe(container);

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      elapsedTime += delta;

      const posAttr = planeGeo.attributes.position;
      const colAttr = planeGeo.attributes.color;
      const count = posAttr.count;

      const omega = 4.0;
      const k = 1.8;

      for (let i = 0; i < count; i++) {
        const ox = originalPositions[i * 3];
        const oy = originalPositions[i * 3 + 1];

        let z = 0;

        if (type === 'interference') {
          // Giao thoa 2 nguồn sóng cách nhau d = 3
          const s1Dist = Math.sqrt((ox + 2.5) * (ox + 2.5) + oy * oy);
          const s2Dist = Math.sqrt((ox - 2.5) * (ox - 2.5) + oy * oy);

          const wave1 = Math.sin(k * s1Dist - omega * elapsedTime) / (1 + 0.15 * s1Dist);
          const wave2 = Math.sin(k * s2Dist - omega * elapsedTime) / (1 + 0.15 * s2Dist);
          z = (wave1 + wave2) * 0.7;
        } else {
          // Sóng phẳng lan truyền dọc theo trục x
          z = Math.sin(ox * 1.4 - omega * elapsedTime) * 0.9;
        }

        posAttr.setZ(i, z);

        // Biến thiên màu sắc theo biên độ dao động
        const normZ = (z + 1.2) / 2.4;
        const r = 0.05 + 0.15 * normZ;
        const g = 0.3 + 0.5 * normZ;
        const b = 0.6 + 0.4 * normZ;

        colAttr.setXYZ(i, r, g, b);
      }

      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
      planeGeo.computeVertexNormals();

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      planeGeo.dispose();
      planeMat.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [type]);

  return (
    <div className={`relative rounded-xl overflow-hidden border border-cyan-500/20 bg-slate-950/80 ${className}`}>
      <div ref={mountRef} className="w-full h-48 md:h-56" />
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none px-2 py-1 bg-slate-950/70 backdrop-blur-sm rounded-lg border border-slate-800 text-[10px] text-cyan-300 font-mono">
        <span>{type === 'interference' ? 'Giao Thoa 2 Nguồn Sóng' : 'Sóng Lan Truyền'}</span>
        <span>Biên độ cộng hưởng & triệt tiêu</span>
      </div>
    </div>
  );
};

