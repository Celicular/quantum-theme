import React from 'react';
import styled, { keyframes } from 'styled-components';

const gradientAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    text-shadow: 0 0 10px rgba(138, 43, 226, 0.7), 
                0 0 20px rgba(138, 43, 226, 0.5), 
                0 0 30px rgba(138, 43, 226, 0.3);
  }
  50% {
    transform: scale(1.05);
    text-shadow: 0 0 15px rgba(138, 43, 226, 0.9), 
                0 0 30px rgba(138, 43, 226, 0.7), 
                0 0 50px rgba(138, 43, 226, 0.5);
  }
  100% {
    transform: scale(1);
    text-shadow: 0 0 10px rgba(138, 43, 226, 0.7), 
                0 0 20px rgba(138, 43, 226, 0.5), 
                0 0 30px rgba(138, 43, 226, 0.3);
  }
`;

const letterSpacingAnimation = keyframes`
  0% {
    letter-spacing: 12px;
  }
  50% {
    letter-spacing: 20px;
  }
  100% {
    letter-spacing: 12px;
  }
`;

// Mobile version with reduced letter spacing
const mobileLetterSpacingAnimation = keyframes`
  0% {
    letter-spacing: 4px;
  }
  50% {
    letter-spacing: 8px;
  }
  100% {
    letter-spacing: 4px;
  }
`;

const glitchAnimation = keyframes`
  0% {
    transform: translate(0);
  }
  2% {
    transform: translate(-2px, 0);
  }
  4% {
    transform: translate(2px, 0);
  }
  6% {
    transform: translate(0, 2px);
  }
  8% {
    transform: translate(0, -2px);
  }
  10% {
    transform: translate(0);
  }
  100% {
    transform: translate(0);
  }
`;

const TitleContainer = styled.div`
  position: absolute;
  top: 60px;
  left: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  pointer-events: none;
  padding: 0 20px;
  
  @media (max-width: 768px) {
    top: 40px;
  }
  
  @media (max-width: 480px) {
    top: 30px;
  }
`;

const MainTitle = styled.h1`
  font-family: 'Orbitron', sans-serif;
  font-size: 3.5rem;
  font-weight: 700;
  color: transparent;
  letter-spacing: 12px;
  margin: 0;
  padding: 0;
  text-align: center;
  background: linear-gradient(90deg, #c53ff2, #05d9fe, #c53ff2);
  background-size: 300% 300%;
  -webkit-background-clip: text;
  background-clip: text;
  animation: ${gradientAnimation} 8s ease infinite,
             ${pulseAnimation} 4s ease-in-out infinite,
             ${letterSpacingAnimation} 8s ease-in-out infinite,
             ${glitchAnimation} 10s infinite;
  text-shadow: 0 0 10px rgba(138, 43, 226, 0.7), 
               0 0 20px rgba(138, 43, 226, 0.5), 
               0 0 30px rgba(138, 43, 226, 0.3);
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
    letter-spacing: 8px;
    animation: ${gradientAnimation} 8s ease infinite,
               ${pulseAnimation} 4s ease-in-out infinite,
               ${mobileLetterSpacingAnimation} 8s ease-in-out infinite,
               ${glitchAnimation} 10s infinite;
  }
  
  @media (max-width: 480px) {
    font-size: 2rem;
    letter-spacing: 4px;
  }
`;

const GlowLayer = styled.span`
  position: absolute;
  font-family: 'Orbitron', sans-serif;
  font-size: 3.5rem;
  font-weight: 700;
  color: transparent;
  letter-spacing: 12px;
  background: linear-gradient(90deg, #ff00ff, #00ffff, #ff00ff);
  background-size: 300% 300%;
  -webkit-background-clip: text;
  background-clip: text;
  opacity: 0.5;
  filter: blur(8px);
  animation: ${gradientAnimation} 8s ease infinite,
             ${letterSpacingAnimation} 8s ease-in-out infinite;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
    letter-spacing: 8px;
    animation: ${gradientAnimation} 8s ease infinite,
               ${mobileLetterSpacingAnimation} 8s ease-in-out infinite;
  }
  
  @media (max-width: 480px) {
    font-size: 2rem;
    letter-spacing: 4px;
    filter: blur(5px);
  }
`;

const Subtitle = styled.div`
  font-family: 'Rajdhani', sans-serif;
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 15px;
  letter-spacing: 4px;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  
  @media (max-width: 768px) {
    font-size: 1rem;
    letter-spacing: 3px;
    margin-top: 10px;
  }
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
    letter-spacing: 2px;
  }
`;

const AnimatedTitle = () => {
  return (
    <TitleContainer>
      <MainTitle>
        <GlowLayer>QUANTUM</GlowLayer>
        QUANTUM
      </MainTitle>
      
      <Subtitle>EXPLORE THE POSSIBILITIES</Subtitle>
    </TitleContainer>
  );
};

export default AnimatedTitle; 