import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import {
  CalendarCheck, Plus, Search,
  CheckCircle2, XCircle, AlertCircle, Clock,
  Camera, Eye, X, Check, Loader2, AlertTriangle
} from "lucide-react"
import { useAuth } from "../hooks/useAuth"
import { getReservas, cambiarEstadoReserva,  } from "../services/reservasService"

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const ESTADO_CONFIG = {
  Pendiente: { label: "Pendiente", icon: AlertCircle,  cls: "bg-amber-50 text-amber-700 border-amber-200"       },
  Aprobada:  { label: "Aprobada",  icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  Rechazada: { label: "Rechazada", icon: XCircle,      cls: "bg-red-50 text-red-700 border-red-200"             },
  Cancelada: { label: "Cancelada", icon: XCircle,      cls: "bg-slate-100 text-slate-500 border-slate-200"      },
  Finalizada:{ label: "Finalizada",icon: CheckCircle2, cls: "bg-blue-50 text-blue-700 border-blue-200"          },
}

function EstadoBadge({ estado }) {
  const cfg = ESTADO_CONFIG[estado] ?? ESTADO_CONFIG.Pendiente
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${cfg.cls}`}>
      <Icon size={11} />{cfg.label}
    </span>
  )
}

function formatFecha(iso) {
  if (!iso) return "—"
  const [y, m, d] = iso.slice(0, 10).split("-")
  const meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"]
  return `${parseInt(d)} ${meses[parseInt(m) - 1]}. ${y}`
}

function formatHora(time) {
  if (!time) return "—"
  // MySQL devuelve TIME como "HH:MM:SS", mostramos solo HH:MM
  return time.slice(0, 5)
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}
const itemVariants = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
}

// ─── MODAL DETALLE ────────────────────────────────────────────────────────────

function DetalleModal({ reserva, isAdmin, onClose, onAprobar, onRechazar, onCancelar }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1,    y: 0 }}
        exit={{    opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.2 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <CalendarCheck size={15} className="text-blue-600" />
            </div>
            <h2 className="text-sm font-semibold text-slate-800">Detalle de reserva</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Estado actual</span>
            <EstadoBadge estado={reserva.estado} />
          </div>
          {[
            { label: "Solicitante", value: `${reserva.nombre_solicitante} ${reserva.apellido_solicitante} (${reserva.rol_solicitante})` },
            { label: "Cámara",      value: reserva.camara },
            { label: "Fecha",       value: formatFecha(reserva.fecha) },
            { label: "Horario",     value: `${formatHora(reserva.hora_inicio)} – ${formatHora(reserva.hora_fin)}` },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-start gap-4">
              <span className="text-xs text-slate-400 shrink-0">{label}</span>
              <span className="text-xs text-slate-700 font-medium text-right">{value}</span>
            </div>
          ))}
          <div className="pt-1">
            <span className="text-xs text-slate-400 block mb-1.5">Motivo</span>
            <p className="text-xs text-slate-700 bg-slate-50 rounded-lg px-3 py-2.5 border border-slate-100 leading-relaxed">
              {reserva.motivo}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex flex-wrap gap-2 justify-end">
          {isAdmin && reserva.estado === "Pendiente" && (
            <>
              <button
                onClick={() => { onRechazar(reserva); onClose() }}
                className="flex items-center gap-1.5 h-9 px-4 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition-colors"
              >
                <XCircle size={14} /> Rechazar
              </button>
              <button
                onClick={() => { onAprobar(reserva); onClose() }}
                className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
              >
                <Check size={14} /> Aprobar
              </button>
            </>
          )}
          {reserva.estado === "Pendiente" && (
            <button
              onClick={() => { onCancelar(reserva); onClose() }}
              className="flex items-center gap-1.5 h-9 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-colors"
            >
              <X size={14} /> Cancelar reserva
            </button>
          )}
          {reserva.estado !== "Pendiente" && (
            <button onClick={onClose} className="h-9 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-colors">
              Cerrar
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

export default function Reservas() {
  const { user }    = useAuth()
  const navigate    = useNavigate()
  const isAdmin     = user?.rol === "admin"

  const [reservas, setReservas]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState("")
  const [search, setSearch]           = useState("")
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [selected, setSelected]       = useState(null)
  const [toasts, setToasts]           = useState([])

  // ── Carga inicial ────────────────────────────────────────────────────────
  useEffect(() => {
    cargarReservas()
  }, [])

  async function cargarReservas() {
    setLoading(true)
    setError("")
    try {
      const data = await getReservas(user?.id, user?.id_rol)
      setReservas(data)
    } catch (err) {
      setError(err?.response?.data?.message ?? "Error al cargar las reservas.")
    } finally {
      setLoading(false)
    }
  }

  // ── Toasts ───────────────────────────────────────────────────────────────
  function addToast(message, type = "success") {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }

  // ── Acciones ─────────────────────────────────────────────────────────────
  async function handleAprobar(reserva) {
    try {
      const actualizada = await cambiarEstadoReserva(reserva.id_reserva, "Aprobada")
      setReservas(prev => prev.map(r => r.id_reserva === actualizada.id_reserva ? actualizada : r))
      addToast("Reserva aprobada correctamente.")
    } catch (err) {
      addToast(err?.response?.data?.message ?? "Error al aprobar la reserva.", "error")
    }
  }

  async function handleRechazar(reserva) {
    try {
      const actualizada = await cambiarEstadoReserva(reserva.id_reserva, "Rechazada")
      setReservas(prev => prev.map(r => r.id_reserva === actualizada.id_reserva ? actualizada : r))
      addToast("Reserva rechazada.", "warning")
    } catch (err) {
      addToast(err?.response?.data?.message ?? "Error al rechazar la reserva.", "error")
    }
  }

  async function handleCancelar(reserva) {
    try {
      const actualizada = await cambiarEstadoReserva(reserva.id_reserva, "Cancelada")
      setReservas(prev => prev.map(r => r.id_reserva === actualizada.id_reserva ? actualizada : r))
      addToast("Reserva cancelada.", "warning")
    } catch (err) {
      addToast(err?.response?.data?.message ?? "Error al cancelar la reserva.", "error")
    }
  }

  // ── Filtrado ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return reservas.filter(r => {
      const solicitante = `${r.nombre_solicitante} ${r.apellido_solicitante}`.toLowerCase()
      const matchSearch =
        solicitante.includes(search.toLowerCase()) ||
        r.camara.toLowerCase().includes(search.toLowerCase()) ||
        (r.motivo ?? "").toLowerCase().includes(search.toLowerCase())
      const matchEstado = filtroEstado === "todos" || r.estado === filtroEstado
      return matchSearch && matchEstado
    })
  }, [reservas, search, filtroEstado])

  const counts = useMemo(() => ({
    todos:     reservas.length,
    Pendiente: reservas.filter(r => r.estado === "Pendiente").length,
    Aprobada:  reservas.filter(r => r.estado === "Aprobada").length,
    Rechazada: reservas.filter(r => r.estado === "Rechazada").length,
  }), [reservas])

  const FILTROS = [
    { key: "todos",     label: "Todas"      },
    { key: "Pendiente", label: "Pendientes" },
    { key: "Aprobada",  label: "Aprobadas"  },
    { key: "Rechazada", label: "Rechazadas" },
  ]

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-5"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-800 leading-tight">Reservas</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {isAdmin ? "Gestiona y aprueba las solicitudes de reserva." : "Consulta y crea tus reservas de sala."}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/reservas/nueva")}
            className="flex items-center gap-2 h-9 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold transition-colors shadow-sm shrink-0"
          >
            <Plus size={16} /> Nueva reserva
          </motion.button>
        </motion.div>

        {/* Filtros */}
        <motion.div variants={itemVariants} className="flex items-center gap-2 flex-wrap">
          {FILTROS.map(f => (
            <button
              key={f.key}
              onClick={() => setFiltroEstado(f.key)}
              className={`flex items-center gap-1.5 h-8 px-3 rounded-lg border text-xs font-medium transition-all
                ${filtroEstado === f.key
                  ? "bg-blue-700 border-blue-700 text-white"
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}
            >
              {f.label}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold
                ${filtroEstado === f.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                {counts[f.key] ?? 0}
              </span>
            </button>
          ))}
          <div className="relative ml-auto">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="h-8 pl-8 pr-3 w-52 rounded-lg border border-slate-200 bg-white text-xs text-slate-700
                placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            />
          </div>
        </motion.div>

        {/* Tabla */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <CalendarCheck size={15} className="text-blue-600" />
              {isAdmin ? "Todas las reservas" : "Mis reservas"}
            </h2>
            <span className="text-[11px] text-slate-400">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</span>
          </div>

          {/* Estado: cargando */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-7 h-7 animate-spin mb-2" />
              <p className="text-sm">Cargando reservas…</p>
            </div>
          )}

          {/* Estado: error */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-sm text-slate-600">{error}</p>
              <button onClick={cargarReservas} className="text-sm text-blue-600 hover:underline font-medium">
                Reintentar
              </button>
            </div>
          )}

          {/* Estado: vacío */}
          {!loading && !error && filtered.length === 0 && (
            <div className="py-14 text-center">
              <CalendarCheck size={32} className="text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400">No hay reservas que mostrar.</p>
              <button
                onClick={() => navigate("/reservas/nueva")}
                className="mt-3 text-xs text-blue-600 hover:underline font-medium"
              >
                Crear una nueva reserva
              </button>
            </div>
          )}

          {/* Tabla de datos */}
          {!loading && !error && filtered.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {isAdmin && <th className="text-left text-[11px] font-medium text-slate-400 px-5 py-3">Solicitante</th>}
                    <th className="text-left text-[11px] font-medium text-slate-400 px-5 py-3">Cámara</th>
                    <th className="text-left text-[11px] font-medium text-slate-400 px-4 py-3 hidden sm:table-cell">Fecha</th>
                    <th className="text-left text-[11px] font-medium text-slate-400 px-4 py-3 hidden md:table-cell">Horario</th>
                    <th className="text-left text-[11px] font-medium text-slate-400 px-4 py-3">Estado</th>
                    <th className="text-right text-[11px] font-medium text-slate-400 px-5 py-3">Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <motion.tr
                      key={r.id_reserva}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors last:border-b-0 cursor-pointer"
                      onClick={() => setSelected(r)}
                    >
                      {isAdmin && (
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-slate-800 text-sm">
                            {r.nombre_solicitante} {r.apellido_solicitante}
                          </p>
                          <p className="text-[11px] text-slate-400 capitalize">{r.rol_solicitante}</p>
                        </td>
                      )}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                            <Camera size={13} className="text-blue-600" />
                          </div>
                          <span className="font-medium text-slate-700 text-sm">{r.camara}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 text-xs hidden sm:table-cell">
                        {formatFecha(r.fecha)}
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                          <Clock size={11} className="text-slate-300" />
                          {formatHora(r.hora_inicio)} – {formatHora(r.hora_fin)}
                        </div>
                      </td>
                      <td className="px-4 py-3.5"><EstadoBadge estado={r.estado} /></td>
                      <td className="px-5 py-3.5 text-right">
                        <button className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                          <Eye size={15} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Modal detalle */}
      <AnimatePresence>
        {selected && (
          <DetalleModal
            reserva={selected}
            isAdmin={isAdmin}
            onClose={() => setSelected(null)}
            onAprobar={handleAprobar}
            onRechazar={handleRechazar}
            onCancelar={handleCancelar}
          />
        )}
      </AnimatePresence>

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <Toast key={t.id} message={t.message} type={t.type} />
          ))}
        </AnimatePresence>
      </div>
    </>
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
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      exit={{    opacity: 0, y: 8,  scale: 0.95 }}
      className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${styles[type] ?? styles.success}`}
    >
      {type === "error"   && <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
      {type === "success" && <Check className="w-4 h-4 flex-shrink-0" />}
      {type === "warning" && <XCircle className="w-4 h-4 flex-shrink-0" />}
      {message}
    </motion.div>
  )
}