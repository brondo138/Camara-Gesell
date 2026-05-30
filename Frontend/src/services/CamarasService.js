import api from "./api"

// ─── OBTENER TODAS LAS CÁMARAS ────────────────────────────────────────────────
export const getCamaras = async () => {
  const { data } = await api.get("/camaras")
  return data.data // array de cámaras
}

// ─── OBTENER CÁMARA POR ID ────────────────────────────────────────────────────
export const getCamaraById = async (id) => {
  const { data } = await api.get(`/camaras/${id}`)
  return data.data
}

// ─── CREAR CÁMARA ─────────────────────────────────────────────────────────────
export const createCamara = async (payload) => {
  // payload: { nombre, ubicacion?, descripcion?, activa? }
  const { data } = await api.post("/camaras", payload)
  return data.data
}

// ─── ACTUALIZAR CÁMARA ────────────────────────────────────────────────────────
export const updateCamara = async (id, payload) => {
  // payload: { nombre, ubicacion?, descripcion?, activa }
  const { data } = await api.put(`/camaras/${id}`, payload)
  return data.data
}

// ─── CAMBIAR ESTADO (activar / desactivar) ────────────────────────────────────
export const toggleEstadoCamara = async (id, activa) => {
  const { data } = await api.patch(`/camaras/${id}/estado`, { activa })
  return data.data
}

// ─── ELIMINAR CÁMARA ──────────────────────────────────────────────────────────
export const deleteCamara = async (id) => {
  const { data } = await api.delete(`/camaras/${id}`)
  return data
}