// src/api/admin/adminAPI.js

import axios from 'axios';

const API_URL = 'https://localhost:7270/api/Admin';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Request:', config);
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response:', response);
    return response;
  },
  (error) => {
    console.error('Error Response:', error.response);
    return Promise.reject(error);
  }
);

export const checkUsernameAvailability = async (username) => {
  const response = await axiosInstance.get(`/CheckUsername?username=${username}`);
  return response.data;
};

export const getAllSpecializations = async () => {
  const response = await axiosInstance.get('/specializations');
  return response.data;
};

export const registerDoctor = async (doctorData) => {
  const response = await axiosInstance.post('/RegisterDoctor', doctorData);
  return response.data;
};


export const getDoctorDetails = async (doctorId) => {
  const response = await axiosInstance.get(`GetDoctorDetails/${doctorId}`);
  return response.data;
};

export const updateDoctor = async (doctorId, doctorDto) => {
  const response = await axiosInstance.put(`UpdateDoctor/${doctorId}`, doctorDto);
  return response.data;
};

export const deleteDoctor = async (userId, doctorId) => {
  const response = await axiosInstance.delete(`DeleteDoctor/${userId}/${doctorId}`);
  return response.data;
};

// Function to fetch patient details by ID
export const getPatientDetails = async (patientId) => {
    try {
      const response = await axiosInstance.get(`/GetPatientDetails/${patientId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || 'Error fetching patient details.');
    }
  };
  
  // Function to update a patient
  export const updatePatient = async (patientDto) => {
    try {
      const response = await axiosInstance.post('/UpdatePatient', patientDto);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || 'Error updating patient.');
    }
  };
  
  // Function to delete a patient by userId and patientId
  export const deletePatient = async (userId, patientId) => {
    try {
      const response = await axiosInstance.delete(`/DeletePatient/${userId}/${patientId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || 'Error deleting patient.');
    }
  };
