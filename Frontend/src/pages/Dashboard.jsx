import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  CalendarCheck, Video, Users, Clock,
  TrendingUp, CheckCircle2, XCircle, AlertCircle,
  Eye, ChevronRight, Activity
} from "lucide-react"
import { useAuth } from "../hooks/useAuth"

// ─── Animaciones ──────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

const itemVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
}

// ─── Mock data ────────────────────────────────────────────────────────────────
// Estructura idéntica a lo que devuelve el backend.
// Cuando conectes la API real, reemplaza estas funciones por llamadas a api.js
// y envuelve en useEffect. El resto del componente no cambia.

const MOCK_ADMIN = {
  kpis: [
    { label: "Reservas este mes",   value: 24, delta: "+4 vs mes anterior", icon: CalendarCheck, color: "blue"   },
    { label: "Sesiones activas",    value:  3, delta: "En curso ahora",      icon: Video,         color: "emerald" },
    { label: "Usuarios registrados",value: 18, delta: "3 nuevos esta semana",icon: Users,         color: "indigo"  },
    { label: "Horas de práctica",   value: 87, delta: "+12 h vs mes ant.",   icon: Clock,         color: "amber"   },
  ],
  reservasRecientes: [
    { id: 1, solicitante: "María López",    camara: "Sala A",  fecha: "2026-05-21", hora: "08:00", estado: "pendiente" },
    { id: 2, solicitante: "Carlos Rivas",   camara: "Sala B",  fecha: "2026-05-21", hora: "10:00", estado: "aprobada"  },
    { id: 3, solicitante: "Ana Martínez",   camara: "Sala A",  fecha: "2026-05-22", hora: "14:00", estado: "aprobada"  },
    { id: 4, solicitante: "Pedro Salinas",  camara: "Sala C",  fecha: "2026-05-22", hora: "16:00", estado: "rechazada" },
    { id: 5, solicitante: "Laura Fuentes",  camara: "Sala B",  fecha: "2026-05-23", hora: "09:00", estado: "pendiente" },
  ],
  sesionesActivas: [
    { id: 1, titulo: "Terapia familiar — caso #12", camara: "Sala A", docente: "Dr. Pérez",    inicio: "08:00", participantes: 3 },
    { id: 2, titulo: "Evaluación psicológica",       camara: "Sala B", docente: "Dra. Morales", inicio: "10:00", participantes: 2 },
    { id: 3, titulo: "Sesión de práctica supervisada",camara: "Sala C",docente: "Dr. Ruiz",     inicio: "11:30", participantes: 5 },
  ],
}

const MOCK_DOCENTE = {
  kpis: [
    { label: "Mis reservas activas", value:  4, delta: "Este mes",         icon: CalendarCheck, color: "blue"    },
    { label: "Sesiones realizadas",  value: 11, delta: "Últimos 30 días",  icon: Video,         color: "emerald" },
    { label: "Estudiantes asignados",value:  6, delta: "En mis sesiones",  icon: Users,         color: "indigo"  },
    { label: "Horas registradas",    value: 28, delta: "Este mes",         icon: Clock,         color: "amber"   },
  ],
  reservasRecientes: [
    { id: 2, solicitante: "Tú",          camara: "Sala B", fecha: "2026-05-21", hora: "10:00", estado: "aprobada"  },
    { id: 3, solicitante: "Tú",          camara: "Sala A", fecha: "2026-05-22", hora: "14:00", estado: "aprobada"  },
    { id: 5, solicitante: "Tú",          camara: "Sala B", fecha: "2026-05-23", hora: "09:00", estado: "pendiente" },
  ],
  sesionesActivas: [
    { id: 2, titulo: "Evaluación psicológica", camara: "Sala B", docente: "Tú", inicio: "10:00", participantes: 2 },
  ],
}

