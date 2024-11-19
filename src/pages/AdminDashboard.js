import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';


const AdminDashboard = () => {
  return (
    <div className="container mt-5">
      <h2>Welcome to Admin Dashboard</h2>
      <p>You are successfully logged in.</p>
      <Link to="/register-doctor" className="btn btn-primary mt-3">
        Register a Doctor
      </Link>
      <Link to="/manage-doctor" className="btn btn-primary mt-3">
        Manage Doctor
      </Link>
      <Link to="/manage-patients" className="btn btn-primary mt-3">
        Manage Patients
      </Link>
    </div>
  );
};

export default AdminDashboard;
