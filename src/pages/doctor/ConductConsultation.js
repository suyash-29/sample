import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTests, getMedications, conductConsultation } from '../../api/doctor/doctor';
import 'bootstrap/dist/css/bootstrap.min.css';

const ConductConsultation = () => {
  const [symptoms, setSymptoms] = useState('');
  const [physicalExam, setPhysicalExam] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [consultationFee, setConsultationFee] = useState(0);
  const [appointmentId, setAppointmentId] = useState('');
  const [tests, setTests] = useState([]);
  const [medications, setMedications] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tests
        const fetchedTests = await getTests();
        console.log('Fetched Tests:', fetchedTests);
        setTests(fetchedTests); // Ensure tests are properly stored

        // Fetch medications
        const fetchedMedications = await getMedications();
        console.log('Fetched Medications:', fetchedMedications);
        setMedications(fetchedMedications);
      } catch (err) {
        console.error('Error fetching tests or medications:', err);
        setError('Failed to load tests or medications.');
      }
    };
    fetchData();
  }, []);

  // Add a new prescription field
  const addPrescriptionField = () => {
    setPrescriptions([...prescriptions, { medicationId: '', dosage: '', durationDays: '', quantity: '' }]);
  };

  const updatePrescription = (index, field, value) => {
    const updatedPrescriptions = prescriptions.map((prescription, i) =>
      i === index ? { ...prescription, [field]: value } : prescription
    );
    setPrescriptions(updatedPrescriptions);
  };

  const removePrescription = (index) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  // Add a test field
  const addTestField = () => {
    setSelectedTests([...selectedTests, { testId: '' }]);
  };

  const updateTest = (index, testId) => {
    const updatedTests = selectedTests.map((test, i) =>
      i === index ? { testId } : test
    );
    setSelectedTests(updatedTests);
  };

  const removeTest = (index) => {
    setSelectedTests(selectedTests.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!symptoms || !treatmentPlan || !consultationFee || !appointmentId || !followUpDate) {
      setError('Please fill in all required fields.');
      return;
    }

    const payload = {
      symptoms,
      physicalExamination: physicalExam,
      treatmentPlan,
      followUpDate,
      testIDs: selectedTests.map((test) => parseInt(test.testId)),
      prescriptions: prescriptions.map((p) => ({
        medicationID: parseInt(p.medicationId),
        dosage: p.dosage,
        durationDays: parseInt(p.durationDays),
        quantity: parseInt(p.quantity),
      })),
    };

    console.log('Submitting payload:', payload);

    try {
      await conductConsultation(appointmentId, consultationFee, payload);
      setSuccess('Consultation completed successfully.');
      setError('');
      navigate('/doctor-dashboard');
    } catch (err) {
      console.error('Error during submission:', err);
      setError('An error occurred while conducting the consultation.');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Conduct Consultation</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="form-group">
        <label>Appointment ID</label>
        <input
          type="text"
          className="form-control"
          value={appointmentId}
          onChange={(e) => setAppointmentId(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Symptoms</label>
        <textarea
          className="form-control"
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
        ></textarea>
      </div>

      <div className="form-group">
        <label>Physical Examination</label>
        <textarea
          className="form-control"
          value={physicalExam}
          onChange={(e) => setPhysicalExam(e.target.value)}
        ></textarea>
      </div>

      <div className="form-group">
        <label>Treatment Plan</label>
        <textarea
          className="form-control"
          value={treatmentPlan}
          onChange={(e) => setTreatmentPlan(e.target.value)}
        ></textarea>
      </div>

      <div className="form-group">
        <label>Follow-Up Date</label>
        <input
          type="date"
          className="form-control"
          value={followUpDate}
          onChange={(e) => setFollowUpDate(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Consultation Fee</label>
        <input
          type="number"
          className="form-control"
          value={consultationFee}
          onChange={(e) => setConsultationFee(Number(e.target.value))}
        />
      </div>

      {/* Tests Section */}
      <div className="form-group">
        <label>Tests</label>
        {selectedTests.map((test, index) => (
          <div key={index} className="mb-3">
            <select
              className="form-control mb-1"
              value={test.testId}
              onChange={(e) => updateTest(index, e.target.value)}
            >
              <option value="">Select Test</option>
              {tests.map((testOption) => (
                <option key={testOption.testID} value={testOption.testID}>
                  {testOption.testName}
                </option>
              ))}
            </select>
            <button className="btn btn-danger btn-sm" onClick={() => removeTest(index)}>
              Remove
            </button>
          </div>
        ))}
        <button className="btn btn-primary" onClick={addTestField}>
          Add Test
        </button>
      </div>

      {/* Prescription Section */}
      <div className="form-group">
        <label>Prescriptions</label>
        {prescriptions.map((prescription, index) => (
          <div key={index} className="mb-3">
            <select
              className="form-control mb-1"
              value={prescription.medicationId}
              onChange={(e) => updatePrescription(index, 'medicationId', e.target.value)}
            >
              <option value="">Select Medication</option>
              {medications.map((med) => (
                <option key={med.medicationID} value={med.medicationID}>
                  {med.medicationName}
                </option>
              ))}
            </select>
            <input
              type="text"
              className="form-control mb-1"
              placeholder="Dosage"
              value={prescription.dosage}
              onChange={(e) => updatePrescription(index, 'dosage', e.target.value)}
            />
            <input
              type="number"
              className="form-control mb-1"
              placeholder="Duration (Days)"
              value={prescription.durationDays}
              onChange={(e) => updatePrescription(index, 'durationDays', e.target.value)}
            />
            <input
              type="number"
              className="form-control mb-1"
              placeholder="Quantity"
              value={prescription.quantity}
              onChange={(e) => updatePrescription(index, 'quantity', e.target.value)}
            />
            <button
              className="btn btn-danger btn-sm"
              onClick={() => removePrescription(index)}
            >
              Remove
            </button>
          </div>
        ))}
        <button className="btn btn-primary" onClick={addPrescriptionField}>
          Add Prescription
        </button>
      </div>

      <button className="btn btn-success mt-3" onClick={handleSubmit}>
        Submit Consultation
      </button>
    </div>
  );
};

export default ConductConsultation;
