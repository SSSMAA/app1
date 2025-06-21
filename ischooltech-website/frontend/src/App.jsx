// frontend/src/App.jsx
import React from 'react';
import HomePage from './components/HomePage';
// Ensure src/index.css (with Tailwind directives) is imported, usually in main.jsx
// import './App.css'; // Remove if App.css is not used or contains default Vite styles
// import './index.css'; // This is usually in main.jsx, not here.

/**
 * The main application component.
 * It currently renders the HomePage component which contains all other page content.
 */
function App() {
  return (
    <HomePage />
  );
}

export default App;
