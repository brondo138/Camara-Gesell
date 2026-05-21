import api from "./api"

const ROLE_BY_ID = {
  1: "admin",
  2: "docente",
  3: "estudiante",
}

function getErrorMessage(error) {
  if (!error.response) {
    return "No se pudo conectar con el backend. Revisa que la API este corriendo en localhost:3000."
  }

  return error.response?.data?.message ?? "No se pudo iniciar sesion."
}

export async function loginRequest({ correo, contrasena }) {
  try {
    const response = await api.post("/auth/login", {
      correo: correo.trim().toLowerCase(),
      contrasena,
    })

    const { usuario, token } = response.data.data

    localStorage.setItem("gesell_token", token)

    return {
      id: usuario.id_usuario,
      nombre: `${usuario.nombre} ${usuario.apellido}`,
      correo: usuario.correo,
      rol: ROLE_BY_ID[usuario.id_rol] ?? "estudiante",
      id_rol: usuario.id_rol,
      nombre_rol: usuario.nombre_rol,
    }
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error })
  }
}
