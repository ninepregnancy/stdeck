
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RootLayout from './app/layout';

// Pages
import Home from './app/page';
import BrowsePage from './app/browse/page';
import AddPage from './app/add/page';
import TopPage from './app/top/page';

export default function App() {
  return (
    <RootLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/add" element={<AddPage />} />
        <Route path="/top" element={<TopPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </RootLayout>
  );
}
