import React, { useState, useEffect } from 'react';
import {
  getPersonalInfo,
  updatePersonalInfo,
  checkUsernameAvailability,
} from '../../api/patient/patientAPI';

const PersonalInfo = () => {
  const [personalInfo, setPersonalInfo] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [usernameMessage, setUsernameMessage] = useState('');
  const [usernameMessageType, setUsernameMessageType] = useState('');
  const [alert, setAlert] = useState({ message: '', type: '' });

  // Fetch personal info on component mount
  useEffect(() => {
    const fetchPersonalInfo = async () => {
      try {
        const info = await getPersonalInfo();
        setPersonalInfo(info);
      } catch (error) {
        console.error('Error fetching personal info:', error);
      }
    };

    fetchPersonalInfo();
  }, []);

  // Handle updating personal info
  const handleUpdate = async () => {
    try {
      await updatePersonalInfo(personalInfo);
      setAlert({ message: 'Personal info updated successfully!', type: 'success' });
      setEditMode(false);

      // Clear the alert after 3 seconds
      setTimeout(() => {
        setAlert({ message: '', type: '' });
      }, 3000);
    } catch (error) {
      setAlert({ message: 'Failed to update personal info.', type: 'danger' });
      setTimeout(() => {
        setAlert({ message: '', type: '' });
      }, 3000);
      console.error('Error updating personal info:', error);
    }
  };

  // Handle checking username availability
  const handleCheckUsername = async () => {
    console.log('Checking username availability:', personalInfo.username); // Debugging log
    try {
      const response = await checkUsernameAvailability(personalInfo.username);
      console.log('Username Availability Response:', response); // Log API response

      const { isAvailable, message } = response; // Adjusted according to your response format
      setUsernameMessage(message);
      setUsernameMessageType(isAvailable ? 'success' : 'danger');

      // Automatically clear the message after 1 second
      setTimeout(() => {
        setUsernameMessage('');
      }, 1000);
    } catch (error) {
      console.error('Error checking username availability:', error); // Debugging log
      setUsernameMessage('Error checking username availability.');
      setUsernameMessageType('danger');

      // Automatically clear the error message after 1 second
      setTimeout(() => {
        setUsernameMessage('');
      }, 1000);
    }
  };

  if (!personalInfo) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Personal Info</h2>

      {/* Display success/error alert messages */}
      {alert.message && (
        <div
          className={`alert alert-${alert.type} alert-dismissible fade show`}
          role="alert"
        >
          {alert.message}
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="alert"
            aria-label="Close"
            onClick={() => setAlert({ message: '', type: '' })}
          ></button>
        </div>
      )}

      {editMode ? (
        <form className="row g-3">
          {/* Username */}
          <div className="col-md-6">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              value={personalInfo.username}
              onChange={(e) =>
                setPersonalInfo({ ...personalInfo, username: e.target.value })
              }
            />
            <button
              type="button"
              className="btn btn-secondary mt-2"
              onClick={handleCheckUsername}
            >
              Check Availability
            </button>
            {usernameMessage && (
              <div className={`mt-2 text-${usernameMessageType}`}>
                <small>{usernameMessage}</small>
              </div>
            )}
          </div>

          {/* Full Name */}
          <div className="col-md-6">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              value={personalInfo.fullName}
              onChange={(e) =>
                setPersonalInfo({ ...personalInfo, fullName: e.target.value })
              }
            />
          </div>

          {/* Email */}
          <div className="col-md-6">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={personalInfo.email}
              onChange={(e) =>
                setPersonalInfo({ ...personalInfo, email: e.target.value })
              }
            />
          </div>

          {/* Contact Number */}
          <div className="col-md-6">
            <label className="form-label">Contact Number</label>
            <input
              type="text"
              className="form-control"
              value={personalInfo.contactNumber}
              onChange={(e) =>
                setPersonalInfo({ ...personalInfo, contactNumber: e.target.value })
              }
            />
          </div>

          {/* Address */}
          <div className="col-12">
            <label className="form-label">Address</label>
            <textarea
              className="form-control"
              value={personalInfo.address}
              onChange={(e) =>
                setPersonalInfo({ ...personalInfo, address: e.target.value })
              }
            ></textarea>
          </div>

          {/* Gender */}
          <div className="col-md-6">
            <label className="form-label">Gender</label>
            <select
              className="form-select"
              value={personalInfo.gender}
              onChange={(e) =>
                setPersonalInfo({ ...personalInfo, gender: e.target.value })
              }
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Date of Birth */}
          <div className="col-md-6">
            <label className="form-label">Date of Birth</label>
            <input
              type="date"
              className="form-control"
              value={personalInfo.dateOfBirth}
              onChange={(e) =>
                setPersonalInfo({ ...personalInfo, dateOfBirth: e.target.value })
              }
            />
          </div>

          {/* Buttons */}
          <div className="col-12 mt-3">
            <button
              type="button"
              className="btn btn-secondary me-2"
              onClick={() => setEditMode(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleUpdate}
            >
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <table className="table table-striped">
          <tbody>
            <tr>
              <th>Username</th>
              <td>{personalInfo.username}</td>
            </tr>
            <tr>
              <th>Full Name</th>
              <td>{personalInfo.fullName}</td>
            </tr>
            <tr>
              <th>Email</th>
              <td>{personalInfo.email}</td>
            </tr>
            <tr>
              <th>Contact Number</th>
              <td>{personalInfo.contactNumber}</td>
            </tr>
            <tr>
              <th>Address</th>
              <td>{personalInfo.address}</td>
            </tr>
            <tr>
              <th>Gender</th>
              <td>{personalInfo.gender}</td>
            </tr>
            <tr>
              <th>Date of Birth</th>
              <td>{personalInfo.dateOfBirth?.split('T')[0]}</td>
            </tr>
          </tbody>
        </table>
      )}

      {!editMode && (
        <button
          className="btn btn-primary mt-3"
          onClick={() => setEditMode(true)}
        >
          Edit
        </button>
      )}
    </div>
  );
};

export default PersonalInfo;
