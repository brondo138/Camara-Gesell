import api from "./api"

export const ROLES = [
  { id: 1, value: "admin", label: "Administrador" },
  { id: 2, value: "docente", label: "Docente" },
  { id: 3, value: "estudiante", label: "Practicante" },
]

function normalizeCorreo(correo) {
  return correo.trim().toLowerCase()
}

function getErrorMessage(error) {
  if (!error.response) {
    return "No se pudo conectar con el backend. Revisa que la API este corriendo en localhost:3000."
  }

  return error.response?.data?.message ?? "No se pudo completar la accion."
}

export function getRoleValue(idRol) {
  return ROLES.find((rol) => rol.id === Number(idRol))?.value ?? "estudiante"
}

export function getRoleId(value) {
  return ROLES.find((rol) => rol.value === value)?.id ?? 3
}

export async function getUsuarios() {
  try {
    const response = await api.get("/usuarios")
    return response.data.data
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error })
  }
}

export async function createUsuario(data) {
  try {
    const response = await api.post("/usuarios", {
      nombre: data.nombre.trim(),
      apellido: data.apellido.trim(),
      correo: normalizeCorreo(data.correo),
      contrasena: data.contrasena,
      id_rol: getRoleId(data.rol),
    })

    return response.data.data
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error })
  }
}

export async function updateUsuario(id, data) {
  try {
    const response = await api.put(`/usuarios/${id}`, {
      nombre: data.nombre.trim(),
      apellido: data.apellido.trim(),
      correo: normalizeCorreo(data.correo),
      id_rol: getRoleId(data.rol),
      activo: data.activo,
    })

    if (data.contrasena?.trim()) {
      await updateUsuarioContrasena(id, data.contrasena)
    }

    return response.data.data
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error })
  }
}

export async function updateUsuarioContrasena(id, nuevaContrasena) {
  try {
    const response = await api.patch(`/usuarios/${id}/contrasena`, {
      nuevaContrasena,
    })

    return response.data.data
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error })
  }
}

export async function toggleUsuarioActivo(usuario) {
  try {
    const response = await api.put(`/usuarios/${usuario.id_usuario}`, {
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      id_rol: usuario.id_rol,
      activo: !usuario.activo,
    })

    return response.data.data
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error })
  }
}

export async function deleteUsuario(id) {
  try {
    const response = await api.delete(`/usuarios/${id}`)
    return response.data.data
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error })
  }
}
