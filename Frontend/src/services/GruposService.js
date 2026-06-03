import api from "./api"

// ─── OBTENER GRUPOS ───────────────────────────────────────────────────────────
export const getGrupos = async (id_usuario, id_rol) => {
  const { data } = await api.get("/grupos", {
    params: { id_usuario, id_rol }
  })
  return data.data
}

// ─── OBTENER GRUPO POR ID ─────────────────────────────────────────────────────
export const getGrupoById = async (id) => {
  const { data } = await api.get(`/grupos/${id}`)
  return data.data
}

// ─── CREAR GRUPO ──────────────────────────────────────────────────────────────
export const createGrupo = async (payload) => {
  const { data } = await api.post("/grupos", payload)
  return data.data
}

// ─── ACTUALIZAR GRUPO ─────────────────────────────────────────────────────────
export const updateGrupo = async (id, payload) => {
  const { data } = await api.put(`/grupos/${id}`, payload)
  return data.data
}

// ─── CAMBIAR ESTADO ───────────────────────────────────────────────────────────
export const toggleEstadoGrupo = async (id, activo) => {
  const { data } = await api.patch(`/grupos/${id}/estado`, { activo })
  return data.data
}

// ─── ELIMINAR GRUPO ───────────────────────────────────────────────────────────
export const deleteGrupo = async (id) => {
  const { data } = await api.delete(`/grupos/${id}`)
  return data
}

// ─── OBTENER MIEMBROS DE UN GRUPO ─────────────────────────────────────────────
export const getMiembrosGrupo = async (id_grupo) => {
  const { data } = await api.get(`/grupos/${id_grupo}/usuarios`)  // ← cambiar /miembros → /usuarios
  return data.data
}

// ─── ASIGNAR USUARIO A GRUPO ──────────────────────────────────────────────────
export const asignarUsuarioAGrupo = async (id_grupo, id_usuario, rol_en_grupo) => {
  const { data } = await api.post(`/grupos/${id_grupo}/usuarios`, {  // ← cambiar /miembros → /usuarios
    id_usuario,
    rol_en_grupo
  })
  return data.data
}

// ─── QUITAR USUARIO DE GRUPO ──────────────────────────────────────────────────
export const quitarUsuarioDeGrupo = async (id_grupo, id_usuario) => {
  const { data } = await api.delete(`/grupos/${id_grupo}/usuarios/${id_usuario}`)  // ← cambiar /miembros → /usuarios
  return data
}