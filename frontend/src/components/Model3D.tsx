'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Html, useProgress } from '@react-three/drei';
import { Suspense, useRef, useState } from 'react';
import * as THREE from 'three';

function Loader() {
  const { progress } = useProgress();
  return <Html center><div className="text-white text-xl">{progress.toFixed(0)}%</div></Html>;
}

function InfinitySymbol() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isTapped, setIsTapped] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Create infinity symbol geometry
  const createInfinityGeometry = () => {
    const shape = new THREE.Shape();
    
    // Mathematical formula for infinity symbol: x = cos(t), y = sin(2t)/2
    const points = [];
    for (let i = 0; i <= 64; i++) {
      const t = (i / 64) * Math.PI * 2;
      const x = Math.cos(t) * 1.5;
      const y = Math.sin(2 * t) / 2;
      points.push(new THREE.Vector2(x, y));
    }
    
    shape.setFromPoints(points);
    
    const extrudeSettings = {
      depth: 0.3,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.1,
      bevelSegments: 8
    };
    
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  };

  // Animation and rotation
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Auto-rotate when not interacting
      if (!hovered && !isTapped) {
        meshRef.current.rotation.y += delta * 0.5;
      }
      
      // Tap animation
      if (isTapped) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.2, 1.2, 1.2), 0.1);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
      
      // Hover animation
      if (hovered) {
        meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      }
    }
  });

  const handleClick = () => {
    setIsTapped(true);
    setTimeout(() => setIsTapped(false), 300);
  };

  return (
    <mesh
      ref={meshRef}
      geometry={createInfinityGeometry()}
      position={[0, 0, 0]}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      castShadow
      receiveShadow
    >
      <meshPhysicalMaterial
        color={hovered ? "#ff6b6b" : isTapped ? "#4ecdc4" : "#45b7d1"}
        metalness={0.6}
        roughness={0.2}
        clearcoat={1}
        clearcoatRoughness={0.1}
      />
    </mesh>
  );
}

function FloatingParticles() {
  const particlesRef = useRef<THREE.InstancedMesh>(null);
  const count = 50;

  useFrame((state) => {
    if (particlesRef.current) {
      const time = state.clock.elapsedTime;
      
      for (let i = 0; i < count; i++) {
        const matrix = new THREE.Matrix4();
        const angle = (i / count) * Math.PI * 2;
        const radius = 3 + Math.sin(time * 0.5 + i) * 0.5;
        
        const x = Math.cos(angle + time * 0.5) * radius;
        const y = Math.sin(angle * 2 + time) * 1.5;
        const z = Math.sin(angle + time * 0.3) * radius;
        
        matrix.setPosition(x, y, z);
        
        const scale = 0.05 + Math.sin(time + i) * 0.02;
        matrix.scale(new THREE.Vector3(scale, scale, scale));
        
        particlesRef.current.setMatrixAt(i, matrix);
      }
      particlesRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={particlesRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.5, 8, 8]} />
      <meshBasicMaterial color="#ffffff" />
    </instancedMesh>
  );
}

export default function Model3D() {
  const [isInteracting, setIsInteracting] = useState(false);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-900 to-black touch-pan-y">
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 50 }}
        onTouchStart={() => setIsInteracting(true)}
        onTouchEnd={() => setIsInteracting(false)}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4ecdc4" />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#ff6b6b" />
        
        <Suspense fallback={<Loader />}>
          <InfinitySymbol />
          <FloatingParticles />
          
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            zoomSpeed={0.8}
            rotateSpeed={0.5}
            minDistance={4}
            maxDistance={12}
            autoRotate={!isInteracting}
            autoRotateSpeed={2}
            touches={{
              ONE: 'rotate',
              TWO: 'zoom'
            }}
          />
          
          <Environment preset="dawn" />
        </Suspense>
      </Canvas>
      
      {/* Interactive instructions */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white text-center bg-black bg-opacity-50 p-3 rounded-lg backdrop-blur-sm">
        <div className="text-sm mb-1">✨ Interactive Infinity Symbol</div>
        <div className="text-xs opacity-80">
          {isInteracting 
            ? 'Drag to rotate • Pinch to zoom • Tap for animation' 
            : 'Touch or click to interact • Auto-rotating'
          }
        </div>
      </div>
    </div>
  );
}