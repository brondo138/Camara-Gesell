import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import {
  AlertCircle, CalendarClock, Camera, CheckCircle2, ChevronRight,
  Clock, Eye, Filter, Search, UserRound, Users, Video, XCircle, X
} from "lucide-react"
import { useAuth } from "../hooks/useAuth"

const MOCK_SESIONES = [
  {
    id_sesion: 1,
    id_reserva: 2,
    titulo: "Evaluacion psicologica inicial",
    paciente: "Paciente reservado",
    estudiante: "Carlos Rivas",
    id_estudiante: 11,
    docente: "Dra. Morales",
    id_docente: 21,
    camara: "Sala B",
    fecha: "2026-05-21",
    hora_inicio: "10:00",
    hora_fin: "12:00",
    estado: "finalizada",
    motivo: "Practica supervisada de entrevista clinica.",
    observaciones: 3,
    grabaciones: 1,
  },
  {
    id_sesion: 2,
    id_reserva: 3,
    titulo: "Terapia familiar - caso #12",
    paciente: "Familia asignada",
    estudiante: "Ana Martinez",
    id_estudiante: 12,
    docente: "Dr. Perez",
    id_docente: 22,
    camara: "Sala A",
    fecha: "2026-05-22",
    hora_inicio: "14:00",
    hora_fin: "16:00",
    estado: "en_curso",
    motivo: "Seguimiento de dinamica familiar con observacion docente.",
    observaciones: 5,
    grabaciones: 0,
  },
  {
    id_sesion: 3,
    id_reserva: 5,
    titulo: "Evaluacion de competencias clinicas",
    paciente: "Caso simulado",
    estudiante: "Laura Fuentes",
    id_estudiante: 14,
    docente: "Dra. Morales",
    id_docente: 21,
    camara: "Sala B",
    fecha: "2026-05-23",
    hora_inicio: "09:00",
    hora_fin: "11:00",
    estado: "programada",
    motivo: "Sesion pendiente de realizacion asociada a reserva aprobada.",
    observaciones: 0,
    grabaciones: 0,
  },
  {
    id_sesion: 4,
    id_reserva: 6,
    titulo: "Seguimiento de caso clinico",
    paciente: "Paciente reservado",
    estudiante: "Mariana Ortiz",
    id_estudiante: 15,
    docente: "Maria Lopez",
    id_docente: 10,
    camara: "Sala D",
    fecha: "2026-05-24",
    hora_inicio: "08:00",
    hora_fin: "09:00",
    estado: "programada",
    motivo: "Sesion breve para seguimiento de objetivos terapeuticos.",
    observaciones: 1,
    grabaciones: 0,
  },
  {
    id_sesion: 5,
    id_reserva: 7,
    titulo: "Entrevista clinica supervisada",
    paciente: "Paciente reservado",
    estudiante: "Pedro Salinas",
    id_estudiante: 13,
    docente: "Dr. Ruiz",
    id_docente: 23,
    camara: "Sala C",
    fecha: "2026-05-25",
    hora_inicio: "15:00",
    hora_fin: "17:00",
    estado: "cancelada",
    motivo: "Cancelada por conflicto de disponibilidad de sala.",
    observaciones: 0,
    grabaciones: 0,
  },
]

const MOCK_USER_ID = { admin: 0, docente: 21, estudiante: 11 }

