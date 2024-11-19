import {jwtDecode} from 'jwt-decode'; 

export const getUserRole = (token) => {
  try {
    const decoded = jwtDecode(token); // Decode the JWT token
    console.log(decoded);
    console.log(decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']);
    return decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']; // Adjust the key based on how the role is stored in the token
  } catch (error) {
    console.error('Failed to decode token:', error);
    throw new Error('Invalid token');
  }
};
