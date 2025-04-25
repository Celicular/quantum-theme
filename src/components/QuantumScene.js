import React, { Suspense, useState, useRef, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import styled from 'styled-components';
import QuantumCube from './QuantumCube';
import { StarBackground } from './StarBackground';
import AnimatedTitle from './AnimatedTitle';
import FuturisticSearchBar from './FuturisticSearchBar';
import ControlToolbar from './ControlToolbar';
import { FaHeart } from 'react-icons/fa';

const CanvasContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background: #010108;
  overflow: hidden;
`;

const CreditFooter = styled.div`
  position: fixed;
  bottom: 10px;
  right: 15px;
  font-family: 'Rajdhani', sans-serif;
  font-size: 12px;
  color: rgba(150, 220, 255, 0.7);
  z-index: 1000;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 5px;
  
  svg {
    color: #ff6b6b;
    animation: pulse 1.5s infinite;
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.3); }
    100% { transform: scale(1); }
  }
  
  @media (max-width: 767px) {
    bottom: 5px;
    right: 10px;
    font-size: 10px;
  }
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

// Controller to handle camera controls and color changes
const SceneController = ({ zoomLevel, selectedTool, onChangeCubeColor }) => {
  const { camera, mouse, viewport } = useThree();
  const orbitControlsRef = useRef();
  
  // Update orbit controls based on tool selection
  React.useEffect(() => {
    if (orbitControlsRef.current) {
      // Only enable pan when the pan tool is explicitly selected
      orbitControlsRef.current.enablePan = (selectedTool === 'pan');
      
      // Disable rotation when any tool is selected
      orbitControlsRef.current.autoRotate = !selectedTool;
      
      // Explicitly disable dragging/panning if the pan tool isn't selected
      if (selectedTool !== 'pan') {
        orbitControlsRef.current.enabled = true;
        orbitControlsRef.current.enablePan = false;
        orbitControlsRef.current.enableDamping = true;
        orbitControlsRef.current.dampingFactor = 0.1;
      }
    }
  }, [selectedTool]);
  
  // Update camera zoom level
  React.useEffect(() => {
    if (camera) {
      camera.position.z = zoomLevel;
    }
  }, [zoomLevel, camera]);
  
  // Handle click events for changing cube color
  const handleClick = useCallback((e) => {
    // Only process clicks if we have an appropriate tool selected
    if (selectedTool && selectedTool !== 'pan') {
      e.stopPropagation(); // Stop event propagation to prevent other handlers
      
      if (selectedTool === 'changeColor') {
        onChangeCubeColor();
      }
    }
  }, [selectedTool, onChangeCubeColor]);
  
  // Add click event listeners
  React.useEffect(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      // Add mouse click handling
      canvas.addEventListener('click', handleClick, { capture: true });
      
      // Add touch handling for mobile
      canvas.addEventListener('touchend', handleClick, { capture: true });
      
      canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
      });
      
      return () => {
        canvas.removeEventListener('click', handleClick, { capture: true });
        canvas.removeEventListener('touchend', handleClick, { capture: true });
        canvas.removeEventListener('contextmenu', (e) => e.preventDefault());
      };
    }
  }, [handleClick]);
  
  return (
    <OrbitControls 
      ref={orbitControlsRef}
      // Pan is only enabled when the pan tool is explicitly selected
      enablePan={selectedTool === 'pan'}
      // Allow zoom regardless of tool selection
      enableZoom={true}
      // Disable rotation when a tool is selected
      enableRotate={!selectedTool || selectedTool === 'pan'}
      minDistance={10}
      maxDistance={25}
      rotateSpeed={0.5}
      // Auto-rotate only when no tool is selected
      autoRotate={!selectedTool}
      autoRotateSpeed={0.5}
    />
  );
};