const MOCK_ESTUDIANTE = {
  kpis: [
    { label: "Mis reservas",       value:  2, delta: "Este mes",        icon: CalendarCheck, color: "blue"    },
    { label: "Sesiones asignadas", value:  5, delta: "Últimos 30 días", icon: Video,         color: "emerald" },
    { label: "Observaciones",      value:  8, delta: "Registradas",     icon: Eye,           color: "indigo"  },
    { label: "Horas de práctica",  value: 14, delta: "Acumuladas",      icon: Clock,         color: "amber"   },
  ],
  reservasRecientes: [
    { id: 1, solicitante: "Tú", camara: "Sala A", fecha: "2026-05-21", hora: "08:00", estado: "pendiente" },
    { id: 5, solicitante: "Tú", camara: "Sala B", fecha: "2026-05-23", hora: "09:00", estado: "aprobada"  },
  ],
  sesionesActivas: [
    { id: 3, titulo: "Sesión de práctica supervisada", camara: "Sala C", docente: "Dr. Ruiz", inicio: "11:30", participantes: 5 },
  ],
}

function getMockData(rol) {
  if (rol === "admin")      return MOCK_ADMIN
  if (rol === "docente")    return MOCK_DOCENTE
  return MOCK_ESTUDIANTE
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const COLOR_MAP = {
  blue:    { bg: "bg-blue-50",    icon: "bg-blue-100 text-blue-600",    text: "text-blue-700"    },
  emerald: { bg: "bg-emerald-50", icon: "bg-emerald-100 text-emerald-600", text: "text-emerald-700" },
  indigo:  { bg: "bg-indigo-50",  icon: "bg-indigo-100 text-indigo-600",  text: "text-indigo-700"  },
  amber:   { bg: "bg-amber-50",   icon: "bg-amber-100 text-amber-600",    text: "text-amber-700"   },
}

const ESTADO_CONFIG = {
  pendiente: { label: "Pendiente", icon: AlertCircle, cls: "bg-amber-50 text-amber-700 border-amber-200"   },
  aprobada:  { label: "Aprobada",  icon: CheckCircle2,cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rechazada: { label: "Rechazada", icon: XCircle,     cls: "bg-red-50 text-red-700 border-red-200"         },
}

function formatFecha(iso) {
  const [y, m, d] = iso.split("-")
  const meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"]
  return `${d} ${meses[parseInt(m, 10) - 1]}.`
}

const GREETING = () => {
  const h = new Date().getHours()
  if (h < 12) return "Buenos días"
  if (h < 19) return "Buenas tardes"
  return "Buenas noches"
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({ label, value, delta, icon: Icon, color }) {
  const c = COLOR_MAP[color]
  return (
    <motion.div
      variants={itemVariants}
      className={`${c.bg} rounded-xl p-5 border border-slate-100 flex flex-col gap-3`}
    >
      <div className="flex items-start justify-between">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${c.icon}`}>
          <Icon size={18} />
        </div>
        <TrendingUp size={14} className="text-slate-300 mt-1" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800 leading-none mb-1">{value}</p>
        <p className="text-xs text-slate-500 font-medium leading-snug">{label}</p>
      </div>
      <p className={`text-[11px] font-medium ${c.text}`}>{delta}</p>
    </motion.div>
  )
}

function EstadoBadge({ estado }) {
  const cfg = ESTADO_CONFIG[estado] ?? ESTADO_CONFIG.pendiente
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${cfg.cls}`}>
      <Icon size={11} />
      {cfg.label}
    </span>
  )
}

function ReservasTable({ reservas }) {
  if (!reservas.length) {
    return <p className="text-sm text-slate-400 py-4 text-center">Sin reservas recientes.</p>
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left text-[11px] font-medium text-slate-400 pb-2.5 pr-4">Solicitante</th>
            <th className="text-left text-[11px] font-medium text-slate-400 pb-2.5 pr-4">Cámara</th>
            <th className="text-left text-[11px] font-medium text-slate-400 pb-2.5 pr-4">Fecha</th>
            <th className="text-left text-[11px] font-medium text-slate-400 pb-2.5 pr-4">Hora</th>
            <th className="text-left text-[11px] font-medium text-slate-400 pb-2.5">Estado</th>
          </tr>
        </thead>
        <tbody>
          {reservas.map((r, i) => (
            <tr
              key={r.id}
              className={`border-b border-slate-50 hover:bg-slate-50/80 transition-colors ${
                i === reservas.length - 1 ? "border-b-0" : ""
              }`}
            >
              <td className="py-2.5 pr-4 text-slate-700 font-medium">{r.solicitante}</td>
              <td className="py-2.5 pr-4 text-slate-500">{r.camara}</td>
              <td className="py-2.5 pr-4 text-slate-500">{formatFecha(r.fecha)}</td>
              <td className="py-2.5 pr-4 text-slate-500">{r.hora}</td>
              <td className="py-2.5"><EstadoBadge estado={r.estado} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SesionCard({ sesion }) {
  return (
    <motion.div
      variants={itemVariants}
      className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50/60 transition-all"
    >
      {/* Indicador en vivo */}
      <div className="mt-0.5 shrink-0 flex flex-col items-center gap-1">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">{sesion.titulo}</p>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
          <span className="text-[11px] text-slate-400">{sesion.camara}</span>
          <span className="text-[11px] text-slate-400">·</span>
          <span className="text-[11px] text-slate-400">{sesion.docente}</span>
          <span className="text-[11px] text-slate-400">·</span>
          <span className="text-[11px] text-slate-400">Inicio {sesion.inicio}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0">
        <Users size={12} />
        {sesion.participantes}
      </div>
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // ── Cuando conectes la API real, reemplaza esto: ──────────────────────────
    // const [reservas, sesiones, kpis] = await Promise.all([
    //   api.get("/reservas?limit=5"),
    //   api.get("/sesiones?estado=activa"),
    //   api.get("/reportes/sesiones"),
    // ])
    // setData({ kpis: kpis.data.data, reservasRecientes: reservas.data.data, sesionesActivas: sesiones.data.data })
    // ─────────────────────────────────────────────────────────────────────────
    const timer = setTimeout(() => {
      setData(getMockData(user?.rol))
      setLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [user?.rol])

  const roleLabel = { admin: "Administrador", docente: "Docente", estudiante: "Practicante" }

  // ── Skeleton de carga ──
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-slate-200 rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-64 bg-slate-200 rounded-xl" />
          <div className="h-64 bg-slate-200 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ── Header ── */}
      <motion.div variants={itemVariants} className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800 leading-tight">
            {GREETING()}, {user?.nombre?.split(" ")[0] ?? "Usuario"} 👋
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {roleLabel[user?.rol] ?? "Usuario"} · {new Date().toLocaleDateString("es-SV", {
              weekday: "long", day: "numeric", month: "long"
            })}
          </p>
        </div>

        {/* Indicador de vista */}
        <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg px-3 py-1.5">
          <Activity size={13} className="text-slate-400" />
          <span className="text-[11px] text-slate-500 font-medium">
            {user?.rol === "admin" ? "Vista global" : "Tu actividad"}
          </span>
        </div>
      </motion.div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {data.kpis.map((kpi, i) => (
          <KpiCard key={i} {...kpi} />
        ))}
      </div>

      {/* ── Fila principal ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Reservas recientes — ocupa 2/3 */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CalendarCheck size={16} className="text-blue-600" />
              <h2 className="text-sm font-semibold text-slate-800">Reservas recientes</h2>
            </div>
            <button className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-medium transition-colors">
              Ver todas <ChevronRight size={13} />
            </button>
          </div>
          <div className="px-5 py-4">
            <ReservasTable reservas={data.reservasRecientes} />
          </div>
        </motion.div>

        {/* Sesiones activas — ocupa 1/3 */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl border border-slate-200 overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <h2 className="text-sm font-semibold text-slate-800">Sesiones activas</h2>
            </div>
            <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
              {data.sesionesActivas.length} en curso
            </span>
          </div>

          <div className="px-4 py-3 space-y-2">
            {data.sesionesActivas.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">Sin sesiones activas ahora.</p>
            ) : (
              data.sesionesActivas.map(s => <SesionCard key={s.id} sesion={s} />)
            )}
          </div>

          {data.sesionesActivas.length > 0 && (
            <div className="px-4 pb-4">
              <button className="w-full mt-1 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] text-slate-500 font-medium flex items-center justify-center gap-1.5 transition-colors">
                Ver todas las sesiones <ChevronRight size={12} />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}