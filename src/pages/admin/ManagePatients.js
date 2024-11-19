import React, { useState, useEffect } from "react";
import { Form, Button, Table, Alert, Spinner } from "react-bootstrap";
import { getPatientDetails, updatePatient, deletePatient } from "../../api/admin/adminAPI";

const ManagePatients = () => {
  const [patientId, setPatientId] = useState("");
  const [patientDetails, setPatientDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const [loading, setLoading] = useState(false);
  const [updatedPatient, setUpdatedPatient] = useState({});

  const fetchPatientDetails = async () => {
    setLoading(true);
    try {
      const response = await getPatientDetails(patientId);
      setPatientDetails(response);
      setUpdatedPatient({ ...response });
      setIsEditing(false); // Reset editing mode
      setAlertMessage("Patient details fetched successfully.");
      setAlertType("success");
    } catch (error) {
      console.error(error);
      setAlertMessage("Failed to fetch patient details.");
      setAlertType("danger");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePatient = async () => {
    setLoading(true);
    try {
      const response = await updatePatient(updatedPatient);
      setPatientDetails(response);
      setAlertMessage("Patient updated successfully.");
      setAlertType("success");
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      setAlertMessage("Failed to update patient.");
      setAlertType("danger");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePatient = async () => {
    setLoading(true);
    try {
      await deletePatient(patientDetails.userID, patientDetails.patientID);
      setAlertMessage("Patient deleted successfully.");
      setAlertType("success");
      setPatientDetails(null); // Clear the details after deletion
    } catch (error) {
      console.error(error);
      setAlertMessage("Failed to delete patient.");
      setAlertType("danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Manage Patients</h2>

      {alertMessage && (
        <Alert variant={alertType} onClose={() => setAlertMessage("")} dismissible>
          {alertMessage}
        </Alert>
      )}

      <Form.Group className="mb-3">
        <Form.Label>Patient ID</Form.Label>
        <div className="d-flex">
          <Form.Control
            type="text"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
          />
          <Button variant="primary" className="ms-2" onClick={fetchPatientDetails} disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : "Get Details"}
          </Button>
        </div>
      </Form.Group>

      {patientDetails && (
        <>
          <Table striped bordered hover className="mt-4">
            <tbody>
            <tr>
                <th>User ID</th>
                <td>
                  {patientDetails.userID}
                </td>
              </tr>
              
              <tr>
                <th>Full Name</th>
                <td>
                  {isEditing ? (
                    <Form.Control
                      type="text"
                      value={updatedPatient.fullName}
                      onChange={(e) =>
                        setUpdatedPatient({ ...updatedPatient, fullName: e.target.value })
                      }
                    />
                  ) : (
                    patientDetails.fullName
                  )}
                </td>
              </tr>
              <tr>
                <th>Email</th>
                <td>
                  {isEditing ? (
                    <Form.Control
                      type="email"
                      value={updatedPatient.email}
                      onChange={(e) =>
                        setUpdatedPatient({ ...updatedPatient, email: e.target.value })
                      }
                    />
                  ) : (
                    patientDetails.email
                  )}
                </td>
              </tr>
              <tr>
                <th>Date of Birth</th>
                <td>
                  {isEditing ? (
                    <Form.Control
                      type="date"
                      value={updatedPatient.dateOfBirth}
                      onChange={(e) =>
                        setUpdatedPatient({ ...updatedPatient, dateOfBirth: e.target.value })
                      }
                    />
                  ) : (
                    new Date(patientDetails.dateOfBirth).toLocaleDateString()
                  )}
                </td>
              </tr>
              <tr>
                <th>Contact Number</th>
                <td>
                  {isEditing ? (
                    <Form.Control
                      type="text"
                      value={updatedPatient.contactNumber}
                      onChange={(e) =>
                        setUpdatedPatient({ ...updatedPatient, contactNumber: e.target.value })
                      }
                    />
                  ) : (
                    patientDetails.contactNumber
                  )}
                </td>
              </tr>
              <tr>
                <th>Address</th>
                <td>
                  {isEditing ? (
                    <Form.Control
                      type="text"
                      value={updatedPatient.address}
                      onChange={(e) =>
                        setUpdatedPatient({ ...updatedPatient, address: e.target.value })
                      }
                    />
                  ) : (
                    patientDetails.address
                  )}
                </td>
              </tr>
              <tr>
                <th>Medical History</th>
                <td>
                  {isEditing ? (
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={updatedPatient.medicalHistory}
                      onChange={(e) =>
                        setUpdatedPatient({ ...updatedPatient, medicalHistory: e.target.value })
                      }
                    />
                  ) : (
                    patientDetails.medicalHistory
                  )}
                </td>
              </tr>
            </tbody>
          </Table>

          <div className="d-flex justify-content-between mt-4">
            {isEditing ? (
              <>
                <Button variant="success" onClick={handleUpdatePatient} disabled={loading}>
                  {loading ? <Spinner animation="border" size="sm" /> : "Save Changes"}
                </Button>
                <Button variant="secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button variant="warning" onClick={() => setIsEditing(true)}>
                  Edit Details
                </Button>
                <Button variant="danger" onClick={handleDeletePatient} disabled={loading}>
                  {loading ? <Spinner animation="border" size="sm" /> : "Delete Patient"}
                </Button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ManagePatients;
