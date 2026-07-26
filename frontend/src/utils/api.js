import axios from 'axios';

let url = "http://localhost:5000";
// let url = ""; 


const api = axios.create({
  baseURL: `${url}/api`,
  withCredentials: true,
});

export default api;