const STORAGE_KEY = "gesell_usuarios"

export const ROLES = [
  { id: 1, value: "admin", label: "Administrador" },
  { id: 2, value: "docente", label: "Docente" },
  { id: 3, value: "estudiante", label: "Practicante" },
]

const usuariosIniciales = [
  {
    id_usuario: 1,
    nombre: "Juan",
    apellido: "Perez",
    correo: "admin@universidad.edu",
    contrasena: "admin123",
    rol: "admin",
    activo: true,
    fecha_creacion: "2026-05-20",
  },
  {
    id_usuario: 2,
    nombre: "Ana",
    apellido: "Martinez",
    correo: "docente@universidad.edu",
    contrasena: "docente123",
    rol: "docente",
    activo: true,
    fecha_creacion: "2026-05-20",
  },
  {
    id_usuario: 3,
    nombre: "Carlos",
    apellido: "Lopez",
    correo: "practicante@universidad.edu",
    contrasena: "practicante123",
    rol: "estudiante",
    activo: true,
    fecha_creacion: "2026-05-20",
  },
]

function readUsuarios() {
  const saved = localStorage.getItem(STORAGE_KEY)

  if (!saved) {
    saveUsuarios(usuariosIniciales)
    return usuariosIniciales
  }

  return JSON.parse(saved)
}

function saveUsuarios(usuarios) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios))
}

function normalizeCorreo(correo) {
  return correo.trim().toLowerCase()
}

function validateUsuario(data, usuarios, currentId) {
  const correo = normalizeCorreo(data.correo)
  const correoUsado = usuarios.some(
    (usuario) =>
      usuario.correo.toLowerCase() === correo &&
      usuario.id_usuario !== currentId
  )

  if (correoUsado) {
    throw new Error("Ya existe un usuario con ese correo.")
  }
}

export function getUsuarios() {
  return readUsuarios()
}

export function createUsuario(data) {
  const usuarios = readUsuarios()
  validateUsuario(data, usuarios)

  const nuevoUsuario = {
    id_usuario: Date.now(),
    nombre: data.nombre.trim(),
    apellido: data.apellido.trim(),
    correo: normalizeCorreo(data.correo),
    contrasena: data.contrasena,
    rol: data.rol,
    activo: data.activo,
    fecha_creacion: new Date().toISOString().slice(0, 10),
  }

  const updated = [nuevoUsuario, ...usuarios]
  saveUsuarios(updated)
  return nuevoUsuario
}

export function updateUsuario(id, data) {
  const usuarios = readUsuarios()
  const userId = Number(id)
  validateUsuario(data, usuarios, userId)

  const updated = usuarios.map((usuario) =>
    usuario.id_usuario === userId
      ? {
          ...usuario,
          nombre: data.nombre.trim(),
          apellido: data.apellido.trim(),
          correo: normalizeCorreo(data.correo),
          contrasena: data.contrasena,
          rol: data.rol,
          activo: data.activo,
        }
      : usuario
  )

  saveUsuarios(updated)
}

export function toggleUsuarioActivo(id) {
  const userId = Number(id)
  const updated = readUsuarios().map((usuario) =>
    usuario.id_usuario === userId
      ? { ...usuario, activo: !usuario.activo }
      : usuario
  )

  saveUsuarios(updated)
}

export function deleteUsuario(id) {
  const userId = Number(id)
  const updated = readUsuarios().filter(
    (usuario) => usuario.id_usuario !== userId
  )

  saveUsuarios(updated)
}
