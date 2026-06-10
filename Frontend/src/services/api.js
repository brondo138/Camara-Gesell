import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "https://camara-gesell.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("gesell_token")

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default api
