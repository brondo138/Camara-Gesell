import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import {
  CalendarCheck, Plus, Search, Filter,
  CheckCircle2, XCircle, AlertCircle, Clock,
  ChevronRight, Camera, Users, Eye,
  X, Check
} from "lucide-react"
import { useAuth } from "../hooks/useAuth"

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_RESERVAS = [
  { id_reserva: 1, solicitante: "María López",   id_solicitante: 10, camara: "Sala A", id_camara: 1, fecha: "2026-05-21", hora_inicio: "08:00", hora_fin: "10:00", motivo: "Sesión de terapia individual con paciente externo.", estado: "pendiente", rol_solicitante: "docente" },
  { id_reserva: 2, solicitante: "Carlos Rivas",  id_solicitante: 11, camara: "Sala B", id_camara: 2, fecha: "2026-05-21", hora_inicio: "10:00", hora_fin: "12:00", motivo: "Práctica supervisada — evaluación psicológica.",    estado: "aprobada",  rol_solicitante: "estudiante" },
  { id_reserva: 3, solicitante: "Ana Martínez",  id_solicitante: 12, camara: "Sala A", id_camara: 1, fecha: "2026-05-22", hora_inicio: "14:00", hora_fin: "16:00", motivo: "Terapia familiar, caso #12.",                        estado: "aprobada",  rol_solicitante: "docente" },
  { id_reserva: 4, solicitante: "Pedro Salinas", id_solicitante: 13, camara: "Sala C", id_camara: 3, fecha: "2026-05-22", hora_inicio: "16:00", hora_fin: "17:00", motivo: "Observación de sesión grupal.",                     estado: "rechazada", rol_solicitante: "estudiante" },
  { id_reserva: 5, solicitante: "Laura Fuentes", id_solicitante: 14, camara: "Sala B", id_camara: 2, fecha: "2026-05-23", hora_inicio: "09:00", hora_fin: "11:00", motivo: "Evaluación de competencias clínicas.",               estado: "pendiente", rol_solicitante: "docente" },
  { id_reserva: 6, solicitante: "María López",   id_solicitante: 10, camara: "Sala D", id_camara: 4, fecha: "2026-05-24", hora_inicio: "08:00", hora_fin: "09:00", motivo: "Seguimiento de caso clínico.",                      estado: "aprobada",  rol_solicitante: "docente" },
]

// IDs mock por rol para filtrar "mis reservas"
const MOCK_USER_ID = { admin: 0, docente: 10, estudiante: 11 }

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ESTADO_CONFIG = {
  pendiente: { label: "Pendiente", icon: AlertCircle,  cls: "bg-amber-50 text-amber-700 border-amber-200"       },
  aprobada:  { label: "Aprobada",  icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rechazada: { label: "Rechazada", icon: XCircle,      cls: "bg-red-50 text-red-700 border-red-200"             },
}

function EstadoBadge({ estado }) {
  const cfg = ESTADO_CONFIG[estado] ?? ESTADO_CONFIG.pendiente
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${cfg.cls}`}>
      <Icon size={11} />{cfg.label}
    </span>
  )
}

function formatFecha(iso) {
  const [y, m, d] = iso.split("-")
  const meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"]
  return `${parseInt(d)} ${meses[parseInt(m)-1]}. ${y}`
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}
const itemVariants = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
}

// ─── Modal detalle / aprobar-rechazar (Admin) ─────────────────────────────────

function DetalleModal({ reserva, onClose, onAprobar, onRechazar, onCancelar, isAdmin }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
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
            { label: "Solicitante",  value: `${reserva.solicitante} (${reserva.rol_solicitante})` },
            { label: "Cámara",       value: reserva.camara },
            { label: "Fecha",        value: formatFecha(reserva.fecha) },
            { label: "Horario",      value: `${reserva.hora_inicio} – ${reserva.hora_fin}` },
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

        {/* Footer con acciones */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex flex-wrap gap-2 justify-end">
          {/* Admin puede aprobar/rechazar si está pendiente */}
          {isAdmin && reserva.estado === "pendiente" && (
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

          {/* Cancelar si está pendiente (dueño o admin) */}
          {reserva.estado === "pendiente" && (
            <button
              onClick={() => { onCancelar(reserva); onClose() }}
              className="flex items-center gap-1.5 h-9 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-colors"
            >
              <X size={14} /> Cancelar reserva
            </button>
          )}

          {reserva.estado !== "pendiente" && (
            <button onClick={onClose} className="h-9 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-colors">
              Cerrar
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Reservas() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.rol === "admin"

  const [reservas, setReservas] = useState(MOCK_RESERVAS)
  const [search, setSearch]     = useState("")
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [selected, setSelected] = useState(null)

  // Filtrar por rol
  const misReservas = isAdmin
    ? reservas
    : reservas.filter(r => r.id_solicitante === MOCK_USER_ID[user?.rol])

  // Aplicar búsqueda y filtro de estado
  const filtered = misReservas.filter(r => {
    const matchSearch =
      r.solicitante.toLowerCase().includes(search.toLowerCase()) ||
      r.camara.toLowerCase().includes(search.toLowerCase()) ||
      r.motivo.toLowerCase().includes(search.toLowerCase())
    const matchEstado = filtroEstado === "todos" || r.estado === filtroEstado
    return matchSearch && matchEstado
  })

  // Contadores para los filtros
  const counts = {
    todos:     misReservas.length,
    pendiente: misReservas.filter(r => r.estado === "pendiente").length,
    aprobada:  misReservas.filter(r => r.estado === "aprobada").length,
    rechazada: misReservas.filter(r => r.estado === "rechazada").length,
  }

  const handleAprobar  = (r) => setReservas(prev => prev.map(x => x.id_reserva === r.id_reserva ? { ...x, estado: "aprobada"  } : x))
  const handleRechazar = (r) => setReservas(prev => prev.map(x => x.id_reserva === r.id_reserva ? { ...x, estado: "rechazada" } : x))
  const handleCancelar = (r) => setReservas(prev => prev.filter(x => x.id_reserva !== r.id_reserva))

  const FILTROS = [
    { key: "todos",     label: "Todas"     },
    { key: "pendiente", label: "Pendientes" },
    { key: "aprobada",  label: "Aprobadas" },
    { key: "rechazada", label: "Rechazadas" },
  ]

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
            className="flex items-center gap-2 h-9 px-4 rounded-xl bg-blue-700 hover:bg-blue-800
              text-white text-sm font-semibold transition-colors shadow-sm shrink-0"
          >
            <Plus size={16} /> Nueva reserva
          </motion.button>
        </motion.div>

        {/* Filtros de estado */}
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
                {counts[f.key]}
              </span>
            </button>
          ))}

          {/* Buscador */}
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

          {filtered.length === 0 ? (
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
          ) : (
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
                          <div>
                            <p className="font-medium text-slate-800 text-sm">{r.solicitante}</p>
                            <p className="text-[11px] text-slate-400 capitalize">{r.rol_solicitante}</p>
                          </div>
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
                      <td className="px-4 py-3.5 text-slate-500 text-xs hidden sm:table-cell">{formatFecha(r.fecha)}</td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                          <Clock size={11} className="text-slate-300" />
                          {r.hora_inicio} – {r.hora_fin}
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
    </>
  )
}