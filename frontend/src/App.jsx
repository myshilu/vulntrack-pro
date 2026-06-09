import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ProtectedRoute from './layouts/ProtectedRoute';
import { AuthContext } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Reports from './pages/Reports';
import ReportForm from './pages/ReportForm';
import ReportDetails from './pages/ReportDetails';
import NotFound from './pages/NotFound';

/*
 * App
 *
 * Root component that defines all client-side routes and conditionally
 * displays the sidebar and navbar when the user is authenticated. Public
 * routes (login/register) do not show the application chrome. Protected
 * routes are wrapped in the ProtectedRoute component to ensure only
 * authenticated users can access them.
 */
const App = () => {
  const { user } = useContext(AuthContext);
  return (
    <BrowserRouter>
      {/* Render the application chrome only if the user is logged in */}
      {user && <Sidebar />}
      {user && <Navbar />}
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/create"
          element={
            <ProtectedRoute>
              <ReportForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/:id/edit"
          element={
            <ProtectedRoute>
              <ReportForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/:id"
          element={
            <ProtectedRoute>
              <ReportDetails />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;