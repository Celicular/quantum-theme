import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const QuantumCube = () => {
  // Refs for the outer and inner cubes
  const outerCubeRef = useRef();
  const innerCubeRef = useRef();
  
  // Time reference for synchronized animations
  const timeRef = useRef({ value: 0 });
  
  // Create gradient shader material for the inner cube with smooth gradients
  const innerCubeShaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
        varying vec3 vPosition;
        varying vec2 vUv;
        
        void main() {
          vPosition = position;
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
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
      `,
      transparent: true,
      side: THREE.DoubleSide
    });
  }, []);
  
  // Create glass morph shader for the outer cube with lighter colors
  const outerCubeShaderMaterial = useMemo(() => {
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
  }, []);

  // Animation loop for rotations and shader uniforms
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    timeRef.current.value = time;
    
    // Update shader uniforms
    innerCubeShaderMaterial.uniforms.time.value = time;
    outerCubeShaderMaterial.uniforms.time.value = time;
    
    // Outer cube rotations
    if (outerCubeRef.current) {
      outerCubeRef.current.rotation.x = time * 0.25;
      outerCubeRef.current.rotation.y = time * 0.2;
      outerCubeRef.current.rotation.z = time * 0.15;
    }
    
    // Inner cube rotations - different directions
    if (innerCubeRef.current) {
      innerCubeRef.current.rotation.x = time * -0.4;
      innerCubeRef.current.rotation.y = time * 0.5;
      innerCubeRef.current.rotation.z = time * -0.3;
    }
  });

  return (
    <group>
      {/* Outer transparent cube with glass morph effect */}
      <mesh ref={outerCubeRef}>
        <boxGeometry args={[3.5, 3.5, 3.5]} />
        <primitive object={outerCubeShaderMaterial} attach="material" />
      </mesh>
      
      {/* Inner colorful cube with gradient effect */}
      <mesh ref={innerCubeRef}>
        <boxGeometry args={[1.8, 1.8, 1.8]} />
        <primitive object={innerCubeShaderMaterial} attach="material" />
      </mesh>
    </group>
  );
};

export default QuantumCube; 