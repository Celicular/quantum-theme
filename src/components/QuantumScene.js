import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import styled from 'styled-components';
import QuantumCube from './QuantumCube';
import StarBackground from './StarBackground';
import AnimatedTitle from './AnimatedTitle';
import FuturisticSearchBar from './FuturisticSearchBar';

const CanvasContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background: #010108;
  overflow: hidden;
`;

const LoadingScreen = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #010108;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 2rem;
  letter-spacing: 5px;
  z-index: 100;
`;

const QuantumScene = () => {
  return (
    <CanvasContainer>
      <AnimatedTitle />
      <FuturisticSearchBar />
      
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={0.8} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8a2be2" />
          
          <group position={[0, 0, 0]}>
            <QuantumCube />
          </group>

          <StarBackground />
          
          <OrbitControls 
            enablePan={false}
            enableZoom={true}
            minDistance={10}
            maxDistance={25}
            rotateSpeed={0.5}
            autoRotate
            autoRotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>
    </CanvasContainer>
  );
};

export default QuantumScene; 