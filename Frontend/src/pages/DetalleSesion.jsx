import { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft, CalendarClock, Camera, CheckCircle2, Clock,
  FileText, MessageSquareText, UserRound, Video, XCircle,
  Loader2, AlertTriangle, Plus, Edit3, Trash2, X, Check,
  Send, Play, Eye, EyeOff, Tag, ChevronDown, Film, Users
} from "lucide-react"
import { useAuth } from "../hooks/useAuth"
import { getSesionById } from "../services/sesionesService"
import { 
  getObservacionesBySesion, 
  createObservacion, 
  updateObservacion, 
  deleteObservacion 
} from "../services/observacionesService"
import { 
  getGrabacionesPorSesion, 
  createGrabacion, 
  updateGrabacion, 
  deleteGrabacion, 
  cambiarVisibilidad,
  getEtiquetas
} from "../services/grabacionesService"

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

function formatFechaHora(iso) {
  if (!iso) return "—"
  const fecha = new Date(iso)
  return fecha.toLocaleDateString("es-SV", { 
    day: "2-digit", 
    month: "2-digit", 
    hour: "2-digit", 
    minute: "2-digit" 
  })
}

function detectVideoType(url) {
  if (!url) return "unknown"
  if (/youtube\.com|youtu\.be/.test(url))  return "youtube"
  if (/drive\.google\.com/.test(url))      return "drive"
  if (/vimeo\.com/.test(url))              return "vimeo"
  if (/\.(mp4|webm|ogg)$/i.test(url))      return "direct"
  return "unknown"
}

function getEmbedUrl(url) {
  const type = detectVideoType(url)
  if (type === "youtube") {
    const m = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)
    return m ? `https://www.youtube.com/embed/${m[1]}` : null
  }
  if (type === "drive") {
    const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
    return m ? `https://drive.google.com/file/d/${m[1]}/preview` : null
  }
  if (type === "vimeo") {
    const m = url.match(/vimeo\.com\/(\d+)/)
    return m ? `https://player.vimeo.com/video/${m[1]}` : null
  }
  if (type === "direct") return url
  return null
}

