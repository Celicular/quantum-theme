import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const QuantumCube = () => {
  const { viewport } = useThree();
  const [isMobile, setIsMobile] = useState(false);
  
  // Check for mobile device on mount with a more stringent check
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1024); // Consider more devices as mobile for better performance
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Refs for the outer and inner cubes
  const outerCubeRef = useRef();
  const innerCubeRef = useRef();
  
  // Time reference for synchronized animations
  const timeRef = useRef({ value: 0 });
  
  // Create gradient shader material for the inner cube with smooth gradients
  const innerCubeShaderMaterial = useMemo(() => {
    // Use extremely simplified shader for mobile
    const fragmentShader = isMobile ? `
      uniform float time;
      varying vec3 vPosition;
      
      // Single blue color for mobile
      vec3 baseColor = vec3(0.1, 0.3, 0.7);
      
      void main() {
        // Normalized position for simple lighting
        vec3 pos = normalize(vPosition);
        
        // Very basic lighting effect
        float light = 0.6 + 0.4 * dot(pos, normalize(vec3(1.0, 1.0, 1.0)));
        
        // Simple slow pulsing effect (much less computation)
        float pulse = 0.1 * sin(time * 0.2) + 0.9;
        
        // Final color with minimal calculations
        vec3 finalColor = baseColor * light * pulse;
        
        gl_FragColor = vec4(finalColor, 0.95);
      }
    ` : `
      uniform float time;
      varying vec3 vPosition;
      varying vec2 vUv;
      
      // Space theme gradient colors - LIGHTER, more vibrant colors with BLUE focus
      vec3 gradientA = vec3(0.1, 0.2, 0.5);    // Deep blue
      vec3 gradientB = vec3(0.05, 0.3, 0.7);   // Bright blue
      vec3 gradientC = vec3(0.2, 0.4, 0.8);    // Light blue
      
      // Smoothstep function for smoother transitions
      float smooth_val(float t) {
        return t * t * (3.0 - 2.0 * t);
      }
      
      void main() {
        // Normalized position for gradients
        vec3 pos = normalize(vPosition);
        
        // Animated time values for color cycling (very slow)
        float t1 = smooth_val(sin(time * 0.1) * 0.5 + 0.5);
        float t2 = smooth_val(sin(time * 0.15 + 2.0) * 0.5 + 0.5);
        
        // Create smooth color gradient based on position and time
        float blend = smooth_val(0.5 + 0.5 * sin(pos.x * 2.0 + pos.y * 2.0 + pos.z * 2.0 + time * 0.2));
        vec3 colorMix1 = mix(gradientA, gradientB, t1);
        vec3 colorMix2 = mix(gradientB, gradientC, t2);
        vec3 baseColor = mix(colorMix1, colorMix2, blend);
        
        // Add brighter star-like highlights
        float specular = pow(max(0.0, 1.0 - length(vUv - vec2(0.5))), 8.0) * 0.4;
        
        // Add enhanced cosmic reflection effect
        float edge = pow(1.0 - abs(dot(normalize(vec3(1.0, 1.0, 1.0)), pos)), 3.0);
        vec3 reflection = vec3(0.2, 0.4, 0.8) * edge * 0.2;
        
        // Final color with more vibrant space-like quality
        vec3 finalColor = baseColor + reflection + specular * vec3(0.3, 0.5, 0.9);
        
        // Add slight transparency
        gl_FragColor = vec4(finalColor, 0.95);
      }
    `;
    
    // Use simpler vertex shader for mobile
    const vertexShader = isMobile ? `
      varying vec3 vPosition;
      
      void main() {
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    ` : `
      varying vec3 vPosition;
      varying vec2 vUv;
      
      void main() {
        vPosition = position;
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      side: THREE.DoubleSide
    });
  }, [isMobile]);
  
  // Create glass morph shader for the outer cube with lighter colors
  const outerCubeShaderMaterial = useMemo(() => {
    // Use extremely simplified shader for mobile or use a basic material instead
    if (isMobile) {
      return new THREE.MeshBasicMaterial({
        color: new THREE.Color(0.2, 0.3, 0.5),
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide
      });
    }
    
    // Full shader for desktop
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        
        void main() {
          vPosition = position;
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        
        // More visible space-themed colors for outer cube
        vec3 color1 = vec3(0.2, 0.3, 0.5);   // Medium blue
        vec3 color2 = vec3(0.35, 0.2, 0.5);  // Medium purple
        vec3 color3 = vec3(0.2, 0.4, 0.5);   // Medium teal
        
        void main() {
          // Enhanced Fresnel effect for glass appearance - less reflective
          vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
          float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), 2.0) * 0.5;
          
          // Time-based color shifting (very slow)
          float t = sin(time * 0.1) * 0.5 + 0.5;
          vec3 baseColor = mix(mix(color1, color2, t), color3, sin(time * 0.12) * 0.5 + 0.5);
          
          // Add a subtle nebula-like pattern
          float pattern = 0.03 * sin(vPosition.x * 3.0 + vPosition.y * 3.0 + vPosition.z * 3.0 + time * 0.15);
          
          // Enhanced glass-like appearance with more subtle highlights
          vec3 finalColor = baseColor * (0.7 + pattern) + vec3(0.2, 0.3, 0.5) * fresnel;
          
          // Adjusted transparency for better visibility
          float opacity = 0.08 + fresnel * 0.08;
          
          gl_FragColor = vec4(finalColor, opacity);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
  }, [isMobile]);

  // Animation loop for rotations and shader uniforms - further optimized for mobile
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    timeRef.current.value = time;
    
    // Update shader uniforms - VERY reduced updates on mobile
    if (!isMobile) {
      innerCubeShaderMaterial.uniforms.time.value = time;
      if (outerCubeShaderMaterial.uniforms) {
        outerCubeShaderMaterial.uniforms.time.value = time;
      }
    } else if (Math.floor(time * 5) % 5 === 0) {
      // Only update every 5th frame on mobile
      innerCubeShaderMaterial.uniforms.time.value = time;
    }
    
    // Even slower rotation on mobile to improve performance
    const rotationSpeed = isMobile ? 0.25 : 1.0;
    
    // Outer cube rotations - simplified for mobile
    if (outerCubeRef.current) {
      if (isMobile) {
        // Single axis rotation for mobile
        outerCubeRef.current.rotation.y = time * 0.15 * rotationSpeed;
      } else {
        outerCubeRef.current.rotation.x = time * 0.25 * rotationSpeed;
        outerCubeRef.current.rotation.y = time * 0.2 * rotationSpeed;
        outerCubeRef.current.rotation.z = time * 0.15 * rotationSpeed;
      }
    }
    
    // Inner cube rotations - simplified for mobile
    if (innerCubeRef.current) {
      if (isMobile) {
        // Single axis rotation in opposite direction for mobile
        innerCubeRef.current.rotation.y = time * -0.3 * rotationSpeed;
      } else {
        innerCubeRef.current.rotation.x = time * -0.4 * rotationSpeed;
        innerCubeRef.current.rotation.y = time * 0.5 * rotationSpeed;
        innerCubeRef.current.rotation.z = time * -0.3 * rotationSpeed;
      }
    }
  });

  // Smaller cube size on mobile
  const outerCubeSize = isMobile ? 2.8 : 3.5;
  const innerCubeSize = isMobile ? 1.4 : 1.8;

  return (
    <group>
      {/* Outer transparent cube with glass morph effect */}
      <mesh ref={outerCubeRef}>
        <boxGeometry args={[outerCubeSize, outerCubeSize, outerCubeSize]} />
        <primitive object={outerCubeShaderMaterial} attach="material" />
      </mesh>
      
      {/* Inner colorful cube with gradient effect */}
      <mesh ref={innerCubeRef}>
        <boxGeometry args={[innerCubeSize, innerCubeSize, innerCubeSize]} />
        <primitive object={innerCubeShaderMaterial} attach="material" />
      </mesh>
    </group>
  );
};

export default QuantumCube; 