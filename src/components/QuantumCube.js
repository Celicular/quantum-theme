import React, { useRef, useMemo, forwardRef, useImperativeHandle, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const hexToRgb = (hex) => {
  // Remove '#' if present
  hex = hex.replace('#', '');
  
  // Parse hex string
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  return { r, g, b };
};

const QuantumCube = forwardRef((props, ref) => {
  const { outerColor = "#c53ff2", innerColor = "#05d9fe" } = props;
  
  // Refs for the outer and inner cubes
  const outerCubeRef = useRef();
  const innerCubeRef = useRef();
  
  // Refs for shader materials to update colors
  const outerShaderRef = useRef();
  const innerShaderRef = useRef();
  
  // Time reference for synchronized animations
  const timeRef = useRef({ value: 0 });
  
  // State to track whether to use custom colors
  const [useCustomColors, setUseCustomColors] = useState(false);
  
  // Convert hex colors to RGB
  const outerColorRgb = useMemo(() => hexToRgb(outerColor), [outerColor]);
  const innerColorRgb = useMemo(() => hexToRgb(innerColor), [innerColor]);
  
  // Create gradient shader material for the inner cube with smooth gradients
  const innerCubeShaderMaterial = useMemo(() => {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        colorBase: { value: new THREE.Color(innerColorRgb.r, innerColorRgb.g, innerColorRgb.b) },
        colorAccent: { value: new THREE.Color(innerColorRgb.r * 0.7, innerColorRgb.g * 0.7, innerColorRgb.b * 0.7) },
        useCustomColors: { value: useCustomColors ? 1.0 : 0.0 }
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
        uniform vec3 colorBase;
        uniform vec3 colorAccent;
        uniform float useCustomColors;
        varying vec3 vPosition;
        varying vec2 vUv;
        
        // Original space theme gradient colors
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
          
          // Add brighter star-like highlights
          float specular = pow(max(0.0, 1.0 - length(vUv - vec2(0.5))), 8.0) * 0.4;
          
          // Add enhanced cosmic reflection effect
          float edge = pow(1.0 - abs(dot(normalize(vec3(1.0, 1.0, 1.0)), pos)), 3.0);
          
          vec3 colorMix1;
          vec3 colorMix2;
          vec3 reflectionColor;
          vec3 specularColor;
          
          if (useCustomColors > 0.5) {
            // Use custom colors when the flag is true
            vec3 customGradientA = colorAccent * 0.6;
            vec3 customGradientB = colorBase;
            vec3 customGradientC = colorBase * 1.3;
            
            colorMix1 = mix(customGradientA, customGradientB, t1);
            colorMix2 = mix(customGradientB, customGradientC, t2);
            reflectionColor = colorBase * edge * 0.2;
            specularColor = colorBase;
          } else {
            // Use original colors
            colorMix1 = mix(gradientA, gradientB, t1);
            colorMix2 = mix(gradientB, gradientC, t2);
            reflectionColor = vec3(0.2, 0.4, 0.8) * edge * 0.2;
            specularColor = vec3(0.3, 0.5, 0.9);
          }
          
          vec3 baseColor = mix(colorMix1, colorMix2, blend);
          
          // Final color with more vibrant space-like quality
          vec3 finalColor = baseColor + reflectionColor + specular * specularColor;
          
          // Add slight transparency
          gl_FragColor = vec4(finalColor, 0.95);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });
    
    innerShaderRef.current = material;
    return material;
  }, [innerColorRgb, useCustomColors]);
  
  // Create glass morph shader for the outer cube with lighter colors
  const outerCubeShaderMaterial = useMemo(() => {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color(outerColorRgb.r * 0.5, outerColorRgb.g * 0.5, outerColorRgb.b * 0.5) },
        color2: { value: new THREE.Color(outerColorRgb.r, outerColorRgb.g, outerColorRgb.b) },
        color3: { value: new THREE.Color(outerColorRgb.r * 0.8, outerColorRgb.g * 0.8, outerColorRgb.b * 0.8) },
        useCustomColors: { value: useCustomColors ? 1.0 : 0.0 }
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
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 color3;
        uniform float useCustomColors;
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        
        // Original space-themed colors for outer cube
        vec3 originalColor1 = vec3(0.2, 0.3, 0.5);   // Medium blue
        vec3 originalColor2 = vec3(0.35, 0.2, 0.5);  // Medium purple
        vec3 originalColor3 = vec3(0.2, 0.4, 0.5);   // Medium teal
        
        void main() {
          // Enhanced Fresnel effect for glass appearance - less reflective
          vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
          float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), 2.0) * 0.5;
          
          // Time-based color shifting (very slow)
          float t = sin(time * 0.1) * 0.5 + 0.5;
          
          vec3 baseColor;
          vec3 fresnelColor;
          
          if (useCustomColors > 0.5) {
            // Use custom colors when the flag is true
            baseColor = mix(mix(color1, color2, t), color3, sin(time * 0.12) * 0.5 + 0.5);
            fresnelColor = color2;
          } else {
            // Always use original colors
            baseColor = mix(mix(originalColor1, originalColor2, t), originalColor3, sin(time * 0.12) * 0.5 + 0.5);
            fresnelColor = vec3(0.2, 0.3, 0.5);
          }
          
          // Add a subtle nebula-like pattern
          float pattern = 0.03 * sin(vPosition.x * 3.0 + vPosition.y * 3.0 + vPosition.z * 3.0 + time * 0.15);
          
          // Enhanced glass-like appearance with more subtle highlights
          vec3 finalColor = baseColor * (0.7 + pattern) + fresnelColor * fresnel;
          
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
    
    outerShaderRef.current = material;
    return material;
  }, [outerColorRgb, useCustomColors]);

  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    changeColors: (newOuterColor, newInnerColor) => {
      // Convert hex colors to rgb
      const outerRgb = hexToRgb(newOuterColor);
      const innerRgb = hexToRgb(newInnerColor);
      
      // Update inner cube colors
      if (innerShaderRef.current) {
        innerShaderRef.current.uniforms.colorBase.value = new THREE.Color(innerRgb.r, innerRgb.g, innerRgb.b);
        innerShaderRef.current.uniforms.colorAccent.value = new THREE.Color(innerRgb.r * 0.7, innerRgb.g * 0.7, innerRgb.b * 0.7);
        innerShaderRef.current.uniforms.useCustomColors.value = 1.0;
      }
      
      // Update outer cube colors
      if (outerShaderRef.current) {
        outerShaderRef.current.uniforms.color1.value = new THREE.Color(outerRgb.r * 0.5, outerRgb.g * 0.5, outerRgb.b * 0.5);
        outerShaderRef.current.uniforms.color2.value = new THREE.Color(outerRgb.r, outerRgb.g, outerRgb.b);
        outerShaderRef.current.uniforms.color3.value = new THREE.Color(outerRgb.r * 0.8, outerRgb.g * 0.8, outerRgb.b * 0.8);
        outerShaderRef.current.uniforms.useCustomColors.value = 1.0;
      }
      
      // Update the state
      setUseCustomColors(true);
    }
  }));

  // Animation loop for rotations and shader uniforms
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    timeRef.current.value = time;
    
    // Update shader uniforms
    innerCubeShaderMaterial.uniforms.time.value = time;
    outerCubeShaderMaterial.uniforms.time.value = time;
    
    // Outer cube rotations - use Math.sin for smoother mobile performance
    if (outerCubeRef.current) {
      // Use simpler rotation calculations for better mobile performance
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
  }, false, []);

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
});

QuantumCube.displayName = 'QuantumCube';

export default QuantumCube; 