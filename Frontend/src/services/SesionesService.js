import api from "./api"

// ─── OBTENER SESIONES (filtradas por rol en el backend) ───────────────────────
export const getSesiones = async (id_usuario, id_rol) => {
  const { data } = await api.get("/sesiones", {
    params: { id_usuario, id_rol }
  })
  return data.data
}

// ─── OBTENER SESIÓN POR ID ────────────────────────────────────────────────────
export const getSesionById = async (id) => {
  const { data } = await api.get(`/sesiones/${id}`)
  return data.data
}

// ─── CREAR SESIÓN ─────────────────────────────────────────────────────────────
// payload: { id_reserva, titulo, descripcion?, tipo_sesion?, fecha_realizacion? }
export const createSesion = async (payload) => {
  const { data } = await api.post("/sesiones", payload)
  return data.data
}

// ─── ACTUALIZAR SESIÓN ────────────────────────────────────────────────────────
export async function updateSesion(id, campos) {
  const { data } = await api.put(`/sesiones/${id}`, campos)
  return data.data
}

// ─── CAMBIAR ESTADO ───────────────────────────────────────────────────────────
// estado: 'Programada' | 'Realizada' | 'Cancelada'
export const cambiarEstadoSesion = async (id, estado) => {
  const { data } = await api.patch(`/sesiones/${id}/estado`, { estado })
  return data.data
}