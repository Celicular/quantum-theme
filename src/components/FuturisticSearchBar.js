import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaSearch } from 'react-icons/fa';

const glowPulse = keyframes`
  0% { box-shadow: 0 0 5px rgba(100, 180, 255, 0.5), 0 0 10px rgba(50, 120, 220, 0.3); }
  50% { box-shadow: 0 0 12px rgba(120, 200, 255, 0.7), 0 0 20px rgba(80, 150, 255, 0.5); }
  100% { box-shadow: 0 0 5px rgba(100, 180, 255, 0.5), 0 0 10px rgba(50, 120, 220, 0.3); }
`;

const scanLine = keyframes`
  0% { transform: translateX(-100%); opacity: 0.5; }
  100% { transform: translateX(100%); opacity: 0; }
`;

const blinkCursor = keyframes`
  0% { opacity: 1; }
  40% { opacity: 1; }
  50% { opacity: 0; }
  90% { opacity: 0; }
  100% { opacity: 1; }
`;

const SearchBarContainer = styled.div`
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  z-index: 1000;
  width: 450px;
  max-width: 90vw;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 25px;
  backdrop-filter: blur(10px);
  animation: ${glowPulse} 4s infinite ease-in-out;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 30px;
    height: 100%;
    background: linear-gradient(90deg, rgba(100, 200, 255, 0.1), transparent);
    animation: ${scanLine} 3s infinite linear;
    z-index: 1;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 50px 12px 20px;
  border-radius: 25px;
  border: none;
  background: rgba(15, 25, 50, 0.3);
  color: #eaf5ff;
  font-size: 16px;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
  border: 1px solid rgba(100, 180, 255, 0.4);
  box-shadow: inset 0 0 10px rgba(20, 60, 120, 0.2);
  
  &:focus {
    background: rgba(20, 35, 70, 0.4);
    border-color: rgba(120, 200, 255, 0.8);
    outline: none;
  }
  
  &::placeholder {
    color: rgba(150, 200, 255, 0.7);
    opacity: 0.7;
  }
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(150, 220, 255, 0.8);
  cursor: pointer;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  
  svg {
    font-size: 18px;
    transition: all 0.3s ease;
  }
  
  &:hover svg {
    color: rgba(200, 230, 255, 1);
    transform: scale(1.1);
  }
`;

const Cursor = styled.span`
  display: inline-block;
  width: 2px;
  height: 18px;
  background-color: rgba(150, 220, 255, 0.8);
  margin-left: 2px;
  animation: ${blinkCursor} 1.5s infinite;
  vertical-align: middle;
`;

const FuturisticSearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const fullPlaceholder = 'Search quantum information...';
  const searchInputRef = useRef(null);
  
  useEffect(() => {
    let currentText = '';
    let currentIndex = 0;
    let isTyping = true;
    
    const typingInterval = setInterval(() => {
      if (isTyping) {
        if (currentIndex < fullPlaceholder.length) {
          currentText += fullPlaceholder[currentIndex];
          setPlaceholder(currentText);
          currentIndex++;
        } else {
          isTyping = false;
          setTimeout(() => {
            isTyping = true;
            currentText = '';
            currentIndex = 0;
          }, 3000);
        }
      }
    }, 100);
    
    return () => clearInterval(typingInterval);
  }, []);
  
  const handleChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim() && onSearch) {
      onSearch(searchTerm);
    }
    
    // Add a subtle focus effect
    if (searchInputRef.current) {
      searchInputRef.current.blur();
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    }
  };
  
  return (
    <SearchBarContainer>
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <SearchInputWrapper>
          <SearchInput
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={handleChange}
            placeholder={placeholder}
            className="search-input"
          />
          {placeholder !== fullPlaceholder && <Cursor />}
          <SearchIconWrapper onClick={handleSubmit}>
            <FaSearch />
          </SearchIconWrapper>
        </SearchInputWrapper>
      </form>
    </SearchBarContainer>
  );
};

export default FuturisticSearchBar; 