import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Camera, Plus, Search, Edit2, Power, PowerOff,
  X, Save, AlertCircle, CheckCircle2, Eye,
  MapPin, Monitor, Wifi, Users
} from "lucide-react"
import { useAuth } from "../hooks/useAuth"

// ─── Mock data ────────────────────────────────────────────────────────────────
// Estructura lista para reemplazar con llamadas reales a /api/camaras

const MOCK_CAMARAS = [
  {
    id_camara: 1,
    nombre: "Sala A",
    descripcion: "Cámara principal con espejo unidireccional y sistema de audio HD.",
    ubicacion: "Edificio de Humanidades, 2do piso",
    capacidad: 8,
    equipo: ["Espejo unidireccional", "Audio HD", "Grabación en video"],
    activo: true,
  },
  {
    id_camara: 2,
    nombre: "Sala B",
    descripcion: "Sala equipada para sesiones de terapia grupal con sistema de observación.",
    ubicacion: "Edificio de Humanidades, 2do piso",
    capacidad: 12,
    equipo: ["Espejo unidireccional", "Micrófonos direccionales", "Grabación en video"],
    activo: true,
  },
  {
    id_camara: 3,
    nombre: "Sala C",
    descripcion: "Sala de observación compacta, ideal para sesiones individuales.",
    ubicacion: "Edificio de Humanidades, 1er piso",
    capacidad: 4,
    equipo: ["Espejo unidireccional", "Audio básico"],
    activo: false,
  },
  {
    id_camara: 4,
    nombre: "Sala D",
    descripcion: "Sala multimedia con proyector integrado y control remoto de cámaras.",
    ubicacion: "Edificio Central, 3er piso",
    capacidad: 10,
    equipo: ["Proyector", "Control remoto", "Grabación en video", "Audio HD"],
    activo: true,
  },
]

// ─── Animaciones ──────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
}

const modalVariants = {
  hidden:  { opacity: 0, scale: 0.96, y: 8 },
  visible: { opacity: 1, scale: 1,    y: 0, transition: { duration: 0.22, ease: "easeOut" } },
  exit:    { opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.15 } },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function EstadoBadge({ activo }) {
  return activo ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
      <CheckCircle2 size={11} /> Disponible
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border bg-slate-100 text-slate-500 border-slate-200">
      <PowerOff size={11} /> Inactiva
    </span>
  )
}

// ─── Modal Crear / Editar (solo Admin) ────────────────────────────────────────

const EMPTY_FORM = { nombre: "", descripcion: "", ubicacion: "", capacidad: "" }

