import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users, Plus, Search, Pencil, Trash2, Power,
  UserPlus, UserMinus, CheckCircle2, XCircle,
  AlertTriangle, Check, ChevronDown, Loader2, X,
  UserCog, Building2
} from "lucide-react"
import { useAuth } from "../hooks/useAuth"
import {
  getGrupos, createGrupo, updateGrupo,
  toggleEstadoGrupo, deleteGrupo,
  getMiembrosGrupo, asignarUsuarioAGrupo, quitarUsuarioDeGrupo
} from "../services/GruposService"

// ─── FORM VACÍO ───────────────────────────────────────────────────────────────
const FORM_EMPTY = {
  nombre: "",
  descripcion: "",
  id_docente_responsable: "",
  activo: true
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function Grupos() {
  const { user }   = useAuth()
  const isAdmin    = user?.rol === "admin"

  const [grupos, setGrupos]     = useState([])
  const [usuarios, setUsuarios] = useState([])  // todos los usuarios no-admin
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState("")

  const [busqueda, setBusqueda]         = useState("")
  const [filtroEstado, setFiltroEstado] = useState("")

  const [modalForm, setModalForm]           = useState(null)  // null | "nueva" | grupo obj
  const [modalEliminar, setModalEliminar]   = useState(null)  // null | grupo obj
  const [modalMiembros, setModalMiembros]   = useState(null)  // null | grupo obj
  const [modalQuitarMiembro, setModalQuitarMiembro] = useState(null) // null | miembro obj

  const [formData, setFormData]   = useState(FORM_EMPTY)
  const [formError, setFormError] = useState("")
  const [formLoading, setFormLoading] = useState(false)

  const [miembros, setMiembros]               = useState([])
  const [miembrosLoading, setMiembrosLoading] = useState(false)
  const [asignando, setAsignando]             = useState(false)
  const [selectedUsuario, setSelectedUsuario] = useState("")
  const [selectedRol, setSelectedRol]         = useState("Practicante")

  const [toasts, setToasts] = useState([])

  // ── Carga inicial ─────────────────────────────────────────────────────────
  useEffect(() => {
    cargarDatos()
  }, [user?.id, user?.id_rol])

  async function cargarDatos() {
    setLoading(true)
    setError("")
    try {
      // Cargamos grupos y usuarios en paralelo desde el inicio
      // para que el FormModal tenga los docentes disponibles de inmediato
      const [gruposData, usuariosData] = await Promise.all([
        getGrupos(user?.id, user?.id_rol),
        isAdmin
          ? fetch(`${import.meta.env.VITE_API_URL ?? "http://localhost:3000/api"}/usuarios`, {
              headers: { Authorization: `Bearer ${localStorage.getItem("gesell_token")}` }
            }).then(r => r.json()).then(r => r.data)
          : Promise.resolve([])
      ])
      setGrupos(gruposData)
      // Excluir administradores — no se asignan a grupos
      setUsuarios(usuariosData.filter(u => u.nombre_rol !== "Administrador"))
    } catch (err) {
      setError(err?.response?.data?.message ?? "Error al cargar los grupos.")
    } finally {
      setLoading(false)
    }
  }

  // ── Cargar miembros de un grupo ───────────────────────────────────────────
  async function cargarMiembros(grupo) {
    setMiembrosLoading(true)
    try {
      const data = await getMiembrosGrupo(grupo.id_grupo)
      setMiembros(data)
    } catch {
      addToast("Error al cargar miembros del grupo.", "error")
    } finally {
      setMiembrosLoading(false)
    }
  }

  // ── Toasts ────────────────────────────────────────────────────────────────
  function addToast(message, type = "success") {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }

  // ── Filtrado ──────────────────────────────────────────────────────────────
  const gruposFiltrados = useMemo(() => {
    return grupos.filter(g => {
      const matchBusqueda =
        g.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (g.descripcion ?? "").toLowerCase().includes(busqueda.toLowerCase()) ||
        (g.docente_responsable ?? "").toLowerCase().includes(busqueda.toLowerCase())
      const matchEstado = filtroEstado === "" ? true : String(g.activo) === filtroEstado
      return matchBusqueda && matchEstado
    })
  }, [grupos, busqueda, filtroEstado])

  const totalActivos   = grupos.filter(g => Boolean(g.activo)).length
  const totalInactivos = grupos.filter(g => !Boolean(g.activo)).length

  // ── Abrir modales ─────────────────────────────────────────────────────────
  function abrirNueva() {
    setFormData(FORM_EMPTY)
    setFormError("")
    setModalForm("nueva")
  }

  function abrirEditar(grupo) {
    setFormData({
      nombre:                 grupo.nombre,
      descripcion:            grupo.descripcion ?? "",
      id_docente_responsable: grupo.id_docente_responsable?.toString() ?? "",
      activo:                 Boolean(grupo.activo)
    })
    setFormError("")
    setModalForm(grupo)
  }

  async function abrirMiembros(grupo) {
    setModalMiembros(grupo)
    setSelectedUsuario("")
    setSelectedRol("Practicante")
    await cargarMiembros(grupo)
  }

  // ── Guardar grupo ─────────────────────────────────────────────────────────
  async function guardarGrupo() {
    if (!formData.nombre.trim()) {
      setFormError("El nombre del grupo es obligatorio.")
      return
    }
    if (!formData.id_docente_responsable) {
      setFormError("Debe seleccionar un docente responsable.")
      return
    }

    setFormLoading(true)
    setFormError("")
    try {
      const payload = {
        nombre:                 formData.nombre.trim(),
        descripcion:            formData.descripcion?.trim() || null,
        id_docente_responsable: parseInt(formData.id_docente_responsable),
        activo:                 formData.activo
      }

      if (modalForm === "nueva") {
        const nuevo = await createGrupo(payload)
        setGrupos(prev => [nuevo, ...prev])
        addToast("Grupo creado correctamente.")
      } else {
        const actualizado = await updateGrupo(modalForm.id_grupo, payload)
        setGrupos(prev => prev.map(g => g.id_grupo === actualizado.id_grupo ? actualizado : g))
        await cargarDatos()
        addToast("Grupo actualizado correctamente.")
      }
      setModalForm(null)
    } catch (err) {
      setFormError(err?.response?.data?.message ?? "Error al guardar el grupo.")
    } finally {
      setFormLoading(false)
    }
  }

  // ── Toggle estado — usa updateGrupo porque no hay PATCH específico ───────────
async function handleToggleEstado(grupo) {
  const nuevoEstado = !Boolean(grupo.activo)
  try {
    // Usar updateGrupo en lugar de toggleEstadoGrupo
    const actualizado = await updateGrupo(grupo.id_grupo, {
      nombre: grupo.nombre,
      descripcion: grupo.descripcion ?? null,
      id_docente_responsable: grupo.id_docente_responsable,
      activo: nuevoEstado
    })
    setGrupos(prev => prev.map(g => g.id_grupo === actualizado.id_grupo ? actualizado : g))
    addToast(
      nuevoEstado ? "Grupo activado." : "Grupo desactivado.",
      nuevoEstado ? "success" : "warning"
    )
  } catch (err) {
    addToast(err?.response?.data?.message ?? "Error al cambiar el estado.", "error")
  }
}
  // ── Eliminar grupo ────────────────────────────────────────────────────────
  async function handleEliminar() {
    try {
      await deleteGrupo(modalEliminar.id_grupo)
      setGrupos(prev => prev.filter(g => g.id_grupo !== modalEliminar.id_grupo))
      addToast("Grupo eliminado correctamente.")
      setModalEliminar(null)
    } catch (err) {
      addToast(err?.response?.data?.message ?? "No se puede eliminar el grupo.", "error")
      setModalEliminar(null)
    }
  }

  // ── Asignar miembro ───────────────────────────────────────────────────────
  async function handleAsignar() {
    if (!selectedUsuario) {
      addToast("Selecciona un usuario.", "warning")
      return
    }
    setAsignando(true)
    try {
      const usuarioAsignado = usuarios.find(u => Number(u.id_usuario) === Number(selectedUsuario))
      await asignarUsuarioAGrupo(modalMiembros.id_grupo, parseInt(selectedUsuario), selectedRol)
      addToast(selectedRol === "Docente" ? "Docente responsable actualizado." : "Usuario asignado correctamente.")
      await cargarMiembros(modalMiembros)
      if (selectedRol === "Docente") {
        setModalMiembros(prev => prev ? {
          ...prev,
          id_docente_responsable: Number(selectedUsuario),
          docente_responsable: usuarioAsignado ? `${usuarioAsignado.nombre} ${usuarioAsignado.apellido}` : prev.docente_responsable,
        } : prev)
        await cargarDatos()
      }
      setSelectedUsuario("")
    } catch (err) {
      addToast(err?.response?.data?.message ?? "Error al asignar usuario.", "error")
    } finally {
      setAsignando(false)
    }
  }

  // ── Quitar miembro — abre modal de confirmación, sin confirm() nativo ────
  async function handleConfirmarQuitarMiembro() {
    try {
      await quitarUsuarioDeGrupo(modalMiembros.id_grupo, modalQuitarMiembro.id_usuario)
      addToast("Usuario removido del grupo.", "warning")
      await cargarMiembros(modalMiembros)
      setModalQuitarMiembro(null)
    } catch (err) {
      addToast(err?.response?.data?.message ?? "Error al quitar usuario.", "error")
      setModalQuitarMiembro(null)
    }
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1e3a5f] flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-800">{isAdmin ? "Grupos" : "Mis grupos"}</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {isAdmin
                  ? `${totalActivos} activo${totalActivos !== 1 ? "s" : ""} · ${totalInactivos} inactivo${totalInactivos !== 1 ? "s" : ""}`
                  : "Consulta los estudiantes asignados a tus grupos de sesión"}
              </p>
            </div>
          </div>
          {isAdmin && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={abrirNueva}
              className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#16304f] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nuevo grupo
            </motion.button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, descripción o docente…"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition"
            />
          </div>
          <div className="relative">
            <select
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value)}
              className="appearance-none pl-4 pr-8 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition cursor-pointer"
            >
              <option value="">Todos</option>
              <option value="1">Activos</option>
              <option value="0">Inactivos</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-6 pb-12">

        {/* Cargando */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p className="text-sm">Cargando grupos…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-sm text-slate-600">{error}</p>
            <button onClick={cargarDatos} className="text-sm text-[#1e3a5f] hover:underline font-medium">
              Reintentar
            </button>
          </div>
        )}

        {/* Vacío */}
        {!loading && !error && gruposFiltrados.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Users className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">
              {grupos.length === 0 ? "No hay grupos registrados aún." : "Ningún grupo coincide con los filtros."}
            </p>
          </div>
        )}

        {/* Grid de cards */}
        {!loading && !error && gruposFiltrados.length > 0 && (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {gruposFiltrados.map(grupo => (
                <GrupoCard
                  key={grupo.id_grupo}
                  grupo={grupo}
                  onEdit={() => abrirEditar(grupo)}
                  onDelete={() => setModalEliminar(grupo)}
                  onToggle={() => handleToggleEstado(grupo)}
                  onManageMembers={() => abrirMiembros(grupo)}
                  canManage={isAdmin}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Modal formulario */}
      <AnimatePresence>
        {modalForm && (
          <FormModal
            isEdit={modalForm !== "nueva"}
            formData={formData}
            setFormData={setFormData}
            formError={formError}
            formLoading={formLoading}
            docentes={usuarios.filter(u => u.nombre_rol === "Docente")}
            onSave={guardarGrupo}
            onClose={() => setModalForm(null)}
          />
        )}
      </AnimatePresence>

      {/* Modal eliminar grupo */}
      <AnimatePresence>
        {modalEliminar && (
          <EliminarModal
            titulo="Eliminar grupo"
            descripcion={<>¿Estás seguro de eliminar el grupo <span className="font-medium text-slate-800">"{modalEliminar.nombre}"</span>?</>}
            advertencia="Si el grupo tiene miembros o sesiones asociadas, la eliminación puede ser rechazada."
            onConfirm={handleEliminar}
            onClose={() => setModalEliminar(null)}
          />
        )}
      </AnimatePresence>

      {/* Modal miembros */}
      <AnimatePresence>
        {modalMiembros && (
          <MiembrosModal
            grupo={modalMiembros}
            miembros={miembros}
            miembrosLoading={miembrosLoading}
            usuariosDisponibles={usuarios.filter(
              u => !miembros.some(m => m.id_usuario === u.id_usuario) || u.nombre_rol === "Docente"
            )}
            selectedUsuario={selectedUsuario}
            setSelectedUsuario={setSelectedUsuario}
            selectedRol={selectedRol}
            setSelectedRol={setSelectedRol}
            asignando={asignando}
            onAssign={handleAsignar}
            onRemove={miembro => setModalQuitarMiembro(miembro)}
            onClose={() => setModalMiembros(null)}
            canManage={isAdmin}
          />
        )}
      </AnimatePresence>

      {/* Modal confirmar quitar miembro — sin confirm() nativo */}
      <AnimatePresence>
        {modalQuitarMiembro && (
          <EliminarModal
            titulo="Quitar miembro"
            descripcion={<>¿Quitar a <span className="font-medium text-slate-800">{modalQuitarMiembro.nombre} {modalQuitarMiembro.apellido}</span> del grupo?</>}
            advertencia="El usuario perderá acceso a las sesiones y grabaciones de este grupo."
            onConfirm={handleConfirmarQuitarMiembro}
            onClose={() => setModalQuitarMiembro(null)}
          />
        )}
      </AnimatePresence>

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => <Toast key={t.id} message={t.message} type={t.type} />)}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── CARD ─────────────────────────────────────────────────────────────────────
function GrupoCard({ grupo, onEdit, onDelete, onToggle, onManageMembers, canManage }) {
  const activo = Boolean(grupo.activo)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-slate-300 transition-all"
    >
      <div className={`h-1.5 w-full ${activo ? "bg-emerald-400" : "bg-slate-300"}`} />

      <div className="p-5">
        {/* Nombre + badge */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-sm font-semibold text-slate-800 leading-snug">{grupo.nombre}</h3>
          <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full flex-shrink-0 ${
            activo
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-slate-100 text-slate-500 border border-slate-200"
          }`}>
            {activo
              ? <><CheckCircle2 className="w-3 h-3" />Activo</>
              : <><XCircle className="w-3 h-3" />Inactivo</>
            }
          </span>
        </div>

        {/* Docente responsable */}
        {grupo.docente_responsable && (
          <div className="flex items-center gap-1.5 mb-2">
            <UserCog className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="text-xs text-slate-500">{grupo.docente_responsable}</span>
          </div>
        )}

        {/* Descripción */}
        {grupo.descripcion ? (
          <div className="flex items-start gap-1.5 mb-4">
            <Building2 className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
            <span className="text-xs text-slate-500 line-clamp-2">{grupo.descripcion}</span>
          </div>
        ) : (
          <div className="mb-4" />
        )}

        {/* Acciones */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100 flex-wrap">
          {canManage && (
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#1e3a5f] border border-slate-200 hover:border-[#1e3a5f]/30 rounded-lg px-3 py-1.5 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" /> Editar
            </button>
          )}
          <button
            onClick={onManageMembers}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#1e3a5f] border border-slate-200 hover:border-[#1e3a5f]/30 rounded-lg px-3 py-1.5 transition-colors"
          >
            <Users className="w-3.5 h-3.5" /> {canManage ? "Miembros" : "Estudiantes"}
          </button>
          {canManage && (
            <>
              <button
                onClick={onToggle}
                className={`flex items-center gap-1.5 text-xs border rounded-lg px-3 py-1.5 transition-colors ${
                  activo
                    ? "text-amber-600 hover:text-amber-700 border-slate-200 hover:border-amber-200"
                    : "text-emerald-600 hover:text-emerald-700 border-slate-200 hover:border-emerald-200"
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                {activo ? "Desactivar" : "Activar"}
              </button>
              <button
                onClick={onDelete}
                className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 border border-slate-200 hover:border-red-200 rounded-lg px-3 py-1.5 transition-colors ml-auto"
              >
                <Trash2 className="w-3.5 h-3.5" /> Eliminar
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── MODAL FORMULARIO ─────────────────────────────────────────────────────────
function FormModal({ isEdit, formData, setFormData, formError, formLoading, docentes, onSave, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1e3a5f] flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-base font-semibold text-slate-800">
              {isEdit ? "Editar grupo" : "Nuevo grupo"}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Nombre <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Ej. Grupo de práctica 01"
              value={formData.nombre}
              onChange={e => setFormData(p => ({ ...p, nombre: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition"
            />
          </div>

          {/* Docente responsable */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Docente responsable <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <UserCog className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={formData.id_docente_responsable}
                onChange={e => setFormData(p => ({ ...p, id_docente_responsable: e.target.value }))}
                className="w-full appearance-none pl-9 pr-8 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition cursor-pointer"
              >
                <option value="">Seleccionar docente…</option>
                {docentes.map(d => (
                  <option key={d.id_usuario} value={d.id_usuario}>
                    {d.nombre} {d.apellido}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
            {docentes.length === 0 && (
              <p className="text-[11px] text-amber-600 mt-1.5 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> No hay docentes registrados en el sistema.
              </p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Descripción</label>
            <textarea
              rows={3}
              placeholder="Descripción opcional del grupo…"
              value={formData.descripcion}
              onChange={e => setFormData(p => ({ ...p, descripcion: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition resize-none"
            />
          </div>

          {/* Toggle estado */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-xs font-medium text-slate-700">Estado</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {formData.activo ? "El grupo estará activo" : "El grupo estará inactivo"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormData(p => ({ ...p, activo: !p.activo }))}
              className={`relative w-11 h-6 rounded-full transition-colors ${formData.activo ? "bg-[#1e3a5f]" : "bg-slate-200"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.activo ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>

          {/* Error */}
          <AnimatePresence>
            {formError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5"
              >
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />{formError}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            disabled={formLoading}
            className="px-4 py-2.5 text-sm text-slate-600 hover:text-slate-800 border border-slate-200 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onSave}
            disabled={formLoading}
            className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium bg-[#1e3a5f] hover:bg-[#16304f] text-white rounded-xl transition-colors disabled:opacity-60"
          >
            {formLoading
              ? <><Loader2 className="w-4 h-4 animate-spin" />Guardando…</>
              : <><Check className="w-4 h-4" />{isEdit ? "Guardar cambios" : "Crear grupo"}</>
            }
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── MODAL MIEMBROS ───────────────────────────────────────────────────────────
function MiembrosModal({
  grupo, miembros, miembrosLoading,
  usuariosDisponibles,
  selectedUsuario, setSelectedUsuario,
  selectedRol, setSelectedRol,
  asignando, onAssign, onRemove, onClose, canManage
}) {
  const [busquedaUsuario, setBusquedaUsuario] = useState("")

  const miembrosVisibles = canManage
    ? miembros
    : miembros.filter(m => ["Practicante", "Estudiante"].includes(m.rol_en_grupo) || m.rol_sistema === "Practicante")

  const usuariosFiltrados = useMemo(() => {
    const term = busquedaUsuario.trim().toLowerCase()

    return usuariosDisponibles.filter(usuario => {
      const matchRol = usuario.nombre_rol === selectedRol
      const matchResponsableActual = selectedRol === "Docente"
        ? Number(usuario.id_usuario) !== Number(grupo.id_docente_responsable)
        : true
      const texto = `${usuario.nombre} ${usuario.apellido} ${usuario.correo ?? ""}`.toLowerCase()
      return matchRol && matchResponsableActual && (!term || texto.includes(term))
    })
  }, [busquedaUsuario, grupo.id_docente_responsable, selectedRol, usuariosDisponibles])

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1e3a5f] flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">{canManage ? "Miembros del grupo" : "Estudiantes del grupo"}</h2>
              <p className="text-xs text-slate-500">{grupo.nombre}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[76vh] overflow-y-auto">
          {/* Miembros actuales */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Miembros actuales
            </h3>
            {miembrosLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : miembrosVisibles.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6 bg-slate-50 rounded-xl border border-slate-100">
                {canManage ? "No hay miembros en este grupo." : "No hay estudiantes asignados a este grupo."}
              </p>
            ) : (
              <div className="space-y-2">
                {miembrosVisibles.map(m => {
                  const esResponsable = m.id_usuario === grupo.id_docente_responsable
                  return (
                    <div
                      key={m.id_usuario}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-slate-800">
                            {m.nombre} {m.apellido}
                          </span>
                          {esResponsable && (
                            <span className="text-[10px] bg-[#1e3a5f]/10 text-[#1e3a5f] px-2 py-0.5 rounded-full font-medium">
                              Responsable
                            </span>
                          )}
                          <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                            {m.rol_en_grupo}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{m.correo}</p>
                      </div>
                      {canManage && !esResponsable && (
                        <button
                          onClick={() => onRemove(m)}
                          className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0 ml-2"
                          title="Quitar del grupo"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Asignar nuevo miembro */}
          {canManage && (
          <div className="lg:border-l lg:border-t-0 border-t border-slate-100 lg:pl-6 pt-6 lg:pt-0">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              {selectedRol === "Docente" ? "Cambiar docente responsable" : "Asignar practicante"}
            </h3>
            <div className="space-y-3">
              {/* Select rol en grupo */}
              <div className="relative">
                <select
                  value={selectedRol}
                  onChange={e => {
                    setSelectedRol(e.target.value)
                    setSelectedUsuario("")
                  }}
                  className="w-full appearance-none px-3.5 pr-8 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition cursor-pointer"
                >
                  <option value="Practicante">Practicante</option>
                  <option value="Docente">Docente</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>

              {/* Buscador usuario */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={busquedaUsuario}
                  onChange={e => setBusquedaUsuario(e.target.value)}
                  placeholder={`Buscar ${selectedRol.toLowerCase()} por nombre o correo…`}
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition"
                />
              </div>

              <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/70 p-2 space-y-1.5">
                {usuariosFiltrados.map(u => {
                  const selected = Number(selectedUsuario) === Number(u.id_usuario)

                  return (
                    <button
                      key={u.id_usuario}
                      type="button"
                      onClick={() => setSelectedUsuario(String(u.id_usuario))}
                      className={`w-full text-left rounded-lg px-3 py-2.5 transition-colors border ${
                        selected
                          ? "bg-[#1e3a5f] text-white border-[#1e3a5f]"
                          : "bg-white text-slate-700 border-slate-100 hover:border-[#1e3a5f]/30"
                      }`}
                    >
                      <p className="text-sm font-medium truncate">{u.nombre} {u.apellido}</p>
                      <p className={`text-xs truncate ${selected ? "text-white/70" : "text-slate-400"}`}>{u.correo}</p>
                    </button>
                  )
                })}
              </div>

              {selectedRol === "Docente" && (
                <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 leading-relaxed">
                  Al seleccionar un nuevo docente, el responsable anterior se quitará automáticamente de este grupo. Los practicantes se mantienen.
                </p>
              )}

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onAssign}
                disabled={asignando || !selectedUsuario}
                className="w-full flex items-center justify-center gap-2 bg-[#1e3a5f] hover:bg-[#16304f] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
              >
                {asignando
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Asignando…</>
                  : <><UserPlus className="w-4 h-4" />Asignar al grupo</>
                }
              </motion.button>

              {usuariosFiltrados.length === 0 && !miembrosLoading && (
                <p className="text-xs text-slate-400 text-center">
                  No hay {selectedRol.toLowerCase()}s disponibles con ese filtro.
                </p>
              )}
            </div>
          </div>
          )}
        </div>

        <div className="px-6 pb-5 flex justify-end border-t border-slate-100 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm text-slate-600 hover:text-slate-800 border border-slate-200 rounded-xl transition-colors"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── MODAL ELIMINAR / CONFIRMAR — reutilizable ────────────────────────────────
function EliminarModal({ titulo, descripcion, advertencia, onConfirm, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">{titulo}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Esta acción no se puede deshacer</p>
          </div>
        </div>

        <p className="text-sm text-slate-600 mb-3">{descripcion}</p>

        {advertencia && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-5 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />{advertencia}
          </p>
        )}

        <div className="flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm text-slate-600 hover:text-slate-800 border border-slate-200 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onConfirm}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Confirmar
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ message, type }) {
  const styles = {
    success: "bg-emerald-600 text-white",
    warning: "bg-amber-500 text-white",
    error:   "bg-red-500 text-white",
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${styles[type] ?? styles.success}`}
    >
      {type === "error"   && <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
      {type === "success" && <Check className="w-4 h-4 flex-shrink-0" />}
      {type === "warning" && <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
      {message}
    </motion.div>
  )
}
