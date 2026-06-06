import api from "./api"

// ─── OBTENER GRABACIONES (filtradas por rol) ──────────────────────────────────
export const getGrabaciones = async (id_usuario, id_rol) => {
  const { data } = await api.get("/grabaciones", {
    params: { id_usuario, id_rol }
  })
  return data.data
}

// ─── OBTENER GRABACIÓN POR ID ─────────────────────────────────────────────────
export const getGrabacionById = async (id) => {
  const { data } = await api.get(`/grabaciones/${id}`)
  return data.data
}

// ─── OBTENER GRABACIONES POR SESIÓN ──────────────────────────────────────────
export const getGrabacionesPorSesion = async (id_sesion) => {
  const { data } = await api.get(`/grabaciones/sesion/${id_sesion}`)
  return data.data
}

// ─── OBTENER ETIQUETAS DISPONIBLES ───────────────────────────────────────────
export const getEtiquetas = async () => {
  const { data } = await api.get("/grabaciones/etiquetas")
  return data.data
}

// ─── CREAR GRABACIÓN ──────────────────────────────────────────────────────────
// payload: { id_sesion, titulo, url_video, descripcion?, visible?, etiquetas[] }
export const createGrabacion = async (payload) => {
  const { data } = await api.post("/grabaciones", payload)
  return data.data
}

// ─── ACTUALIZAR GRABACIÓN ─────────────────────────────────────────────────────
export const updateGrabacion = async (id, payload) => {
  const { data } = await api.put(`/grabaciones/${id}`, payload)
  return data.data
}

// ─── CAMBIAR VISIBILIDAD ──────────────────────────────────────────────────────
export const cambiarVisibilidad = async (id, visible) => {
  const { data } = await api.patch(`/grabaciones/${id}/visibilidad`, { visible })
  return data.data
}

// ─── ELIMINAR GRABACIÓN ───────────────────────────────────────────────────────
// DESPUÉS
export const deleteGrabacion = async (id, id_usuario, id_rol) => {
  const { data } = await api.delete(`/grabaciones/${id}`, {
    data: { id_usuario, id_rol }
  })
  return data
}