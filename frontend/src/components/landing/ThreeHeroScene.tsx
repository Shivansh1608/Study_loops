import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function ThreeHeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3 floating light orbs red / amber, opacity ~0.15
    const geometry1 = new THREE.SphereGeometry(3.5, 32, 32);
    const material1 = new THREE.MeshBasicMaterial({
      color: 0xef4444, // red
      transparent: true,
      opacity: 0.14,
    });
    const orb1 = new THREE.Mesh(geometry1, material1);
    orb1.position.set(-6, 2, 0);
    scene.add(orb1);

    const geometry2 = new THREE.SphereGeometry(4, 32, 32);
    const material2 = new THREE.MeshBasicMaterial({
      color: 0xf59e0b, // amber
      transparent: true,
      opacity: 0.12,
    });
    const orb2 = new THREE.Mesh(geometry2, material2);
    orb2.position.set(6, -2, -2);
    scene.add(orb2);

    const geometry3 = new THREE.SphereGeometry(2.8, 32, 32);
    const material3 = new THREE.MeshBasicMaterial({
      color: 0xdc2626, // deep red
      transparent: true,
      opacity: 0.10,
    });
    const orb3 = new THREE.Mesh(geometry3, material3);
    orb3.position.set(1, 3.5, -4);
    scene.add(orb3);

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Slow gentle float
      orb1.position.y = 2 + Math.sin(elapsedTime * 0.7) * 0.6;
      orb1.position.x = -6 + Math.cos(elapsedTime * 0.5) * 0.5;

      orb2.position.y = -2 + Math.sin(elapsedTime * 0.6 + 2) * 0.7;
      orb2.position.x = 6 + Math.cos(elapsedTime * 0.4 + 1) * 0.6;

      orb3.position.y = 3.5 + Math.sin(elapsedTime * 0.8 + 4) * 0.5;
      orb3.position.x = 1 + Math.cos(elapsedTime * 0.6 + 3) * 0.4;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      geometry1.dispose();
      material1.dispose();
      geometry2.dispose();
      material2.dispose();
      geometry3.dispose();
      material3.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden" 
      aria-hidden="true" 
    />
  );
}

