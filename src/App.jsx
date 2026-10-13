import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout';

// Page components
import Login from './pages/Login';
import Fields from './pages/Fields';
import FieldNew from './pages/FieldNew';
import Weather from './pages/Weather';
import Advice from './pages/Advice';
import Savings from './pages/Savings';
import About from './pages/About';

/**
 * KhetiX Root Application
 * - Routes: /login, /fields, /fields/new, /weather, /advice, /savings, /about
 * - Wrapped with LanguageProvider for trilingual support (en, ur, sd)
 */
export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Default redirect to fields */}
            <Route index element={<Navigate to="/fields" replace />} />
            <Route path="fields" element={<Fields />} />
            <Route path="fields/new" element={<FieldNew />} />
            <Route path="weather" element={<Weather />} />
            <Route path="advice" element={<Advice />} />
            <Route path="savings" element={<Savings />} />
            <Route path="about" element={<About />} />
            <Route path="login" element={<Login />} />
            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/fields" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}
