import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppointmentList from './doctor/AppointmentList';
import 'bootstrap/dist/css/bootstrap.min.css';


const DoctorDashboard = () => {
  const navigate = useNavigate();

  const navigateToConsultation = () => {
    navigate('/conduct-consultation');
  };

  const navigateToMedicalRecords = () => {
    navigate('/medical-records');
  };
  const navigateToHolidays = () => {
    navigate('/holidays');
  };


  return (
    <div className="container">
      <h2 className="my-4">Welcome to Doctor Dashboard</h2>
      <div className="btn-group mb-4" role="group" aria-label="Doctor Actions">
        <button type="button" className="btn btn-primary" onClick={navigateToConsultation}>Conduct Consultation</button>
        <button type="button" className="btn btn-secondary">Check Appointments</button>
        <button type="button" className="btn btn-info" onClick={navigateToMedicalRecords}>View Medical Records</button>
        <button type="button" className="btn btn-warning" onClick={navigateToHolidays}>Manage Holidays</button>
      </div>
      <AppointmentList />
    </div>
  );
};

export default DoctorDashboard;
