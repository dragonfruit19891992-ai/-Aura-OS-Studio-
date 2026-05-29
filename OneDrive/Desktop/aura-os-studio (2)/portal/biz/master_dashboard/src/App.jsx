import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import BusinessOverlook from './pages/BusinessOverlook';
import PnL from './pages/PnL';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/business_overlook" element={<BusinessOverlook />} />
        <Route path="/pnl" element={<PnL />} />
      </Routes>
    </BrowserRouter>
  );
}
