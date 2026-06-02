import api from "./api"

// ─── OBTENER TODAS LAS CÁMARAS ────────────────────────────────────────────────
export const getCamaras = async (id_usuario, id_rol) => {
  const { data } = await api.get("/camaras", { params: { id_usuario, id_rol } })
  return data.data // array de cámaras
}

// ─── OBTENER CÁMARA POR ID ────────────────────────────────────────────────────
export const getCamaraById = async (id) => {
  const { data } = await api.get(`/camaras/${id}`)
  return data.data
}

// ─── CREAR CÁMARA ─────────────────────────────────────────────────────────────
export const createCamara = async (payload) => {
  const { data } = await api.post("/camaras", payload)
  return data.data
}

// ─── ACTUALIZAR CÁMARA ────────────────────────────────────────────────────────
export const updateCamara = async (id, payload) => {
  const { data } = await api.put(`/camaras/${id}`, payload)
  return data.data
}

// ─── CAMBIAR ESTADO ───────────────────────────────────────────────────────────
export const toggleEstadoCamara = async (id, activa) => {
  const { data } = await api.patch(`/camaras/${id}/estado`, { activa })
  return data.data
}

// ─── ELIMINAR CÁMARA ──────────────────────────────────────────────────────────
export const deleteCamara = async (id) => {
  const { data } = await api.delete(`/camaras/${id}`)
  return data
}