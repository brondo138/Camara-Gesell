import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import {
  CalendarCheck, Video, Users, Clock,
  TrendingUp, CheckCircle2, XCircle, AlertCircle,
  ChevronRight, Activity, Camera, Loader2
} from "lucide-react"
import { useAuth } from "../hooks/useAuth"
import { getReservas } from "../services/reservasService"
import { getSesiones } from "../services/sesionesService"
import { getResumen } from "../services/reportesService"

// ─── ANIMACIONES ──────────────────────────────────────────────────────────────
const containerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07 } },
}
const itemVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const COLOR_MAP = {
  blue:    { bg: "bg-blue-50",    icon: "bg-blue-100 text-blue-600",       text: "text-blue-700"    },
  emerald: { bg: "bg-emerald-50", icon: "bg-emerald-100 text-emerald-600", text: "text-emerald-700" },
  indigo:  { bg: "bg-indigo-50",  icon: "bg-indigo-100 text-indigo-600",   text: "text-indigo-700"  },
  amber:   { bg: "bg-amber-50",   icon: "bg-amber-100 text-amber-600",     text: "text-amber-700"   },
}

const ESTADO_CONFIG = {
  Pendiente: { label: "Pendiente", icon: AlertCircle,  cls: "bg-amber-50 text-amber-700 border-amber-200"         },
  Aprobada:  { label: "Aprobada",  icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-700 border-emerald-200"   },
  Rechazada: { label: "Rechazada", icon: XCircle,      cls: "bg-red-50 text-red-700 border-red-200"               },
  Cancelada: { label: "Cancelada", icon: XCircle,      cls: "bg-slate-100 text-slate-500 border-slate-200"        },
}

function formatFecha(iso) {
  if (!iso) return "—"
  const [, m, d] = iso.slice(0, 10).split("-")
  const meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"]
  return `${parseInt(d, 10)} ${meses[parseInt(m, 10) - 1]}.`
}

function formatHora(time) {
  if (!time) return "—"
  return time.slice(0, 5)
}

function formatHoras(minutos) {
  if (!minutos) return "0 h"
  const h = minutos / 60
  return `${h % 1 === 0 ? h : h.toFixed(1)} h`
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return "Buenos días"
  if (h < 19) return "Buenas tardes"
  return "Buenas noches"
}

const ROLE_LABEL = { admin: "Administrador", docente: "Docente", estudiante: "Practicante" }

// ─── MES Y AÑO ACTUALES ───────────────────────────────────────────────────────
const MES_ACTUAL  = new Date().getMonth() + 1
const ANIO_ACTUAL = new Date().getFullYear()

// ─── SUB-COMPONENTES ──────────────────────────────────────────────────────────
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

function KpiSkeleton() {
  return (
    <div className="h-32 bg-slate-100 rounded-xl animate-pulse" />
  )
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

function ReservasTable({ reservas, loading }) {
  if (loading) {
    return (
      <div className="space-y-3 py-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 bg-slate-100 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }
  if (!reservas.length) {
    return <p className="text-sm text-slate-400 py-6 text-center">Sin reservas recientes.</p>
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
              key={r.id_reserva}
              className={`border-b border-slate-50 hover:bg-slate-50/80 transition-colors ${
                i === reservas.length - 1 ? "border-b-0" : ""
              }`}
            >
              <td className="py-2.5 pr-4 text-slate-700 font-medium text-xs">
                {r.nombre_solicitante} {r.apellido_solicitante}
              </td>
              <td className="py-2.5 pr-4 text-slate-500 text-xs">
                <span className="inline-flex items-center gap-1">
                  <Camera size={11} className="text-slate-300" />{r.camara}
                </span>
              </td>
              <td className="py-2.5 pr-4 text-slate-500 text-xs">{formatFecha(r.fecha)}</td>
              <td className="py-2.5 pr-4 text-slate-500 text-xs">{formatHora(r.hora_inicio)}</td>
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
      <div className="mt-0.5 shrink-0">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">{sesion.titulo}</p>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
          <span className="text-[11px] text-slate-400">{sesion.camara}</span>
          <span className="text-[11px] text-slate-400">·</span>
          <span className="text-[11px] text-slate-400">
            {sesion.nombre_solicitante} {sesion.apellido_solicitante}
          </span>
          <span className="text-[11px] text-slate-400">·</span>
          <span className="text-[11px] text-slate-400">{formatHora(sesion.hora_inicio)}</span>
        </div>
      </div>
    </motion.div>
  )
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function Dashboard() {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const isAdmin    = user?.rol === "admin"

  // KPIs desde reportes/resumen
  const [resumen, setResumen]         = useState(null)
  const [loadingResumen, setLoadingResumen] = useState(true)

  // Reservas recientes
  const [reservas, setReservas]       = useState([])
  const [loadingReservas, setLoadingReservas] = useState(true)

  // Sesiones programadas próximas
  const [sesiones, setSesiones]       = useState([])
  const [loadingSesiones, setLoadingSesiones] = useState(true)

  useEffect(() => {
    if (!user) return
    cargarDatos()
  }, [user])

  async function cargarDatos() {
    // Cargamos las 3 secciones en paralelo
    await Promise.allSettled([
      cargarResumen(),
      cargarReservas(),
      cargarSesiones(),
    ])
  }

  async function cargarResumen() {
    setLoadingResumen(true)
    try {
      const data = await getResumen({
        id_usuario: user?.id,
        id_rol:     user?.id_rol,
        mes:        MES_ACTUAL,
        anio:       ANIO_ACTUAL
      })
      setResumen(data)
    } catch {
      setResumen(null)
    } finally {
      setLoadingResumen(false)
    }
  }

  async function cargarReservas() {
    setLoadingReservas(true)
    try {
      const data = await getReservas(user?.id, user?.id_rol)
      // Tomar las 5 más recientes
      setReservas(data.slice(0, 5))
    } catch {
      setReservas([])
    } finally {
      setLoadingReservas(false)
    }
  }

  async function cargarSesiones() {
    setLoadingSesiones(true)
    try {
      const data = await getSesiones(user?.id, user?.id_rol)
      // Solo sesiones programadas, máximo 4
      setSesiones(data.filter(s => s.estado === "Programada").slice(0, 4))
    } catch {
      setSesiones([])
    } finally {
      setLoadingSesiones(false)
    }
  }

  // ── KPIs según rol ────────────────────────────────────────────────────────
  function buildKpis() {
    if (!resumen) return []

    if (isAdmin) {
      return [
        {
          label: "Reservas este mes",
          value: resumen.total_reservas,
          delta: `${resumen.porcentaje_cumplimiento}% de sesiones realizadas`,
          icon:  CalendarCheck,
          color: "blue"
        },
        {
          label: "Sesiones programadas",
          value: resumen.sesiones_programadas,
          delta: `${resumen.sesiones_realizadas} realizadas este mes`,
          icon:  Video,
          color: "emerald"
        },
        {
          label: "Horas de sala",
          value: formatHoras(resumen.total_minutos),
          delta: "Tiempo reservado este mes",
          icon:  Clock,
          color: "amber"
        },
        {
          label: "Evidencias",
          value: resumen.total_observaciones + resumen.total_grabaciones,
          delta: `${resumen.total_observaciones} obs. · ${resumen.total_grabaciones} grab.`,
          icon:  Users,
          color: "indigo"
        },
      ]
    }

    // Docente y estudiante
    return [
      {
        label: "Mis reservas este mes",
        value: resumen.total_reservas,
        delta: "Solicitudes del mes actual",
        icon:  CalendarCheck,
        color: "blue"
      },
      {
        label: "Sesiones realizadas",
        value: resumen.sesiones_realizadas,
        delta: `${resumen.sesiones_programadas} próximas`,
        icon:  Video,
        color: "emerald"
      },
      {
        label: "Horas acumuladas",
        value: formatHoras(resumen.total_minutos),
        delta: "Este mes",
        icon:  Clock,
        color: "amber"
      },
      {
        label: "Mis observaciones",
        value: resumen.total_observaciones,
        delta: `${resumen.total_grabaciones} grabaciones`,
        icon:  Users,
        color: "indigo"
      },
    ]
  }

  const kpis = buildKpis()

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800 leading-tight">
            {greeting()}, {user?.nombre?.split(" ")[0] ?? "Usuario"} 👋
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {ROLE_LABEL[user?.rol] ?? "Usuario"} · {new Date().toLocaleDateString("es-SV", {
              weekday: "long", day: "numeric", month: "long"
            })}
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg px-3 py-1.5">
          <Activity size={13} className="text-slate-400" />
          <span className="text-[11px] text-slate-500 font-medium">
            {isAdmin ? "Vista global" : "Tu actividad"}
          </span>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loadingResumen
          ? [...Array(4)].map((_, i) => <KpiSkeleton key={i} />)
          : kpis.map((kpi, i) => <KpiCard key={i} {...kpi} />)
        }
      </div>

      {/* Fila principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Reservas recientes — 2/3 */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CalendarCheck size={16} className="text-blue-600" />
              <h2 className="text-sm font-semibold text-slate-800">Reservas recientes</h2>
            </div>
            <button
              onClick={() => navigate("/reservas")}
              className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Ver todas <ChevronRight size={13} />
            </button>
          </div>
          <div className="px-5 py-4">
            <ReservasTable reservas={reservas} loading={loadingReservas} />
          </div>
        </motion.div>

        {/* Sesiones programadas — 1/3 */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl border border-slate-200 overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
              <h2 className="text-sm font-semibold text-slate-800">Próximas sesiones</h2>
            </div>
            <span className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium">
              {sesiones.length} programada{sesiones.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="px-4 py-3 space-y-2">
            {loadingSesiones ? (
              <div className="space-y-2 py-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : sesiones.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">
                No hay sesiones programadas.
              </p>
            ) : (
              sesiones.map(s => <SesionCard key={s.id_sesion} sesion={s} />)
            )}
          </div>

          {sesiones.length > 0 && (
            <div className="px-4 pb-4">
              <button
                onClick={() => navigate("/sesiones")}
                className="w-full mt-1 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] text-slate-500 font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                Ver todas las sesiones <ChevronRight size={12} />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}