const QuantumScene = () => {
  const [zoomLevel, setZoomLevel] = useState(15);
  const [selectedTool, setSelectedTool] = useState(null);
  const [cubeColor, setCubeColor] = useState("#c53ff2"); // Original purple
  const [innerCubeColor, setInnerCubeColor] = useState("#05d9fe"); // Original cyan
  const quantumCubeRef = useRef();
  const starBackgroundRef = useRef();
  
  // Check if on mobile device for performance optimization
  const isMobile = useRef(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                           window.innerWidth <= 768);
  
  // Callback to change cube color
  const handleChangeCubeColor = useCallback(() => {
    // Generate random colors for outer and inner cubes
    const randomColor = () => {
      const colors = [
        "#c53ff2", // Purple
        "#05d9fe", // Cyan
        "#ff6b6b", // Red
        "#48dbad", // Green
        "#ffcd3c", // Yellow
        "#ff85ea", // Pink
        "#3d84f7"  // Blue
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    };
    
    // Set new random colors
    const newOuterColor = randomColor();
    let newInnerColor = randomColor();
    
    // Make sure inner color is different from outer color
    while (newInnerColor === newOuterColor) {
      newInnerColor = randomColor();
    }
    
    setCubeColor(newOuterColor);
    setInnerCubeColor(newInnerColor);
    
    // Update the cube colors via ref if available
    if (quantumCubeRef.current && quantumCubeRef.current.changeColors) {
      quantumCubeRef.current.changeColors(newOuterColor, newInnerColor);
    }
  }, []);
  
  // Add pointer event handlers to prevent default behavior when tools other than pan are active
  React.useEffect(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      // Prevent default pan behavior when pan tool isn't selected
      const preventDefaultIfNotPan = (e) => {
        if (selectedTool && selectedTool !== 'pan') {
          e.preventDefault();
          e.stopPropagation();
        }
      };
      
      // Add event listeners to prevent default behavior
      canvas.addEventListener('mousedown', preventDefaultIfNotPan, true);
      canvas.addEventListener('touchstart', preventDefaultIfNotPan, true);
      
      return () => {
        canvas.removeEventListener('mousedown', preventDefaultIfNotPan, true);
        canvas.removeEventListener('touchstart', preventDefaultIfNotPan, true);
      };
    }
  }, [selectedTool]);
  
  return (
    <CanvasContainer>
      <AnimatedTitle />
      <FuturisticSearchBar />
      <ControlToolbar
        currentZoom={zoomLevel}
        setZoom={setZoomLevel}
        setSelectedTool={setSelectedTool}
      />
      
      <CreditFooter>
        MADE WITH <FaHeart /> BY HIMADRI
      </CreditFooter>
      
      <Canvas
        camera={{ position: [0, 0, zoomLevel], fov: 60 }}
        style={{ 
          background: 'transparent',
          cursor: selectedTool === 'pan' ? 'grab' : 
                 selectedTool ? 'crosshair' : 'default'
        }}
        dpr={isMobile.current ? 0.8 : [1, 2]} // Lower resolution on mobile
        onContextMenu={(e) => e.preventDefault()}
        onPointerDown={(e) => {
          // Prevent default pointer behavior if not using pan tool
          if (selectedTool && selectedTool !== 'pan') {
            e.stopPropagation();
          }
        }}
        gl={{ 
          antialias: !isMobile.current, // Disable antialiasing on mobile
          alpha: true,
          powerPreference: 'high-performance',
          precision: isMobile.current ? 'lowp' : 'highp' // Lower precision on mobile
        }}
        frameloop="always" // Always animate to ensure cube rotation
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={0.8} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8a2be2" />
          
          <group position={[0, 0, 0]}>
            <QuantumCube 
              ref={quantumCubeRef}
              outerColor={cubeColor}
              innerColor={innerCubeColor}
            />
          </group>

          <StarBackground
            ref={starBackgroundRef}
            panEnabled={selectedTool === 'pan'}
          />
          
          <SceneController
            zoomLevel={zoomLevel}
            selectedTool={selectedTool}
            onChangeCubeColor={handleChangeCubeColor}
          />
        </Suspense>
      </Canvas>
    </CanvasContainer>
  );
};

export default QuantumScene; 