import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  BarChart2, CalendarDays, Camera, CheckCircle2, Clock, Download,
  FileText, Filter, PieChart, Printer, TrendingUp, Users, Video
} from "lucide-react"
import { useAuth } from "../hooks/useAuth"

const MOCK_REPORTES = [
  { id: 1, fecha: "2026-05-06", periodo: "mayo", camara: "Sala A", docente: "Dr. Perez", estudiante: "Ana Martinez", estado: "finalizada", duracion: 120, observaciones: 5, grabaciones: 1, reservas: 1 },
  { id: 2, fecha: "2026-05-08", periodo: "mayo", camara: "Sala B", docente: "Dra. Morales", estudiante: "Carlos Rivas", estado: "finalizada", duracion: 90, observaciones: 3, grabaciones: 1, reservas: 1 },
  { id: 3, fecha: "2026-05-10", periodo: "mayo", camara: "Sala C", docente: "Dr. Ruiz", estudiante: "Pedro Salinas", estado: "cancelada", duracion: 0, observaciones: 0, grabaciones: 0, reservas: 1 },
  { id: 4, fecha: "2026-05-13", periodo: "mayo", camara: "Sala A", docente: "Dr. Perez", estudiante: "Mariana Ortiz", estado: "finalizada", duracion: 75, observaciones: 2, grabaciones: 1, reservas: 1 },
  { id: 5, fecha: "2026-05-16", periodo: "mayo", camara: "Sala D", docente: "Maria Lopez", estudiante: "Laura Fuentes", estado: "programada", duracion: 60, observaciones: 1, grabaciones: 0, reservas: 1 },
  { id: 6, fecha: "2026-05-21", periodo: "mayo", camara: "Sala B", docente: "Dra. Morales", estudiante: "Carlos Rivas", estado: "finalizada", duracion: 120, observaciones: 3, grabaciones: 1, reservas: 1 },
  { id: 7, fecha: "2026-05-22", periodo: "mayo", camara: "Sala A", docente: "Dr. Perez", estudiante: "Ana Martinez", estado: "en_curso", duracion: 120, observaciones: 5, grabaciones: 0, reservas: 1 },
  { id: 8, fecha: "2026-05-23", periodo: "mayo", camara: "Sala B", docente: "Dra. Morales", estudiante: "Laura Fuentes", estado: "programada", duracion: 120, observaciones: 0, grabaciones: 0, reservas: 1 },
  { id: 9, fecha: "2026-04-11", periodo: "abril", camara: "Sala C", docente: "Dr. Ruiz", estudiante: "Pedro Salinas", estado: "finalizada", duracion: 110, observaciones: 4, grabaciones: 1, reservas: 1 },
  { id: 10, fecha: "2026-04-18", periodo: "abril", camara: "Sala A", docente: "Dr. Perez", estudiante: "Ana Martinez", estado: "finalizada", duracion: 95, observaciones: 2, grabaciones: 1, reservas: 1 },
  { id: 11, fecha: "2026-04-24", periodo: "abril", camara: "Sala D", docente: "Maria Lopez", estudiante: "Mariana Ortiz", estado: "cancelada", duracion: 0, observaciones: 0, grabaciones: 0, reservas: 1 },
]

const MOCK_USER_SCOPE = {
  docente: "Dra. Morales",
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
}

const PERIODOS = [
  { key: "mayo", label: "Mayo 2026" },
  { key: "abril", label: "Abril 2026" },
  { key: "todos", label: "Todo" },
]

const TIPOS = [
  { key: "general", label: "General", icon: BarChart2 },
  { key: "sesiones", label: "Sesiones", icon: Video },
  { key: "salas", label: "Salas", icon: Camera },
]

const ESTADO_LABEL = {
  finalizada: "Finalizada",
  en_curso: "En curso",
  programada: "Programada",
  cancelada: "Cancelada",
}

function formatFecha(iso) {
  const [y, m, d] = iso.split("-")
  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
  return `${parseInt(d, 10)} ${meses[parseInt(m, 10) - 1]}. ${y}`
}

function formatHoras(minutos) {
  const horas = minutos / 60
  return `${horas % 1 === 0 ? horas : horas.toFixed(1)} h`
}

