import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaHandPaper, FaSearch, FaPlus, FaMinus } from 'react-icons/fa';
import { GiCube } from 'react-icons/gi';

const glowPulse = keyframes`
  0% { box-shadow: 0 0 5px rgba(100, 180, 255, 0.5), 0 0 10px rgba(50, 120, 220, 0.3); }
  50% { box-shadow: 0 0 12px rgba(120, 200, 255, 0.7), 0 0 20px rgba(80, 150, 255, 0.5); }
  100% { box-shadow: 0 0 5px rgba(100, 180, 255, 0.5), 0 0 10px rgba(50, 120, 220, 0.3); }
`;

const ToolbarContainer = styled.div`
  position: fixed;
  display: flex;
  flex-direction: column;
  z-index: 1000;
  backdrop-filter: blur(10px);
  background: rgba(15, 25, 50, 0.3);
  border-radius: 15px;
  padding: 10px;
  border: 1px solid rgba(100, 180, 255, 0.4);
  animation: ${glowPulse} 4s infinite ease-in-out;
  
  /* Desktop position */
  @media (min-width: 768px) {
    left: 30px;
    top: 50%;
    transform: translateY(-50%);
  }
  
  /* Mobile position */
  @media (max-width: 767px) {
    bottom: 120px;
    left: 50%;
    transform: translateX(-50%);
    flex-direction: row;
  }
`;

const ToolButton = styled.button`
  width: 45px;
  height: 45px;
  border-radius: 12px;
  background: rgba(20, 35, 70, 0.6);
  color: rgba(150, 220, 255, 0.8);
  border: 1px solid rgba(100, 180, 255, 0.4);
  margin: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 20px;
  
  &:hover, &.active {
    background: rgba(30, 50, 100, 0.8);
    color: rgba(200, 230, 255, 1);
    transform: scale(1.05);
  }
  
  &:focus {
    outline: none;
  }
`;

const ZoomSliderContainer = styled.div`
  height: ${props => props.isVisible ? '120px' : '0'};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: height 0.3s ease;
  
  @media (max-width: 767px) {
    height: auto;
    width: ${props => props.isVisible ? '120px' : '0'};
    position: absolute;
    top: -80px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(15, 25, 50, 0.7);
    border-radius: 15px;
    padding: ${props => props.isVisible ? '10px' : '0'};
    border: ${props => props.isVisible ? '1px solid rgba(100, 180, 255, 0.4)' : 'none'};
  }
`;

const SliderWrapper = styled.div`
  position: relative;
  height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 0;
  
  @media (max-width: 767px) {
    flex-direction: row;
    height: auto;
    width: 100px;
  }
`;

const StyledSlider = styled.input`
  -webkit-appearance: none;
  width: 100px;
  height: 5px;
  background: rgba(100, 180, 255, 0.4);
  border-radius: 5px;
  transform: rotate(-90deg);
  cursor: pointer;
  
  &:focus {
    outline: none;
  }
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: rgba(150, 220, 255, 0.8);
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  &::-moz-range-thumb {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: rgba(150, 220, 255, 0.8);
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  @media (max-width: 767px) {
    transform: rotate(0);
  }
`;

const ZoomLabel = styled.div`
  color: rgba(150, 220, 255, 0.8);
  font-size: 12px;
  margin-top: 5px;
`;

const ControlToolbar = ({ 
  setZoom, 
  currentZoom,
  setSelectedTool
}) => {
  const [showZoomSlider, setShowZoomSlider] = useState(false);
  const [activeToolId, setActiveToolId] = useState('none');
  
  // Load selected tool from localStorage on component mount
  useEffect(() => {
    const savedTool = localStorage.getItem('selectedTool');
    if (savedTool) {
      setActiveToolId(savedTool);
      
      // Set the selected tool in parent component
      if (setSelectedTool) {
        setSelectedTool(savedTool);
      }
    }
  }, [setSelectedTool]);
  
  const handleZoomChange = (e) => {
    const value = parseFloat(e.target.value);
    setZoom(value);
  };
  
  const selectTool = (toolId) => {
    // If clicking the same tool, deselect it
    if (activeToolId === toolId) {
      setActiveToolId('none');
      localStorage.setItem('selectedTool', 'none');
      setSelectedTool('none');
    } else {
      // Select the new tool
      setActiveToolId(toolId);
      localStorage.setItem('selectedTool', toolId);
      setSelectedTool(toolId);
    }
  };
  
  return (
    <ToolbarContainer>
      <ToolButton 
        onClick={() => selectTool('pan')} 
        className={activeToolId === 'pan' ? 'active' : ''}
        title="Pan Tool - Click to activate"
      >
        <FaHandPaper />
      </ToolButton>
      
      <ToolButton 
        onClick={() => setShowZoomSlider(!showZoomSlider)}
        title="Zoom Controls"
      >
        {showZoomSlider ? <FaMinus /> : <FaPlus />}
      </ToolButton>
      
      <ZoomSliderContainer isVisible={showZoomSlider}>
        <SliderWrapper>
          <StyledSlider
            type="range"
            min="10"
            max="25"
            step="0.5"
            value={currentZoom}
            onChange={handleZoomChange}
          />
          <ZoomLabel>{Math.round(currentZoom * 10) / 10}x</ZoomLabel>
        </SliderWrapper>
      </ZoomSliderContainer>
      
      <ToolButton 
        onClick={() => selectTool('changeColor')}
        className={activeToolId === 'changeColor' ? 'active' : ''}
        title="Change Cube Color - Click to activate"
      >
        <GiCube />
      </ToolButton>
    </ToolbarContainer>
  );
};

export default ControlToolbar; 