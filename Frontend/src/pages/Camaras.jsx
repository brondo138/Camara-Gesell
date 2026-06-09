import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import {
  Camera, Plus, Search, Pencil, Trash2, Power,
  MapPin, FileText, CheckCircle2, XCircle,
  AlertTriangle, Check, ChevronDown, Loader2, X,
} from "lucide-react"
import { useAuth } from "../hooks/useAuth"
import {
  getCamaras,
  createCamara,
  updateCamara,
  toggleEstadoCamara,
  deleteCamara,
} from "../services/CamarasService"

// ─── FORM vacío ───────────────────────────────────────────────────────────────
const FORM_EMPTY = { nombre: "", ubicacion: "", descripcion: "", activa: true }

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function Camaras() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.rol === "admin"

  const [camaras, setCamaras]           = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState("")

  const [busqueda, setBusqueda]         = useState("")
  const [filtroEstado, setFiltroEstado] = useState("") // "" | "1" | "0"

  const [modalForm, setModalForm]       = useState(null)  // null | "nueva" | camara obj
  const [modalEliminar, setModalEliminar] = useState(null) // null | camara obj

  const [formData, setFormData]         = useState(FORM_EMPTY)
  const [formError, setFormError]       = useState("")
  const [formLoading, setFormLoading]   = useState(false)

  const [toasts, setToasts]             = useState([])

  // ── Verificar permisos ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAdmin) {
      navigate("/dashboard")
    }
  }, [isAdmin, navigate])

  // ── Carga inicial ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (isAdmin) {
      cargarCamaras()
    }
  }, [isAdmin])

  async function cargarCamaras() {
    setLoading(true)
    setError("")
    try {
      const data = await getCamaras(user?.id, user?.id_rol)
      setCamaras(data)
    } catch (err) {
      setError(err?.response?.data?.message ?? "Error al cargar las cámaras.")
    } finally {
      setLoading(false)
    }
  }

  // ── Toasts ─────────────────────────────────────────────────────────────────
  function addToast(message, type = "success") {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500)
  }

  // ── Filtrado ───────────────────────────────────────────────────────────────
  const camarasFiltradas = useMemo(() => {
    return camaras.filter((c) => {
      const matchBusqueda =
        c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (c.ubicacion ?? "").toLowerCase().includes(busqueda.toLowerCase())
      const matchEstado =
        filtroEstado === "" ? true : String(c.activa) === filtroEstado
      return matchBusqueda && matchEstado
    })
  }, [camaras, busqueda, filtroEstado])

  // ── Abrir modales ──────────────────────────────────────────────────────────
  function abrirNueva() {
    setFormData(FORM_EMPTY)
    setFormError("")
    setModalForm("nueva")
  }

  function abrirEditar(camara) {
    setFormData({
      nombre:      camara.nombre,
      ubicacion:   camara.ubicacion ?? "",
      descripcion: camara.descripcion ?? "",
      activa:      Boolean(camara.activa),
    })
    setFormError("")
    setModalForm(camara)
  }

  // ── Guardar (crear o editar) ───────────────────────────────────────────────
  async function guardarCamara() {
    if (!formData.nombre.trim()) {
      setFormError("El nombre de la cámara es obligatorio.")
      return
    }
    setFormLoading(true)
    setFormError("")
    try {
      if (modalForm === "nueva") {
        const nueva = await createCamara(formData)
        setCamaras((prev) => [nueva, ...prev])
        addToast("Cámara creada correctamente.")
      } else {
        const actualizada = await updateCamara(modalForm.id_camara, formData)
        setCamaras((prev) =>
          prev.map((c) => (c.id_camara === actualizada.id_camara ? actualizada : c))
        )
        addToast("Cámara actualizada correctamente.")
      }
      setModalForm(null)
    } catch (err) {
      setFormError(err?.response?.data?.message ?? "Error al guardar la cámara.")
    } finally {
      setFormLoading(false)
    }
  }

  // ── Toggle estado ──────────────────────────────────────────────────────────
  async function handleToggleEstado(camara) {
    const nuevoEstado = !Boolean(camara.activa)
    try {
      const actualizada = await toggleEstadoCamara(camara.id_camara, nuevoEstado)
      setCamaras((prev) =>
        prev.map((c) => (c.id_camara === actualizada.id_camara ? actualizada : c))
      )
      addToast(
        nuevoEstado ? "Cámara activada." : "Cámara desactivada.",
        nuevoEstado ? "success" : "warning"
      )
    } catch (err) {
      addToast(err?.response?.data?.message ?? "Error al cambiar el estado.", "error")
    }
  }

  // ── Eliminar ───────────────────────────────────────────────────────────────
  async function handleEliminar() {
    try {
      await deleteCamara(modalEliminar.id_camara)
      setCamaras((prev) => prev.filter((c) => c.id_camara !== modalEliminar.id_camara))
      addToast("Cámara eliminada correctamente.")
      setModalEliminar(null)
    } catch (err) {
      const msg =
        err?.response?.data?.message ??
        "No se puede eliminar: la cámara tiene reservas asociadas."
      addToast(msg, "error")
      setModalEliminar(null)
    }
  }

  // ── Contadores para el header ──────────────────────────────────────────────
  const totalActivas   = camaras.filter((c) => Boolean(c.activa)).length
  const totalInactivas = camaras.filter((c) => !Boolean(c.activa)).length

  // Si no es admin, no renderizar nada (la redirección ya está en useEffect)
  if (!isAdmin) return null

  // ─── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── HEADER ── */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1e3a5f] flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-800">Cámaras Gesell</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {totalActivas} activa{totalActivas !== 1 ? "s" : ""} · {totalInactivas} inactiva{totalInactivas !== 1 ? "s" : ""}
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
              Nueva cámara
            </motion.button>
          )}
        </div>
      </div>

      {/* ── FILTROS ── */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o ubicación…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition"
            />
          </div>
          <div className="relative">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="appearance-none pl-4 pr-8 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition cursor-pointer"
            >
              <option value="">Todas</option>
              <option value="1">Activas</option>
              <option value="0">Inactivas</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ── CONTENIDO ── */}
      <div className="max-w-7xl mx-auto px-6 pb-12">

        {/* Estado: cargando */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p className="text-sm">Cargando cámaras…</p>
          </div>
        )}

        {/* Estado: error de red */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-sm text-slate-600">{error}</p>
            <button
              onClick={cargarCamaras}
              className="text-sm text-[#1e3a5f] hover:underline font-medium"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Estado: sin resultados */}
        {!loading && !error && camarasFiltradas.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Camera className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">
              {camaras.length === 0
                ? "No hay cámaras registradas aún."
                : "Ninguna cámara coincide con los filtros."}
            </p>
          </div>
        )}

        {/* Grid de cards */}
        {!loading && !error && camarasFiltradas.length > 0 && (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {camarasFiltradas.map((camara) => (
                <CamaraCard
                  key={camara.id_camara}
                  camara={camara}
                  isAdmin={isAdmin}
                  onEdit={() => abrirEditar(camara)}
                  onDelete={() => setModalEliminar(camara)}
                  onToggle={() => handleToggleEstado(camara)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* ── MODAL FORMULARIO ── */}
      <AnimatePresence>
        {modalForm && (
          <FormModal
            isEdit={modalForm !== "nueva"}
            formData={formData}
            setFormData={setFormData}
            formError={formError}
            formLoading={formLoading}
            onSave={guardarCamara}
            onClose={() => setModalForm(null)}
          />
        )}
      </AnimatePresence>

      {/* ── MODAL ELIMINAR ── */}
      <AnimatePresence>
        {modalEliminar && (
          <EliminarModal
            camara={modalEliminar}
            onConfirm={handleEliminar}
            onClose={() => setModalEliminar(null)}
          />
        )}
      </AnimatePresence>

      {/* ── TOASTS ── */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <Toast key={t.id} message={t.message} type={t.type} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── CARD ─────────────────────────────────────────────────────────────────────
function CamaraCard({ camara, isAdmin, onEdit, onDelete, onToggle }) {
  const activa = Boolean(camara.activa)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-slate-300 transition-all"
    >
      {/* Franja de estado */}
      <div className={`h-1.5 w-full ${activa ? "bg-emerald-400" : "bg-slate-300"}`} />

      <div className="p-5">
        {/* Nombre + badge estado */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-sm font-semibold text-slate-800 leading-snug">
            {camara.nombre}
          </h3>
          <span
            className={`flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full flex-shrink-0 ${
              activa
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-slate-100 text-slate-500 border border-slate-200"
            }`}
          >
            {activa
              ? <><CheckCircle2 className="w-3 h-3" />Activa</>
              : <><XCircle className="w-3 h-3" />Inactiva</>
            }
          </span>
        </div>

        {/* Ubicación */}
        {camara.ubicacion ? (
          <div className="flex items-start gap-1.5 mb-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
            <span className="text-xs text-slate-500 line-clamp-1">{camara.ubicacion}</span>
          </div>
        ) : null}

        {/* Descripción */}
        {camara.descripcion ? (
          <div className="flex items-start gap-1.5 mb-4">
            <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
            <span className="text-xs text-slate-500 line-clamp-2">{camara.descripcion}</span>
          </div>
        ) : (
          <div className="mb-4" />
        )}

        {/* Acciones - solo visible para admin */}
        {isAdmin && (
          <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#1e3a5f] border border-slate-200 hover:border-[#1e3a5f]/30 rounded-lg px-3 py-1.5 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Editar
            </button>
            <button
              onClick={onToggle}
              className={`flex items-center gap-1.5 text-xs border rounded-lg px-3 py-1.5 transition-colors ${
                activa
                  ? "text-amber-600 hover:text-amber-700 border-slate-200 hover:border-amber-200"
                  : "text-emerald-600 hover:text-emerald-700 border-slate-200 hover:border-emerald-200"
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              {activa ? "Desactivar" : "Activar"}
            </button>
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 border border-slate-200 hover:border-red-200 rounded-lg px-3 py-1.5 transition-colors ml-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Eliminar
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── MODAL FORMULARIO ─────────────────────────────────────────────────────────
function FormModal({ isEdit, formData, setFormData, formError, formLoading, onSave, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1e3a5f] flex items-center justify-center">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-base font-semibold text-slate-800">
              {isEdit ? "Editar cámara" : "Nueva cámara"}
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
              placeholder="Ej. Cámara Gesell 1"
              value={formData.nombre}
              onChange={(e) => setFormData((p) => ({ ...p, nombre: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition"
            />
          </div>

          {/* Ubicación */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Ubicación</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Ej. Edificio de Psicología, aula 204"
                value={formData.ubicacion}
                onChange={(e) => setFormData((p) => ({ ...p, ubicacion: e.target.value }))}
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition"
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Descripción</label>
            <textarea
              rows={3}
              placeholder="Descripción opcional de la cámara…"
              value={formData.descripcion}
              onChange={(e) => setFormData((p) => ({ ...p, descripcion: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition resize-none"
            />
          </div>

          {/* Toggle activa */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-xs font-medium text-slate-700">Estado inicial</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {formData.activa ? "La cámara estará activa" : "La cámara estará inactiva"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, activa: !p.activa }))}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                formData.activa ? "bg-[#1e3a5f]" : "bg-slate-200"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  formData.activa ? "translate-x-5" : "translate-x-0"
                }`}
              />
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
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                {formError}
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
              : <><Check className="w-4 h-4" />{isEdit ? "Guardar cambios" : "Crear cámara"}</>
            }
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── MODAL ELIMINAR ───────────────────────────────────────────────────────────
function EliminarModal({ camara, onConfirm, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Eliminar cámara</h3>
            <p className="text-xs text-slate-500 mt-0.5">Esta acción no se puede deshacer</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 mb-2">
          ¿Estás seguro de que deseas eliminar{" "}
          <span className="font-medium text-slate-800">"{camara.nombre}"</span>?
        </p>
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-6 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          Si tiene reservas asociadas, la eliminación será rechazada.
        </p>
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
            <Trash2 className="w-4 h-4" />
            Eliminar
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
      {type === "warning" && <Power className="w-4 h-4 flex-shrink-0" />}
      {message}
    </motion.div>
  )
}
