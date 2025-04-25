import React, { useEffect } from 'react';
import './App.css';
import QuantumScene from './components/QuantumScene';

function App() {
  // Fix for mobile viewport height issues
  useEffect(() => {
    // First we get the viewport height and we multiply it by 1% to get a value for a vh unit
    let vh = window.innerHeight * 0.01;
    // Then we set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    
    // We listen to the resize event
    const handleResize = () => {
      // We execute the same script as before
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="App">
      <QuantumScene />
    </div>
  );
}

export default App; 