import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Use createRoot API for React 18 with concurrent features
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // Remove StrictMode in production to avoid double rendering cycles
  <App />
);

// Only measure performance in production
// Learn more: https://bit.ly/CRA-vitals
if (process.env.NODE_ENV === 'production') {
  reportWebVitals();
}