function CamaraModal({ camara, onClose, onSave }) {
  const isEdit = !!camara
  const [form, setForm] = useState(
    isEdit
      ? { nombre: camara.nombre, descripcion: camara.descripcion, ubicacion: camara.ubicacion, capacidad: camara.capacidad }
      : EMPTY_FORM
  )
  const [errors, setErrors] = useState({})

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: "" }))
  }

  const validate = () => {
    const e = {}
    if (!form.nombre.trim())      e.nombre      = "El nombre es obligatorio."
    if (!form.ubicacion.trim())   e.ubicacion   = "La ubicación es obligatoria."
    if (!form.capacidad || form.capacidad < 1) e.capacidad = "Ingresa una capacidad válida."
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    onSave({ ...camara, ...form, capacidad: parseInt(form.capacidad, 10) })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        variants={modalVariants}
        initial="hidden" animate="visible" exit="exit"
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Camera size={16} className="text-blue-600" />
            </div>
            <h2 className="text-sm font-semibold text-slate-800">
              {isEdit ? "Editar cámara" : "Nueva cámara"}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Nombre <span className="text-red-400">*</span></label>
            <input
              value={form.nombre}
              onChange={e => set("nombre", e.target.value)}
              placeholder="Ej: Sala A"
              className={`w-full h-10 px-3 rounded-xl border text-sm text-slate-800 placeholder:text-slate-400
                bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all
                ${errors.nombre ? "border-red-300 bg-red-50" : "border-slate-200"}`}
            />
            {errors.nombre && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11}/>{errors.nombre}</p>}
          </div>

          {/* Ubicación */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Ubicación <span className="text-red-400">*</span></label>
            <input
              value={form.ubicacion}
              onChange={e => set("ubicacion", e.target.value)}
              placeholder="Ej: Edificio de Humanidades, 2do piso"
              className={`w-full h-10 px-3 rounded-xl border text-sm text-slate-800 placeholder:text-slate-400
                bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all
                ${errors.ubicacion ? "border-red-300 bg-red-50" : "border-slate-200"}`}
            />
            {errors.ubicacion && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11}/>{errors.ubicacion}</p>}
          </div>

          {/* Capacidad */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Capacidad (personas) <span className="text-red-400">*</span></label>
            <input
              type="number"
              min={1}
              value={form.capacidad}
              onChange={e => set("capacidad", e.target.value)}
              placeholder="Ej: 8"
              className={`w-full h-10 px-3 rounded-xl border text-sm text-slate-800 placeholder:text-slate-400
                bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all
                ${errors.capacidad ? "border-red-300 bg-red-50" : "border-slate-200"}`}
            />
            {errors.capacidad && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11}/>{errors.capacidad}</p>}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Descripción <span className="text-slate-300">(opcional)</span></label>
            <textarea
              value={form.descripcion}
              onChange={e => set("descripcion", e.target.value)}
              placeholder="Describe el equipo y características de la sala..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400
                bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/60">
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-100 transition-colors font-medium"
          >
            Cancelar
          </button>
          <motion.button
            onClick={handleSave}
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            className="h-9 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Save size={15} />
            {isEdit ? "Guardar cambios" : "Crear cámara"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Vista Admin — tabla con acciones ─────────────────────────────────────────

function AdminView({ camaras, onEdit, onToggle, onNueva }) {
  const [search, setSearch] = useState("")

  const filtered = camaras.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    c.ubicacion.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">

      {/* Toolbar */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o ubicación..."
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700
              placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
          />
        </div>

        <motion.button
          onClick={onNueva}
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 h-9 px-4 rounded-xl bg-blue-700 hover:bg-blue-800
            text-white text-sm font-semibold transition-colors shadow-sm shrink-0"
        >
          <Plus size={16} /> Nueva cámara
        </motion.button>
      </motion.div>

      {/* Tabla */}
      <motion.div variants={itemVariants} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Camera size={15} className="text-blue-600" />
            Cámaras Gesell
          </h2>
          <span className="text-[11px] text-slate-400">{filtered.length} registros</span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Camera size={32} className="text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No se encontraron cámaras.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-[11px] font-medium text-slate-400 px-5 py-3">Nombre</th>
                  <th className="text-left text-[11px] font-medium text-slate-400 px-4 py-3 hidden md:table-cell">Ubicación</th>
                  <th className="text-left text-[11px] font-medium text-slate-400 px-4 py-3 hidden lg:table-cell">Capacidad</th>
                  <th className="text-left text-[11px] font-medium text-slate-400 px-4 py-3">Estado</th>
                  <th className="text-right text-[11px] font-medium text-slate-400 px-5 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <motion.tr
                    key={c.id_camara}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors last:border-b-0"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                          ${c.activo ? "bg-blue-50" : "bg-slate-100"}`}>
                          <Camera size={15} className={c.activo ? "text-blue-600" : "text-slate-400"} />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 text-sm">{c.nombre}</p>
                          <p className="text-[11px] text-slate-400 md:hidden">{c.ubicacion}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-slate-300 shrink-0" />
                        {c.ubicacion}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                        <Users size={12} className="text-slate-300" />
                        {c.capacidad} personas
                      </div>
                    </td>
                    <td className="px-4 py-3.5"><EstadoBadge activo={c.activo} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEdit(c)}
                          className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                          title="Editar"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => onToggle(c)}
                          className={`p-2 rounded-lg transition-all
                            ${c.activo
                              ? "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                              : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                            }`}
                          title={c.activo ? "Desactivar" : "Activar"}
                        >
                          {c.activo ? <PowerOff size={15} /> : <Power size={15} />}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

// ─── Vista Docente/Estudiante — cards de disponibilidad ───────────────────────

function PublicView({ camaras }) {
  const [search, setSearch] = useState("")
  const [soloDisponibles, setSoloDisponibles] = useState(false)

  const filtered = camaras.filter(c => {
    const matchSearch =
      c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      c.ubicacion.toLowerCase().includes(search.toLowerCase())
    return matchSearch && (!soloDisponibles || c.activo)
  })

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">

      {/* Toolbar */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar sala..."
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700
              placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
          />
        </div>

        <button
          onClick={() => setSoloDisponibles(v => !v)}
          className={`flex items-center gap-2 h-9 px-4 rounded-xl border text-sm font-medium transition-all shrink-0
            ${soloDisponibles
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
            }`}
        >
          <CheckCircle2 size={15} />
          Solo disponibles
        </button>
      </motion.div>

      {/* Contador */}
      <motion.p variants={itemVariants} className="text-xs text-slate-400">
        {camaras.filter(c => c.activo).length} de {camaras.length} salas disponibles
      </motion.p>

      {/* Cards */}
      {filtered.length === 0 ? (
        <motion.div variants={itemVariants} className="py-16 text-center">
          <Camera size={36} className="text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No se encontraron cámaras.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(c => (
            <motion.div
              key={c.id_camara}
              variants={itemVariants}
              className={`bg-white rounded-xl border overflow-hidden transition-all
                ${c.activo ? "border-slate-200 hover:border-blue-200 hover:shadow-md hover:shadow-blue-500/5" : "border-slate-100 opacity-60"}`}
            >
              {/* Card header */}
              <div className={`px-4 py-3 flex items-center justify-between border-b
                ${c.activo ? "border-slate-100 bg-slate-50/40" : "border-slate-100 bg-slate-50"}`}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                    ${c.activo ? "bg-blue-100" : "bg-slate-100"}`}>
                    <Camera size={15} className={c.activo ? "text-blue-600" : "text-slate-400"} />
                  </div>
                  <span className="font-semibold text-slate-800 text-sm">{c.nombre}</span>
                </div>
                <EstadoBadge activo={c.activo} />
              </div>

              {/* Card body */}
              <div className="px-4 py-3.5 space-y-3">
                {c.descripcion && (
                  <p className="text-xs text-slate-500 leading-relaxed">{c.descripcion}</p>
                )}

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin size={12} className="text-slate-300 shrink-0" />
                    {c.ubicacion}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Users size={12} className="text-slate-300 shrink-0" />
                    Capacidad: {c.capacidad} personas
                  </div>
                </div>

                {/* Equipamiento */}
                {c.equipo?.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {c.equipo.map((eq, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[10px] font-medium">
                        <Monitor size={9} />
                        {eq}
                      </span>
                    ))}
                  </div>
                )}

                {/* CTA solo si está disponible */}
                {c.activo && (
                  <button className="w-full mt-1 h-8 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100
                    text-blue-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors">
                    <Eye size={13} /> Ver disponibilidad
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Camaras() {
  const { user } = useAuth()
  const isAdmin = user?.rol === "admin"

  const [camaras, setCamaras] = useState(MOCK_CAMARAS)
  const [modal, setModal] = useState(null) // null | { mode: "nueva" | "editar", camara?: {} }

  // ── Handlers (conectar a api.js cuando el backend esté listo) ──

  const handleSave = (data) => {
    if (modal.mode === "editar") {
      // PUT /api/camaras/:id
      setCamaras(prev => prev.map(c => c.id_camara === data.id_camara ? { ...c, ...data } : c))
    } else {
      // POST /api/camaras
      const nueva = { ...data, id_camara: Date.now(), activo: true, equipo: [] }
      setCamaras(prev => [...prev, nueva])
    }
    setModal(null)
  }

  const handleToggle = (camara) => {
    // PUT /api/camaras/:id/estado
    setCamaras(prev =>
      prev.map(c => c.id_camara === camara.id_camara ? { ...c, activo: !c.activo } : c)
    )
  }

  return (
    <>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-800 leading-tight">Cámaras Gesell</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          {isAdmin
            ? "Administra las salas de observación — crea, edita y controla su disponibilidad."
            : "Consulta las salas disponibles para reservar."}
        </p>
      </div>

      {isAdmin ? (
        <AdminView
          camaras={camaras}
          onEdit={c => setModal({ mode: "editar", camara: c })}
          onToggle={handleToggle}
          onNueva={() => setModal({ mode: "nueva" })}
        />
      ) : (
        <PublicView camaras={camaras} />
      )}

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <CamaraModal
            camara={modal.mode === "editar" ? modal.camara : null}
            onClose={() => setModal(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </>
  )
}