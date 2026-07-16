import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ApplicationForm from './components/ApplicationForm';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import DoctorRegisterPage from './components/DoctorRegisterPage';
import ApplicationsTable from './components/ApplicationsTable';
import UsersManagement from './components/UsersManagement';
import PrivateRoute from './components/PrivateRoute';
import Header from './components/Header';
import './index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-wrapper">
          <Header />
          <div className="app-container">
            <Routes>
              <Route path="/" element={<ApplicationForm />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/doctor-register" element={<DoctorRegisterPage />} />
              <Route 
                path="/applications" 
                element={
                  <PrivateRoute requiredRole="doctor">
                    <ApplicationsTable />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/users" 
                element={
                  <PrivateRoute requiredRole="doctor">
                    <UsersManagement />
                  </PrivateRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;