import axios from 'axios';

const API_URL = 'https://localhost:7270/api/User';

export const checkUsernameAvailability = async (username) => {
  try {
    const response = await axios.get(`${API_URL}/check-username`, {
      params: { username },
    });
    return response.data;
  } catch (error) {
    console.error('Username check failed:', error);
    throw error;
  }
};

export const registerPatient = async (registrationData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, registrationData);
    return response.data;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};
