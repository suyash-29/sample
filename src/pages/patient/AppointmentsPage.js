import React, { useState, useEffect } from "react";
import { Table, Button, Alert, Form } from "react-bootstrap";
import { getAppointments, cancelAppointment, rescheduleAppointment } from "../../api/patient/patientAPI";

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState("All");
  const [alert, setAlert] = useState({ show: false, message: "", variant: "" });
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [newDateTime, setNewDateTime] = useState("");

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      const data = await getAppointments();
      setAppointments(data);
    } catch (error) {
      showAlert(error.message || "Error fetching appointments", "danger");
    }
  };

  // Handle cancel appointment
  const handleCancel = async (appointmentId) => {
    try {
      await cancelAppointment(appointmentId);
      showAlert("Appointment canceled successfully", "success");
      fetchAppointments();
    } catch (error) {
      showAlert(error.message || "Error canceling appointment", "danger");
    }
  };

  // Handle reschedule appointment
  const handleReschedule = async (appointmentId) => {
    if (!newDateTime) {
      showAlert("Please select a new date and time.", "warning");
      return;
    }
    try {
      const payload = { newAppointmentDate: newDateTime };
      await rescheduleAppointment(appointmentId, payload);
      showAlert("Appointment rescheduled successfully", "success");
      fetchAppointments();
      setEditingAppointment(null);
    } catch (error) {
      showAlert(error.message || "Error rescheduling appointment", "danger");
    }
  };

  // Show alert with auto-hide
  const showAlert = (message, variant) => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: "", variant: "" }), 2000);
  };

  // Filter appointments
  const filteredAppointments = appointments.filter((appointment) =>
    filter === "All" ? true : appointment.status === filter
  );

  const formatDateTimeForDisplay = (date) => {
    return new Date(date).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateTimeForInput = (date) => {
    const isoString = new Date(date).toISOString();
    return isoString.slice(0, 16); // Extract YYYY-MM-DDTHH:mm format
  };

  // Fetch appointments on component mount
  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div className="container mt-4">
      <h2>Appointments</h2>

      {alert.show && <Alert variant={alert.variant}>{alert.message}</Alert>}

      <div className="mb-3">
        <Button variant="primary" onClick={() => setFilter("All")} className="me-2">
          All
        </Button>
        <Button variant="success" onClick={() => setFilter("Scheduled")} className="me-2">
          Scheduled
        </Button>
        <Button variant="secondary" onClick={() => setFilter("Completed")} className="me-2">
          Completed
        </Button>
        <Button variant="danger" onClick={() => setFilter("Canceled")}>
          Canceled
        </Button>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Appointment ID</th>
            <th>Doctor ID</th>
            <th>Doctor Name</th>
            <th>Date & Time</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAppointments.map((appointment) => (
            <tr key={appointment.appointmentID}>
              <td>{appointment.appointmentID}</td>
              <td>{appointment.doctorID}</td>
              <td>{appointment.doctorName}</td>
              <td>
                {editingAppointment === appointment.appointmentID ? (
                  <Form.Control
                    type="datetime-local"
                    value={newDateTime}
                    step="60"
                    onChange={(e) => setNewDateTime(e.target.value)}
                  />
                ) : (
                  formatDateTimeForDisplay(appointment.appointmentDate)
                )}
              </td>
              <td>{appointment.status}</td>
              <td>
                {appointment.status === "Scheduled" && (
                  <>
                    {editingAppointment === appointment.appointmentID ? (
                      <>
                        <Button
                          variant="success"
                          className="me-2"
                          onClick={() => handleReschedule(appointment.appointmentID)}
                        >
                          Save
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => setEditingAppointment(null)}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="warning"
                          className="me-2"
                          onClick={() => {
                            setEditingAppointment(appointment.appointmentID);
                            setNewDateTime(formatDateTimeForInput(appointment.appointmentDate));
                          }}
                        >
                          Reschedule
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleCancel(appointment.appointmentID)}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default AppointmentsPage;
