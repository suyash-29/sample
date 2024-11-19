import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { getPatientMedicalRecords, updateMedicalRecord, updateBillingStatus } from '../../api/doctor/doctor';

const MedicalRecords = () => {
  const [patientId, setPatientId] = useState('');
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null); // Track which record is being edited
  const [apiMessage, setApiMessage] = useState(''); // Track success/error messages

  const fetchMedicalRecords = async () => {
    try {
      setApiMessage('');
      const data = await getPatientMedicalRecords(patientId);
      setMedicalRecords(data);
    } catch (err) {
      setApiMessage('Failed to fetch medical records. Please try again.');
    }
  };

  const handleUpdateRecord = async (recordId, updatedData) => {
    try {
      const response = await updateMedicalRecord(recordId, patientId, updatedData);
      setApiMessage('Medical record updated successfully.');
      fetchMedicalRecords();
      setEditingRecord(null); // Exit editing mode
    } catch (err) {
      setApiMessage('Failed to update medical record. Please try again.');
    }
  };

  const handleUpdateBilling = async (billingId) => {
    try {
      await updateBillingStatus(billingId);
      setApiMessage('Billing status updated to Paid.');
      fetchMedicalRecords();
    } catch (err) {
      setApiMessage('Failed to update billing status. Please try again.');
    }
  };

  return (
    <div className="container">
      <h2 className="my-4">Medical Records</h2>
      <div className="mb-4">
        <input
          type="number"
          placeholder="Enter Patient ID"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          className="form-control"
        />
        <button onClick={fetchMedicalRecords} className="btn btn-primary mt-2">
          Fetch Medical Records
        </button>
      </div>
      {apiMessage && (
        <div className={`alert ${apiMessage.includes('Failed') ? 'alert-danger' : 'alert-success'}`}>
          {apiMessage}
        </div>
      )}
      {medicalRecords.map((record, index) => (
        <div key={`medical-record-${record.medicalRecordID || index}`} className="mb-5">
          <h4>Medical Record ID: {record.medicalRecordID || 'N/A'}</h4>
          <h4>Appointment Date: {record.appointmentDate}</h4>
          <h5>Doctor: {record.doctorName}</h5>

          {/* Inline Editing */}
          {editingRecord === record.medicalRecordID ? (
            <>
              <div>
                <label>Symptoms:</label>
                <input
                  type="text"
                  defaultValue={record.symptoms || ''}
                  className="form-control mb-2"
                  onChange={(e) => (record.symptoms = e.target.value)}
                />
              </div>
              <div>
                <label>Physical Examination:</label>
                <input
                  type="text"
                  defaultValue={record.physicalExamination || ''}
                  className="form-control mb-2"
                  onChange={(e) => (record.physicalExamination = e.target.value)}
                />
              </div>
              <div>
                <label>Treatment Plan:</label>
                <input
                  type="text"
                  defaultValue={record.treatmentPlan || ''}
                  className="form-control mb-2"
                  onChange={(e) => (record.treatmentPlan = e.target.value)}
                />
              </div>
              <div>
                <label>Follow-Up Date:</label>
                <input
                  type="date"
                  defaultValue={record.followUpDate || ''}
                  className="form-control mb-2"
                  onChange={(e) => (record.followUpDate = e.target.value)}
                />
              </div>
              <button
                onClick={() =>
                  handleUpdateRecord(record.medicalRecordID, {
                    symptoms: record.symptoms,
                    physicalExamination: record.physicalExamination,
                    treatmentPlan: record.treatmentPlan,
                    followUpDate: record.followUpDate,
                  })
                }
                className="btn btn-success me-2"
              >
                Save Changes
              </button>
              <button onClick={() => setEditingRecord(null)} className="btn btn-secondary">
                Cancel
              </button>
            </>
          ) : (
            <>
              <p>Symptoms: {record.symptoms || 'N/A'}</p>
              <p>Physical Examination: {record.physicalExamination || 'N/A'}</p>
              <p>Treatment Plan: {record.treatmentPlan || 'N/A'}</p>
              <p>Follow-Up Date: {record.followUpDate || 'N/A'}</p>
              <button onClick={() => setEditingRecord(record.medicalRecordID)} className="btn btn-warning">
                Update Medical Record
              </button>
            </>
          )}

<h5>Tests</h5>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Test Name</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {record.tests.map((test, idx) => (
                <tr key={`test-${test.testID || idx}`}>
                  <td>{test.testName}</td>
                  <td>${test.testPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h5>Prescriptions</h5>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Medication</th>
                <th>Dosage</th>
                <th>Duration</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {record.prescriptions.map((prescription, idx) => (
                <tr key={`prescription-${prescription.medicationID || idx}`}>
                  <td>{prescription.medicationName}</td>
                  <td>{prescription.dosage}</td>
                  <td>{prescription.durationDays} days</td>
                  <td>{prescription.quantity || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {record.billingDetails && (
            <div className="mt-3">
              <h5>Billing Details</h5>
              <p>
                Billing ID: {record.billingDetails.billingID} | Consultation Fee: $
                {record.billingDetails.consultationFee} | Total Test Price: $
                {record.billingDetails.totalTestsPrice} | Total Medications Price: $
                {record.billingDetails.totalMedicationsPrice} | Grand Total: $
                {record.billingDetails.grandTotal} | Status: {record.billingDetails.status}
              </p>
              {record.billingDetails.status === 'Pending' && (
                <button
                  onClick={() => handleUpdateBilling(record.billingDetails.billingID)}
                  className="btn btn-success"
                >
                  Mark as Paid
                </button>
              )}
            </div>
          )}

          {/* Separator */}
          {index < medicalRecords.length - 1 && <hr />}
        </div>
      ))}
    </div>
  );
};

export default MedicalRecords;
