import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Effects } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
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
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 2rem;
  letter-spacing: 5px;
  z-index: 100;
`;

const LoadingBar = styled.div`
  width: 200px;
  height: 4px;
  background: rgba(100, 100, 255, 0.2);
  margin-top: 20px;
  position: relative;
  overflow: hidden;
  border-radius: 2px;
  
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 50%;
    background: linear-gradient(90deg, #3f51b5, #7986cb);
    animation: loading 1.5s infinite ease-in-out;
    border-radius: 2px;
  }
  
  @keyframes loading {
    0% {
      left: -50%;
    }
    100% {
      left: 100%;
    }
  }
`;

const FPSMonitor = styled.div`
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 5px;
  font-size: 10px;
  z-index: 1000;
  display: ${props => props.show ? 'block' : 'none'};
`;

const FallbackLoader = () => (
  <LoadingScreen>
    INITIALIZING QUANTUM SPACE
    <LoadingBar />
  </LoadingScreen>
);

// Post-processing effects component - only used on high-performance devices
const PostProcessingEffects = ({ isLowPerformance }) => {
  if (isLowPerformance) return null;
  
  return (
    <EffectComposer multisampling={0} enabled={!isLowPerformance}>
      <Bloom 
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        intensity={0.8}
      />
    </EffectComposer>
  );
};

const QuantumScene = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isLowPerformance, setIsLowPerformance] = useState(false);
  const [fps, setFps] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const performanceMonitorRef = useRef(null);
  const frameTimeRef = useRef(Date.now());
  const frameCountRef = useRef(0);
  
  // Check for mobile device and low performance on mount
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth <= 1024;
      setIsMobile(isMobileDevice);
      
      // Check for very low-performance devices
      const isLowPerf = window.innerWidth <= 768 || 
                        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsLowPerformance(isLowPerf);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Add a small delay before showing content to allow for initial loading
    const loadTimer = setTimeout(() => {
      setIsLoaded(true);
    }, 1000);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(loadTimer);
    };
  }, []);
  
  // Performance monitoring
  useEffect(() => {
    if (!isLowPerformance) return;
    
    let animFrameId;
    let lastTimestamp = performance.now();
    const frameTimes = [];
    
    const monitorPerformance = () => {
      const now = performance.now();
      const delta = now - lastTimestamp;
      lastTimestamp = now;
      
      // Keep track of the last 10 frames
      frameTimes.push(delta);
      if (frameTimes.length > 10) frameTimes.shift();
      
      // Calculate average FPS
      const avgDelta = frameTimes.reduce((sum, time) => sum + time, 0) / frameTimes.length;
      const currentFps = Math.round(1000 / avgDelta);
      
      setFps(currentFps);
      
      // If FPS is too low, reduce quality even further
      if (performanceMonitorRef.current && currentFps < 20 && performanceMonitorRef.current.renderer) {
        // Further reduce pixel ratio
        const pixelRatio = Math.max(0.5, window.devicePixelRatio * 0.5);
        performanceMonitorRef.current.renderer.setPixelRatio(pixelRatio);
      }
      
      animFrameId = requestAnimationFrame(monitorPerformance);
    };
    
    monitorPerformance();
    return () => cancelAnimationFrame(animFrameId);
  }, [isLowPerformance]);
  
  // Capture renderer reference
  const handleCreated = (state) => {
    performanceMonitorRef.current = state;
    
    // Apply initial optimizations based on device
    if (state.gl) {
      if (isLowPerformance) {
        state.gl.setPixelRatio(Math.min(0.7, window.devicePixelRatio));
      }
    }
  };

  return (
    <CanvasContainer>
      <AnimatedTitle />
      <FuturisticSearchBar />
      
      <Canvas
        camera={{ 
          position: [0, 0, isLowPerformance ? 20 : isMobile ? 18 : 15], 
          fov: isLowPerformance ? 75 : isMobile ? 70 : 60,
          near: 0.1,
          far: 200
        }}
        style={{ background: 'transparent' }}
        dpr={isLowPerformance ? 0.6 : isMobile ? 1 : [1, 2]} // Extremely low resolution on mobile
        performance={{ min: 0.2 }} // Allow the renderer to adapt performance more aggressively
        frameloop={isLowPerformance ? "demand" : "always"} // Only render on demand for very low performance
        gl={{ 
          powerPreference: "high-performance",
          antialias: !isLowPerformance, // Enable antialiasing only on high-performance devices
          alpha: true,
          depth: true,
          stencil: false, // Disable stencil buffer
          precision: isLowPerformance ? "lowp" : "mediump" // Use low precision on low performance devices
        }}
        onCreated={handleCreated}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.2} />
          {/* Reduce number of lights on mobile */}
          {!isLowPerformance && (
            <>
              <pointLight position={[10, 10, 10]} intensity={0.8} />
              <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8a2be2" />
            </>
          )}
          {isLowPerformance && (
            <pointLight position={[0, 5, 10]} intensity={0.9} />
          )}
          
          <group position={[0, 0, 0]}>
            <QuantumCube />
          </group>

          <StarBackground isMobile={isMobile} />
          
          <OrbitControls 
            enablePan={false}
            enableZoom={!isLowPerformance} // Disable zoom on very low performance devices
            minDistance={isLowPerformance ? 15 : isMobile ? 12 : 10}
            maxDistance={isLowPerformance ? 25 : isMobile ? 30 : 25}
            rotateSpeed={isLowPerformance ? 0.2 : isMobile ? 0.3 : 0.5}
            autoRotate
            autoRotateSpeed={isLowPerformance ? 0.1 : isMobile ? 0.3 : 0.5}
            enableDamping={!isLowPerformance} // Enable damping only on high-performance devices
            dampingFactor={0.05}
          />
          
          {/* Add post-processing effects only for high-performance devices */}
          <PostProcessingEffects isLowPerformance={isLowPerformance || isMobile} />
        </Suspense>
      </Canvas>
      
      {/* Loading screen shown during initial load */}
      {!isLoaded && <FallbackLoader />}
      
      {/* Debug FPS counter - hidden in production */}
      <FPSMonitor show={process.env.NODE_ENV === 'development'}>
        FPS: {fps}
      </FPSMonitor>
    </CanvasContainer>
  );
};

export default QuantumScene; 