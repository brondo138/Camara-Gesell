import api from "./api"

// ─── OBTENER OBSERVACIONES DE UNA SESIÓN ─────────────────────────────────────
export const getObservacionesBySesion = async (id_sesion, id_usuario, id_rol) => {
  const { data } = await api.get("/observaciones", {
    params: { id_sesion, id_usuario, id_rol }
  })
  return data.data
}

// ─── CREAR OBSERVACIÓN ────────────────────────────────────────────────────────
// payload: { id_sesion, id_usuario, observacion }
export const createObservacion = async (payload) => {
  const { data } = await api.post("/observaciones", {
    ...payload,
    id_rol: payload.id_rol  // Se envía id_rol para validación en backend
  })
  return data.data
}

// ─── ACTUALIZAR OBSERVACIÓN ───────────────────────────────────────────────────
export const updateObservacion = async (id_observacion, id_usuario, id_rol, observacion) => {
  const { data } = await api.put(`/observaciones/${id_observacion}`, {
    id_usuario,
    id_rol,
    observacion
  })
  return data.data
}

// ─── ELIMINAR OBSERVACIÓN ────────────────────────────────────────────────────
export const deleteObservacion = async (id_observacion, id_usuario, id_rol) => {
  const { data } = await api.delete(`/observaciones/${id_observacion}`, {
    data: { id_usuario, id_rol }
  })
  return data
}