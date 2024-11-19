// src/components/MainPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './MainPage.css'; // Create a CSS file for custom styles

const MainPage = () => {
  return (
    <div className="main-page">
      <div className="content-wrapper">
        <h1>Welcome to AmazeCare</h1>
        <p>Your Trusted Partner in Healthcare Management</p>
        <div className="button-group">
          <Link to="/login" className="btn btn-primary">Login</Link>
          <Link to="/signup" className="btn btn-secondary">Signup</Link>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
