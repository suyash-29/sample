import React, { useState, useEffect } from "react";
import { Form, Button, Table, Badge, Alert, Spinner } from "react-bootstrap";
import { getDoctorDetails, updateDoctor, deleteDoctor, getAllSpecializations } from "../../api/admin/adminAPI";

const ManageDoctor = () => {
  const [doctorId, setDoctorId] = useState("");
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const [loading, setLoading] = useState(false);
  const [updatedDoctor, setUpdatedDoctor] = useState({});
  const [specializations, setSpecializations] = useState([]);
  const [availableSpecializations, setAvailableSpecializations] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState("");

  // Fetch all specializations on component mount
  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        const response = await getAllSpecializations();
        setAvailableSpecializations(response);
        console.log("Available Specializations:", response); // Debugging
      } catch (error) {
        console.error("Error fetching specializations:", error);
        setAlertMessage("Failed to load specializations.");
        setAlertType("danger");
      }
    };

    fetchSpecializations();
  }, []);

  const fetchDoctorDetails = async () => {
    setLoading(true);
    try {
      const response = await getDoctorDetails(doctorId);
      setDoctorDetails(response);
      setUpdatedDoctor({
        fullName: response.fullName,
        email: response.email,
        experienceYears: response.experienceYears,
        qualification: response.qualification,
        designation: response.designation,
      });
      setSpecializations(response.doctorSpecializations.map((ds) => ({
        id: ds.specialization.specializationID,
        name: ds.specialization.specializationName,
      })));
      setIsEditing(false); // Reset editing mode
      console.log("Doctor Details:", response); // Debugging
    } catch (error) {
      console.error(error);
      setAlertMessage("Failed to fetch doctor details.");
      setAlertType("danger");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDoctor = async () => {
    setLoading(true);
    try {
      const payload = {
        ...updatedDoctor,
        specializationIds: specializations.map((s) => s.id),
      };
      console.log("Outgoing Packet (Update):", payload); // Debugging
      const response = await updateDoctor(doctorDetails.doctorID, payload);
      setAlertMessage("Doctor updated successfully.");
      setAlertType("success");
      console.log("Response:", response); // Debugging
    } catch (error) {
      console.error(error);
      setAlertMessage("Failed to update doctor.");
      setAlertType("danger");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDoctor = async () => {
    setLoading(true);
    try {
      console.log("Outgoing Packet (Delete):", { userId: doctorDetails.userID, doctorId: doctorDetails.doctorID });
      const response = await deleteDoctor(doctorDetails.userID, doctorDetails.doctorID);
      setAlertMessage("Doctor deleted successfully.");
      setAlertType("success");
      console.log("Response:", response); // Debugging
      setDoctorDetails(null);
    } catch (error) {
      console.error(error);
      setAlertMessage("Failed to delete doctor.");
      setAlertType("danger");
    } finally {
      setLoading(false);
    }
  };

  const addSpecialization = () => {
    if (
      selectedSpecialization &&
      !specializations.some((s) => s.id === selectedSpecialization.id)
    ) {
      setSpecializations([...specializations, selectedSpecialization]);
    }
  };

  const removeSpecialization = (id) => {
    setSpecializations(specializations.filter((s) => s.id !== id));
  };

  return (
    <div className="container mt-5">
      <h2>Manage Doctor</h2>

      {alertMessage && (
        <Alert variant={alertType} className="mt-3">
          {alertMessage}
        </Alert>
      )}

      {/* Fetch Doctor Details */}
      <Form.Group className="mb-3">
        <Form.Label>Doctor ID</Form.Label>
        <div className="d-flex">
          <Form.Control
            type="text"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
          />
          <Button variant="primary" className="ms-2" onClick={fetchDoctorDetails} disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : "Get Details"}
          </Button>
        </div>
      </Form.Group>

      {doctorDetails && (
        <>
          <Table striped bordered hover className="mt-4">
            <tbody>
              <tr>
                <th>Full Name</th>
                <td>{isEditing ? (
                  <Form.Control
                    type="text"
                    value={updatedDoctor.fullName}
                    onChange={(e) =>
                      setUpdatedDoctor({ ...updatedDoctor, fullName: e.target.value })
                    }
                  />
                ) : (
                  doctorDetails.fullName
                )}</td>
              </tr>
              <tr>
                <th>Email</th>
                <td>{isEditing ? (
                  <Form.Control
                    type="email"
                    value={updatedDoctor.email}
                    onChange={(e) =>
                      setUpdatedDoctor({ ...updatedDoctor, email: e.target.value })
                    }
                  />
                ) : (
                  doctorDetails.email
                )}</td>
              </tr>
              <tr>
                <th>Experience Years</th>
                <td>{isEditing ? (
                  <Form.Control
                    type="number"
                    value={updatedDoctor.experienceYears}
                    onChange={(e) =>
                      setUpdatedDoctor({ ...updatedDoctor, experienceYears: e.target.value })
                    }
                  />
                ) : (
                  doctorDetails.experienceYears
                )}</td>
              </tr>
              <tr>
                <th>Qualification</th>
                <td>{isEditing ? (
                  <Form.Control
                    type="text"
                    value={updatedDoctor.qualification}
                    onChange={(e) =>
                      setUpdatedDoctor({ ...updatedDoctor, qualification: e.target.value })
                    }
                  />
                ) : (
                  doctorDetails.qualification
                )}</td>
              </tr>
              <tr>
                <th>Designation</th>
                <td>{isEditing ? (
                  <Form.Control
                    type="text"
                    value={updatedDoctor.designation}
                    onChange={(e) =>
                      setUpdatedDoctor({ ...updatedDoctor, designation: e.target.value })
                    }
                  />
                ) : (
                  doctorDetails.designation
                )}</td>
              </tr>
              <tr>
                <th>Specializations</th>
                <td>
                  {specializations.map((spec, index) => (
                    <Badge key={index} pill bg="info" className="me-2">
                      {spec.name}{" "}
                      {isEditing && (
                        <Button
                          variant="link"
                          className="text-white p-0"
                          onClick={() => removeSpecialization(spec.id)}
                        >
                          &times;
                        </Button>
                      )}
                    </Badge>
                  ))}
                  {isEditing && (
                    <div className="d-flex mt-2">
                      <Form.Select onChange={(e) => setSelectedSpecialization({
                        id: e.target.value,
                        name: e.target.options[e.target.selectedIndex].text
                      })}>
                        <option value="">Select Specialization</option>
                        {availableSpecializations.map((spec) => (
                          <option key={spec.specializationID} value={spec.specializationID}>
                            {spec.specializationName}
                          </option>
                        ))}
                      </Form.Select>
                      <Button variant="secondary" className="ms-2" onClick={addSpecialization}>
                        Add
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            </tbody>
          </Table>

          {/* Action Buttons */}
          <div className="d-flex justify-content-between mt-4">
            {isEditing ? (
              <>
                <Button variant="success" onClick={handleUpdateDoctor} disabled={loading}>
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
                <Button variant="danger" onClick={handleDeleteDoctor} disabled={loading}>
                  {loading ? <Spinner animation="border" size="sm" /> : "Delete Doctor"}
                </Button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ManageDoctor;
