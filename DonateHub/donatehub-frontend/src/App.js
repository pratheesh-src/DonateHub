import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Import Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Listings from './pages/Listings';
import ItemDetail from './pages/ItemDetail';
import SellItem from './pages/SellItem';
import DonateForm from './pages/DonateForm';
import AdminPanel from './pages/AdminPanel';
import EditDonation from './pages/EditDonation';
import MyDonations from './pages/MyDonations';

// Test Component
import TestConnection from './components/TestConnection';

function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/item/:id" element={<ItemDetail />} />
            
            {/* Testing Route (Temporary) */}
            <Route path="/test-db" element={<TestConnection />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/sell" element={
              <ProtectedRoute>
                <SellItem />
              </ProtectedRoute>
            } />
            <Route path="/donate/:type" element={
              <ProtectedRoute>
                <DonateForm />
              </ProtectedRoute>
            } />
            <Route path="/edit-donation/:id" element={
              <ProtectedRoute>
                <EditDonation />
              </ProtectedRoute>
            } />
            <Route path="/my-donations" element={
              <ProtectedRoute>
                <MyDonations />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute adminOnly={true}>
                <AdminPanel />
              </ProtectedRoute>
            } />
            
            {/* Redirect unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;