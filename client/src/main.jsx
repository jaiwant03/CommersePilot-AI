import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

// Normal CSS Files - Strict Architecture (No Tailwind / Bootstrap)
import './styles/reset.css';
import './styles/variables.css';
import './styles/base.css';
import './styles/components.css';
import './styles/layout.css';
import './styles/mockups.css';
import './styles/auth.css';
import './styles/onboarding.css';
import './styles/workspace.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
