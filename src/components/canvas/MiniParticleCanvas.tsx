import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface MiniParticleCanvasProps {
  className?: string;
}

export const MiniParticleCanvas: React.FC<MiniParticleCanvasProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 220;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050811);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 5, 16);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Grid tham chiếu không gian rỗng
    const grid = new THREE.GridHelper(16, 16, 0x1e293b, 0x0f172a);
    grid.position.y = -2;
    scene.add(grid);

    // Ánh sáng
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xf59e0b, 2.5, 30);
    pointLight.position.set(0, 4, 6);
    scene.add(pointLight);

    // Tạo các viên bi hạt Newton
    const particleCount = 14;
    const sphereGeo = new THREE.SphereGeometry(0.35, 20, 20);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.2,
    });

    const particles: Array<{
      mesh: THREE.Mesh;
      speed: number;
      initX: number;
      initY: number;
      initZ: number;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      const mesh = new THREE.Mesh(sphereGeo, sphereMat);
      const initX = -9 + Math.random() * 18;
      const initY = -1 + Math.random() * 3;
      const initZ = -4 + Math.random() * 8;
      mesh.position.set(initX, initY, initZ);
      scene.add(mesh);

      particles.push({
        mesh,
        speed: 4.5 + Math.random() * 3.0,
        initX,
        initY,
        initZ,
      });
    }

    let animationId: number;
    let isVisible = true;
    let lastTime = performance.now();

    // Dừng render khi cuộn ra ngoài màn hình để tối ưu hiệu năng
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

      particles.forEach((p) => {
        p.mesh.position.x += p.speed * delta;
        if (p.mesh.position.x > 9) {
          p.mesh.position.x = -9;
          p.mesh.position.y = -1 + Math.random() * 3;
          p.mesh.position.z = -4 + Math.random() * 8;
        }
      });

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
      sphereGeo.dispose();
      sphereMat.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className={`relative rounded-xl overflow-hidden border border-amber-500/20 bg-slate-950/80 ${className}`}>
      <div ref={mountRef} className="w-full h-48 md:h-56" />
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none px-2 py-1 bg-slate-950/70 backdrop-blur-sm rounded-lg border border-slate-800 text-[10px] text-amber-300 font-mono">
        <span>Mô hình Hạt Cổ Điển</span>
        <span>Bay thẳng trong chân không rỗng</span>
      </div>
    </div>
  );
};

