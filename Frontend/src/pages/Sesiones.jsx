import { useState, useEffect, useMemo } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import {
  AlertCircle, CalendarClock, Camera, CheckCircle2, ChevronRight,
  Clock, Eye, Filter, Search, UserRound, Users, Video, XCircle,
  Loader2, AlertTriangle, Trash2, CheckCheck, X
} from "lucide-react"
import { useAuth } from "../hooks/useAuth"
import { getSesiones, cambiarEstadoSesion, deleteSesion } from "../services/sesionesService"

// ─── CONFIG ESTADOS ───────────────────────────────────────────────────────────
const ESTADO_CONFIG = {
  Programada: { label: "Programada", icon: CalendarClock, cls: "bg-blue-50 text-blue-700 border-blue-200"     },
  Realizada:  { label: "Realizada",  icon: CheckCircle2,  cls: "bg-slate-100 text-slate-700 border-slate-200" },
  Cancelada:  { label: "Cancelada",  icon: XCircle,       cls: "bg-red-50 text-red-700 border-red-200"        },
}

// ─── ANIMACIONES ──────────────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}
const itemVariants = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function formatFecha(iso) {
  if (!iso) return "—"
  const [y, m, d] = iso.slice(0, 10).split("-")
  const meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"]
  return `${parseInt(d, 10)} ${meses[parseInt(m, 10) - 1]}. ${y}`
}

function formatHora(time) {
  if (!time) return "—"
  return time.slice(0, 5)
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ message, type }) {
  const styles = {
    success: "bg-emerald-600 text-white",
    error:   "bg-red-600 text-white",
    warning: "bg-amber-500 text-white",
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      exit={{    opacity: 0, y: 10, scale: 0.95 }}
      className={`px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium pointer-events-auto ${styles[type] ?? styles.success}`}
    >
      {message}
    </motion.div>
  )
}

