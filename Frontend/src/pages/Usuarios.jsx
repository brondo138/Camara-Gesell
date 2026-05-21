import { useMemo, useState } from "react"
import {
  CheckCircle2,
  Edit3,
  Plus,
  Search,
  Trash2,
  UserCheck,
  UserX,
  X,
} from "lucide-react"
import {
  ROLES,
  createUsuario,
  deleteUsuario,
  getUsuarios,
  toggleUsuarioActivo,
  updateUsuario,
} from "../services/usuariosService"

const emptyForm = {
  nombre: "",
  apellido: "",
  correo: "",
  contrasena: "",
  rol: "docente",
  activo: true,
}

function getRoleLabel(rol) {
  return ROLES.find((item) => item.value === rol)?.label ?? rol
}

function UsuarioForm({ form, editingId, error, onChange, onCancel, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {editingId ? "Editar usuario" : "Nuevo usuario"}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Datos basados en la tabla usuarios de la base de datos.
          </p>
        </div>

        {editingId && (
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            title="Cancelar edicion"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-600">
          Nombre
          <input
            required
            value={form.nombre}
            onChange={(e) => onChange("nombre", e.target.value)}
            className="h-10 rounded-lg border border-slate-200 px-3 text-slate-800 font-normal focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            placeholder="Ej. Maria"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-600">
          Apellido
          <input
            required
            value={form.apellido}
            onChange={(e) => onChange("apellido", e.target.value)}
            className="h-10 rounded-lg border border-slate-200 px-3 text-slate-800 font-normal focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            placeholder="Ej. Gomez"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-600">
          Correo
          <input
            required
            type="email"
            value={form.correo}
            onChange={(e) => onChange("correo", e.target.value)}
            className="h-10 rounded-lg border border-slate-200 px-3 text-slate-800 font-normal focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            placeholder="usuario@universidad.edu"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-600">
          Contrasena
          <input
            required
            type="password"
            value={form.contrasena}
            onChange={(e) => onChange("contrasena", e.target.value)}
            className="h-10 rounded-lg border border-slate-200 px-3 text-slate-800 font-normal focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            placeholder="Minimo 6 caracteres"
            minLength={6}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-600">
          Rol
          <select
            value={form.rol}
            onChange={(e) => onChange("rol", e.target.value)}
            className="h-10 rounded-lg border border-slate-200 px-3 text-slate-800 font-normal bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          >
            {ROLES.map((rol) => (
              <option key={rol.value} value={rol.value}>
                {rol.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-3 text-sm font-medium text-slate-600 pt-7">
          <input
            type="checkbox"
            checked={form.activo}
            onChange={(e) => onChange("activo", e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          Usuario activo
        </label>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-2 mt-5">
        <button
          type="submit"
          className="h-10 px-4 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          {editingId ? <CheckCircle2 size={17} /> : <Plus size={17} />}
          {editingId ? "Guardar cambios" : "Crear usuario"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={onCancel}
            className="h-10 px-4 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-semibold transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState(() => getUsuarios())
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState("")
  const [error, setError] = useState("")

  const filteredUsuarios = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return usuarios

    return usuarios.filter((usuario) =>
      `${usuario.nombre} ${usuario.apellido} ${usuario.correo} ${getRoleLabel(usuario.rol)}`
        .toLowerCase()
        .includes(query)
    )
  }, [search, usuarios])

  const totalActivos = usuarios.filter((usuario) => usuario.activo).length

  const refreshUsuarios = () => {
    setUsuarios(getUsuarios())
  }

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setError("")
  }

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
    setError("")
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    try {
      if (editingId) {
        updateUsuario(editingId, form)
      } else {
        createUsuario(form)
      }

      refreshUsuarios()
      resetForm()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEdit = (usuario) => {
    setEditingId(usuario.id_usuario)
    setForm({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      contrasena: usuario.contrasena,
      rol: usuario.rol,
      activo: usuario.activo,
    })
    setError("")
  }

  const handleToggleActivo = (id) => {
    toggleUsuarioActivo(id)
    refreshUsuarios()
  }

  const handleDelete = (id) => {
    const confirmDelete = window.confirm("Seguro que deseas eliminar este usuario?")

    if (!confirmDelete) return

    deleteUsuario(id)
    refreshUsuarios()

    if (editingId === id) resetForm()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Usuarios</h1>
          <p className="text-slate-500 mt-2">
            CRUD de administracion para usuarios, roles y estado de acceso.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:min-w-72">
          <div className="bg-white border border-slate-200 rounded-lg px-4 py-3">
            <p className="text-xs text-slate-500">Total</p>
            <p className="text-xl font-bold text-slate-900">{usuarios.length}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg px-4 py-3">
            <p className="text-xs text-slate-500">Activos</p>
            <p className="text-xl font-bold text-emerald-600">{totalActivos}</p>
          </div>
        </div>
      </div>

      <UsuarioForm
        form={form}
        editingId={editingId}
        error={error}
        onChange={handleChange}
        onCancel={resetForm}
        onSubmit={handleSubmit}
      />

      <section className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-5 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Listado</h2>
            <p className="text-sm text-slate-500 mt-1">
              {filteredUsuarios.length} usuario(s) encontrados.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 rounded-lg border border-slate-200 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              placeholder="Buscar por nombre, correo o rol"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="text-left font-semibold px-5 py-3">Usuario</th>
                <th className="text-left font-semibold px-5 py-3">Correo</th>
                <th className="text-left font-semibold px-5 py-3">Rol</th>
                <th className="text-left font-semibold px-5 py-3">Estado</th>
                <th className="text-left font-semibold px-5 py-3">Creacion</th>
                <th className="text-right font-semibold px-5 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsuarios.map((usuario) => (
                <tr key={usuario.id_usuario} className="hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-navy-700 text-white flex items-center justify-center text-xs font-semibold">
                        {usuario.nombre[0]}
                        {usuario.apellido[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">
                          {usuario.nombre} {usuario.apellido}
                        </p>
                        <p className="text-xs text-slate-400">ID {usuario.id_usuario}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{usuario.correo}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                      {getRoleLabel(usuario.rol)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        usuario.activo
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {usuario.activo ? <UserCheck size={13} /> : <UserX size={13} />}
                      {usuario.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500">{usuario.fecha_creacion}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleEdit(usuario)}
                        className="p-2 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar usuario"
                      >
                        <Edit3 size={17} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleActivo(usuario.id_usuario)}
                        className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        title={usuario.activo ? "Desactivar usuario" : "Activar usuario"}
                      >
                        {usuario.activo ? <UserX size={17} /> : <UserCheck size={17} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(usuario.id_usuario)}
                        className="p-2 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar usuario"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
