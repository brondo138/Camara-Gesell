import api from "./api"

// Parámetros comunes: { id_usuario, id_rol, mes?, anio? }

export const getResumen = async (params) => {
  const { data } = await api.get("/reportes/resumen", { params })
  return data.data
}

export const getUsoSalas = async (params) => {
  const { data } = await api.get("/reportes/salas", { params })
  return data.data
}

export const getEstados = async (params) => {
  const { data } = await api.get("/reportes/estados", { params })
  return data.data
}

export const getActividadDocentes = async (params) => {
  const { data } = await api.get("/reportes/docentes", { params })
  return data.data
}

export const getDetalle = async (params) => {
  const { data } = await api.get("/reportes/detalle", { params })
  return data.data
}