import api from "./api"

// ─── OBTENER RESERVAS (filtradas por rol en el backend) ───────────────────────
export const getReservas = async (id_usuario, id_rol) => {
  const { data } = await api.get("/reservas", {
    params: { id_usuario, id_rol }
  })
  return data.data
}

// ─── OBTENER RESERVA POR ID ───────────────────────────────────────────────────
export const getReservaById = async (id) => {
  const { data } = await api.get(`/reservas/${id}`)
  return data.data
}

// ─── CREAR RESERVA ────────────────────────────────────────────────────────────
// payload: { id_camara, id_usuario_solicitante, fecha, hora_inicio, hora_fin, motivo }
export const createReserva = async (payload) => {
  const { data } = await api.post("/reservas", payload)
  return data.data
}

// ─── CAMBIAR ESTADO ───────────────────────────────────────────────────────────
// estado: 'Aprobada' | 'Rechazada' | 'Cancelada' | 'Finalizada'
export const cambiarEstadoReserva = async (id, estado) => {
  const { data } = await api.patch(`/reservas/${id}/estado`, { estado })
  return data.data
}

// ─── ELIMINAR RESERVA ─────────────────────────────────────────────────────────
export const deleteReserva = async (id) => {
  const { data } = await api.delete(`/reservas/${id}`)
  return data
}