import axios from 'axios';

const API_URL = 'https://localhost:7270/api/Doctor';

// Create an Axios instance with the base URL and common headers
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept request to automatically add the Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Fetch appointments by status
export const getAppointmentsByStatus = async (status) => {
  try {
    const response = await axiosInstance.get(`/GetAppointmentsByStatus`, {
      params: { status },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching appointments by status:', error);
    return []; // Return an empty array if there's an error
  }
};

// Cancel an appointment by ID
export const cancelAppointment = async (appointmentId) => {
  try {
    await axiosInstance.put(`/CancelAppointment/${appointmentId}/cancel`);
    
  } catch (error) {
    console.error('Error canceling appointment:', error);
    throw error; // Propagate error for further handling if needed
  }
};



export const rescheduleAppointment = async (appointmentId, rescheduleData) => {
    try {
      const response = await axiosInstance.put(
        `/RescheduleAppointment/${appointmentId}`,
        rescheduleData
      );
      
      return response;
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      throw error;
    }
  };

  export const getMedications = async () => {
    try {
      const response = await axios.get(`${API_URL}/GetAllMedications`);
      return response.data;
    } catch (error) {
      console.error('Error fetching medications:', error);
      throw error;
    }
  };
  
  export const getTests = async () => {
    try {
      const response = await axios.get(`${API_URL}/GetAllTests`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tests:', error);
      throw error;
    }
  };
  
  export const conductConsultation = async (appointmentId, recordDto, consultationFee) => {
    try {
      const response = await axios.post(`${API_URL}/appointments/${appointmentId}/consult`, recordDto, {
        params: { consultationFee },
      });
      return response.data;
    } catch (error) {
      console.error('Error conducting consultation:', error);
      throw error;
    }
  };
  