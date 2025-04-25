import React, { useRef, useMemo, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const StarBackground = forwardRef((props, ref) => {
  const { panEnabled } = props;
  
  // References for different star groups
  const regularStarsRef = useRef();
  const twinklingStarsRef = useRef();
  const shootingStarsRef = useRef();
  const nebulaRef = useRef();
  const trailsRef = useRef(new THREE.Group());
  
  // State for black holes and white holes
  const [blackHoles, setBlackHoles] = useState([]);
  const [whiteHoles, setWhiteHoles] = useState([]);
  const [fadeInStars, setFadeInStars] = useState([]);
  
  // Track stars that were affected by holes for regeneration
  const affectedStarsRef = useRef([]);
  
  // Original star positions (for regeneration)
  const originalPositionsRef = useRef({
    regular: null,
    twinkling: null,
  });
  
  // Helper function to detect mobile device - evaluate only once
  const isMobile = useMemo(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           (typeof window !== 'undefined' && window.innerWidth <= 768);
  }, []);
  
  // Define counts based on device type - consistent values
  const counts = useMemo(() => ({
    regularStars: isMobile ? 800 : 2000,
    twinklingStars: isMobile ? 150 : 400,
    shootingStars: isMobile ? 20 : 50,
    nebulaClouds: isMobile ? 4 : 8,
    trailLength: isMobile ? 8 : 15
  }), [isMobile]);

  // Helper function to create a star texture
  const createStarTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, 32, 32);
    
    // Create radial gradient for star glow
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.1, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  };

  // Helper function to create a nebula texture
  const createNebulaTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    // Create radial gradient for nebula effect
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.7)');
    gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  };

  // Create a black hole texture
  const createHoleTexture = (isBlack = true) => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, 64, 64);
    
    // Create radial gradient for hole
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    
    if (isBlack) {
      // Black hole with stronger central darkness
      gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
      gradient.addColorStop(0.2, 'rgba(10, 0, 20, 0.9)');
      gradient.addColorStop(0.4, 'rgba(30, 10, 60, 0.8)');
      gradient.addColorStop(0.7, 'rgba(70, 30, 120, 0.5)');
      gradient.addColorStop(1, 'rgba(100, 50, 200, 0)');
    } else {
      // White hole with brighter center
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.2, 'rgba(240, 250, 255, 0.9)');
      gradient.addColorStop(0.4, 'rgba(220, 240, 255, 0.8)');
      gradient.addColorStop(0.7, 'rgba(160, 200, 255, 0.5)');
      gradient.addColorStop(1, 'rgba(120, 180, 255, 0)');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  };

  // Create regular background stars
  const [regularStarPositions, regularStarSizes] = useMemo(() => {
    const positions = [];
    const sizes = [];
    const starCount = counts.regularStars;
    
    for (let i = 0; i < starCount; i++) {
      // Create stars in a spherical distribution
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const distance = 50 + Math.random() * 50;
      
      const x = distance * Math.sin(phi) * Math.cos(theta);
      const y = distance * Math.sin(phi) * Math.sin(theta);
      const z = distance * Math.cos(phi);
      
      positions.push(x, y, z);
      
      // Smaller, more varied star sizes
      const size = Math.random() < 0.9 
        ? 0.03 + Math.random() * 0.05  // 90% tiny stars
        : 0.08 + Math.random() * 0.1;  // 10% slightly larger stars
      
      sizes.push(size);
    }
    
    return [new Float32Array(positions), new Float32Array(sizes)];
  }, [counts.regularStars]);

  // Create twinkling stars
  const [twinklingStarPositions, twinklingStarColors, twinklingStarSizes] = useMemo(() => {
    const positions = [];
    const colors = [];
    const sizes = [];
    const starCount = counts.twinklingStars;
    
    for (let i = 0; i < starCount; i++) {
      // Similar spherical distribution but closer to camera
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const distance = 30 + Math.random() * 40;
      
      const x = distance * Math.sin(phi) * Math.cos(theta);
      const y = distance * Math.sin(phi) * Math.sin(theta);
      const z = distance * Math.cos(phi);
      
      positions.push(x, y, z);
      
      // Colors with slight variations
      const r = 0.8 + Math.random() * 0.2;
      const g = 0.8 + Math.random() * 0.2;
      const b = 0.9 + Math.random() * 0.1;
      
      colors.push(r, g, b);
      
      // Smaller twinkling star sizes
      sizes.push(0.1 + Math.random() * 0.15);
    }
    
    return [
      new Float32Array(positions), 
      new Float32Array(colors),
      new Float32Array(sizes)
    ];
  }, [counts.twinklingStars]);

  // Create shooting stars with better visibility
  const shootingStarData = useMemo(() => {
    const stars = [];
    const count = counts.shootingStars;
    
    for (let i = 0; i < count; i++) {
      // Random starting position
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 0.5); // Upper hemisphere bias
      const distance = 50 + Math.random() * 30;
      
      const x = distance * Math.sin(phi) * Math.cos(theta);
      const y = distance * Math.sin(phi) * Math.sin(theta);
      const z = distance * Math.cos(phi);
      
      // Random direction (mostly downward)
      const endPhi = phi + (Math.random() * 0.5 + 0.2);
      const endTheta = theta + (Math.random() * 0.2 - 0.1);
      
      stars.push({
        position: new THREE.Vector3(x, y, z),
        velocity: new THREE.Vector3(
          Math.sin(endPhi) * Math.cos(endTheta) - Math.sin(phi) * Math.cos(theta),
          Math.sin(endPhi) * Math.sin(endTheta) - Math.sin(phi) * Math.sin(theta),
          Math.cos(endPhi) - Math.cos(phi)
        ).normalize().multiplyScalar(0.1 + Math.random() * 0.2),
        active: false,
        trail: [],
        trailLength: counts.trailLength + Math.floor(Math.random() * 10),
        startTime: Math.random() * 10,
        duration: 2 + Math.random() * 3,
        size: 0.2 + Math.random() * 0.3,
        color: new THREE.Color(0.9, 0.9, 1.0)
      });
    }
    
    return stars;
  }, [counts]);

  // Create nebula clouds
  const [nebulaPositions, nebulaColors, nebulaSizes] = useMemo(() => {
    const positions = [];
    const colors = [];
    const sizes = [];
    const cloudCount = counts.nebulaClouds;
    
    const colorOptions = [
      // Purple/pink nebula
      { r: 0.7, g: 0.3, b: 0.9 },
      // Blue nebula
      { r: 0.2, g: 0.5, b: 0.9 },
      // Green nebula
      { r: 0.3, g: 0.8, b: 0.5 },
      // Red nebula
      { r: 0.9, g: 0.2, b: 0.3 },
      // Cyan nebula
      { r: 0.3, g: 0.9, b: 0.8 }
    ];
    
    for (let i = 0; i < cloudCount; i++) {
      const distance = 40 + Math.random() * 30;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      const x = distance * Math.sin(phi) * Math.cos(theta);
      const y = distance * Math.sin(phi) * Math.sin(theta);
      const z = distance * Math.cos(phi);
      
      positions.push(x, y, z);
      
      const colorIdx = Math.floor(Math.random() * colorOptions.length);
      const color = colorOptions[colorIdx];
      
      const r = color.r + (Math.random() * 0.1 - 0.05);
      const g = color.g + (Math.random() * 0.1 - 0.05);
      const b = color.b + (Math.random() * 0.1 - 0.05);
      
      colors.push(r, g, b);
      
      sizes.push(4 + Math.random() * 8);
    }
    
    return [
      new Float32Array(positions),
      new Float32Array(colors),
      new Float32Array(sizes)
    ];
  }, [counts.nebulaClouds]);

  // Create and store textures
  const starTexture = useMemo(() => createStarTexture(), []);
  const nebulaTexture = useMemo(() => createNebulaTexture(), []);
  const blackHoleTexture = useMemo(() => createHoleTexture(true), []);
  const whiteHoleTexture = useMemo(() => createHoleTexture(false), []);

  // Initialize shooting star materials
  const shootingStarMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.5,
      map: starTexture,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    });
  }, []);

  const trailMaterial = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.5,
      depthWrite: false
    });
  }, []);

  // Function to save original positions for regeneration
  useEffect(() => {
    if (regularStarsRef.current && twinklingStarsRef.current) {
      originalPositionsRef.current = {
        regular: regularStarsRef.current.geometry.attributes.position.array.slice(),
        twinkling: twinklingStarsRef.current.geometry.attributes.position.array.slice(),
      };
    }
  }, []);

  // Create a black hole at the given position
  const createBlackHole = useCallback((position) => {
    console.log('Creating black hole at:', position);
    const newHole = {
      position: new THREE.Vector3(position.x, position.y, position.z),
      radius: 0,
      maxRadius: 1, // Small visual radius 
      effectRadius: 4, // Fixed effect radius (about 100 pixels)
      strength: 25.0, // Much stronger effect
      createdAt: Date.now(),
      id: Date.now()
    };
    
    setBlackHoles(prev => [...prev, newHole]);
    
    // Remove black hole after 4 seconds
    setTimeout(() => {
      setBlackHoles(prev => prev.filter(hole => hole.id !== newHole.id));
      regenerateStars();
    }, 4000);
  }, []);
  
  // Create a white hole at the given position
  const createWhiteHole = useCallback((position) => {
    console.log('Creating white hole at:', position);
    const newHole = {
      position: new THREE.Vector3(position.x, position.y, position.z),
      radius: 0,
      maxRadius: 1, // Small visual radius
      effectRadius: 4, // Fixed effect radius (about 100 pixels)
      strength: 25.0, // Much stronger effect
      createdAt: Date.now(),
      id: Date.now()
    };
    
    setWhiteHoles(prev => [...prev, newHole]);
    
    // Remove white hole after 4 seconds
    setTimeout(() => {
      setWhiteHoles(prev => prev.filter(hole => hole.id !== newHole.id));
      regenerateStars();
    }, 4000);
  }, []);
  
  // Function to regenerate stars with fade in effect
  const regenerateStars = useCallback(() => {
    if (!originalPositionsRef.current.regular || !originalPositionsRef.current.twinkling) return;
    
    const fadingStars = [...affectedStarsRef.current];
    affectedStarsRef.current = [];
    
    setFadeInStars(fadingStars);
    
    // Clear fading stars after animation completes
    setTimeout(() => {
      setFadeInStars([]);
    }, 2000);
  }, []);

  // Set up shooting star positions
  const shootingStarPositions = useMemo(() => {
    // Create a fixed-size array with the correct size that won't change
    const positions = new Float32Array(counts.shootingStars * 3);
    
    // Initialize all positions
    for (let i = 0; i < shootingStarData.length; i++) {
      positions[i * 3] = shootingStarData[i].position.x;
      positions[i * 3 + 1] = shootingStarData[i].position.y;
      positions[i * 3 + 2] = shootingStarData[i].position.z;
    }
    
    return positions;
  }, [counts.shootingStars, shootingStarData]);

  // Use a separate ref to track if we need to recreate the geometry
  const geometryKeys = useRef({
    regular: `regular-${counts.regularStars}`,
    twinkling: `twinkling-${counts.twinklingStars}`,
    shooting: `shooting-${counts.shootingStars}`,
    nebula: `nebula-${counts.nebulaClouds}`
  });

  // Frame update for animations
  useFrame(({ clock, camera, mouse, viewport }) => {
    const time = clock.getElapsedTime();
    
    // Animate twinkling stars
    if (twinklingStarsRef.current) {
      const colors = twinklingStarsRef.current.geometry.attributes.color.array;
      const sizes = twinklingStarsRef.current.geometry.attributes.size.array;
      
      for (let i = 0; i < colors.length / 3; i++) {
        const idx = i * 3;
        const t = time * (0.2 + (i % 7) * 0.1) + i * 0.3;
        const pulseFactor = Math.sin(t) * 0.3 + 0.7;
        
        colors[idx] *= pulseFactor;
        colors[idx + 1] *= pulseFactor;
        colors[idx + 2] *= pulseFactor;
        
        sizes[i] = twinklingStarSizes[i] * (pulseFactor * 0.7 + 0.3);
      }
      
      twinklingStarsRef.current.geometry.attributes.color.needsUpdate = true;
      twinklingStarsRef.current.geometry.attributes.size.needsUpdate = true;
    }
    
    // Animate shooting stars
    if (shootingStarsRef.current && trailsRef.current) {
      // Clear old trails
      while (trailsRef.current.children.length > 0) {
        const line = trailsRef.current.children[0];
        line.geometry.dispose();
        trailsRef.current.remove(line);
      }
      
      // Update shooting stars
      shootingStarData.forEach((star, index) => {
        // Check if star should be active
        if (!star.active && time > star.startTime) {
          star.active = true;
          star.trail = [];
          star.endTime = time + star.duration;
        }
        
        // Update active stars
        if (star.active) {
          // Move star
          star.position.add(star.velocity);
          
          // Add to trail
          star.trail.unshift(star.position.clone());
          
          // Limit trail length
          if (star.trail.length > star.trailLength) {
            star.trail.pop();
          }
          
          // Draw trail if we have enough points
          if (star.trail.length > 2) {
            const trailPoints = star.trail.map(point => new THREE.Vector3(point.x, point.y, point.z));
            const trailGeometry = new THREE.BufferGeometry().setFromPoints(trailPoints);
            
            // Calculate trail opacity
            const progress = (star.endTime - time) / star.duration;
            const opacity = Math.max(0, Math.min(1, progress));
            
            // Create line with fading effect
            const trailLine = new THREE.Line(
              trailGeometry,
              new THREE.LineBasicMaterial({
                color: 0xffffff,
                transparent: true,
                blending: THREE.AdditiveBlending,
                opacity: opacity * 0.7,
                depthWrite: false
              })
            );
            trailsRef.current.add(trailLine);
          }
          
          // Reset star if it's finished
          if (time > star.endTime) {
            star.active = false;
            star.startTime = time + Math.random() * 5; // Wait before reactivating
            
            // Reset position
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 0.5);
            const distance = 50 + Math.random() * 30;
            
            star.position.set(
              distance * Math.sin(phi) * Math.cos(theta),
              distance * Math.sin(phi) * Math.sin(theta),
              distance * Math.cos(phi)
            );
            
            // Reset direction
            const endPhi = phi + (Math.random() * 0.5 + 0.2);
            const endTheta = theta + (Math.random() * 0.2 - 0.1);
            
            star.velocity.set(
              Math.sin(endPhi) * Math.cos(endTheta) - Math.sin(phi) * Math.cos(theta),
              Math.sin(endPhi) * Math.sin(endTheta) - Math.sin(phi) * Math.sin(theta),
              Math.cos(endPhi) - Math.cos(phi)
            ).normalize().multiplyScalar(0.1 + Math.random() * 0.2);
            
            star.trail = [];
          }
        }
        
        // Update star positions in geometry - only if index is within bounds
        if (shootingStarsRef.current && 
            shootingStarsRef.current.geometry && 
            shootingStarsRef.current.geometry.attributes.position && 
            index < counts.shootingStars) {
          
          const positions = shootingStarsRef.current.geometry.attributes.position.array;
          const idx = index * 3;
          
          // Only update if within array bounds
          if (idx + 2 < positions.length) {
            positions[idx] = star.position.x;
            positions[idx + 1] = star.position.y;
            positions[idx + 2] = star.position.z;
          }
        }
      });
      
      if (shootingStarsRef.current && 
          shootingStarsRef.current.geometry && 
          shootingStarsRef.current.geometry.attributes.position) {
        shootingStarsRef.current.geometry.attributes.position.needsUpdate = true;
      }
    }
    
    // Animate nebula clouds
    if (nebulaRef.current) {
      const colors = nebulaRef.current.geometry.attributes.color.array;
      const sizes = nebulaRef.current.geometry.attributes.size.array;
      const positions = nebulaRef.current.geometry.attributes.position.array;
      
      for (let i = 0; i < sizes.length; i++) {
        const idx = i * 3;
        const t = time * 0.1 + i * 2;
        const pulseFactor = Math.sin(t) * 0.1 + 0.9;
        
        colors[idx] *= pulseFactor;
        colors[idx + 1] *= pulseFactor;
        colors[idx + 2] *= pulseFactor;
        
        sizes[i] = nebulaSizes[i] * (pulseFactor * 0.3 + 0.7);
        
        const x = positions[idx];
        const y = positions[idx + 1];
        const rotationSpeed = 0.005 * (i % 2 === 0 ? 1 : -1);
        
        positions[idx] = x * Math.cos(time * rotationSpeed) - y * Math.sin(time * rotationSpeed);
        positions[idx + 1] = x * Math.sin(time * rotationSpeed) + y * Math.cos(time * rotationSpeed);
      }
      
      nebulaRef.current.geometry.attributes.color.needsUpdate = true;
      nebulaRef.current.geometry.attributes.size.needsUpdate = true;
      nebulaRef.current.geometry.attributes.position.needsUpdate = true;
    }
    
    // Black hole effects - improved attraction logic
    if (blackHoles.length > 0 && (regularStarsRef.current || twinklingStarsRef.current)) {
      const regPositions = regularStarsRef.current?.geometry.attributes.position.array;
      const twinkPositions = twinklingStarsRef.current?.geometry.attributes.position.array;
      
      blackHoles.forEach(hole => {
        // Expand radius over time (first 1 second)
        const age = (Date.now() - hole.createdAt) / 1000;
        hole.radius = Math.min(hole.maxRadius, age * hole.maxRadius);
        
        // Affect regular stars
        if (regPositions) {
          for (let i = 0; i < regPositions.length; i += 3) {
            const starPos = new THREE.Vector3(regPositions[i], regPositions[i+1], regPositions[i+2]);
            const distance = starPos.distanceTo(hole.position);
            
            // Use fixed effect radius instead of dynamically calculated one
            if (distance < hole.effectRadius) {
              // Calculate direction TO the black hole (sucking in)
              const direction = new THREE.Vector3().subVectors(hole.position, starPos).normalize();
              
              // Simple linear falloff with distance from center
              const forceFactor = 1 - (distance / hole.effectRadius);
              const force = forceFactor * hole.strength * 0.03;
              
              // Apply force
              starPos.add(direction.multiplyScalar(force));
              
              regPositions[i] = starPos.x;
              regPositions[i+1] = starPos.y;
              regPositions[i+2] = starPos.z;
              
              // Track affected stars for regeneration
              if (!affectedStarsRef.current.find(s => s.type === 'regular' && s.index === i)) {
                affectedStarsRef.current.push({
                  type: 'regular',
                  index: i,
                  originalPos: new THREE.Vector3(
                    originalPositionsRef.current.regular[i],
                    originalPositionsRef.current.regular[i+1],
                    originalPositionsRef.current.regular[i+2]
                  )
                });
              }
            }
          }
          regularStarsRef.current.geometry.attributes.position.needsUpdate = true;
        }
        
        // Affect twinkling stars
        if (twinkPositions) {
          for (let i = 0; i < twinkPositions.length; i += 3) {
            const starPos = new THREE.Vector3(twinkPositions[i], twinkPositions[i+1], twinkPositions[i+2]);
            const distance = starPos.distanceTo(hole.position);
            
            // Use fixed effect radius instead of dynamically calculated one
            if (distance < hole.effectRadius) {
              // Calculate direction TO the black hole (sucking in)
              const direction = new THREE.Vector3().subVectors(hole.position, starPos).normalize();
              
              // Simple linear falloff with distance from center
              const forceFactor = 1 - (distance / hole.effectRadius);
              const force = forceFactor * hole.strength * 0.03;
              
              // Apply force
              starPos.add(direction.multiplyScalar(force));
              
              twinkPositions[i] = starPos.x;
              twinkPositions[i+1] = starPos.y;
              twinkPositions[i+2] = starPos.z;
              
              // Track affected stars for regeneration
              if (!affectedStarsRef.current.find(s => s.type === 'twinkling' && s.index === i)) {
                affectedStarsRef.current.push({
                  type: 'twinkling',
                  index: i,
                  originalPos: new THREE.Vector3(
                    originalPositionsRef.current.twinkling[i],
                    originalPositionsRef.current.twinkling[i+1],
                    originalPositionsRef.current.twinkling[i+2]
                  )
                });
              }
            }
          }
          twinklingStarsRef.current.geometry.attributes.position.needsUpdate = true;
        }
      });
    }
    
    // White hole effects - improved repulsion logic
    if (whiteHoles.length > 0 && (regularStarsRef.current || twinklingStarsRef.current)) {
      const regPositions = regularStarsRef.current?.geometry.attributes.position.array;
      const twinkPositions = twinklingStarsRef.current?.geometry.attributes.position.array;
      
      whiteHoles.forEach(hole => {
        // Expand radius over time (first 1 second)
        const age = (Date.now() - hole.createdAt) / 1000;
        hole.radius = Math.min(hole.maxRadius, age * hole.maxRadius);
        
        // Affect regular stars
        if (regPositions) {
          for (let i = 0; i < regPositions.length; i += 3) {
            const starPos = new THREE.Vector3(regPositions[i], regPositions[i+1], regPositions[i+2]);
            const distance = starPos.distanceTo(hole.position);
            
            // Use fixed effect radius instead of dynamically calculated one
            if (distance < hole.effectRadius) {
              // Calculate direction AWAY from the white hole (pushing out)
              const direction = new THREE.Vector3().subVectors(starPos, hole.position).normalize();
              
              // Simple linear falloff with distance from center
              const forceFactor = 1 - (distance / hole.effectRadius);
              const force = forceFactor * hole.strength * 0.03;
              
              // Apply force
              starPos.add(direction.multiplyScalar(force));
              
              regPositions[i] = starPos.x;
              regPositions[i+1] = starPos.y;
              regPositions[i+2] = starPos.z;
              
              // Track affected stars for regeneration
              if (!affectedStarsRef.current.find(s => s.type === 'regular' && s.index === i)) {
                affectedStarsRef.current.push({
                  type: 'regular',
                  index: i,
                  originalPos: new THREE.Vector3(
                    originalPositionsRef.current.regular[i],
                    originalPositionsRef.current.regular[i+1],
                    originalPositionsRef.current.regular[i+2]
                  )
                });
              }
            }
          }
          regularStarsRef.current.geometry.attributes.position.needsUpdate = true;
        }
        
        // Affect twinkling stars
        if (twinkPositions) {
          for (let i = 0; i < twinkPositions.length; i += 3) {
            const starPos = new THREE.Vector3(twinkPositions[i], twinkPositions[i+1], twinkPositions[i+2]);
            const distance = starPos.distanceTo(hole.position);
            
            // Use fixed effect radius instead of dynamically calculated one
            if (distance < hole.effectRadius) {
              // Calculate direction AWAY from the white hole (pushing out)
              const direction = new THREE.Vector3().subVectors(starPos, hole.position).normalize();
              
              // Simple linear falloff with distance from center
              const forceFactor = 1 - (distance / hole.effectRadius);
              const force = forceFactor * hole.strength * 0.03;
              
              // Apply force
              starPos.add(direction.multiplyScalar(force));
              
              twinkPositions[i] = starPos.x;
              twinkPositions[i+1] = starPos.y;
              twinkPositions[i+2] = starPos.z;
              
              // Track affected stars for regeneration
              if (!affectedStarsRef.current.find(s => s.type === 'twinkling' && s.index === i)) {
                affectedStarsRef.current.push({
                  type: 'twinkling',
                  index: i,
                  originalPos: new THREE.Vector3(
                    originalPositionsRef.current.twinkling[i],
                    originalPositionsRef.current.twinkling[i+1],
                    originalPositionsRef.current.twinkling[i+2]
                  )
                });
              }
            }
          }
          twinklingStarsRef.current.geometry.attributes.position.needsUpdate = true;
        }
      });
    }
    
    // Handle fading in regenerated stars
    if (fadeInStars.length > 0) {
      fadeInStars.forEach(star => {
        if (star.type === 'regular' && regularStarsRef.current) {
          const positions = regularStarsRef.current.geometry.attributes.position.array;
          const i = star.index;
          const originalPos = star.originalPos;
          
          // Linear interpolation to original position
          const lerpFactor = Math.min(1, (Date.now() - (blackHoles[0]?.createdAt || whiteHoles[0]?.createdAt || Date.now())) / 2000);
          
          const currentPos = new THREE.Vector3(positions[i], positions[i+1], positions[i+2]);
          currentPos.lerp(originalPos, lerpFactor);
          
          positions[i] = currentPos.x;
          positions[i+1] = currentPos.y;
          positions[i+2] = currentPos.z;
        }
        
        if (star.type === 'twinkling' && twinklingStarsRef.current) {
          const positions = twinklingStarsRef.current.geometry.attributes.position.array;
          const i = star.index;
          const originalPos = star.originalPos;
          
          // Linear interpolation to original position
          const lerpFactor = Math.min(1, (Date.now() - (blackHoles[0]?.createdAt || whiteHoles[0]?.createdAt || Date.now())) / 2000);
          
          const currentPos = new THREE.Vector3(positions[i], positions[i+1], positions[i+2]);
          currentPos.lerp(originalPos, lerpFactor);
          
          positions[i] = currentPos.x;
          positions[i+1] = currentPos.y;
          positions[i+2] = currentPos.z;
        }
      });
      
      if (regularStarsRef.current) regularStarsRef.current.geometry.attributes.position.needsUpdate = true;
      if (twinklingStarsRef.current) twinklingStarsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  // Randomly make regular stars appear and disappear
  useEffect(() => {
    let interval;
    if (regularStarsRef.current) {
      interval = setInterval(() => {
        const sizes = regularStarsRef.current.geometry.attributes.size.array;
        for (let i = 0; i < 10; i++) {
          const randIndex = Math.floor(Math.random() * sizes.length);
          if (Math.random() > 0.5) {
            sizes[randIndex] = regularStarSizes[randIndex];
          } else {
            sizes[randIndex] = 0;
          }
        }
        regularStarsRef.current.geometry.attributes.size.needsUpdate = true;
      }, 200);
    }
    
    return () => clearInterval(interval);
  }, [regularStarSizes]);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    // Empty implementation that doesn't do anything anymore
    createBlackHole: () => {},
    createWhiteHole: () => {}
  }));

  return (
    <group>
      {/* Regular static stars */}
      <points ref={regularStarsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={regularStarPositions.length / 3}
            array={regularStarPositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={regularStarSizes.length}
            array={regularStarSizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={1}
          sizeAttenuation
          color="#ffffff"
          transparent
          opacity={0.8}
          fog={false}
          map={starTexture}
          blending={THREE.AdditiveBlending}
        />
      </points>
      
      {/* Twinkling stars with colors */}
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
          size={1}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.9}
          fog={false}
          blending={THREE.AdditiveBlending}
          map={starTexture}
          depthWrite={false}
        />
      </points>
      
      {/* Shooting stars */}
      <points ref={shootingStarsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={shootingStarPositions.length / 3}
            array={shootingStarPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <primitive object={shootingStarMaterial} attach="material" />
      </points>
      
      {/* Shooting star trails */}
      <primitive object={trailsRef.current} />
      
      {/* Nebula clouds */}
      <points ref={nebulaRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={nebulaPositions.length / 3}
            array={nebulaPositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={nebulaColors.length / 3}
            array={nebulaColors}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={nebulaSizes.length}
            array={nebulaSizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={1}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.5}
          fog={false}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          map={nebulaTexture}
        />
      </points>
      
      {/* Black holes - smaller size */}
      {blackHoles.map(hole => (
        <sprite
          key={hole.id}
          position={[hole.position.x, hole.position.y, hole.position.z]}
          scale={[hole.radius * 1.0, hole.radius * 1.0, 1]} // Even smaller visual size 
        >
          <spriteMaterial
            map={blackHoleTexture}
            transparent
            opacity={0.9}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </sprite>
      ))}
      
      {/* White holes - smaller size */}
      {whiteHoles.map(hole => (
        <sprite
          key={hole.id}
          position={[hole.position.x, hole.position.y, hole.position.z]}
          scale={[hole.radius * 1.0, hole.radius * 1.0, 1]} // Even smaller visual size
        >
          <spriteMaterial
            map={whiteHoleTexture}
            transparent
            opacity={0.9}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </sprite>
      ))}
    </group>
  );
});

StarBackground.displayName = 'StarBackground';

export { StarBackground }; 