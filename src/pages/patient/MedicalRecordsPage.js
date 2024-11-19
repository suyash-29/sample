// src/components/MedicalRecordsPage.js
import React, { useEffect, useState } from 'react';
import { getMedicalHistory } from '../../api/patient/patientAPI';

const MedicalRecordsPage = () => {
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMedicalRecords = async () => {
      try {
        const data = await getMedicalHistory();
        console.log('Fetched Medical Records:', data); // For debugging
        setMedicalRecords(data);
      } catch (err) {
        console.error('Error:', err);
        setError(err || 'Failed to load medical records.');
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalRecords();
  }, []);

  if (loading) {
    return (
      <div className="container mt-4">
        <h2>Medical Records</h2>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <h2>Medical Records</h2>
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Medical Records</h2>
      {medicalRecords.length === 0 ? (
        <div className="alert alert-warning">No medical records found.</div>
      ) : (
        <>
          {medicalRecords.map((record) => (
            <div key={record.medicalRecordID} className="mb-5">
              <h4>Appointment Details</h4>
              <table className="table table-bordered table-striped">
                <tbody>
                  <tr>
                    <th>Medical Record ID</th>
                    <td>{record.medicalRecordID}</td>
                  </tr>
                  <tr>
                    <th>Appointment Date</th>
                    <td>
                      {new Date(record.appointmentDate).toLocaleDateString()}
                    </td>
                  </tr>
                  <tr>
                    <th>Doctor Name</th>
                    <td>{record.doctorName}</td>
                  </tr>
                  <tr>
                    <th>Symptoms</th>
                    <td>{record.symptoms}</td>
                  </tr>
                  <tr>
                    <th>Physical Examination</th>
                    <td>{record.physicalExamination}</td>
                  </tr>
                  <tr>
                    <th>Treatment Plan</th>
                    <td>{record.treatmentPlan}</td>
                  </tr>
                  <tr>
                    <th>Follow-Up Date</th>
                    <td>
                      {record.followUpDate
                        ? new Date(record.followUpDate).toLocaleDateString()
                        : 'N/A'}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Tests */}
              <h5>Tests</h5>
              {record.tests && record.tests.length > 0 ? (
                <table className="table table-bordered table-striped">
                  <thead>
                    <tr>
                      <th>Test Name</th>
                      <th>Price ($)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.tests.map((test, index) => (
                      <tr key={index}>
                        <td>{test.testName}</td>
                        <td>{test.testPrice}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="alert alert-info">No tests available.</div>
              )}

              {/* Prescriptions */}
              <h5>Prescriptions</h5>
              {record.prescriptions && record.prescriptions.length > 0 ? (
                <table className="table table-bordered table-striped">
                  <thead>
                    <tr>
                      <th>Medication Name</th>
                      <th>Dosage</th>
                      <th>Duration (Days)</th>
                      <th>Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.prescriptions.map((prescription, index) => (
                      <tr key={index}>
                        <td>{prescription.medicationName}</td>
                        <td>{prescription.dosage}</td>
                        <td>{prescription.durationDays}</td>
                        <td>{prescription.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="alert alert-info">No prescriptions available.</div>
              )}

              {/* Billing Details */}
              <h5>Billing Details</h5>
              {record.billingDetails ? (
                <table className="table table-bordered table-striped">
                  <thead>
                    <th>Consultation Fee</th>
                    <th>Total Test Price</th>
                    <th>Total Medication Price</th>
                    <th>Grand Total</th>
                    <th>Status</th>
                  </thead>
                  <tbody>
                      <td>{record.billingDetails.consultationFee}</td>
                      <td>{record.billingDetails.totalTestsPrice}</td>
                      <td>{record.billingDetails.totalMedicationsPrice}</td>
                      <td>{record.billingDetails.grandTotal}</td>
                      <td>{record.billingDetails.status}</td>
                  </tbody>
                </table>
              ) : (
                <div className="alert alert-info">No billing details available.</div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default MedicalRecordsPage;
