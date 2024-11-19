import React, { useState, useEffect } from 'react';
import { getAppointmentsByStatus, cancelAppointment, rescheduleAppointment } from '../../api/doctor/appointmentApi';
import 'bootstrap/dist/css/bootstrap.min.css';

const AppointmentList = () => {
  const [statusFilter, setStatusFilter] = useState('Scheduled');
  const [appointments, setAppointments] = useState([]);
  const [editingAppointmentId, setEditingAppointmentId] = useState(null);
  const [rescheduleDateTime, setRescheduleDateTime] = useState('');
  const [alert, setAlert] = useState({ message: '', type: '' }); // Alert state for success/error messages

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  const fetchAppointments = async () => {
    try {
      const fetchedAppointments = await getAppointmentsByStatus(statusFilter);
      setAppointments(Array.isArray(fetchedAppointments) ? fetchedAppointments : fetchedAppointments?.$values || []);
    } catch (error) {
      setAlert({ message: 'Error fetching appointments.', type: 'danger' });
    }
  };

  const handleCancel = async (appointmentId) => {
    try {
      await cancelAppointment(appointmentId);
      setAlert({ message: 'Appointment canceled successfully.', type: 'success' });
      fetchAppointments();
    } catch (error) {
      setAlert({ message: 'Error canceling the appointment.', type: 'danger' });
    }
  };

  const handleRescheduleClick = (appointment) => {
    setEditingAppointmentId(appointment.appointmentID);
    setRescheduleDateTime(new Date(appointment.appointmentDate).toISOString().slice(0, 16));
    setAlert({ message: '', type: '' }); // Clear alerts when editing starts
  };

  const handleRescheduleSubmit = async () => {
    if (!rescheduleDateTime || new Date(rescheduleDateTime) <= new Date()) {
      setAlert({ message: 'Please select a valid future date and time.', type: 'warning' });
      return;
    }

    try {
      const rescheduleData = { newAppointmentDate: rescheduleDateTime };
      await rescheduleAppointment(editingAppointmentId, rescheduleData);
      setAlert({ message: 'Appointment rescheduled successfully.', type: 'success' });
      setEditingAppointmentId(null);
      setRescheduleDateTime('');
      fetchAppointments();
    } catch (error) {
      setAlert({ message: 'Error rescheduling the appointment.', type: 'danger' });
    }
  };

  const handleRescheduleCancel = () => {
    setEditingAppointmentId(null);
    setRescheduleDateTime('');
    setAlert({ message: '', type: '' }); // Clear alerts when cancelling editing
  };

 

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      {/* Alert Banner */}
      {alert.message && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
          {alert.message}
          <button type="button" className="btn-close" aria-label="Close" onClick={() => setAlert({ message: '', type: '' })}></button>
        </div>
      )}

      {/* Status Filter Buttons */}
      <div className="btn-group mb-3">
        {['Scheduled', 'Canceled', 'Completed'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`btn btn-outline-primary ${statusFilter === status ? 'active' : ''}`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Appointments Table */}
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Appointment ID</th>
            <th>Patient ID</th>
            <th>Patient Name</th>
            <th>Date & Time</th>
            <th>Status</th>
            <th>Symptoms</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.length > 0 ? (
            appointments.map(appt => (
              <tr key={appt.appointmentID}>
                <td>{appt.appointmentID}</td>
                <td>{appt.patientID}</td>
                <td>{appt.patientName}</td>
                <td>
                  {editingAppointmentId === appt.appointmentID ? (
                    <>
                      <input
                        type="datetime-local"
                        value={rescheduleDateTime}
                        onChange={(e) => setRescheduleDateTime(e.target.value)}
                        className="form-control"
                      />
                      <button
                        onClick={handleRescheduleSubmit}
                        className="btn btn-success btn-sm mt-2 me-2"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={handleRescheduleCancel}
                        className="btn btn-secondary btn-sm mt-2"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    formatDateTime(appt.appointmentDate)
                  )}
                </td>
                <td>{appt.status}</td>
                <td>{appt.symptoms || 'N/A'}</td>
                <td>
                  {appt.status === 'Scheduled' && editingAppointmentId !== appt.appointmentID && (
                    <>
                      <button
                        onClick={() => handleCancel(appt.appointmentID)}
                        className="btn btn-danger btn-sm mx-1"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleRescheduleClick(appt)}
                        className="btn btn-warning btn-sm mx-1"
                      >
                        Reschedule
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">No appointments found for the selected status.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AppointmentList;