const TYPE_META = {
  youtube: { label: "YouTube",      Icon: Play, color: "text-red-500",   bg: "bg-red-50",   border: "border-red-200"   },
  drive:   { label: "Google Drive", Icon: Film, color: "text-blue-600",  bg: "bg-blue-50",  border: "border-blue-200"  },
  vimeo:   { label: "Vimeo",        Icon: Film, color: "text-sky-500",   bg: "bg-sky-50",   border: "border-sky-200"   },
  direct:  { label: "Video MP4",    Icon: Film, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
  unknown: { label: "Enlace",       Icon: Film, color: "text-gray-500",  bg: "bg-gray-50",  border: "border-gray-200"  },
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

// ─── COMPONENTE DE OBSERVACIÓN ────────────────────────────────────────────────
function ObservacionItem({ observacion, currentUserId, isAdmin, onEdit, onDelete }) {
  const [showActions, setShowActions] = useState(false)
  const isAuthor = observacion.id_usuario === currentUserId
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-slate-50 rounded-xl p-4 border border-slate-100"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
              {observacion.nombre_usuario?.[0] || observacion.nombre?.[0] || "U"}
            </div>
            <span className="text-xs font-semibold text-slate-800">
              {observacion.nombre_usuario || observacion.nombre} {observacion.apellido_usuario || ""}
            </span>
            <span className="text-[10px] text-slate-400">
              {observacion.rol_usuario || observacion.rol_sistema}
            </span>
            <span className="text-[10px] text-slate-400">
              • {formatFechaHora(observacion.fecha_observacion)}
            </span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
            {observacion.observacion}
          </p>
        </div>
        
        {(isAdmin || isAuthor) && showActions && (
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => onEdit(observacion)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Editar">
              <Edit3 size={14} />
            </button>
            <button onClick={() => onDelete(observacion)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Eliminar">
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── COMPONENTE DE GRABACIÓN SIMPLE ───────────────────────────────────────────
function GrabacionCardSimple({ grabacion, currentUserId, isAdmin, onPlay, onEdit, onDelete, onToggleVisible }) {
  const [showActions, setShowActions] = useState(false)
  const isAuthor = grabacion.id_usuario_subio === currentUserId
  const tipo = detectVideoType(grabacion.url_video)
  const meta = TYPE_META[tipo]
  const Icon = meta.Icon
  const visible = Boolean(grabacion.visible)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`bg-slate-50 rounded-xl p-3 border ${visible ? "border-slate-100" : "border-amber-100 opacity-70"}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start gap-3">
        <button onClick={onPlay} className="w-12 h-12 rounded-xl bg-[#1e3a5f] flex items-center justify-center shrink-0 hover:bg-[#16304f] transition-colors">
          <Play className="w-5 h-5 text-white" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-semibold text-slate-800 truncate">{grabacion.titulo}</h4>
            <span className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${meta.bg} ${meta.color} ${meta.border} border`}>
              <Icon className="w-2.5 h-2.5" />{meta.label}
            </span>
            {!visible && (
              <span className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                <EyeOff className="w-2.5 h-2.5" /> Oculta
              </span>
            )}
          </div>
          {grabacion.etiquetas?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {grabacion.etiquetas.map(e => (
                <span key={e.id_etiqueta} className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">
                  {e.nombre}
                </span>
              ))}
            </div>
          )}
          <p className="text-[11px] text-slate-400 mt-1">{new Date(grabacion.fecha_subida).toLocaleDateString("es-SV")}</p>
        </div>
        {(isAdmin || isAuthor) && showActions && (
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={onEdit} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Editar">
              <Edit3 size={13} />
            </button>
            {isAdmin && (
              <button onClick={onToggleVisible} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors" title={visible ? "Ocultar" : "Mostrar"}>
                {visible ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            )}
            <button onClick={onDelete} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Eliminar">
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── MODAL PARA OBSERVACIONES ─────────────────────────────────────────────────
function ObservacionModal({ isOpen, observacion, onClose, onSave, isSaving }) {
  const [texto, setTexto] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (isOpen) {
      setTexto(observacion?.observacion || "")
      setError("")
    }
  }, [isOpen, observacion])

  const handleSubmit = () => {
    if (!texto.trim()) {
      setError("La observación no puede estar vacía")
      return
    }
    if (texto.trim().length < 5) {
      setError("La observación debe tener al menos 5 caracteres")
      return
    }
    onSave(texto.trim())
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }} transition={{ duration: 0.2 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <MessageSquareText size={15} className="text-blue-600" />
            </div>
            <h2 className="text-sm font-semibold text-slate-800">
              {observacion ? "Editar observación" : "Nueva observación"}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          <label className="block text-xs font-medium text-slate-600 mb-2">Observación</label>
          <textarea value={texto} onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribe tu observación sobre esta sesión..." rows={5}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition resize-none" />
          {error && <p className="text-xs text-red-500 mt-2 flex items-center gap-1"><AlertTriangle size={12} /> {error}</p>}
        </div>

        <div className="px-6 pb-6 flex items-center justify-end gap-2.5">
          <button onClick={onClose} disabled={isSaving} className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50">Cancelar</button>
          <button onClick={handleSubmit} disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-700 hover:bg-blue-800 text-white rounded-xl">
            {isSaving ? <><Loader2 size={16} className="animate-spin" /> Guardando...</> : <><Send size={16} /> {observacion ? "Guardar cambios" : "Crear"}</>}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── MODAL PARA GRABACIONES ───────────────────────────────────────────────────
function GrabacionModal({ isOpen, grabacion, sesionId, onClose, onSave, isSaving, etiquetas }) {
  const [formData, setFormData] = useState({
    titulo: "",
    url_video: "",
    descripcion: "",
    visible: true,
    etiquetas: []
  })
  const [error, setError] = useState("")
  const tipoDetectado = detectVideoType(formData.url_video)
  const meta = TYPE_META[tipoDetectado]
  const Icon = meta.Icon

  useEffect(() => {
    if (isOpen) {
      if (grabacion) {
        setFormData({
          titulo: grabacion.titulo,
          url_video: grabacion.url_video,
          descripcion: grabacion.descripcion || "",
          visible: Boolean(grabacion.visible),
          etiquetas: grabacion.etiquetas?.map(e => e.id_etiqueta) || []
        })
      } else {
        setFormData({ titulo: "", url_video: "", descripcion: "", visible: true, etiquetas: [] })
      }
      setError("")
    }
  }, [isOpen, grabacion])

  function toggleEtiqueta(id) {
    setFormData(prev => ({
      ...prev,
      etiquetas: prev.etiquetas.includes(id) ? prev.etiquetas.filter(e => e !== id) : [...prev.etiquetas, id]
    }))
  }

  const handleSubmit = () => {
    if (!formData.titulo.trim()) {
      setError("El título es obligatorio")
      return
    }
    if (!formData.url_video.trim()) {
      setError("La URL del video es obligatoria")
      return
    }
    if (detectVideoType(formData.url_video) === "unknown") {
      setError("URL no reconocida. Usa YouTube, Google Drive, Vimeo o un MP4 directo.")
      return
    }
    onSave({ ...formData, id_sesion: sesionId })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }} transition={{ duration: 0.2 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Video size={15} className="text-blue-600" />
            </div>
            <h2 className="text-sm font-semibold text-slate-800">
              {grabacion ? "Editar grabación" : "Subir grabación"}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Título <span className="text-red-400">*</span></label>
            <input type="text" value={formData.titulo} onChange={e => setFormData(p => ({ ...p, titulo: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">URL del video <span className="text-red-400">*</span></label>
            <div className="relative">
              <input type="url" value={formData.url_video} onChange={e => setFormData(p => ({ ...p, url_video: e.target.value }))}
                placeholder="https://youtube.com/watch?v=... o drive.google.com/..."
                className="w-full px-3.5 py-2.5 pr-10 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              {formData.url_video && <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${meta?.color || "text-gray-400"}`}><Icon className="w-4 h-4" /></span>}
            </div>
            {formData.url_video && tipoDetectado !== "unknown" && (
              <p className="mt-1.5 text-[11px] text-green-600 flex items-center gap-1"><Check className="w-3 h-3" />Detectado: {meta?.label}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Descripción</label>
            <textarea rows={2} value={formData.descripcion} onChange={e => setFormData(p => ({ ...p, descripcion: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" />
          </div>
          {etiquetas.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-2">Etiquetas</label>
              <div className="flex flex-wrap gap-2">
                {etiquetas.map(e => {
                  const sel = formData.etiquetas.includes(e.id_etiqueta)
                  return (
                    <button key={e.id_etiqueta} type="button" onClick={() => toggleEtiqueta(e.id_etiqueta)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium border transition-all ${
                        sel ? "bg-[#1e3a5f] text-white border-[#1e3a5f]" : "bg-slate-50 text-slate-500 border-slate-200"
                      }`}>
                      <Tag className="w-2.5 h-2.5" />{e.nombre}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-xs font-medium text-slate-700">Visible para estudiantes</p>
              <p className="text-[11px] text-slate-400">{formData.visible ? "La grabación es visible" : "La grabación está oculta"}</p>
            </div>
            <button type="button" onClick={() => setFormData(p => ({ ...p, visible: !p.visible }))}
              className={`relative w-11 h-6 rounded-full transition-colors ${formData.visible ? "bg-[#1e3a5f]" : "bg-slate-200"}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.visible ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>
          {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle size={12} /> {error}</p>}
        </div>

        <div className="px-6 pb-6 pt-2 flex items-center justify-end gap-2.5 flex-shrink-0 border-t border-slate-100">
          <button onClick={onClose} disabled={isSaving} className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl">Cancelar</button>
          <button onClick={handleSubmit} disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-700 hover:bg-blue-800 text-white rounded-xl">
            {isSaving ? <><Loader2 size={16} className="animate-spin" /> Guardando...</> : <><Check size={16} /> {grabacion ? "Guardar" : "Subir"}</>}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── MODAL PARA VER VIDEO ─────────────────────────────────────────────────────
function VideoModal({ grabacion, onClose }) {
  const tipo = detectVideoType(grabacion.url_video)
  const embedUrl = getEmbedUrl(grabacion.url_video)
  const meta = TYPE_META[tipo]
  const Icon = meta.Icon

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
        onClick={onClose}
      />
      <motion.div 
        initial={{ scale: 0.93, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.93, opacity: 0 }} 
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden"
        style={{ zIndex: 1 }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full ${meta.bg} ${meta.color} ${meta.border} border`}>
              <Icon className="w-3 h-3" />{meta.label}
            </span>
            <h2 className="text-sm font-semibold text-slate-800 truncate">{grabacion.titulo}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>
        <div className="bg-black aspect-video w-full">
          {embedUrl && (tipo === "youtube" || tipo === "drive" || tipo === "vimeo") ? (
            <iframe 
              src={embedUrl} 
              title={grabacion.titulo} 
              className="w-full h-full" 
              allowFullScreen 
            />
          ) : tipo === "direct" && embedUrl ? (
            <video 
              src={embedUrl} 
              controls 
              className="w-full h-full" 
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white/50 gap-3">
              <Film className="w-10 h-10" />
              <p className="text-sm">No se puede previsualizar este enlace</p>
              <a 
                href={grabacion.url_video} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs underline"
              >
                Abrir en nueva pestaña
              </a>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function DetalleSesion() {
  const { user } = useAuth()
  const { id } = useParams()
  const isAdmin = user?.rol === "admin"
  const puedeSubir = isAdmin || user?.rol === "docente"

  const [sesion, setSesion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  
  // Estados para observaciones
  const [observaciones, setObservaciones] = useState([])
  const [observacionesLoading, setObservacionesLoading] = useState(true)
  const [modalObservacion, setModalObservacion] = useState(null)
  const [savingObservacion, setSavingObservacion] = useState(false)

  // Estados para grabaciones
  const [grabaciones, setGrabaciones] = useState([])
  const [grabacionesLoading, setGrabacionesLoading] = useState(true)
  const [modalGrabacionVideo, setModalGrabacionVideo] = useState(null)
  const [modalFormGrabacion, setModalFormGrabacion] = useState(null)
  const [grabacionAEliminar, setGrabacionAEliminar] = useState(null)
  const [savingGrabacion, setSavingGrabacion] = useState(false)
  const [etiquetas, setEtiquetas] = useState([])

  const [toasts, setToasts] = useState([])

  useEffect(() => {
    if (id) {
      cargarDatos()
      cargarGrabaciones()
      cargarEtiquetas()
    }
  }, [id])

  async function cargarDatos() {
    setLoading(true)
    setError("")
    try {
      const sesionData = await getSesionById(id)
      setSesion(sesionData)
      
      // Cargar observaciones
      try {
        const observacionesData = await getObservacionesBySesion(id, user?.id, user?.id_rol)
        setObservaciones(observacionesData || [])
      } catch (obsErr) {
        console.warn("Error cargando observaciones:", obsErr)
        setObservaciones([])
      } finally {
        setObservacionesLoading(false)
      }
    } catch (err) {
      setError(err?.response?.data?.message ?? "Error al cargar los datos.")
    } finally {
      setLoading(false)
    }
  }

  async function cargarGrabaciones() {
    setGrabacionesLoading(true)
    try {
      const data = await getGrabacionesPorSesion(id, user?.id, user?.id_rol)
      setGrabaciones(data || [])
    } catch (err) {
      console.error("Error cargando grabaciones:", err)
      setGrabaciones([])
    } finally {
      setGrabacionesLoading(false)
    }
  }

  async function cargarEtiquetas() {
    try {
      const data = await getEtiquetas()
      setEtiquetas(data || [])
    } catch (err) {
      console.error("Error cargando etiquetas:", err)
      setEtiquetas([])
    }
  }

  function addToast(message, type = "success") {
    const idToast = Date.now()
    setToasts(prev => [...prev, { id: idToast, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== idToast)), 3500)
  }

  // ── CRUD Observaciones ─────────────────────────────────────────────────────
  async function handleCreateObservacion(texto) {
    setSavingObservacion(true)
    try {
      const nueva = await createObservacion({
        id_sesion: parseInt(id),
        id_usuario: user?.id,
        id_rol: user?.id_rol,
        observacion: texto
      })
      setObservaciones(prev => [nueva, ...prev])
      addToast("Observación creada correctamente.")
      setModalObservacion(null)
    } catch (err) {
      addToast(err?.response?.data?.message ?? "Error al crear la observación.", "error")
    } finally {
      setSavingObservacion(false)
    }
  }

  async function handleUpdateObservacion(texto) {
    setSavingObservacion(true)
    try {
      const actualizada = await updateObservacion(
        modalObservacion.id_observacion,
        user?.id,
        user?.id_rol,
        texto
      )
      setObservaciones(prev => prev.map(o => o.id_observacion === actualizada.id_observacion ? actualizada : o))
      addToast("Observación actualizada correctamente.")
      setModalObservacion(null)
    } catch (err) {
      addToast(err?.response?.data?.message ?? "Error al actualizar la observación.", "error")
    } finally {
      setSavingObservacion(false)
    }
  }

  async function handleDeleteObservacion(observacion) {
    if (!confirm("¿Eliminar esta observación?")) return
    try {
      await deleteObservacion(observacion.id_observacion, user?.id, user?.id_rol)
      setObservaciones(prev => prev.filter(o => o.id_observacion !== observacion.id_observacion))
      addToast("Observación eliminada correctamente.", "warning")
    } catch (err) {
      addToast(err?.response?.data?.message ?? "Error al eliminar la observación.", "error")
    }
  }

  // ── CRUD Grabaciones ──────────────────────────────────────────────────────
  async function handleCreateGrabacion(data) {
    setSavingGrabacion(true)
    try {
      const nueva = await createGrabacion({
        ...data,
        id_usuario_subio: user?.id,
        id_rol: user?.id_rol
      })
      setGrabaciones(prev => [nueva, ...prev])
      addToast("Grabación subida correctamente.")
      setModalFormGrabacion(null)
    } catch (err) {
      addToast(err?.response?.data?.message ?? "Error al subir la grabación.", "error")
    } finally {
      setSavingGrabacion(false)
    }
  }

  async function handleUpdateGrabacion(data) {
    setSavingGrabacion(true)
    try {
      const actualizada = await updateGrabacion(modalFormGrabacion.id_grabacion, {
        ...data,
        id_usuario: user?.id,
        id_rol: user?.id_rol
      })
      setGrabaciones(prev => prev.map(g => g.id_grabacion === actualizada.id_grabacion ? actualizada : g))
      addToast("Grabación actualizada correctamente.")
      setModalFormGrabacion(null)
    } catch (err) {
      addToast(err?.response?.data?.message ?? "Error al actualizar la grabación.", "error")
    } finally {
      setSavingGrabacion(false)
    }
  }

  async function handleDeleteGrabacion() {
    try {
      await deleteGrabacion(grabacionAEliminar.id_grabacion, user?.id, user?.id_rol)
      setGrabaciones(prev => prev.filter(g => g.id_grabacion !== grabacionAEliminar.id_grabacion))
      addToast("Grabación eliminada correctamente.", "warning")
      setGrabacionAEliminar(null)
    } catch (err) {
      addToast(err?.response?.data?.message ?? "Error al eliminar la grabación.", "error")
    }
  }

  async function handleToggleVisible(grabacion) {
    try {
      const actualizada = await cambiarVisibilidad(grabacion.id_grabacion, !Boolean(grabacion.visible), user?.id, user?.id_rol)
      setGrabaciones(prev => prev.map(g => g.id_grabacion === actualizada.id_grabacion ? actualizada : g))
      addToast(Boolean(grabacion.visible) ? "Grabación ocultada." : "Grabación visible.", "warning")
    } catch (err) {
      addToast(err?.response?.data?.message ?? "Error al cambiar visibilidad.", "error")
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-3" />
        <p className="text-sm">Cargando sesión…</p>
      </div>
    )
  }

  if (error || !sesion) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <h1 className="text-lg font-semibold text-slate-800">Sesión no encontrada</h1>
        <p className="text-sm text-slate-400 mt-1">{error || `No existe una sesión con el ID ${id}.`}</p>
        <div className="flex items-center justify-center gap-3 mt-5">
          <button onClick={cargarDatos} className="h-9 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm text-slate-600 font-medium">Reintentar</button>
          <Link to="/sesiones" className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold">Volver a sesiones</Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <Link to="/sesiones" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-600 font-medium mb-3">
              <ArrowLeft size={14} /> Sesiones
            </Link>
            <h1 className="text-xl font-semibold text-slate-800 leading-tight">{sesion.titulo}</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Reserva #{sesion.id_reserva} · {sesion.tipo_sesion}
            </p>
          </div>
          <EstadoBadge estado={sesion.estado} />
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <InfoItem icon={Camera} label="Sala" value={sesion.camara} />
          <InfoItem icon={CalendarClock} label="Fecha" value={formatFecha(sesion.fecha_realizacion)} />
          <InfoItem icon={Clock} label="Horario" value={`${formatHora(sesion.hora_inicio)} – ${formatHora(sesion.hora_fin)}`} />
          <InfoItem icon={UserRound} label="Tipo" value={sesion.tipo_sesion} />
        </div>

        {/* Descripción y Solicitante */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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

          <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <UserRound size={15} className="text-blue-600" />
              <h2 className="text-sm font-semibold text-slate-800">Solicitante</h2>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <p className="text-[11px] text-slate-400 mb-1">Nombre</p>
                <p className="text-sm font-semibold text-slate-800">{sesion.nombre_solicitante} {sesion.apellido_solicitante}</p>
              </div>
              <div className="border-t border-slate-100 pt-3">
                <p className="text-[11px] text-slate-400 mb-1">Rol</p>
                <p className="text-sm font-semibold text-slate-800 capitalize">{sesion.rol_solicitante}</p>
              </div>
              <div className="border-t border-slate-100 pt-3">
                <p className="text-[11px] text-slate-400 mb-1">Grupo</p>
                <p className="text-sm font-semibold text-slate-800">{sesion.grupo || "—"}</p>
              </div>
            </div>
          </section>
        </div>

        {/* Observaciones y Grabaciones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Observaciones */}
          <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquareText size={15} className="text-blue-600" />
                <h2 className="text-sm font-semibold text-slate-800">Observaciones</h2>
                <span className="text-[11px] text-slate-400">{observaciones.length}</span>
              </div>
              {sesion.estado !== "Cancelada" && (
                <button onClick={() => setModalObservacion({})} className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-lg">
                  <Plus size={12} /> Nueva
                </button>
              )}
            </div>
            <div className="p-5">
              {observacionesLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
              ) : observaciones.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquareText size={32} className="text-slate-200 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No hay observaciones para esta sesión.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  <AnimatePresence>
                    {observaciones.map(obs => (
                      <ObservacionItem key={obs.id_observacion} observacion={obs} currentUserId={user?.id} isAdmin={isAdmin}
                        onEdit={() => setModalObservacion({ editing: obs })} onDelete={() => handleDeleteObservacion(obs)} />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </section>

          {/* Grabaciones */}
          <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video size={15} className="text-blue-600" />
                <h2 className="text-sm font-semibold text-slate-800">Grabaciones</h2>
                <span className="text-[11px] text-slate-400">{grabaciones.length}</span>
              </div>
              {puedeSubir && sesion.estado !== "Cancelada" && (
                <button onClick={() => setModalFormGrabacion({})} className="flex items-center gap-1 text-xs bg-[#1e3a5f] hover:bg-[#16304f] text-white px-2.5 py-1.5 rounded-lg">
                  <Plus size={12} /> Subir
                </button>
              )}
            </div>
            <div className="p-5">
              {grabacionesLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
              ) : grabaciones.length === 0 ? (
                <div className="text-center py-8">
                  <Video size={32} className="text-slate-200 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No hay grabaciones para esta sesión.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  <AnimatePresence>
                    {grabaciones.map(g => (
                      <GrabacionCardSimple key={g.id_grabacion} grabacion={g} currentUserId={user?.id} isAdmin={isAdmin}
                        onPlay={() => setModalGrabacionVideo(g)} onEdit={() => setModalFormGrabacion({ editing: g })}
                        onDelete={() => setGrabacionAEliminar(g)} onToggleVisible={() => handleToggleVisible(g)} />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </section>
        </div>
      </motion.div>

      {/* Modales */}
      <AnimatePresence>
        {modalObservacion && (
          <ObservacionModal isOpen={!!modalObservacion} observacion={modalObservacion.editing || null}
            onClose={() => setModalObservacion(null)} onSave={modalObservacion.editing ? handleUpdateObservacion : handleCreateObservacion}
            isSaving={savingObservacion} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalFormGrabacion && (
          <GrabacionModal isOpen={!!modalFormGrabacion} grabacion={modalFormGrabacion.editing || null} sesionId={parseInt(id)}
            onClose={() => setModalFormGrabacion(null)} onSave={modalFormGrabacion.editing ? handleUpdateGrabacion : handleCreateGrabacion}
            isSaving={savingGrabacion} etiquetas={etiquetas} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalGrabacionVideo && (
          <VideoModal grabacion={modalGrabacionVideo} onClose={() => setModalGrabacionVideo(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {grabacionAEliminar && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setGrabacionAEliminar(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">Eliminar grabación</h3>
                  <p className="text-xs text-slate-500">Esta acción no se puede deshacer</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-6">¿Eliminar <span className="font-medium">"{grabacionAEliminar.titulo}"</span>?</p>
              <div className="flex justify-end gap-2.5">
                <button onClick={() => setGrabacionAEliminar(null)} className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl">Cancelar</button>
                <button onClick={handleDeleteGrabacion} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-xl">
                  <Trash2 className="w-4 h-4" /> Eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => {
            const styles = { success: "bg-emerald-600", warning: "bg-amber-500", error: "bg-red-500" }
            return (
              <motion.div key={t.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${styles[t.type] || styles.success}`}>
                {t.type === "error" && <AlertTriangle className="w-4 h-4" />}
                {t.type === "success" && <Check className="w-4 h-4" />}
                {t.type === "warning" && <AlertTriangle className="w-4 h-4" />}
                {t.message}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </>
  )
}