import axios from 'axios';

// let url = "http://localhost:5000";
let url = "https://hotel-management-system-ashy.vercel.app"; 


const api = axios.create({
  baseURL: `${url}/api`,
  withCredentials: true,
});

export default api;