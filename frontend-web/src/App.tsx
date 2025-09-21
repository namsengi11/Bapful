import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';
import { colors } from './styles/colors';
import { isAuthenticated } from './services/api';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';

// Global Styles
const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    height: 100%;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: ${colors.background.primary};
    color: ${colors.text.primary};
  }

  #root {
    height: 100%;
  }

  body {
    overflow-x: hidden;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
      monospace;
  }

  /* Mobile viewport adjustments */
  @media screen and (max-width: 480px) {
    html {
      font-size: 16px;
    }
  }

  /* Prevent iOS zoom on input focus */
  @supports (-webkit-touch-callout: none) {
    input, textarea, select {
      font-size: 16px;
    }
  }
`;

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public Route Component (redirect to home if already authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return !isAuthenticated() ? <>{children}</> : <Navigate to="/home" replace />;
};

function App() {
  return (
    <>
      <GlobalStyle />
      <Router>
        <Routes>
          {/* Default route */}
          <Route 
            path="/" 
            element={
              isAuthenticated() ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />
            } 
          />
          
          {/* Public routes */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            } 
          />
          
          {/* Protected routes */}
          <Route 
            path="/home" 
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback route */}
          <Route 
            path="*" 
            element={<Navigate to="/" replace />} 
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