function groupBy(items, key) {
  return items.reduce((acc, item) => {
    const group = item[key]
    acc[group] = acc[group] ?? []
    acc[group].push(item)
    return acc
  }, {})
}

function StatCard({ label, value, helper, icon: Icon, tone }) {
  const tones = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
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
  const percent = max > 0 ? Math.max((value / max) * 100, 6) : 0
  const bar = {
    blue: "bg-blue-600",
    emerald: "bg-emerald-600",
    amber: "bg-amber-500",
    indigo: "bg-indigo-600",
  }[tone]

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
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

function exportCsv(rows) {
  const headers = ["Fecha", "Camara", "Docente", "Estudiante", "Estado", "Duracion", "Observaciones", "Grabaciones"]
  const body = rows.map(r => [
    r.fecha,
    r.camara,
    r.docente,
    r.estudiante,
    ESTADO_LABEL[r.estado],
    r.duracion,
    r.observaciones,
    r.grabaciones,
  ])
  const csv = [headers, ...body]
    .map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n")

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "reporte-gesell.csv"
  link.click()
  URL.revokeObjectURL(url)
}

export default function Reportes() {
  const { user } = useAuth()
  const [periodo, setPeriodo] = useState("mayo")
  const [tipo, setTipo] = useState("general")

  const isAdmin = user?.rol === "admin"

  const reportesVisibles = useMemo(() => {
    const byRole = isAdmin
      ? MOCK_REPORTES
      : MOCK_REPORTES.filter(r => r.docente === MOCK_USER_SCOPE.docente)
    return periodo === "todos" ? byRole : byRole.filter(r => r.periodo === periodo)
  }, [isAdmin, periodo])

  const resumen = useMemo(() => {
    const totalReservas = reportesVisibles.reduce((acc, r) => acc + r.reservas, 0)
    const sesiones = reportesVisibles.length
    const finalizadas = reportesVisibles.filter(r => r.estado === "finalizada").length
    const minutos = reportesVisibles.reduce((acc, r) => acc + r.duracion, 0)
    const observaciones = reportesVisibles.reduce((acc, r) => acc + r.observaciones, 0)
    const grabaciones = reportesVisibles.reduce((acc, r) => acc + r.grabaciones, 0)
    const cumplimiento = sesiones ? Math.round((finalizadas / sesiones) * 100) : 0

    return { totalReservas, sesiones, finalizadas, minutos, observaciones, grabaciones, cumplimiento }
  }, [reportesVisibles])

  const salas = useMemo(() => {
    const grouped = groupBy(reportesVisibles, "camara")
    return Object.entries(grouped)
      .map(([camara, rows]) => ({
        camara,
        sesiones: rows.length,
        horas: rows.reduce((acc, r) => acc + r.duracion, 0),
      }))
      .sort((a, b) => b.sesiones - a.sesiones)
  }, [reportesVisibles])

  const docentes = useMemo(() => {
    const grouped = groupBy(reportesVisibles, "docente")
    return Object.entries(grouped)
      .map(([docente, rows]) => ({
        docente,
        sesiones: rows.length,
        observaciones: rows.reduce((acc, r) => acc + r.observaciones, 0),
      }))
      .sort((a, b) => b.sesiones - a.sesiones)
  }, [reportesVisibles])

  const estados = useMemo(() => {
    const grouped = groupBy(reportesVisibles, "estado")
    return Object.entries(ESTADO_LABEL).map(([estado, label]) => ({
      estado,
      label,
      total: grouped[estado]?.length ?? 0,
    }))
  }, [reportesVisibles])

  const maxSala = Math.max(...salas.map(s => s.sesiones), 1)
  const maxDocente = Math.max(...docentes.map(d => d.sesiones), 1)
  const maxEstado = Math.max(...estados.map(e => e.total), 1)

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">
      <motion.div variants={itemVariants} className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800 leading-tight">Reportes</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {isAdmin ? "Resumen operativo de reservas, sesiones y uso de salas." : "Resumen de tus sesiones, salas y observaciones."}
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
            onClick={() => exportCsv(reportesVisibles)}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold transition-colors shadow-sm"
          >
            <Download size={14} /> CSV
          </button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-500">
          <Filter size={14} className="text-slate-400" />
          {isAdmin ? "Vista global" : "Vista docente"}
        </div>

        {PERIODOS.map(p => (
          <button
            key={p.key}
            type="button"
            onClick={() => setPeriodo(p.key)}
            className={`h-8 px-3 rounded-lg border text-xs font-medium transition-all ${
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
                    ? "bg-navy-700 border-navy-700 text-white"
                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Icon size={13} /> {t.label}
              </button>
            )
          })}
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Reservas" value={resumen.totalReservas} helper="Solicitudes del periodo" icon={CalendarDays} tone="blue" />
        <StatCard label="Sesiones" value={resumen.sesiones} helper={`${resumen.cumplimiento}% finalizadas`} icon={Video} tone="emerald" />
        <StatCard label="Horas de sala" value={formatHoras(resumen.minutos)} helper="Tiempo reservado" icon={Clock} tone="amber" />
        <StatCard label="Evidencias" value={resumen.observaciones + resumen.grabaciones} helper={`${resumen.observaciones} obs. · ${resumen.grabaciones} grab.`} icon={FileText} tone="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {(tipo === "general" || tipo === "salas") && (
          <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Camera size={15} className="text-blue-600" />
                Uso por sala
              </h2>
              <span className="text-[11px] text-slate-400">{salas.length} sala{salas.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="p-5 space-y-4">
              {salas.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">Sin datos para el periodo seleccionado.</p>
              ) : (
                salas.map((s, index) => (
                  <ProgressRow
                    key={s.camara}
                    label={s.camara}
                    value={s.sesiones}
                    max={maxSala}
                    detail={`${formatHoras(s.horas)} acumuladas`}
                    tone={index % 2 === 0 ? "blue" : "emerald"}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}

        {(tipo === "general" || tipo === "sesiones") && (
          <motion.div variants={itemVariants} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <PieChart size={15} className="text-blue-600" />
                Estados
              </h2>
              <span className="text-[11px] text-slate-400">{resumen.sesiones} total</span>
            </div>
            <div className="p-5 space-y-4">
              {estados.map((e, index) => (
                <ProgressRow
                  key={e.estado}
                  label={e.label}
                  value={e.total}
                  max={maxEstado}
                  detail={e.total === 1 ? "1 sesion" : `${e.total} sesiones`}
                  tone={["emerald", "blue", "amber", "indigo"][index]}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {(tipo === "general" || tipo === "sesiones") && (
        <motion.div variants={itemVariants} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <TrendingUp size={15} className="text-blue-600" />
              Actividad docente
            </h2>
            <span className="text-[11px] text-slate-400">{docentes.length} docente{docentes.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {docentes.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8 md:col-span-2">No hay actividad docente registrada.</p>
            ) : (
              docentes.map(d => (
                <ProgressRow
                  key={d.docente}
                  label={d.docente}
                  value={d.sesiones}
                  max={maxDocente}
                  detail={`${d.observaciones} observaciones registradas`}
                  tone="indigo"
                />
              ))
            )}
          </div>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Users size={15} className="text-blue-600" />
            Detalle del reporte
          </h2>
          <span className="text-[11px] text-slate-400">{reportesVisibles.length} registro{reportesVisibles.length !== 1 ? "s" : ""}</span>
        </div>

        {reportesVisibles.length === 0 ? (
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
                  <th className="text-left text-[11px] font-medium text-slate-400 px-4 py-3">Docente</th>
                  <th className="text-left text-[11px] font-medium text-slate-400 px-4 py-3 hidden md:table-cell">Estudiante</th>
                  <th className="text-left text-[11px] font-medium text-slate-400 px-4 py-3">Estado</th>
                  <th className="text-right text-[11px] font-medium text-slate-400 px-5 py-3">Duracion</th>
                </tr>
              </thead>
              <tbody>
                {reportesVisibles.map((r, i) => (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.035 }}
                    className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors last:border-b-0"
                  >
                    <td className="px-5 py-3.5 text-xs text-slate-600">{formatFecha(r.fecha)}</td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700">
                        <Camera size={12} className="text-slate-300" />
                        {r.camara}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">{r.docente}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 hidden md:table-cell">{r.estudiante}</td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border bg-slate-50 text-slate-600 border-slate-200">
                        <CheckCircle2 size={11} />
                        {ESTADO_LABEL[r.estado]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-xs font-semibold text-slate-700">{formatHoras(r.duracion)}</td>
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
