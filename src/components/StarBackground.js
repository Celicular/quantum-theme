import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const StarBackground = () => {
  // References for different star groups
  const regularStarsRef = useRef();
  const twinklingStarsRef = useRef();
  const shootingStarsRef = useRef();
  const nebulaRef = useRef();
  const trailsRef = useRef(new THREE.Group());

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

  // Create regular background stars
  const [regularStarPositions, regularStarSizes] = useMemo(() => {
    const positions = [];
    const sizes = [];
    const starCount = 2000; // More stars
    
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
  }, []);

  // Create twinkling stars
  const [twinklingStarPositions, twinklingStarColors, twinklingStarSizes] = useMemo(() => {
    const positions = [];
    const colors = [];
    const sizes = [];
    const starCount = 400;
    
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
  }, []);

  // Create shooting stars with better visibility
  const shootingStarData = useMemo(() => {
    const stars = [];
    const count = 50; // Increased count for more shooting stars
    
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
        trailLength: 15 + Math.floor(Math.random() * 20),
        startTime: Math.random() * 10,
        duration: 2 + Math.random() * 3,
        size: 0.2 + Math.random() * 0.3,
        color: new THREE.Color(0.9, 0.9, 1.0)
      });
    }
    
    return stars;
  }, []);

  // Create nebula clouds
  const [nebulaPositions, nebulaColors, nebulaSizes] = useMemo(() => {
    const positions = [];
    const colors = [];
    const sizes = [];
    const cloudCount = 8;
    
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
  }, []);

  // Create and store textures
  const starTexture = useMemo(() => createStarTexture(), []);
  const nebulaTexture = useMemo(() => createNebulaTexture(), []);

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

  // Frame update for animations
  useFrame(({ clock }) => {
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
        
        // Update star positions in geometry
        if (shootingStarsRef.current.geometry && shootingStarsRef.current.geometry.attributes.position) {
          const positions = shootingStarsRef.current.geometry.attributes.position.array;
          const idx = index * 3;
          
          positions[idx] = star.position.x;
          positions[idx + 1] = star.position.y;
          positions[idx + 2] = star.position.z;
        }
      });
      
      if (shootingStarsRef.current.geometry) {
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
  });

  // Set up shooting star positions
  const shootingStarPositions = useMemo(() => {
    const positions = new Float32Array(shootingStarData.length * 3);
    
    shootingStarData.forEach((star, i) => {
      positions[i * 3] = star.position.x;
      positions[i * 3 + 1] = star.position.y;
      positions[i * 3 + 2] = star.position.z;
    });
    
    return positions;
  }, [shootingStarData]);

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
    </group>
  );
};

export default StarBackground; 