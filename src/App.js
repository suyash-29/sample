// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MainPage from './components/MainPage';
import Login from './components/Login';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PatientDashboard from './pages/PatientDashboard';
import 'bootstrap/dist/css/bootstrap.min.css';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './components/Dashboard';
import Signup from './components/Signup';
import ConductConsultation from './pages/doctor/ConductConsultation';
import MedicalRecords from './pages/doctor/MedicalRecords';
import Holidays from './pages/doctor/Holiday';
import PersonalInfo from './pages/patient/PersonalInfo';
import SearchDoctors from './pages/patient/SearchDoctors';
import MedicalRecordsPage from './pages/patient/MedicalRecordsPage';
import AppointmentsPage from './pages/patient/AppointmentsPage';
import BookAppointment from './pages/patient/BookAppointment';
import RegisterDoctor from './pages/admin/RegisterDoctor';
import ManageDoctor from './pages/admin/ManageDoctor';
import ManagePatients from './pages/admin/ManagePatients';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
  };

  return (
    <Router>
     
    <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
    <Routes>
      <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
      <Route path="/signup" element={<Signup />} />
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route path="/conduct-consultation" element={<ConductConsultation />} />
        <Route path="/medical-records" element={<MedicalRecords />} />
        <Route path="/holidays" element={<Holidays />} />
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        <Route path="/personal-info" element={<PersonalInfo />} />
        <Route path="/search-doctors" element={<SearchDoctors />} />
        <Route path="/patient-medical-records" element={<MedicalRecordsPage />} />
        <Route path="/book-appointment" element={<BookAppointment />} />
        <Route path="/appointments-page" element={<AppointmentsPage />} />

        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/register-doctor" element={<RegisterDoctor />} /> 
        <Route path="/manage-doctor" element={<ManageDoctor />} /> 
        <Route path="/manage-patients" element={<ManagePatients/>} /> 
           
       </Route>
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  </Router>
  );
}

export default App;