const ESTADO_CONFIG = {
  programada: { label: "Programada", icon: CalendarClock, cls: "bg-blue-50 text-blue-700 border-blue-200" },
  en_curso: { label: "En curso", icon: Video, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  finalizada: { label: "Finalizada", icon: CheckCircle2, cls: "bg-slate-100 text-slate-700 border-slate-200" },
  cancelada: { label: "Cancelada", icon: XCircle, cls: "bg-red-50 text-red-700 border-red-200" },
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
}

function formatFecha(iso) {
  const [y, m, d] = iso.split("-")
  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
  return `${parseInt(d, 10)} ${meses[parseInt(m, 10) - 1]}. ${y}`
}

function EstadoBadge({ estado }) {
  const cfg = ESTADO_CONFIG[estado] ?? ESTADO_CONFIG.programada
  const Icon = cfg.icon

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${cfg.cls}`}>
      <Icon size={11} />
      {cfg.label}
    </span>
  )
}

function StatCard({ label, value, icon: Icon, tone }) {
  const tones = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    slate: "bg-slate-50 text-slate-700 border-slate-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
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

function SesionMobileCard({ sesion, onOpen, onCancel }) {
  const puedeCancelar = sesion.estado === "programada" || sesion.estado === "en_curso"

  return (
    <motion.div
      variants={itemVariants}
      className="w-full rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-200 hover:bg-blue-50/30 transition-all"
    >
      <button type="button" onClick={onOpen} className="w-full text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{sesion.titulo}</p>
            <p className="text-xs text-slate-400 mt-1">{formatFecha(sesion.fecha)} · {sesion.hora_inicio} - {sesion.hora_fin}</p>
          </div>
          <EstadoBadge estado={sesion.estado} />
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5 min-w-0"><Camera size={13} className="text-slate-300" />{sesion.camara}</span>
          <span className="flex items-center gap-1.5 min-w-0"><UserRound size={13} className="text-slate-300" />{sesion.docente}</span>
          <span className="flex items-center gap-1.5 min-w-0 col-span-2"><Users size={13} className="text-slate-300" />{sesion.estudiante}</span>
        </div>
      </button>

      {puedeCancelar && (
        <button
          type="button"
          onClick={onCancel}
          className="mt-4 w-full flex items-center justify-center gap-1.5 h-8 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition-colors"
        >
          <X size={13} /> Cancelar sesion
        </button>
      )}
    </motion.div>
  )
}

function SesionesCanceladasModal({ sesiones, onClose, onRestore }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.2 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl z-10 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <XCircle size={15} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Sesiones canceladas</h2>
              <p className="text-[11px] text-slate-400">Restaura una sesion si fue cancelada por error.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-5">
          {sesiones.length === 0 ? (
            <div className="py-12 text-center">
              <Video size={32} className="text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400">No hay sesiones canceladas.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sesiones.map(sesion => (
                <div key={sesion.id_sesion} className="rounded-xl border border-slate-200 bg-white p-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{sesion.titulo}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatFecha(sesion.fecha)} · {sesion.hora_inicio} - {sesion.hora_fin}
                    </p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1.5"><Camera size={12} className="text-slate-300" />{sesion.camara}</span>
                      <span className="inline-flex items-center gap-1.5"><UserRound size={12} className="text-slate-300" />{sesion.docente}</span>
                      <span className="inline-flex items-center gap-1.5"><Users size={12} className="text-slate-300" />{sesion.estudiante}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRestore(sesion)}
                    className="shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold transition-colors"
                  >
                    Restaurar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function Sesiones() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.rol === "admin"
  const isDocente = user?.rol === "docente"

  const [sesiones, setSesiones] = useState(MOCK_SESIONES)
  const [search, setSearch] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [showCanceladas, setShowCanceladas] = useState(false)

  const sesionesVisibles = useMemo(() => {
    if (isAdmin) return sesiones
    if (isDocente) return sesiones.filter(s => s.id_docente === MOCK_USER_ID.docente)
    return sesiones.filter(s => s.id_estudiante === MOCK_USER_ID.estudiante)
  }, [isAdmin, isDocente, sesiones])

  const filtered = sesionesVisibles.filter(s => {
    const term = search.toLowerCase()
    const matchSearch =
      s.titulo.toLowerCase().includes(term) ||
      s.estudiante.toLowerCase().includes(term) ||
      s.docente.toLowerCase().includes(term) ||
      s.camara.toLowerCase().includes(term) ||
      s.motivo.toLowerCase().includes(term)
    const matchEstado = filtroEstado === "todos" || s.estado === filtroEstado
    return matchSearch && matchEstado
  })

  const counts = {
    todos: sesionesVisibles.length,
    programada: sesionesVisibles.filter(s => s.estado === "programada").length,
    en_curso: sesionesVisibles.filter(s => s.estado === "en_curso").length,
    finalizada: sesionesVisibles.filter(s => s.estado === "finalizada").length,
    cancelada: sesionesVisibles.filter(s => s.estado === "cancelada").length,
  }

  const stats = [
    { label: "Sesiones", value: counts.todos, icon: Video, tone: "blue" },
    { label: "En curso", value: counts.en_curso, icon: AlertCircle, tone: "emerald" },
    { label: "Finalizadas", value: counts.finalizada, icon: CheckCircle2, tone: "slate" },
    { label: "Observaciones", value: sesionesVisibles.reduce((acc, s) => acc + s.observaciones, 0), icon: Eye, tone: "amber" },
  ]

  const filtros = [
    { key: "todos", label: "Todas" },
    { key: "programada", label: "Programadas" },
    { key: "en_curso", label: "En curso" },
    { key: "finalizada", label: "Finalizadas" },
    { key: "cancelada", label: "Canceladas" },
  ]

  const handleCancelar = (sesion) => {
    const ok = window.confirm(`¿Cancelar la sesion "${sesion.titulo}"? El registro quedara como historial.`)
    if (!ok) return
    setSesiones(prev => prev.map(s => s.id_sesion === sesion.id_sesion ? { ...s, estado: "cancelada" } : s))
  }

  const handleRestaurar = (sesion) => {
    setSesiones(prev => prev.map(s => s.id_sesion === sesion.id_sesion ? { ...s, estado: "programada" } : s))
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">
      <motion.div variants={itemVariants} className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800 leading-tight">Sesiones</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {isAdmin ? "Control de sesiones asociadas a reservas aprobadas." : "Consulta tus sesiones y el seguimiento de cada cita."}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowCanceladas(true)}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition-colors"
          >
            <XCircle size={14} />
            Sesiones canceladas
            <span className="px-1.5 py-0.5 rounded-full bg-white/70 text-[10px] font-bold">
              {counts.cancelada}
            </span>
          </button>
          <div className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-500">
            <Filter size={14} className="text-slate-400" />
            {isAdmin ? "Vista global" : isDocente ? "Mis sesiones docentes" : "Mis sesiones asignadas"}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => <StatCard key={stat.label} {...stat} />)}
      </div>

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
              {counts[f.key]}
            </span>
          </button>
        ))}

        <div className="relative w-full sm:w-64 sm:ml-auto">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar sesion..."
            className="h-8 pl-8 pr-3 w-full rounded-lg border border-slate-200 bg-white text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
          />
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white rounded-xl border border-slate-200 overflow-hidden hidden md:block">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Video size={15} className="text-blue-600" />
            Historial de sesiones
          </h2>
          <span className="text-[11px] text-slate-400">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-14 text-center">
            <Video size={32} className="text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No hay sesiones que coincidan con los filtros.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-[11px] font-medium text-slate-400 px-5 py-3">Sesion</th>
                  <th className="text-left text-[11px] font-medium text-slate-400 px-4 py-3">Participantes</th>
                  <th className="text-left text-[11px] font-medium text-slate-400 px-4 py-3">Sala</th>
                  <th className="text-left text-[11px] font-medium text-slate-400 px-4 py-3">Fecha</th>
                  <th className="text-left text-[11px] font-medium text-slate-400 px-4 py-3">Estado</th>
                  <th className="text-right text-[11px] font-medium text-slate-400 px-5 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <motion.tr
                    key={s.id_sesion}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.035 }}
                    onClick={() => navigate(`/sesiones/${s.id_sesion}`)}
                    className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors last:border-b-0 cursor-pointer"
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-800 text-sm">{s.titulo}</p>
                      <p className="text-[11px] text-slate-400">Reserva #{s.id_reserva} · {s.motivo}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-xs font-medium text-slate-700">{s.estudiante}</p>
                      <p className="text-[11px] text-slate-400">{s.docente}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                        <Camera size={12} className="text-slate-300" />
                        {s.camara}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-xs text-slate-600">{formatFecha(s.fecha)}</p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock size={10} />{s.hora_inicio} - {s.hora_fin}
                      </p>
                    </td>
                    <td className="px-4 py-3.5"><EstadoBadge estado={s.estado} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        {(s.estado === "programada" || s.estado === "en_curso") && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              handleCancelar(s)
                            }}
                            className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-semibold transition-all"
                          >
                            <X size={13} />
                            Cancelar
                          </button>
                        )}
                        <button className="inline-flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                        <ChevronRight size={16} />
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

      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="py-12 text-center bg-white border border-slate-200 rounded-xl">
            <Video size={30} className="text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No hay sesiones que mostrar.</p>
          </div>
        ) : (
          filtered.map(s => (
            <SesionMobileCard
              key={s.id_sesion}
              sesion={s}
              onOpen={() => navigate(`/sesiones/${s.id_sesion}`)}
              onCancel={() => handleCancelar(s)}
            />
          ))
        )}
      </div>
      <AnimatePresence>
        {showCanceladas && (
          <SesionesCanceladasModal
            sesiones={sesionesVisibles.filter(s => s.estado === "cancelada")}
            onClose={() => setShowCanceladas(false)}
            onRestore={handleRestaurar}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
