import React, { useState } from 'react';
import axios from 'axios';
import { checkUsernameAvailability, registerPatient } from '../api/User/userService';

import { useNavigate } from 'react-router-dom';
import Popup from 'reactjs-popup';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'reactjs-popup/dist/index.css'; // Add styles for the popup

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    contactNumber: '',
    address: '',
    medicalHistory: ''
  });
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [availabilityMessage, setAvailabilityMessage] = useState('');
  const [error, setError] = useState('');
  const [showPopup, setShowPopup] = useState(false); 
  const navigate = useNavigate();

  const API_URL = 'https://localhost:7270/api/User';

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Check if the username is available
  const checkUsernameAvailability = async () => {
    if (!formData.username) {
      setAvailabilityMessage('Please enter a username first.');
      setUsernameAvailable(null);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/check-username`, {
        params: { username: formData.username }
      });
      setUsernameAvailable(response.data.isAvailable);
      setAvailabilityMessage(response.data.isAvailable ? 'Username is available!' : 'Username is taken.');
    } catch (error) {
      console.error('Username check error:', error);
      setAvailabilityMessage('Error checking username availability.');
      setUsernameAvailable(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (usernameAvailable === false) {
      setError('Username is already taken');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/register`, formData);
      if (response.status === 201) {
        setShowPopup(true); 
        setTimeout(() => {
          navigate('/login'); 
        }, 3000);
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="container signup-container">
      <h2>Signup</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className="form-control"
            required
          />
          <button
            type="button"
            onClick={checkUsernameAvailability}
            className="btn btn-secondary mt-2"
          >
            Check Availability
          </button>
          {availabilityMessage && (
            <div className={usernameAvailable ? 'text-success' : 'text-danger'}>
              {availabilityMessage}
            </div>
          )}
        </div>
        <div className="mb-3">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <label>Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <label>Date of Birth</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <label>Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="form-control"
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="mb-3">
          <label>Contact Number</label>
          <input
            type="tel"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <label>Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <label>Medical History</label>
          <textarea
            name="medicalHistory"
            value={formData.medicalHistory}
            onChange={handleInputChange}
            className="form-control"
          />
        </div>
        {error && <p className="text-danger">{error}</p>}
        <button type="submit" className="btn btn-primary">Sign Up</button>
      </form>

      {/* Popup for successful registration */}
      <Popup open={showPopup} closeOnDocumentClick={false} modal>
        <div className="popup-content">
          <h4>Registration Successful!</h4>
          <p>You will be redirected to the login page shortly.</p>
        </div>
      </Popup>
    </div>
  );
};

export default Signup;
