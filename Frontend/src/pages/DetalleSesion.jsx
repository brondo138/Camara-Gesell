import { useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowLeft, CalendarClock, Camera, CheckCircle2, Clock,
  FileText, MessageSquareText, UserRound, Users, Video, XCircle, X
} from "lucide-react"

const MOCK_SESIONES = [
  {
    id_sesion: 1,
    id_reserva: 2,
    titulo: "Evaluacion psicologica inicial",
    paciente: "Paciente reservado",
    estudiante: "Carlos Rivas",
    docente: "Dra. Morales",
    camara: "Sala B",
    fecha: "2026-05-21",
    hora_inicio: "10:00",
    hora_fin: "12:00",
    estado: "finalizada",
    motivo: "Practica supervisada de entrevista clinica.",
    objetivos: ["Aplicar entrevista inicial", "Registrar conducta observable", "Recibir retroalimentacion docente"],
    observaciones: [
      { autor: "Dra. Morales", tipo: "Docente", texto: "Buen manejo del encuadre inicial y cierre claro de la sesion.", hora: "12:08" },
      { autor: "Carlos Rivas", tipo: "Estudiante", texto: "Pendiente reforzar preguntas de seguimiento en la segunda mitad.", hora: "12:14" },
    ],
    grabaciones: [{ nombre: "Sesion completa", estado: "Disponible", duracion: "01:52:10" }],
  },
  {
    id_sesion: 2,
    id_reserva: 3,
    titulo: "Terapia familiar - caso #12",
    paciente: "Familia asignada",
    estudiante: "Ana Martinez",
    docente: "Dr. Perez",
    camara: "Sala A",
    fecha: "2026-05-22",
    hora_inicio: "14:00",
    hora_fin: "16:00",
    estado: "en_curso",
    motivo: "Seguimiento de dinamica familiar con observacion docente.",
    objetivos: ["Observar interacciones familiares", "Identificar patrones de comunicacion", "Documentar acuerdos terapeuticos"],
    observaciones: [
      { autor: "Dr. Perez", tipo: "Docente", texto: "Registrar momento de escalamiento verbal para analisis posterior.", hora: "14:43" },
      { autor: "Ana Martinez", tipo: "Estudiante", texto: "La familia responde mejor cuando se reformulan acuerdos concretos.", hora: "15:10" },
    ],
    grabaciones: [],
  },
  {
    id_sesion: 3,
    id_reserva: 5,
    titulo: "Evaluacion de competencias clinicas",
    paciente: "Caso simulado",
    estudiante: "Laura Fuentes",
    docente: "Dra. Morales",
    camara: "Sala B",
    fecha: "2026-05-23",
    hora_inicio: "09:00",
    hora_fin: "11:00",
    estado: "programada",
    motivo: "Sesion pendiente de realizacion asociada a reserva aprobada.",
    objetivos: ["Evaluar escucha activa", "Medir manejo de silencios", "Revisar informe posterior"],
    observaciones: [],
    grabaciones: [],
  },
  {
    id_sesion: 4,
    id_reserva: 6,
    titulo: "Seguimiento de caso clinico",
    paciente: "Paciente reservado",
    estudiante: "Mariana Ortiz",
    docente: "Maria Lopez",
    camara: "Sala D",
    fecha: "2026-05-24",
    hora_inicio: "08:00",
    hora_fin: "09:00",
    estado: "programada",
    motivo: "Sesion breve para seguimiento de objetivos terapeuticos.",
    objetivos: ["Revisar avances del caso", "Ajustar plan de seguimiento", "Documentar proxima intervencion"],
    observaciones: [
      { autor: "Maria Lopez", tipo: "Docente", texto: "Revisar notas previas antes de iniciar la sesion.", hora: "07:45" },
    ],
    grabaciones: [],
  },
  {
    id_sesion: 5,
    id_reserva: 7,
    titulo: "Entrevista clinica supervisada",
    paciente: "Paciente reservado",
    estudiante: "Pedro Salinas",
    docente: "Dr. Ruiz",
    camara: "Sala C",
    fecha: "2026-05-25",
    hora_inicio: "15:00",
    hora_fin: "17:00",
    estado: "cancelada",
    motivo: "Cancelada por conflicto de disponibilidad de sala.",
    objetivos: ["Practicar entrevista semiestructurada", "Registrar lenguaje no verbal", "Generar retroalimentacion grupal"],
    observaciones: [],
    grabaciones: [],
  },
]

