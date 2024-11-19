import React, { useState, useEffect } from 'react';
import { getDoctorsBySpecialization } from '../../api/patient/patientAPI';

const specializations = [
  'All',
  'Cardiology',
  'Neurology',
  'Oncology',
  'Pediatrics',
  'General Medicine',
];

const SearchDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const fetchDoctors = async (specialization = null) => {
    setLoading(true);
    setError('');
    try {
      const data = await getDoctorsBySpecialization(specialization);
      console.log('API Response:', data); // Log API response for debugging
      setDoctors(data);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError(err || 'Failed to fetch doctors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors(); // Fetch all doctors on component mount
  }, []);

  const handleFilterClick = (specialization) => {
    setActiveFilter(specialization);
    fetchDoctors(specialization === 'All' ? null : specialization);
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Search Doctors</h2>

      {/* Filter Buttons */}
      <div className="mb-3">
        {specializations.map((specialization) => (
          <button
            key={specialization}
            className={`btn ${
              activeFilter === specialization ? 'btn-primary' : 'btn-outline-primary'
            } me-2 mb-2`}
            onClick={() => handleFilterClick(specialization)}
          >
            {specialization}
          </button>
        ))}
      </div>

      {/* Loading Spinner */}
      {loading && <div className="spinner-border text-primary" role="status"></div>}

      {/* Error Message */}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Doctors Table */}
      {!loading && !error && doctors.length > 0 && (
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Experience</th>
              <th>Qualification</th>
              <th>Designation</th>
              <th>Specializations</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor, index) => (
              <tr key={doctor.doctorID} className={index % 2 === 0 ? 'table-light' : 'table-secondary'}>
                <td>{doctor.doctorID}</td>
                <td>{doctor.fullName}</td>
                <td>{doctor.email}</td>
                <td>{doctor.experienceYears} years</td>
                <td>{doctor.qualification}</td>
                <td>{doctor.designation}</td>
                <td>{doctor.specializations.join(', ') || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && !error && doctors.length === 0 && (
        <div className="alert alert-warning">No doctors found.</div>
      )}
    </div>
  );
};

export default SearchDoctors;
