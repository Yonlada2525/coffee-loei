import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './index.css';

import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppStateProvider } from './context/AppStateContext';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import FarmsPublic from './pages/FarmsPublic';
import MapPage from './pages/MapPage';
import Dashboard from './pages/Dashboard';
import OwnersPage from './pages/OwnersPage';
import FarmsManager from './pages/FarmsManager';
import CoffeeTypesPage from './pages/CoffeeTypesPage';
import FarmTypesPage from './pages/FarmTypesPage';
import SoilTypesPage from './pages/SoilTypesPage';
import ProductionsPage from './pages/ProductionsPage';
import MediaPage from './pages/MediaPage';
import TrashPage from './pages/TrashPage';
import ProfilePage from './pages/ProfilePage';

function Guard({ role, children }) {
  const { session } = useAuth();
  if (!session) return <Navigate to="/login" replace />;
  if (role && session.user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/farms" element={<FarmsPublic />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/admin" element={<Guard role="admin"><Dashboard role="admin" /></Guard>} />
        <Route path="/admin/owners" element={<Guard role="admin"><OwnersPage /></Guard>} />
        <Route path="/admin/farms" element={<Guard role="admin"><FarmsManager /></Guard>} />
        <Route path="/admin/coffee-types" element={<Guard role="admin"><CoffeeTypesPage /></Guard>} />
        <Route path="/admin/farm-types" element={<Guard role="admin"><FarmTypesPage /></Guard>} />
        <Route path="/admin/soil-types" element={<Guard role="admin"><SoilTypesPage /></Guard>} />
        <Route path="/admin/productions" element={<Guard role="admin"><ProductionsPage /></Guard>} />
        <Route path="/admin/media" element={<Guard role="admin"><MediaPage admin /></Guard>} />
        <Route path="/admin/trash" element={<Guard role="admin"><TrashPage /></Guard>} />
        <Route path="/admin/profile" element={<Guard role="admin"><ProfilePage admin /></Guard>} />

        <Route path="/owner" element={<Guard role="owner"><Dashboard role="owner" /></Guard>} />
        <Route path="/owner/profile" element={<Guard role="owner"><ProfilePage /></Guard>} />
        <Route path="/owner/farms" element={<Guard role="owner"><FarmsManager owner /></Guard>} />
        <Route path="/owner/productions" element={<Guard role="owner"><ProductionsPage owner /></Guard>} />
        <Route path="/owner/media" element={<Guard role="owner"><MediaPage /></Guard>} />
        <Route path="/owner/trash" element={<Guard role="owner"><TrashPage owner /></Guard>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <AppStateProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AppStateProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