// ─── MODAL DE CONFIRMACIÓN ────────────────────────────────────────────────────
function ConfirmModal({ open, title, description, confirmLabel, confirmCls, onConfirm, onCancel, loading }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1,    opacity: 1 }}
            exit={{    scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm p-6"
          >
            <h3 className="text-base font-semibold text-slate-800">{title}</h3>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{description}</p>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={onCancel}
                disabled={loading}
                className="h-9 px-4 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`h-9 px-4 rounded-lg text-sm text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2 ${confirmCls}`}
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── SUB-COMPONENTES ──────────────────────────────────────────────────────────
function EstadoBadge({ estado }) {
  const cfg = ESTADO_CONFIG[estado] ?? ESTADO_CONFIG.Programada
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${cfg.cls}`}>
      <Icon size={11} />{cfg.label}
    </span>
  )
}

function StatCard({ label, value, icon: Icon, tone }) {
  const tones = {
    blue:    "bg-blue-50 text-blue-700 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    slate:   "bg-slate-50 text-slate-700 border-slate-100",
    amber:   "bg-amber-50 text-amber-700 border-amber-100",
  }
  return (
    <motion.div variants={itemVariants} className={`rounded-xl border p-4 ${tones[tone]}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-2xl font-bold leading-none">{value}</p>
          <p className="text-xs font-medium mt-1 opacity-75">{label}</p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-white/70 flex items-center justify-center shrink-0">
          <Icon size={17} />
        </div>
      </div>
    </motion.div>
  )
}

function SesionMobileCard({ sesion, onOpen, onConcluir, onEliminar, isAdmin, isDocente }) {
  const puedesConcluir = (isAdmin || isDocente) && sesion.estado === "Programada"
  const puedosEliminar = isAdmin && (sesion.estado === "Realizada" || sesion.estado === "Cancelada")

  return (
    <motion.div variants={itemVariants} className="rounded-xl border border-slate-200 bg-white p-4">
      <button
        type="button"
        onClick={onOpen}
        className="w-full text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{sesion.titulo}</p>
            <p className="text-xs text-slate-400 mt-1">
              {formatFecha(sesion.fecha_realizacion)} · {formatHora(sesion.hora_inicio)} – {formatHora(sesion.hora_fin)}
            </p>
          </div>
          <EstadoBadge estado={sesion.estado} />
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5 min-w-0">
            <Camera size={13} className="text-slate-300" />{sesion.camara}
          </span>
          <span className="flex items-center gap-1.5 min-w-0 col-span-2">
            <UserRound size={13} className="text-slate-300" />
            {sesion.nombre_solicitante} {sesion.apellido_solicitante}
          </span>
        </div>
      </button>

      {/* Acciones mobile */}
      {(puedesConcluir || puedosEliminar) && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
          {puedesConcluir && (
            <button
              onClick={e => { e.stopPropagation(); onConcluir(sesion) }}
              className="flex items-center gap-1.5 h-7 px-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition-colors"
            >
              <CheckCheck size={12} /> Concluir
            </button>
          )}
          {puedosEliminar && (
            <button
              onClick={e => { e.stopPropagation(); onEliminar(sesion) }}
              className="flex items-center gap-1.5 h-7 px-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors"
            >
              <Trash2 size={12} /> Eliminar
            </button>
          )}
        </div>
      )}
    </motion.div>
  )
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function Sesiones() {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const isAdmin    = parseInt(user?.id_rol) === 1
  const isDocente  = parseInt(user?.id_rol) === 2

  const [sesiones, setSesiones]           = useState([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState("")
  const [search, setSearch]               = useState("")
  const [filtroEstado, setFiltroEstado]   = useState("todos")

  // ── Toasts ───────────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState([])
  function addToast(message, type = "success") {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }

  // ── Modal de confirmación ────────────────────────────────────────────────
  const [modal, setModal] = useState({ open: false, tipo: null, sesion: null })
  const [modalLoading, setModalLoading] = useState(false)

  function abrirConcluir(sesion) {
    setModal({ open: true, tipo: "concluir", sesion })
  }
  function abrirEliminar(sesion) {
    setModal({ open: true, tipo: "eliminar", sesion })
  }
  function cerrarModal() {
    if (modalLoading) return
    setModal({ open: false, tipo: null, sesion: null })
  }

  // ── Carga inicial ────────────────────────────────────────────────────────
  useEffect(() => {
    cargarSesiones()
  }, [])

  async function cargarSesiones() {
    setLoading(true)
    setError("")
    try {
      const data = await getSesiones(user?.id, user?.id_rol)
      setSesiones(data)
    } catch (err) {
      setError(err?.response?.data?.message ?? "Error al cargar las sesiones.")
    } finally {
      setLoading(false)
    }
  }

  // ── Acción: concluir sesión ───────────────────────────────────────────────
  async function handleConcluir() {
    setModalLoading(true)
    try {
      const actualizada = await cambiarEstadoSesion(modal.sesion.id_sesion, "Realizada")
      setSesiones(prev =>
        prev.map(s => s.id_sesion === modal.sesion.id_sesion ? { ...s, estado: "Realizada" } : s)
      )
      addToast("Sesión marcada como Realizada.")
      cerrarModal()
    } catch (err) {
      addToast(err?.response?.data?.message ?? "Error al concluir la sesión.", "error")
    } finally {
      setModalLoading(false)
    }
  }

  // ── Acción: eliminar sesión ──────────────────────────────────────────────
  async function handleEliminar() {
    setModalLoading(true)
    try {
      await deleteSesion(modal.sesion.id_sesion)
      setSesiones(prev => prev.filter(s => s.id_sesion !== modal.sesion.id_sesion))
      addToast("Sesión eliminada correctamente.")
      cerrarModal()
    } catch (err) {
      addToast(err?.response?.data?.message ?? "Error al eliminar la sesión.", "error")
    } finally {
      setModalLoading(false)
    }
  }

  // ── Filtrado ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return sesiones.filter(s => {
      const term = search.toLowerCase()
      const matchSearch =
        s.titulo.toLowerCase().includes(term) ||
        `${s.nombre_solicitante} ${s.apellido_solicitante}`.toLowerCase().includes(term) ||
        s.camara.toLowerCase().includes(term) ||
        (s.motivo ?? "").toLowerCase().includes(term)
      const matchEstado = filtroEstado === "todos" || s.estado === filtroEstado
      return matchSearch && matchEstado
    })
  }, [sesiones, search, filtroEstado])

  const counts = useMemo(() => ({
    todos:      sesiones.length,
    Programada: sesiones.filter(s => s.estado === "Programada").length,
    Realizada:  sesiones.filter(s => s.estado === "Realizada").length,
    Cancelada:  sesiones.filter(s => s.estado === "Cancelada").length,
  }), [sesiones])

  const stats = [
    { label: "Sesiones",    value: counts.todos,      icon: Video,        tone: "blue"    },
    { label: "Programadas", value: counts.Programada, icon: CalendarClock,tone: "emerald" },
    { label: "Realizadas",  value: counts.Realizada,  icon: CheckCircle2, tone: "slate"   },
    { label: "Canceladas",  value: counts.Cancelada,  icon: XCircle,      tone: "amber"   },
  ]

  const filtros = [
    { key: "todos",      label: "Todas"       },
    { key: "Programada", label: "Programadas" },
    { key: "Realizada",  label: "Realizadas"  },
    { key: "Cancelada",  label: "Canceladas"  },
  ]

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">

        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-800 leading-tight">Sesiones</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {isAdmin
                ? "Control de sesiones asociadas a reservas aprobadas."
                : "Consulta tus sesiones y el seguimiento de cada cita."}
            </p>
          </div>
          <div className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-500">
            <Filter size={14} className="text-slate-400" />
            {isAdmin ? "Vista global" : isDocente ? "Mis sesiones docentes" : "Mis sesiones asignadas"}
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(stat => <StatCard key={stat.label} {...stat} />)}
        </div>

        {/* Filtros */}
        <motion.div variants={itemVariants} className="flex items-center gap-2 flex-wrap">
          {filtros.map(f => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFiltroEstado(f.key)}
              className={`flex items-center gap-1.5 h-8 px-3 rounded-lg border text-xs font-medium transition-all ${
                filtroEstado === f.key
                  ? "bg-blue-700 border-blue-700 text-white"
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              {f.label}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                filtroEstado === f.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
              }`}>
                {counts[f.key] ?? 0}
              </span>
            </button>
          ))}
          <div className="relative w-full sm:w-64 sm:ml-auto">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar sesión..."
              className="h-8 pl-8 pr-3 w-full rounded-lg border border-slate-200 bg-white text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            />
          </div>
        </motion.div>

        {/* Tabla — desktop */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl border border-slate-200 overflow-hidden hidden md:block">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Video size={15} className="text-blue-600" />
              Historial de sesiones
            </h2>
            <span className="text-[11px] text-slate-400">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</span>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-7 h-7 animate-spin mb-2" />
              <p className="text-sm">Cargando sesiones…</p>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-sm text-slate-600">{error}</p>
              <button onClick={cargarSesiones} className="text-sm text-blue-600 hover:underline font-medium">
                Reintentar
              </button>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="py-14 text-center">
              <Video size={32} className="text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400">No hay sesiones que coincidan con los filtros.</p>
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left text-[11px] font-medium text-slate-400 px-5 py-3">Sesión</th>
                    <th className="text-left text-[11px] font-medium text-slate-400 px-4 py-3">Solicitante</th>
                    <th className="text-left text-[11px] font-medium text-slate-400 px-4 py-3">Sala</th>
                    <th className="text-left text-[11px] font-medium text-slate-400 px-4 py-3">Fecha</th>
                    <th className="text-left text-[11px] font-medium text-slate-400 px-4 py-3">Estado</th>
                    {/* La columna de acciones solo ocupa espacio si el usuario puede hacer algo */}
                    {(isAdmin || isDocente) && (
                      <th className="text-left text-[11px] font-medium text-slate-400 px-4 py-3">Acciones</th>
                    )}
                    <th className="text-right text-[11px] font-medium text-slate-400 px-5 py-3">Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => {
                    const puedesConcluir = (isAdmin || isDocente) && s.estado === "Programada"
                    const puedosEliminar = isAdmin && (s.estado === "Realizada" || s.estado === "Cancelada")

                    return (
                      <motion.tr
                        key={s.id_sesion}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.035 }}
                        className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors last:border-b-0"
                      >
                        {/* Clic en la fila excepto en acciones */}
                        <td
                          className="px-5 py-3.5 cursor-pointer"
                          onClick={() => navigate(`/sesiones/${s.id_sesion}`)}
                        >
                          <p className="font-medium text-slate-800 text-sm">{s.titulo}</p>
                          <p className="text-[11px] text-slate-400">
                            Reserva #{s.id_reserva} · {s.tipo_sesion}
                          </p>
                        </td>
                        <td
                          className="px-4 py-3.5 cursor-pointer"
                          onClick={() => navigate(`/sesiones/${s.id_sesion}`)}
                        >
                          <p className="text-xs font-medium text-slate-700">
                            {s.nombre_solicitante} {s.apellido_solicitante}
                          </p>
                          <p className="text-[11px] text-slate-400 capitalize">{s.rol_solicitante}</p>
                        </td>
                        <td
                          className="px-4 py-3.5 cursor-pointer"
                          onClick={() => navigate(`/sesiones/${s.id_sesion}`)}
                        >
                          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                            <Camera size={12} className="text-slate-300" />{s.camara}
                          </span>
                        </td>
                        <td
                          className="px-4 py-3.5 cursor-pointer"
                          onClick={() => navigate(`/sesiones/${s.id_sesion}`)}
                        >
                          <p className="text-xs text-slate-600">{formatFecha(s.fecha_realizacion)}</p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock size={10} />{formatHora(s.hora_inicio)} – {formatHora(s.hora_fin)}
                          </p>
                        </td>
                        <td
                          className="px-4 py-3.5 cursor-pointer"
                          onClick={() => navigate(`/sesiones/${s.id_sesion}`)}
                        >
                          <EstadoBadge estado={s.estado} />
                        </td>

                        {/* Acciones — NO navega al hacer clic */}
                        {(isAdmin || isDocente) && (
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5">
                              {puedesConcluir && (
                                <button
                                  onClick={() => abrirConcluir(s)}
                                  title="Marcar como Realizada"
                                  className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-medium hover:bg-emerald-100 transition-colors"
                                >
                                  <CheckCheck size={12} /> Concluir
                                </button>
                              )}
                              {puedosEliminar && (
                                <button
                                  onClick={() => abrirEliminar(s)}
                                  title="Eliminar sesión"
                                  className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-[11px] font-medium hover:bg-red-100 transition-colors"
                                >
                                  <Trash2 size={12} /> Eliminar
                                </button>
                              )}
                            </div>
                          </td>
                        )}

                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => navigate(`/sesiones/${s.id_sesion}`)}
                            className="inline-flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Cards — mobile */}
        <div className="md:hidden space-y-3">
          {loading && (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="py-12 text-center bg-white border border-slate-200 rounded-xl">
              <Video size={30} className="text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400">No hay sesiones que mostrar.</p>
            </div>
          )}
          {!loading && filtered.map(s => (
            <SesionMobileCard
              key={s.id_sesion}
              sesion={s}
              onOpen={() => navigate(`/sesiones/${s.id_sesion}`)}
              onConcluir={abrirConcluir}
              onEliminar={abrirEliminar}
              isAdmin={isAdmin}
              isDocente={isDocente}
            />
          ))}
        </div>

      </motion.div>

      {/* Modal Concluir */}
      <ConfirmModal
        open={modal.open && modal.tipo === "concluir"}
        title="¿Marcar sesión como Realizada?"
        description={`La sesión "${modal.sesion?.titulo}" pasará al estado Realizada. Una vez concluida podrá ser eliminada si es necesario.`}
        confirmLabel="Sí, concluir"
        confirmCls="bg-emerald-600 hover:bg-emerald-700"
        onConfirm={handleConcluir}
        onCancel={cerrarModal}
        loading={modalLoading}
      />

      {/* Modal Eliminar */}
      <ConfirmModal
        open={modal.open && modal.tipo === "eliminar"}
        title="¿Eliminar esta sesión?"
        description={`Se eliminará permanentemente "${modal.sesion?.titulo}". Esta acción no se puede deshacer.`}
        confirmLabel="Sí, eliminar"
        confirmCls="bg-red-600 hover:bg-red-700"
        onConfirm={handleEliminar}
        onCancel={cerrarModal}
        loading={modalLoading}
      />

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => <Toast key={t.id} message={t.message} type={t.type} />)}
        </AnimatePresence>
      </div>
    </>
  )
}