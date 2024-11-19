import React, { useEffect, useState } from 'react';
import { checkUsernameAvailability, getAllSpecializations, registerDoctor } from '../../api/admin/adminAPI';
import { Alert, Form, Button, Spinner, Badge } from 'react-bootstrap';

const RegisterDoctor = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    experienceYears: '',
    qualification: '',
    designation: '',
    specializationIds: [],
  });
  const [specializations, setSpecializations] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [usernameMessage, setUsernameMessage] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        const data = await getAllSpecializations();
        setSpecializations(data);
      } catch (error) {
        console.error('Error fetching specializations:', error);
      }
    };
    fetchSpecializations();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const addSpecialization = () => {
    if (!selectedSpecialization) return;

    const specializationId = Number(selectedSpecialization);
    if (!formData.specializationIds.includes(specializationId)) {
      setFormData({
        ...formData,
        specializationIds: [...formData.specializationIds, specializationId],
      });
    }
  };

  const removeSpecialization = (id) => {
    setFormData({
      ...formData,
      specializationIds: formData.specializationIds.filter((specId) => specId !== id),
    });
  };

  const checkUsername = async () => {
    if (!formData.username.trim()) {
      setUsernameMessage('Please enter a username.');
      return;
    }

    try {
      const { isAvailable, message } = await checkUsernameAvailability(formData.username);
      setUsernameMessage(message);
      setTimeout(() => setUsernameMessage(''), 2000);
    } catch (error) {
      console.error('Error checking username:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Outgoing Packet:', formData); // Log the outgoing data packet
      const response = await registerDoctor(formData);
      setAlertMessage('Doctor registered successfully!');
      setAlertType('success');
      setFormData({
        username: '',
        password: '',
        fullName: '',
        email: '',
        experienceYears: '',
        qualification: '',
        designation: '',
        specializationIds: [],
      });
    } catch (error) {
      setAlertMessage(error.response?.data || 'Failed to register doctor.');
      setAlertType('danger');
    } finally {
      setLoading(false);
      setTimeout(() => setAlertMessage(''), 2000);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Register a Doctor</h2>

      {alertMessage && (
        <Alert variant={alertType} className="mt-3">
          {alertMessage}
        </Alert>
      )}

      <Form onSubmit={handleSubmit} className="mt-4">
        {/* Username Field */}
        <Form.Group className="mb-3">
          <Form.Label>Username</Form.Label>
          <div className="d-flex align-items-center">
            <Form.Control
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <Button
              variant="secondary"
              className="ms-2"
              onClick={checkUsername}
            >
              Check Availability
            </Button>
          </div>
          {usernameMessage && <div className="text-info mt-2">{usernameMessage}</div>}
        </Form.Group>

        {/* Other Fields */}
        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Full Name</Form.Label>
          <Form.Control
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Years of Experience</Form.Label>
          <Form.Control
            type="number"
            name="experienceYears"
            value={formData.experienceYears}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Qualification</Form.Label>
          <Form.Control
            type="text"
            name="qualification"
            value={formData.qualification}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Designation</Form.Label>
          <Form.Control
            type="text"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            required
          />
        </Form.Group>

        {/* Specialization Selection */}
        <Form.Group className="mb-3">
          <Form.Label>Specializations</Form.Label>
          <div className="d-flex align-items-center">
            <Form.Select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
            >
              <option value="">Select a specialization</option>
              {specializations.map((spec) => (
                <option key={spec.specializationID} value={spec.specializationID}>
                  {spec.specializationName}
                </option>
              ))}
            </Form.Select>
            <Button variant="secondary" className="ms-2" onClick={addSpecialization}>
              Add Specialization
            </Button>
          </div>
          <div className="mt-3">
            {formData.specializationIds.map((id) => {
              const spec = specializations.find((spec) => spec.specializationID === id);
              return (
                <Badge key={id} pill bg="info" className="me-2">
                  {spec?.specializationName}{' '}
                  <Button
                    variant="link"
                    className="text-white p-0 ms-2"
                    onClick={() => removeSpecialization(id)}
                  >
                    &times;
                  </Button>
                </Badge>
              );
            })}
          </div>
        </Form.Group>

        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : 'Register'}
        </Button>
      </Form>
    </div>
  );
};

export default RegisterDoctor;