const ESTADO_CONFIG = {
  programada: { label: "Programada", icon: CalendarClock, cls: "bg-blue-50 text-blue-700 border-blue-200" },
  en_curso: { label: "En curso", icon: Video, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  finalizada: { label: "Finalizada", icon: CheckCircle2, cls: "bg-slate-100 text-slate-700 border-slate-200" },
  cancelada: { label: "Cancelada", icon: XCircle, cls: "bg-red-50 text-red-700 border-red-200" },
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
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.cls}`}>
      <Icon size={12} />
      {cfg.label}
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

export default function DetalleSesion() {
  const { id } = useParams()
  const sesionBase = useMemo(() => MOCK_SESIONES.find(s => String(s.id_sesion) === String(id)), [id])
  const [estadoSesion, setEstadoSesion] = useState(sesionBase?.estado)
  const sesion = sesionBase ? { ...sesionBase, estado: estadoSesion } : null
  const puedeCancelar = sesion?.estado === "programada" || sesion?.estado === "en_curso"

  const handleCancelar = () => {
    const ok = window.confirm(`¿Cancelar la sesion "${sesion.titulo}"? El registro quedara como historial.`)
    if (!ok) return
    setEstadoSesion("cancelada")
  }

  if (!sesion) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
        <Video size={34} className="text-slate-200 mx-auto mb-3" />
        <h1 className="text-lg font-semibold text-slate-800">Sesion no encontrada</h1>
        <p className="text-sm text-slate-400 mt-1">No existe una sesion con el ID {id} en los datos actuales.</p>
        <Link to="/sesiones" className="inline-flex items-center gap-2 mt-5 h-9 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold transition-colors">
          <ArrowLeft size={15} />
          Volver a sesiones
        </Link>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <Link to="/sesiones" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-600 font-medium mb-3">
            <ArrowLeft size={14} />
            Sesiones
          </Link>
          <h1 className="text-xl font-semibold text-slate-800 leading-tight">{sesion.titulo}</h1>
          <p className="text-sm text-slate-400 mt-0.5">Reserva #{sesion.id_reserva} · {sesion.motivo}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {puedeCancelar && (
            <button
              type="button"
              onClick={handleCancelar}
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition-colors"
            >
              <X size={14} /> Cancelar sesion
            </button>
          )}
          <EstadoBadge estado={sesion.estado} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <InfoItem icon={Camera} label="Sala" value={sesion.camara} />
        <InfoItem icon={CalendarClock} label="Fecha" value={formatFecha(sesion.fecha)} />
        <InfoItem icon={Clock} label="Horario" value={`${sesion.hora_inicio} - ${sesion.hora_fin}`} />
        <InfoItem icon={Users} label="Paciente" value={sesion.paciente} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <FileText size={15} className="text-blue-600" />
            <h2 className="text-sm font-semibold text-slate-800">Objetivos de la sesion</h2>
          </div>
          <div className="p-5 space-y-3">
            {sesion.objetivos.map((objetivo, index) => (
              <div key={objetivo} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
                  {index + 1}
                </span>
                <p className="text-sm text-slate-600 leading-relaxed">{objetivo}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <UserRound size={15} className="text-blue-600" />
            <h2 className="text-sm font-semibold text-slate-800">Participantes</h2>
          </div>
          <div className="p-5 space-y-3">
            <div>
              <p className="text-[11px] text-slate-400 mb-1">Docente responsable</p>
              <p className="text-sm font-semibold text-slate-800">{sesion.docente}</p>
            </div>
            <div className="border-t border-slate-100 pt-3">
              <p className="text-[11px] text-slate-400 mb-1">Estudiante asignado</p>
              <p className="text-sm font-semibold text-slate-800">{sesion.estudiante}</p>
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <MessageSquareText size={15} className="text-blue-600" />
              Observaciones
            </h2>
            <span className="text-[11px] text-slate-400">{sesion.observaciones.length} registro{sesion.observaciones.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="p-5 space-y-3">
            {sesion.observaciones.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">Aun no hay observaciones vinculadas.</p>
            ) : (
              sesion.observaciones.map(obs => (
                <div key={`${obs.autor}-${obs.hora}`} className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="text-sm font-semibold text-slate-800">{obs.autor}</p>
                    <span className="text-[11px] text-slate-400">{obs.hora}</span>
                  </div>
                  <p className="text-[11px] text-blue-600 font-medium mb-2">{obs.tipo}</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{obs.texto}</p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Video size={15} className="text-blue-600" />
              Grabaciones
            </h2>
            <span className="text-[11px] text-slate-400">{sesion.grabaciones.length} archivo{sesion.grabaciones.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="p-5 space-y-3">
            {sesion.grabaciones.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">Sin grabaciones registradas para esta sesion.</p>
            ) : (
              sesion.grabaciones.map(grabacion => (
                <div key={grabacion.nombre} className="rounded-xl bg-slate-50 border border-slate-100 p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{grabacion.nombre}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{grabacion.duracion} · {grabacion.estado}</p>
                  </div>
                  <Video size={18} className="text-slate-300 shrink-0" />
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </motion.div>
  )
}
