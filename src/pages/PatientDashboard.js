import React from 'react';
import { useNavigate } from 'react-router-dom';

const PatientDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="container">
      <h2>Patient Dashboard</h2>
      <button
        className="btn btn-primary mb-3 me-2"
        onClick={() => navigate('/personal-info')}
      >
        View/Update Personal Info
      </button>
      <button
        className="btn btn-secondary mb-3 me-2"
        onClick={() => navigate('/search-doctors')}
      >
        Search Doctors
      </button>
      <button
        className="btn btn-primary mb-3 me-2"
        onClick={() => navigate('/patient-medical-records')}
      >
        View Medical Records
      </button>
      <button
        className="btn btn-primary mb-3 m2-2"
        onClick={() => navigate('/book-appointment')}
      >
        Book Appointment
      </button>
      <button
        className="btn btn-primary mb-3 m2-2"
        onClick={() => navigate('/appointments-page')}
      >
        Appointment
      </button>
    </div>
  );
};

export default PatientDashboard;
