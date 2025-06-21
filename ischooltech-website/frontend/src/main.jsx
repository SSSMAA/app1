// frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // Global styles, including Tailwind directives
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n'; // i18next configuration instance

// Initialize the React application.
// ReactDOM.createRoot is the modern way to create a root for rendering React components.
ReactDOM.createRoot(document.getElementById('root')).render(
  // React.StrictMode activates additional checks and warnings for its descendants,
  // helping to identify potential problems in an application during development.
  <React.StrictMode>
    {/* React.Suspense allows you to defer rendering of some parts of your component tree
        until some condition is met (e.g., data loading, translations loading).
        The `fallback` prop specifies what to render while waiting. */}
    <React.Suspense fallback="loading...">
      {/* I18nextProvider makes the i18n instance available to all components
          down the React component tree via React Context. */}
      <I18nextProvider i18n={i18n}>
        <App />
      </I18nextProvider>
    </React.Suspense>
  </React.StrictMode>,
);
