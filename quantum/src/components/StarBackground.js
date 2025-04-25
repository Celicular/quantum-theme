import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Create a simple star texture
function createStarTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.4, 'rgba(200, 220, 255, 0.8)');
  gradient.addColorStop(0.7, 'rgba(180, 200, 255, 0.3)');
  gradient.addColorStop(1, 'rgba(200, 220, 255, 0)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);
  
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Create a larger, more vibrant star texture for bright stars
function createBrightStarTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.2, 'rgba(220, 240, 255, 0.9)');
  gradient.addColorStop(0.5, 'rgba(150, 200, 255, 0.4)');
  gradient.addColorStop(1, 'rgba(120, 180, 255, 0)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

const StarBackground = ({ isMobile }) => {
  // Use even more aggressive mobile detection
  const [isLowPerformance, setIsLowPerformance] = useState(isMobile);
  
  useEffect(() => {
    // Check for very low-performance devices (most mobile phones)
    const checkPerformance = () => {
      // Consider all mobile devices + laptops with smaller screens as low performance
      const isLow = window.innerWidth <= 1200 || 
                    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsLowPerformance(isLow);
    };
    
    checkPerformance();
    window.addEventListener('resize', checkPerformance);
    return () => window.removeEventListener('resize', checkPerformance);
  }, []);

  // Dramatically reduce particle counts for mobile
  const starCount = isLowPerformance ? 200 : 2000;
  const twinklingStarCount = isLowPerformance ? 15 : 100;
  const brightStarCount = isLowPerformance ? 5 : 25;
  
  // Skip features entirely on very low performance
  const enableTwinkling = true; // Keep basic twinkling even on mobile
  const enableBrightStars = true; // Keep a few bright stars even on mobile
  const enableShootingStars = !isLowPerformance;
  const enableNebula = !isLowPerformance;
  
  // Create main background stars
  const starPositions = useMemo(() => {
    const positions = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount; i++) {
      const distance = 40 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i * 3] = distance * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = distance * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = distance * Math.cos(phi);
    }
    
    return positions;
  }, [starCount]);
  
  // Create twinkling stars
  const twinklingStarsRef = useRef();
  const [twinklingStarPositions, twinklingStarColors, twinklingStarSizes] = useMemo(() => {
    if (!enableTwinkling) {
      return [new Float32Array(0), new Float32Array(0), new Float32Array(0)];
    }
    
    const positions = new Float32Array(twinklingStarCount * 3);
    const colors = new Float32Array(twinklingStarCount * 3);
    const sizes = new Float32Array(twinklingStarCount);
    
    for (let i = 0; i < twinklingStarCount; i++) {
      const distance = 35 + Math.random() * 15;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i * 3] = distance * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = distance * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = distance * Math.cos(phi);
      
      // More varied colors - blues, whites, and slight reds
      const colorType = Math.random();
      if (colorType > 0.7) {
        // Blue-ish
        colors[i * 3] = 0.7 + Math.random() * 0.3;
        colors[i * 3 + 1] = 0.8 + Math.random() * 0.2;
        colors[i * 3 + 2] = 0.9 + Math.random() * 0.1;
      } else if (colorType > 0.4) {
        // White-ish
        colors[i * 3] = 0.9 + Math.random() * 0.1;
        colors[i * 3 + 1] = 0.9 + Math.random() * 0.1;
        colors[i * 3 + 2] = 0.9 + Math.random() * 0.1;
      } else {
        // Slight red/yellow tint
        colors[i * 3] = 0.9 + Math.random() * 0.1;
        colors[i * 3 + 1] = 0.7 + Math.random() * 0.3;
        colors[i * 3 + 2] = 0.7 + Math.random() * 0.2;
      }
      
      sizes[i] = Math.random() * 2 + 1;
    }
    
    return [positions, colors, sizes];
  }, [twinklingStarCount, enableTwinkling]);
  
  // Create bright stars
  const brightStarsRef = useRef();
  const [brightStarPositions, brightStarColors, brightStarSizes] = useMemo(() => {
    if (!enableBrightStars) {
      return [new Float32Array(0), new Float32Array(0), new Float32Array(0)];
    }
    
    const positions = new Float32Array(brightStarCount * 3);
    const colors = new Float32Array(brightStarCount * 3);
    const sizes = new Float32Array(brightStarCount);
    
    for (let i = 0; i < brightStarCount; i++) {
      const distance = 35 + Math.random() * 15;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i * 3] = distance * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = distance * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = distance * Math.cos(phi);
      
      // Bright star colors - whites with a hint of blue or yellow
      const colorType = Math.random();
      if (colorType > 0.5) {
        // Bright white-blue
        colors[i * 3] = 0.9 + Math.random() * 0.1;
        colors[i * 3 + 1] = 0.9 + Math.random() * 0.1;
        colors[i * 3 + 2] = 1.0;
      } else {
        // Bright white-yellow
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.9 + Math.random() * 0.1;
        colors[i * 3 + 2] = 0.8 + Math.random() * 0.1;
      }
      
      sizes[i] = Math.random() * 3 + 2.5;
    }
    
    return [positions, colors, sizes];
  }, [brightStarCount, enableBrightStars]);
  
  // Create star textures
  const starTexture = useMemo(() => createStarTexture(), []);
  const brightStarTexture = useMemo(() => createBrightStarTexture(), []);
  
  // Animation function - optimized for performance
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    // Skip frames on low performance devices
    if (isLowPerformance && Math.floor(time * 5) % 3 !== 0) {
      return;
    }
    
    // Animate twinkling stars
    if (enableTwinkling && twinklingStarsRef.current) {
      const colors = twinklingStarsRef.current.geometry.attributes.color.array;
      const sizes = twinklingStarsRef.current.geometry.attributes.size.array;
      
      // Update fewer particles on low performance
      const updateStep = isLowPerformance ? 3 : 1;
      for (let i = 0; i < twinklingStarCount; i += updateStep) {
        const idx = i * 3;
        // More complex animation with unique phase for each star
        const pulseFactor = 0.7 + 0.3 * Math.sin(time * 0.5 + i * 0.2);
        
        colors[idx] *= pulseFactor;
        colors[idx + 1] *= pulseFactor;
        colors[idx + 2] *= pulseFactor;
        
        sizes[i] = twinklingStarSizes[i] * pulseFactor;
      }
      
      twinklingStarsRef.current.geometry.attributes.color.needsUpdate = true;
      twinklingStarsRef.current.geometry.attributes.size.needsUpdate = true;
    }
    
    // Animate bright stars with more dramatic pulsing
    if (enableBrightStars && brightStarsRef.current) {
      const colors = brightStarsRef.current.geometry.attributes.color.array;
      const sizes = brightStarsRef.current.geometry.attributes.size.array;
      
      for (let i = 0; i < brightStarCount; i++) {
        const idx = i * 3;
        // More dramatic pulsing for bright stars
        const pulseFactor = 0.8 + 0.4 * Math.sin(time * 0.3 + i * 0.5);
        const colorPulse = 0.9 + 0.2 * Math.sin(time * 0.4 + i * 0.3);
        
        colors[idx] *= colorPulse;
        colors[idx + 1] *= colorPulse;
        colors[idx + 2] *= colorPulse;
        
        sizes[i] = brightStarSizes[i] * pulseFactor;
      }
      
      brightStarsRef.current.geometry.attributes.color.needsUpdate = true;
      brightStarsRef.current.geometry.attributes.size.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Fixed background stars */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={starPositions.length / 3}
            array={starPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={isLowPerformance ? 1 : 1.2}
          color={0xffffff}
          transparent
          opacity={0.8}
          map={starTexture}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      
      {/* Twinkling stars */}
      {enableTwinkling && (
        <points ref={twinklingStarsRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={twinklingStarPositions.length / 3}
              array={twinklingStarPositions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={twinklingStarColors.length / 3}
              array={twinklingStarColors}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-size"
              count={twinklingStarSizes.length}
              array={twinklingStarSizes}
              itemSize={1}
            />
          </bufferGeometry>
          <pointsMaterial
            size={2}
            sizeAttenuation
            vertexColors
            transparent
            opacity={0.9}
            map={starTexture}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      )}
      
      {/* Bright stars with glow */}
      {enableBrightStars && (
        <points ref={brightStarsRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={brightStarPositions.length / 3}
              array={brightStarPositions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={brightStarColors.length / 3}
              array={brightStarColors}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-size"
              count={brightStarSizes.length}
              array={brightStarSizes}
              itemSize={1}
            />
          </bufferGeometry>
          <pointsMaterial
            size={4}
            sizeAttenuation
            vertexColors
            transparent
            opacity={1}
            map={brightStarTexture}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      )}
    </group>
  );
};

export default StarBackground; 