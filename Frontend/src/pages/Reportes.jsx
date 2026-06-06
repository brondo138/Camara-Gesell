import { useState, useEffect, useMemo, useCallback } from "react"
import { motion } from "framer-motion"
import {
  BarChart2, CalendarDays, Camera, CheckCircle2, Clock, Download,
  FileText, Filter, PieChart, Printer, TrendingUp, Users, Video,
  Loader2, AlertTriangle
} from "lucide-react"
import { useAuth } from "../hooks/useAuth"
import {
  getResumen, getUsoSalas, getEstados,
  getActividadDocentes, getDetalle
} from "../services/reportesService"

// ─── ANIMACIONES ──────────────────────────────────────────────────────────────
const containerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.06 } },
}
const itemVariants = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
}

// ─── PERIODOS DISPONIBLES ─────────────────────────────────────────────────────
function getPeriodos() {
  const periodos = [{ key: "todos|todos", label: "Todo" }]
  const hoy = new Date()
  for (let i = 0; i < 6; i++) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1)
    const mes  = d.getMonth() + 1
    const anio = d.getFullYear()
    const label = d.toLocaleDateString("es-SV", { month: "long", year: "numeric" })
    periodos.splice(1, 0, { key: `${mes}|${anio}`, label })
  }
  return periodos
}

