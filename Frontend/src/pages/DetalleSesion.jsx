import { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowLeft, CalendarClock, Camera, CheckCircle2, Clock,
  FileText, MessageSquareText, UserRound, Video, XCircle,
  Loader2, AlertTriangle
} from "lucide-react"
import { getSesionById } from "../services/sesionesService"

// ─── CONFIG ESTADOS ───────────────────────────────────────────────────────────
const ESTADO_CONFIG = {
  Programada: { label: "Programada", icon: CalendarClock, cls: "bg-blue-50 text-blue-700 border-blue-200"     },
  Realizada:  { label: "Realizada",  icon: CheckCircle2,  cls: "bg-slate-100 text-slate-700 border-slate-200" },
  Cancelada:  { label: "Cancelada",  icon: XCircle,       cls: "bg-red-50 text-red-700 border-red-200"        },
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

// ─── SUB-COMPONENTES ──────────────────────────────────────────────────────────
function EstadoBadge({ estado }) {
  const cfg = ESTADO_CONFIG[estado] ?? ESTADO_CONFIG.Programada
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.cls}`}>
      <Icon size={12} />{cfg.label}
    </span>
  )
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
      <div className="flex items-center gap-2 text-slate-400 mb-2">
        <Icon size={14} />
        <span className="text-[11px] font-medium">{label}</span>
      </div>
      <p className="text-sm font-semibold text-slate-800">{value}</p>
    </div>
  )
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function DetalleSesion() {
  const { id } = useParams()

  const [sesion, setSesion]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState("")

  useEffect(() => {
    cargarSesion()
  }, [id])

  async function cargarSesion() {
    setLoading(true)
    setError("")
    try {
      const data = await getSesionById(id)
      setSesion(data)
    } catch (err) {
      setError(err?.response?.data?.message ?? "Error al cargar la sesión.")
    } finally {
      setLoading(false)
    }
  }

  // ── Estado: cargando ──
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-3" />
        <p className="text-sm">Cargando sesión…</p>
      </div>
    )
  }

  // ── Estado: error o no encontrada ──
  if (error || !sesion) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <h1 className="text-lg font-semibold text-slate-800">Sesión no encontrada</h1>
        <p className="text-sm text-slate-400 mt-1">
          {error || `No existe una sesión con el ID ${id}.`}
        </p>
        <div className="flex items-center justify-center gap-3 mt-5">
          <button
            onClick={cargarSesion}
            className="h-9 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm text-slate-600 font-medium transition-colors"
          >
            Reintentar
          </button>
          <Link
            to="/sesiones"
            className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold transition-colors"
          >
            <ArrowLeft size={15} />
            Volver a sesiones
          </Link>
        </div>
      </div>
    )
  }

  // ─── RENDER PRINCIPAL ─────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <Link
            to="/sesiones"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-600 font-medium mb-3"
          >
            <ArrowLeft size={14} />
            Sesiones
          </Link>
          <h1 className="text-xl font-semibold text-slate-800 leading-tight">{sesion.titulo}</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Reserva #{sesion.id_reserva} · {sesion.tipo_sesion} · {sesion.motivo}
          </p>
        </div>
        <EstadoBadge estado={sesion.estado} />
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <InfoItem icon={Camera}      label="Sala"    value={sesion.camara} />
        <InfoItem icon={CalendarClock} label="Fecha" value={formatFecha(sesion.fecha_realizacion)} />
        <InfoItem icon={Clock}       label="Horario" value={`${formatHora(sesion.hora_inicio)} – ${formatHora(sesion.hora_fin)}`} />
        <InfoItem icon={UserRound}   label="Tipo"    value={sesion.tipo_sesion} />
      </div>

      {/* Participantes + descripción */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Descripción — 2/3 */}
        <section className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <FileText size={15} className="text-blue-600" />
            <h2 className="text-sm font-semibold text-slate-800">Descripción</h2>
          </div>
          <div className="p-5">
            {sesion.descripcion ? (
              <p className="text-sm text-slate-600 leading-relaxed">{sesion.descripcion}</p>
            ) : (
              <p className="text-sm text-slate-400 italic">Sin descripción registrada.</p>
            )}
          </div>
        </section>

        {/* Participantes — 1/3 */}
        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <UserRound size={15} className="text-blue-600" />
            <h2 className="text-sm font-semibold text-slate-800">Solicitante</h2>
          </div>
          <div className="p-5 space-y-3">
            <div>
              <p className="text-[11px] text-slate-400 mb-1">Nombre</p>
              <p className="text-sm font-semibold text-slate-800">
                {sesion.nombre_solicitante} {sesion.apellido_solicitante}
              </p>
            </div>
            <div className="border-t border-slate-100 pt-3">
              <p className="text-[11px] text-slate-400 mb-1">Rol</p>
              <p className="text-sm font-semibold text-slate-800 capitalize">{sesion.rol_solicitante}</p>
            </div>
            <div className="border-t border-slate-100 pt-3">
              <p className="text-[11px] text-slate-400 mb-1">Reserva</p>
              <p className="text-sm font-semibold text-slate-800">#{sesion.id_reserva}</p>
            </div>
          </div>
        </section>
      </div>

      {/* Observaciones y Grabaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Observaciones */}
        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <MessageSquareText size={15} className="text-blue-600" />
              Observaciones
            </h2>
            <span className="text-[11px] text-slate-400">
              Próximamente disponible
            </span>
          </div>
          <div className="p-5">
            <p className="text-sm text-slate-400 text-center py-6">
              Las observaciones se cargarán cuando el módulo esté integrado.
            </p>
          </div>
        </section>

        {/* Grabaciones */}
        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Video size={15} className="text-blue-600" />
              Grabaciones
            </h2>
            <span className="text-[11px] text-slate-400">
              Próximamente disponible
            </span>
          </div>
          <div className="p-5">
            <p className="text-sm text-slate-400 text-center py-6">
              Las grabaciones se cargarán cuando el módulo esté integrado.
            </p>
          </div>
        </section>
      </div>
    </motion.div>
  )
}


