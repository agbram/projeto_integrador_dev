import axios from 'axios';

// URL dinâmica para produção/desenvolvimento
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL,  // Usa variável de ambiente
});

// Adiciona o token em todas as requisições
api.interceptors.request.use(function (config) {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = 'Bearer ' + token;
  }
  return config;
});

// Se a resposta for 401/403, toma a decisão de deslogar ou não
api.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (!error.config?.url?.includes('/users/login')) {
        const msg = error.response?.data?.error || error.response?.data?.erro;
        
        if (msg === "Usuário não autorizado") {
          // Apenas previne o deslogamento e propaga o erro para a página reagir
          return Promise.reject(error);
        } else {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;