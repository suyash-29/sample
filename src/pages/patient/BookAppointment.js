import React, { useState } from 'react';
import { getDoctorHolidays, scheduleAppointment } from '../../api/patient/patientAPI';
import { Table, Alert } from 'react-bootstrap';

const BookAppointment = () => {
  const [formData, setFormData] = useState({
    doctorID: '',
    appointmentDate: '',
    symptoms: '',
  });
  const [message, setMessage] = useState('');
  const [alertType, setAlertType] = useState('');
  const [holidays, setHolidays] = useState([]);
  const [noHolidaysMessage, setNoHolidaysMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await scheduleAppointment(formData);
      setMessage(response.message);
      setAlertType('success');
      setFormData({ doctorID: '', appointmentDate: '', symptoms: '' });
    } catch (error) {
      setMessage(error.response?.data || 'Failed to schedule appointment.');
      setAlertType('danger');
    }
  };

  const formatDateTimeForDisplay = (date) => {
    return new Date(date).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

 
  const checkAvailability = async () => {
    if (!formData.doctorID) {
      setNoHolidaysMessage('Please enter a valid Doctor ID.');
      return;
    }
  
    console.log(`Checking holidays for Doctor ID: ${formData.doctorID}`);
    
    try {
      const holidaysData = await getDoctorHolidays(formData.doctorID);
      console.log('Schedule Data:', holidaysData);
      setHolidays(holidaysData);
      setNoHolidaysMessage('');
    } catch (error) {
      console.error('Error fetching holidays:', error);
      setNoHolidaysMessage('No holidays found for this doctor.');
      setHolidays([]);
    }
  };
  

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Book an Appointment</h2>

      {message && (
        <div className={`alert alert-${alertType} alert-dismissible fade show`} role="alert">
          {message}
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="alert"
            aria-label="Close"
            onClick={() => setMessage('')}
          ></button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Doctor ID</label>
          <input
            type="text"
            name="doctorID"
            className="form-control"
            value={formData.doctorID}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Appointment Date & Time</label>
          <input
            type="datetime-local"
            name="appointmentDate"
            className="form-control"
            value={formData.appointmentDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-12">
          <label className="form-label">Symptoms</label>
          <textarea
            name="symptoms"
            className="form-control"
            rows="4"
            value={formData.symptoms}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        <div className="col-12">
          <button type="submit" className="btn btn-primary">Book Appointment</button>
        </div>
      </form>

      <div className="mt-5">
        <h3>Check Doctor Availability</h3>
        <button onClick={checkAvailability} className="btn btn-secondary mb-3" disabled={!formData.doctorID}>
          Check Availability
        </button>

        {noHolidaysMessage && (
          <Alert variant="info">
            {noHolidaysMessage}
          </Alert>
        )}

        {holidays.length > 0 && (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Index</th>
                <th>Start Date</th>
                <th>End Date</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map((holiday,index) => (
                <tr key={index}>
                  <td>{index}</td>
                  <td>{formatDateTimeForDisplay(holiday.startDate)}</td>
                  <td>{formatDateTimeForDisplay(holiday.endDate)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default BookAppointment;