const TIPOS = [
  { key: "general",  label: "General",  icon: BarChart2 },
  { key: "sesiones", label: "Sesiones", icon: Video     },
  { key: "salas",    label: "Salas",    icon: Camera    },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function formatFecha(iso) {
  if (!iso) return "—"
  const [y, m, d] = iso.slice(0, 10).split("-")
  const meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"]
  return `${parseInt(d, 10)} ${meses[parseInt(m, 10) - 1]}. ${y}`
}

function formatHoras(minutos) {
  if (!minutos) return "0 h"
  const h = minutos / 60
  return `${h % 1 === 0 ? h : h.toFixed(1)} h`
}

function exportCsv(rows) {
  const headers = ["Fecha","Sala","Solicitante","Rol","Estado","Duración (min)","Observaciones","Grabaciones"]
  const body = rows.map(r => [
    r.fecha, r.camara, r.solicitante, r.rol_solicitante,
    r.estado, r.duracion_minutos, r.total_observaciones, r.total_grabaciones
  ])
  const csv = [headers, ...body]
    .map(row => row.map(v => `"${String(v ?? "").replaceAll('"','""')}"`).join(","))
    .join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url  = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url; link.download = "reporte-gesell.csv"; link.click()
  URL.revokeObjectURL(url)
}

// ─── SUB-COMPONENTES ──────────────────────────────────────────────────────────
function StatCard({ label, value, helper, icon: Icon, tone }) {
  const tones = {
    blue:    "bg-blue-50 text-blue-700 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber:   "bg-amber-50 text-amber-700 border-amber-100",
    indigo:  "bg-indigo-50 text-indigo-700 border-indigo-100",
  }
  return (
    <motion.div variants={itemVariants} className={`rounded-xl border p-4 ${tones[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-2xl font-bold leading-none">{value}</p>
          <p className="text-xs font-medium mt-1 opacity-80">{label}</p>
          <p className="text-[11px] mt-2 opacity-70">{helper}</p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-white/70 flex items-center justify-center shrink-0">
          <Icon size={17} />
        </div>
      </div>
    </motion.div>
  )
}

function ProgressRow({ label, value, max, detail, tone = "blue" }) {
  const percent = max > 0 ? Math.max((value / max) * 100, 4) : 0
  const bar = { blue: "bg-blue-600", emerald: "bg-emerald-600", amber: "bg-amber-500", indigo: "bg-indigo-600" }[tone]
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-700 truncate">{label}</p>
          <p className="text-[11px] text-slate-400">{detail}</p>
        </div>
        <span className="text-xs font-semibold text-slate-700 shrink-0">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${bar}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

function SectionLoader() {
  return (
    <div className="flex justify-center items-center py-12">
      <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
    </div>
  )
}

function SectionError({ onRetry }) {
  return (
    <div className="flex flex-col items-center py-10 gap-2 text-slate-400">
      <AlertTriangle className="w-5 h-5 text-red-400" />
      <p className="text-xs">Error al cargar datos.</p>
      <button onClick={onRetry} className="text-xs text-blue-600 hover:underline">Reintentar</button>
    </div>
  )
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function Reportes() {
  const { user }   = useAuth()
  const isAdmin    = user?.rol === "admin"
  const PERIODOS   = useMemo(() => getPeriodos(), [])

  const [periodo, setPeriodo] = useState(PERIODOS[1]?.key ?? "todos|todos")
  const [tipo, setTipo]       = useState("general")

  // Datos por sección
  const [resumen,   setResumen]   = useState(null)
  const [salas,     setSalas]     = useState([])
  const [estados,   setEstados]   = useState([])
  const [docentes,  setDocentes]  = useState([])
  const [detalle,   setDetalle]   = useState([])

  // Estados de carga/error por sección
  const [loadingResumen,  setLoadingResumen]  = useState(true)
  const [loadingSalas,    setLoadingSalas]    = useState(true)
  const [loadingEstados,  setLoadingEstados]  = useState(true)
  const [loadingDocentes, setLoadingDocentes] = useState(true)
  const [loadingDetalle,  setLoadingDetalle]  = useState(true)

  const [errorResumen,  setErrorResumen]  = useState(false)
  const [errorSalas,    setErrorSalas]    = useState(false)
  const [errorEstados,  setErrorEstados]  = useState(false)
  const [errorDocentes, setErrorDocentes] = useState(false)
  const [errorDetalle,  setErrorDetalle]  = useState(false)

  // ── Parámetros de consulta ────────────────────────────────────────────────
  const queryParams = useMemo(() => {
    const [mes, anio] = periodo.split("|")
    return {
      id_usuario: user?.id,
      id_rol:     user?.id_rol,
      mes,
      anio
    }
  }, [periodo, user])

  // ── Carga de datos ────────────────────────────────────────────────────────
  const cargarResumen = useCallback(async () => {
    setLoadingResumen(true); setErrorResumen(false)
    try   { setResumen(await getResumen(queryParams)) }
    catch { setErrorResumen(true) }
    finally { setLoadingResumen(false) }
  }, [queryParams])

  const cargarSalas = useCallback(async () => {
    setLoadingSalas(true); setErrorSalas(false)
    try   { setSalas(await getUsoSalas(queryParams)) }
    catch { setErrorSalas(true) }
    finally { setLoadingSalas(false) }
  }, [queryParams])

  const cargarEstados = useCallback(async () => {
    setLoadingEstados(true); setErrorEstados(false)
    try   { setEstados(await getEstados(queryParams)) }
    catch { setErrorEstados(true) }
    finally { setLoadingEstados(false) }
  }, [queryParams])

  const cargarDocentes = useCallback(async () => {
    setLoadingDocentes(true); setErrorDocentes(false)
    try   { setDocentes(await getActividadDocentes(queryParams)) }
    catch { setErrorDocentes(true) }
    finally { setLoadingDocentes(false) }
  }, [queryParams])

  const cargarDetalle = useCallback(async () => {
    setLoadingDetalle(true); setErrorDetalle(false)
    try   { setDetalle(await getDetalle(queryParams)) }
    catch { setErrorDetalle(true) }
    finally { setLoadingDetalle(false) }
  }, [queryParams])

  // Recargar todo cuando cambia el periodo
  useEffect(() => {
    cargarResumen()
    cargarSalas()
    cargarEstados()
    if (isAdmin) cargarDocentes()
    cargarDetalle()
  }, [queryParams])

  // ── Máximos para barras de progreso ──────────────────────────────────────
  const maxSala    = Math.max(...salas.map(s => s.total_sesiones), 1)
  const maxDocente = Math.max(...docentes.map(d => d.total_sesiones), 1)
  const maxEstado  = Math.max(...estados.map(e => e.total), 1)

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">

      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800 leading-tight">Reportes</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {isAdmin
              ? "Resumen operativo de reservas, sesiones y uso de salas."
              : "Resumen de tus sesiones, salas y observaciones."}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-colors"
          >
            <Printer size={14} /> Imprimir
          </button>
          <button
            type="button"
            onClick={() => exportCsv(detalle)}
            disabled={detalle.length === 0}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold transition-colors shadow-sm disabled:opacity-50"
          >
            <Download size={14} /> CSV
          </button>
        </div>
      </motion.div>

      {/* Filtros */}
      <motion.div variants={itemVariants} className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-500">
          <Filter size={14} className="text-slate-400" />
          {isAdmin ? "Vista global" : "Tu actividad"}
        </div>

        {PERIODOS.map(p => (
          <button
            key={p.key}
            type="button"
            onClick={() => setPeriodo(p.key)}
            className={`h-8 px-3 rounded-lg border text-xs font-medium transition-all capitalize ${
              periodo === p.key
                ? "bg-blue-700 border-blue-700 text-white"
                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
            }`}
          >
            {p.label}
          </button>
        ))}

        <div className="w-full sm:w-auto sm:ml-auto flex items-center gap-2 flex-wrap">
          {TIPOS.map(t => {
            const Icon = t.icon
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTipo(t.key)}
                className={`flex items-center gap-1.5 h-8 px-3 rounded-lg border text-xs font-medium transition-all ${
                  tipo === t.key
                    ? "bg-[#1e3a5f] border-[#1e3a5f] text-white"
                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Icon size={13} /> {t.label}
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loadingResumen ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-slate-100 animate-pulse" />
          ))
        ) : errorResumen ? (
          <div className="col-span-4">
            <SectionError onRetry={cargarResumen} />
          </div>
        ) : resumen ? (
          <>
            <StatCard
              label="Reservas"
              value={resumen.total_reservas}
              helper="Solicitudes del periodo"
              icon={CalendarDays}
              tone="blue"
            />
            <StatCard
              label="Sesiones"
              value={resumen.total_sesiones}
              helper={`${resumen.porcentaje_cumplimiento}% realizadas`}
              icon={Video}
              tone="emerald"
            />
            <StatCard
              label="Horas de sala"
              value={formatHoras(resumen.total_minutos)}
              helper="Tiempo reservado"
              icon={Clock}
              tone="amber"
            />
            <StatCard
              label="Evidencias"
              value={resumen.total_observaciones + resumen.total_grabaciones}
              helper={`${resumen.total_observaciones} obs. · ${resumen.total_grabaciones} grab.`}
              icon={FileText}
              tone="indigo"
            />
          </>
        ) : null}
      </div>

      {/* Salas + Estados */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Uso por sala */}
        {(tipo === "general" || tipo === "salas") && (
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Camera size={15} className="text-blue-600" />
                Uso por sala
              </h2>
              <span className="text-[11px] text-slate-400">
                {salas.length} sala{salas.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="p-5 space-y-4">
              {loadingSalas ? <SectionLoader /> :
               errorSalas   ? <SectionError onRetry={cargarSalas} /> :
               salas.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">Sin datos para el periodo.</p>
               ) : (
                salas.map((s, i) => (
                  <ProgressRow
                    key={s.id_camara}
                    label={s.camara}
                    value={s.total_sesiones}
                    max={maxSala}
                    detail={`${formatHoras(s.total_minutos)} acumuladas`}
                    tone={i % 2 === 0 ? "blue" : "emerald"}
                  />
                ))
               )}
            </div>
          </motion.div>
        )}

        {/* Estados de sesiones */}
        {(tipo === "general" || tipo === "sesiones") && (
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <PieChart size={15} className="text-blue-600" />
                Estados
              </h2>
              <span className="text-[11px] text-slate-400">
                {resumen?.total_sesiones ?? 0} total
              </span>
            </div>
            <div className="p-5 space-y-4">
              {loadingEstados ? <SectionLoader /> :
               errorEstados   ? <SectionError onRetry={cargarEstados} /> : (
                estados.map((e, i) => (
                  <ProgressRow
                    key={e.estado}
                    label={e.estado}
                    value={e.total}
                    max={maxEstado}
                    detail={e.total === 1 ? "1 sesión" : `${e.total} sesiones`}
                    tone={["emerald","blue","amber"][i]}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Actividad docente — solo admin */}
      {isAdmin && (tipo === "general" || tipo === "sesiones") && (
        <motion.div variants={itemVariants} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <TrendingUp size={15} className="text-blue-600" />
              Actividad docente
            </h2>
            <span className="text-[11px] text-slate-400">
              {docentes.length} docente{docentes.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {loadingDocentes ? <SectionLoader /> :
             errorDocentes   ? <SectionError onRetry={cargarDocentes} /> :
             docentes.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8 md:col-span-2">
                No hay actividad docente registrada.
              </p>
             ) : (
              docentes.map(d => (
                <ProgressRow
                  key={d.id_usuario}
                  label={d.docente}
                  value={d.total_sesiones}
                  max={maxDocente}
                  detail={`${d.total_observaciones} observaciones · ${formatHoras(d.total_minutos)}`}
                  tone="indigo"
                />
              ))
             )}
          </div>
        </motion.div>
      )}

      {/* Tabla detalle */}
      <motion.div variants={itemVariants} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Users size={15} className="text-blue-600" />
            Detalle del reporte
          </h2>
          <span className="text-[11px] text-slate-400">
            {detalle.length} registro{detalle.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loadingDetalle ? <SectionLoader /> :
         errorDetalle   ? <SectionError onRetry={cargarDetalle} /> :
         detalle.length === 0 ? (
          <div className="py-14 text-center">
            <BarChart2 size={32} className="text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No hay datos que mostrar.</p>
          </div>
         ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-[11px] font-medium text-slate-400 px-5 py-3">Fecha</th>
                  <th className="text-left text-[11px] font-medium text-slate-400 px-4 py-3">Sala</th>
                  <th className="text-left text-[11px] font-medium text-slate-400 px-4 py-3">Solicitante</th>
                  <th className="text-left text-[11px] font-medium text-slate-400 px-4 py-3 hidden md:table-cell">Sesión</th>
                  <th className="text-left text-[11px] font-medium text-slate-400 px-4 py-3">Estado</th>
                  <th className="text-right text-[11px] font-medium text-slate-400 px-5 py-3">Duración</th>
                </tr>
              </thead>
              <tbody>
                {detalle.map((r, i) => (
                  <motion.tr
                    key={r.id_sesion}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.025 }}
                    className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors last:border-b-0"
                  >
                    <td className="px-5 py-3.5 text-xs text-slate-600">{formatFecha(r.fecha)}</td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700">
                        <Camera size={12} className="text-slate-300" />
                        {r.camara}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-xs font-medium text-slate-700">{r.solicitante}</p>
                      <p className="text-[11px] text-slate-400 capitalize">{r.rol_solicitante}</p>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 hidden md:table-cell line-clamp-1">
                      {r.titulo}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border bg-slate-50 text-slate-600 border-slate-200">
                        <CheckCircle2 size={11} />
                        {r.estado}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-xs font-semibold text-slate-700">
                      {formatHoras(r.duracion_minutos)}
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