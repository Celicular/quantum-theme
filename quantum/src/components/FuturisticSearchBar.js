import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaSearch, FaMicrophone, FaRobot } from 'react-icons/fa';

const scanAnimation = keyframes`
  0% {
    transform: translateX(-100%);
    opacity: 0.5;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    transform: translateX(100%);
    opacity: 0.5;
  }
`;

const pulseAnimation = keyframes`
  0% {
    box-shadow: 0 0 4px 1px rgba(72, 118, 255, 0.2);
  }
  50% {
    box-shadow: 0 0 16px 2px rgba(72, 118, 255, 0.6);
  }
  100% {
    box-shadow: 0 0 4px 1px rgba(72, 118, 255, 0.2);
  }
`;

const micPulseAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.7;
  }
`;

const SearchContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, 60px);
  width: clamp(300px, 90%, 600px);
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media (max-width: 768px) {
    transform: translate(-50%, 30px);
    width: 90%;
  }
`;

const SearchBar = styled.div`
  width: 100%;
  height: 50px;
  background: rgba(2, 6, 24, 0.6);
  border: 1px solid rgba(71, 98, 255, 0.4);
  border-radius: 25px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  position: relative;
  backdrop-filter: blur(10px);
  box-shadow: 0 0 10px rgba(51, 94, 255, 0.2), 
              inset 0 0 15px rgba(0, 12, 59, 0.8);
  transition: all 0.3s ease;
  
  &:hover, &:focus-within {
    border: 1px solid rgba(82, 123, 255, 0.8);
    animation: ${pulseAnimation} 2s infinite ease-in-out;
    background: rgba(4, 8, 32, 0.7);
  }
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, 
      rgba(72, 118, 255, 0), 
      rgba(72, 118, 255, 0.8), 
      rgba(72, 118, 255, 0));
    border-radius: 25px 25px 0 0;
  }
  
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(72, 118, 255, 0.2),
      transparent
    );
    border-radius: 25px;
    animation: ${scanAnimation} 3s infinite;
    pointer-events: none;
  }
`;

const SearchInput = styled.input`
  background: transparent;
  border: none;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  padding: 10px;
  width: 100%;
  outline: none;
  font-family: 'Orbitron', sans-serif;
  letter-spacing: 1px;
  
  &::placeholder {
    color: rgba(178, 195, 255, 0.5);
    transition: all 0.3s ease;
  }
  
  &:focus::placeholder {
    color: rgba(178, 195, 255, 0.7);
    transform: translateX(5px);
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(178, 195, 255, 0.8);
  font-size: 16px;
  margin-right: ${props => props.marginRight ? '10px' : '0'};
  margin-left: ${props => props.marginLeft ? '10px' : '0'};
  cursor: pointer;
  transition: color 0.3s ease, transform 0.2s ease;
  
  &:hover {
    color: rgba(110, 162, 255, 1);
    transform: scale(1.1);
  }
  
  ${props => props.active && `
    color: rgba(99, 166, 255, 1);
    animation: ${micPulseAnimation} 2s infinite ease-in-out;
  `}
`;

const SearchSuggestions = styled.div`
  width: 100%;
  background: rgba(2, 6, 24, 0.8);
  border: 1px solid rgba(71, 98, 255, 0.3);
  border-top: none;
  border-radius: 0 0 15px 15px;
  margin-top: -10px;
  padding: 20px 15px 10px;
  backdrop-filter: blur(10px);
  display: ${props => (props.visible ? 'block' : 'none')};
  transform-origin: top center;
  transition: transform 0.3s ease, opacity 0.3s ease;
  box-shadow: 0 5px 15px rgba(10, 17, 51, 0.6);
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 10%;
    right: 10%;
    height: 1px;
    background: linear-gradient(90deg, 
      rgba(72, 118, 255, 0), 
      rgba(72, 118, 255, 0.5), 
      rgba(72, 118, 255, 0));
  }
`;

const SuggestionItem = styled.div`
  color: rgba(178, 195, 255, 0.8);
  padding: 8px 20px;
  border-radius: 4px;
  margin-bottom: 8px;
  cursor: pointer;
  font-family: 'Orbitron', sans-serif;
  font-size: 14px;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(71, 98, 255, 0.2);
    color: rgba(210, 220, 255, 1);
    transform: translateX(5px);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
  
  svg {
    margin-right: 10px;
    opacity: 0.7;
  }
`;

const StatusIndicator = styled.div`
  width: 60%;
  height: 3px;
  border-radius: 2px;
  background: rgba(30, 45, 90, 0.5);
  margin-top: 10px;
  overflow: hidden;
  opacity: ${props => (props.visible ? 1 : 0)};
  transition: opacity 0.3s ease;
  
  &:after {
    content: '';
    display: block;
    width: 30%;
    height: 100%;
    background: linear-gradient(90deg, 
      rgba(72, 118, 255, 0.3), 
      rgba(72, 118, 255, 0.8), 
      rgba(72, 118, 255, 0.3));
    animation: ${scanAnimation} 2s infinite;
  }
`;

const suggestions = [
  { text: "Quantum computing applications", icon: <FaRobot /> },
  { text: "Advanced neural networks", icon: <FaRobot /> },
  { text: "Artificial intelligence ethics", icon: <FaRobot /> },
  { text: "Quantum cryptography methods", icon: <FaRobot /> }
];

const FuturisticSearchBar = () => {
  const [inputFocused, setInputFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [statusVisible, setStatusVisible] = useState(false);
  
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  
  useEffect(() => {
    // Show suggestions with slight delay for a more interactive feel
    let timer;
    if (inputFocused || inputValue) {
      timer = setTimeout(() => {
        setShowSuggestions(true);
      }, 200);
    } else {
      timer = setTimeout(() => {
        setShowSuggestions(false);
      }, 200);
    }
    
    return () => clearTimeout(timer);
  }, [inputFocused, inputValue]);
  
  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setInputFocused(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (e.target.value) {
      setStatusVisible(true);
    } else {
      setStatusVisible(false);
    }
  };
  
  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    inputRef.current.focus();
  };
  
  const toggleVoiceInput = () => {
    setIsListening(!isListening);
    if (!isListening) {
      // Simulate voice recognition starting
      setStatusVisible(true);
      // Simulate voice recognition ending after 3 seconds
      setTimeout(() => {
        setIsListening(false);
        setInputValue('Quantum computing applications');
        setTimeout(() => setStatusVisible(false), 1000);
      }, 3000);
    } else {
      setStatusVisible(false);
    }
  };

  return (
    <SearchContainer ref={containerRef}>
      <SearchBar>
        <IconWrapper marginRight>
          <FaSearch />
        </IconWrapper>
        <SearchInput
          ref={inputRef}
          placeholder="ENTER QUERY..."
          onFocus={() => setInputFocused(true)}
          value={inputValue}
          onChange={handleInputChange}
        />
        <IconWrapper marginLeft active={isListening} onClick={toggleVoiceInput}>
          <FaMicrophone />
        </IconWrapper>
      </SearchBar>
      
      <StatusIndicator visible={statusVisible} />
      
      <SearchSuggestions visible={showSuggestions}>
        {suggestions.map((suggestion, index) => (
          <SuggestionItem 
            key={index} 
            onClick={() => handleSuggestionClick(suggestion.text)}
          >
            {suggestion.icon}
            {suggestion.text}
          </SuggestionItem>
        ))}
      </SearchSuggestions>
    </SearchContainer>
  );
};

export default FuturisticSearchBar; 