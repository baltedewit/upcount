import axios from 'axios';

export const getHeaders = () => {
  let headers = {
    Accept: 'application/json;',
  };
  if (localStorage.getItem('token')) {
    headers['Authorization'] = `Token ${localStorage.getItem('token')}`;
  }
  return headers;
};

export default () => {
  return axios.create({
    baseURL:
      process.env.NODE_ENV === 'development' ? 'http://localhost:8888/' : 'https://api.upcount.app',
    timeout: 30000,
    headers: getHeaders(),
  });
};
