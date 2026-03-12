import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TableMap from './pages/TableMap';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[var(--color-riva-cream)] text-[var(--color-riva-dark)] font-sans antialiased">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tables" element={<TableMap />} />
          
          {/* Default redirect to Login for now */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
