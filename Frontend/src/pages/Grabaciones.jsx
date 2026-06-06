import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Video, Search, Plus, Pencil, Trash2, Play,
  MonitorPlay, HardDrive, Film, Calendar, BookOpen,
  Filter, ChevronDown, AlertTriangle, Check, Link2,
  Eye, EyeOff, Tag, X, Loader2, Camera, User, Users
} from "lucide-react"
import { useAuth } from "../hooks/useAuth"
import {
  getGrabaciones, getEtiquetas, createGrabacion,
  updateGrabacion, deleteGrabacion, cambiarVisibilidad
} from "../services/grabacionesService"
import { getSesiones } from "../services/sesionesService"
import { getGrupos } from "../services/gruposService"

// ─── UTILIDADES URL ───────────────────────────────────────────────────────────
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
  youtube: { label: "YouTube",      Icon: MonitorPlay, color: "text-red-500",   bg: "bg-red-50",   border: "border-red-200"   },
  drive:   { label: "Google Drive", Icon: HardDrive,   color: "text-blue-600",  bg: "bg-blue-50",  border: "border-blue-200"  },
  vimeo:   { label: "Vimeo",        Icon: Film,        color: "text-sky-500",   bg: "bg-sky-50",   border: "border-sky-200"   },
  direct:  { label: "Video MP4",    Icon: Film,        color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
  unknown: { label: "Enlace",       Icon: Link2,       color: "text-gray-500",  bg: "bg-gray-50",  border: "border-gray-200"  },
}

const FORM_EMPTY = { id_sesion: "", titulo: "", url_video: "", descripcion: "", visible: true, etiquetas: [] }

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function Grabaciones() {
  const { user }      = useAuth()
  const isAdmin       = user?.rol === "admin"
  const isDocente     = user?.rol === "docente"
  const puedeSubir    = isAdmin || isDocente
  const puedeEliminar = isAdmin

  const [grabaciones, setGrabaciones] = useState([])
  const [sesiones, setSesiones]       = useState([])
  const [etiquetas, setEtiquetas]     = useState([])
  const [grupos, setGrupos]           = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState("")
  const [toasts, setToasts]           = useState([])

  const [busqueda, setBusqueda]                   = useState("")
  const [filtroSesion, setFiltroSesion]           = useState("")
  const [filtroTipo, setFiltroTipo]               = useState("")
  const [filtroFecha, setFiltroFecha]             = useState("")
  const [filtroSala, setFiltroSala]               = useState("")
  const [filtroSolicitante, setFiltroSolicitante] = useState("")
  const [filtroEtiqueta, setFiltroEtiqueta]       = useState("")
  const [filtroGrupo, setFiltroGrupo]             = useState("")
  const [mostrarFiltros, setMostrarFiltros]       = useState(false)

  const [modalVideo, setModalVideo]       = useState(null)
  const [modalForm, setModalForm]         = useState(null)
  const [modalEliminar, setModalEliminar] = useState(null)
  const [formData, setFormData]           = useState(FORM_EMPTY)
  const [formError, setFormError]         = useState("")
  const [formLoading, setFormLoading]     = useState(false)

  useEffect(() => { cargarDatos() }, [])

  async function cargarDatos() {
    setLoading(true); setError("")
    try {
      const [grab, ses, etiq, gruposData] = await Promise.all([
        getGrabaciones(user?.id, user?.id_rol),
        getSesiones(user?.id, user?.id_rol),
        getEtiquetas(),
        getGrupos()
      ])
      setGrabaciones(grab); setSesiones(ses); setEtiquetas(etiq); setGrupos(gruposData)
    } catch (err) {
      setError(err?.response?.data?.message ?? "Error al cargar las grabaciones.")
    } finally { setLoading(false) }
  }

  function addToast(message, type = "success") {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }

  const salas = useMemo(() =>
    [...new Map(grabaciones.map(g => [g.id_camara, g.camara])).entries()]
      .map(([id, nombre]) => ({ id, nombre })), [grabaciones])

  const solicitantes = useMemo(() =>
    [...new Map(grabaciones.map(g => [
      g.id_usuario_solicitante,
      `${g.nombre_solicitante} ${g.apellido_solicitante}`
    ])).entries()].map(([id, nombre]) => ({ id, nombre })), [grabaciones])

  const grabacionesFiltradas = useMemo(() => {
    return grabaciones.filter(g => {
      const matchBusqueda =
        g.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        (g.camara ?? "").toLowerCase().includes(busqueda.toLowerCase()) ||
        `${g.nombre_solicitante} ${g.apellido_solicitante}`.toLowerCase().includes(busqueda.toLowerCase())
      const matchSesion      = filtroSesion      ? g.id_sesion === parseInt(filtroSesion)                   : true
      const matchTipo        = filtroTipo        ? detectVideoType(g.url_video) === filtroTipo              : true
      const matchFecha       = filtroFecha       ? (g.fecha_subida ?? "").slice(0, 10) === filtroFecha      : true
      const matchSala        = filtroSala        ? g.id_camara === parseInt(filtroSala)                     : true
      const matchSolicitante = filtroSolicitante ? g.id_usuario_solicitante === parseInt(filtroSolicitante) : true
      const matchEtiqueta    = filtroEtiqueta
        ? g.etiquetas?.some(e => e.id_etiqueta === parseInt(filtroEtiqueta)) : true
      const matchGrupo       = filtroGrupo       ? g.id_grupo === parseInt(filtroGrupo)                     : true
      return matchBusqueda && matchSesion && matchTipo && matchFecha && matchSala && matchSolicitante && matchEtiqueta && matchGrupo
    })
  }, [grabaciones, busqueda, filtroSesion, filtroTipo, filtroFecha, filtroSala, filtroSolicitante, filtroEtiqueta, filtroGrupo])

  const filtrosActivos = [filtroSesion, filtroTipo, filtroFecha, filtroSala, filtroSolicitante, filtroEtiqueta, filtroGrupo].filter(Boolean).length

  function limpiarFiltros() {
    setFiltroSesion(""); setFiltroTipo(""); setFiltroFecha("")
    setFiltroSala(""); setFiltroSolicitante(""); setFiltroEtiqueta(""); setBusqueda(""); setFiltroGrupo("")
  }

  function abrirNueva() { setFormData(FORM_EMPTY); setFormError(""); setModalForm("nueva") }

  function abrirEditar(g) {
    setFormData({
      id_sesion: g.id_sesion, titulo: g.titulo, url_video: g.url_video,
      descripcion: g.descripcion ?? "", visible: Boolean(g.visible),
      etiquetas: g.etiquetas?.map(e => e.id_etiqueta) ?? []
    })
    setFormError(""); setModalForm(g)
  }

  async function guardarGrabacion() {
    if (!formData.titulo.trim())    return setFormError("El título es obligatorio.")
    if (!formData.id_sesion)        return setFormError("Selecciona una sesión.")
    if (!formData.url_video.trim()) return setFormError("La URL es obligatoria.")
    if (detectVideoType(formData.url_video) === "unknown")
      return setFormError("URL no reconocida. Usa YouTube, Google Drive, Vimeo o un MP4 directo.")
    setFormLoading(true); setFormError("")
    try {
      if (modalForm === "nueva") {
        const nueva = await createGrabacion(formData)
        setGrabaciones(prev => [nueva, ...prev])
        addToast("Grabación registrada correctamente.")
      } else {
        const actualizada = await updateGrabacion(modalForm.id_grabacion, formData)
        setGrabaciones(prev => prev.map(g => g.id_grabacion === actualizada.id_grabacion ? actualizada : g))
        addToast("Grabación actualizada correctamente.")
      }
      setModalForm(null)
    } catch (err) {
      setFormError(err?.response?.data?.message ?? "Error al guardar la grabación.")
    } finally { setFormLoading(false) }
  }

  async function handleToggleVisible(g) {
    try {
      const actualizada = await cambiarVisibilidad(g.id_grabacion, !Boolean(g.visible))
      setGrabaciones(prev => prev.map(x => x.id_grabacion === actualizada.id_grabacion ? actualizada : x))
      addToast(Boolean(g.visible) ? "Grabación ocultada." : "Grabación visible.", "warning")
    } catch (err) {
      addToast(err?.response?.data?.message ?? "Error al cambiar visibilidad.", "error")
    }
  }

  async function handleEliminar() {
    try {
      await deleteGrabacion(modalEliminar.id_grabacion, user?.id, user?.id_rol)
      setGrabaciones(prev => prev.filter(g => g.id_grabacion !== modalEliminar.id_grabacion))
      addToast("Grabación eliminada correctamente.")
      setModalEliminar(null)
    } catch (err) {
      addToast(err?.response?.data?.message ?? "Error al eliminar.", "error")
      setModalEliminar(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1e3a5f] flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-800">Grabaciones</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {grabacionesFiltradas.length} grabación{grabacionesFiltradas.length !== 1 ? "es" : ""}
              </p>
            </div>
          </div>
          {puedeSubir && (
            <motion.button whileTap={{ scale: 0.97 }} onClick={abrirNueva}
              className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#16304f] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
              <Plus className="w-4 h-4" /> Nueva grabación
            </motion.button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Buscar por título, sala o solicitante…"
              value={busqueda} onChange={e => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition" />
          </div>
          <button onClick={() => setMostrarFiltros(v => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm border rounded-xl transition-colors ${mostrarFiltros || filtrosActivos > 0 ? "bg-[#1e3a5f] text-white border-[#1e3a5f]" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}>
            <Filter className="w-4 h-4" /> Filtros
            {filtrosActivos > 0 && (
              <span className="bg-white/20 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{filtrosActivos}</span>
            )}
          </button>
          {filtrosActivos > 0 && (
            <button onClick={limpiarFiltros}
              className="flex items-center gap-1.5 px-3 py-2.5 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 bg-white rounded-xl transition-colors">
              <X className="w-3.5 h-3.5" /> Limpiar
            </button>
          )}
        </div>

        <AnimatePresence>
          {mostrarFiltros && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-3 pt-3 border-t border-slate-200">
                {/* Fecha */}
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input type="date" value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition" />
                </div>
                {/* Sala */}
                <div className="relative">
                  <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <select value={filtroSala} onChange={e => setFiltroSala(e.target.value)}
                    className="w-full appearance-none pl-8 pr-7 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition cursor-pointer">
                    <option value="">Todas las salas</option>
                    {salas.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                </div>
                {/* Solicitante */}
                {(isAdmin || isDocente) && (
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <select value={filtroSolicitante} onChange={e => setFiltroSolicitante(e.target.value)}
                      className="w-full appearance-none pl-8 pr-7 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition cursor-pointer">
                      <option value="">Todos los usuarios</option>
                      {solicitantes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                  </div>
                )}
                {/* Tipo */}
                <div className="relative">
                  <Film className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
                    className="w-full appearance-none pl-8 pr-7 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition cursor-pointer">
                    <option value="">Todos los tipos</option>
                    <option value="youtube">YouTube</option>
                    <option value="drive">Google Drive</option>
                    <option value="vimeo">Vimeo</option>
                    <option value="direct">MP4 directo</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                </div>
                {/* Sesión */}
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <select value={filtroSesion} onChange={e => setFiltroSesion(e.target.value)}
                    className="w-full appearance-none pl-8 pr-7 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition cursor-pointer">
                    <option value="">Todas las sesiones</option>
                    {sesiones.map(s => <option key={s.id_sesion} value={s.id_sesion}>{s.titulo}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                </div>
                {/* Grupo — solo admin */}
                {isAdmin && (
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <select value={filtroGrupo} onChange={e => setFiltroGrupo(e.target.value)}
                      className="w-full appearance-none pl-8 pr-7 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition cursor-pointer">
                      <option value="">Todos los grupos</option>
                      {grupos.map(g => <option key={g.id_grupo} value={g.id_grupo}>{g.nombre}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mini filtros etiquetas */}
        {etiquetas.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {etiquetas.map(e => (
              <button key={e.id_etiqueta}
                onClick={() => setFiltroEtiqueta(filtroEtiqueta === String(e.id_etiqueta) ? "" : String(e.id_etiqueta))}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium border transition-all ${
                  filtroEtiqueta === String(e.id_etiqueta)
                    ? "bg-[#1e3a5f] text-white border-[#1e3a5f]"
                    : "bg-white text-slate-500 border-slate-200 hover:border-[#1e3a5f]/30"
                }`}>
                <Tag className="w-3 h-3" />{e.nombre}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p className="text-sm">Cargando grabaciones…</p>
          </div>
        )}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-sm text-slate-600">{error}</p>
            <button onClick={cargarDatos} className="text-sm text-[#1e3a5f] hover:underline font-medium">Reintentar</button>
          </div>
        )}
        {!loading && !error && grabacionesFiltradas.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Video className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">No se encontraron grabaciones.</p>
          </div>
        )}
        {!loading && !error && grabacionesFiltradas.length > 0 && (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {grabacionesFiltradas.map(g => (
                <GrabacionCard key={g.id_grabacion} grabacion={g}
                  sesion={sesiones.find(s => s.id_sesion === g.id_sesion)}
                  puedeSubir={puedeSubir} puedeEliminar={puedeEliminar} isAdmin={isAdmin}
                  onPlay={() => setModalVideo(g)} onEdit={() => abrirEditar(g)}
                  onDelete={() => setModalEliminar(g)} onToggleVisible={() => handleToggleVisible(g)} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {modalVideo && <VideoModal grabacion={modalVideo} sesion={sesiones.find(s => s.id_sesion === modalVideo.id_sesion)} onClose={() => setModalVideo(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {modalForm && <FormModal isEdit={modalForm !== "nueva"} formData={formData} setFormData={setFormData}
          formError={formError} formLoading={formLoading} sesiones={sesiones} etiquetas={etiquetas}
          onSave={guardarGrabacion} onClose={() => setModalForm(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {modalEliminar && <EliminarModal grabacion={modalEliminar} onConfirm={handleEliminar} onClose={() => setModalEliminar(null)} />}
      </AnimatePresence>

      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => <Toast key={t.id} message={t.message} type={t.type} />)}
        </AnimatePresence>
      </div>
    </div>
  )
}

function GrabacionCard({ grabacion, sesion, puedeSubir, puedeEliminar, isAdmin, onPlay, onEdit, onDelete, onToggleVisible }) {
  const tipo = detectVideoType(grabacion.url_video)
  const meta = TYPE_META[tipo]
  const Icon = meta.Icon
  const activa = Boolean(grabacion.visible)

  return (
    <motion.div layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.22 }}
      className={`bg-white border rounded-2xl overflow-hidden hover:shadow-md transition-all ${activa ? "border-slate-200 hover:border-slate-300" : "border-slate-200 opacity-60"}`}>
      <button onClick={onPlay}
        className="w-full h-36 bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8e] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,white,transparent)]" />
        <motion.div whileHover={{ scale: 1.1 }}
          className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
          <Play className="w-6 h-6 text-white fill-white ml-0.5" />
        </motion.div>
        <span className={`absolute top-3 right-3 flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full ${meta.bg} ${meta.color} ${meta.border} border`}>
          <Icon className="w-3 h-3" />{meta.label}
        </span>
        {!activa && (
          <span className="absolute top-3 left-3 flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full bg-slate-800/70 text-white">
            <EyeOff className="w-3 h-3" /> Oculta
          </span>
        )}
      </button>

      <div className="p-4">
        <h3 className="text-sm font-semibold text-slate-800 leading-snug mb-2 line-clamp-2">{grabacion.titulo}</h3>
        {grabacion.etiquetas?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {grabacion.etiquetas.map(e => (
              <span key={e.id_etiqueta} className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Tag className="w-2.5 h-2.5" />{e.nombre}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-start gap-1.5 mb-1">
          <BookOpen className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
          <span className="text-xs text-slate-500 line-clamp-1">{sesion?.titulo ?? `Sesión #${grabacion.id_sesion}`}</span>
        </div>
        <div className="flex items-center gap-1.5 mb-1">
          <Camera className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="text-xs text-slate-500">{grabacion.camara}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="text-xs text-slate-500">
            {grabacion.fecha_subida ? new Date(grabacion.fecha_subida).toLocaleDateString("es-SV", { year: "numeric", month: "long", day: "numeric" }) : "—"}
          </span>
        </div>
      </div>

      {(puedeSubir || puedeEliminar) && (
        <div className="px-4 pb-4 flex items-center gap-2 flex-wrap">
          {puedeSubir && (
            <button onClick={onEdit} className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#1e3a5f] border border-slate-200 hover:border-[#1e3a5f]/30 rounded-lg px-3 py-1.5 transition-colors">
              <Pencil className="w-3.5 h-3.5" /> Editar
            </button>
          )}
          {isAdmin && (
            <button onClick={onToggleVisible}
              className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-amber-600 border border-slate-200 hover:border-amber-200 rounded-lg px-3 py-1.5 transition-colors">
              {activa ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {activa ? "Ocultar" : "Mostrar"}
            </button>
          )}
          {puedeEliminar && (
            <button onClick={onDelete} className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 border border-slate-200 hover:border-red-200 rounded-lg px-3 py-1.5 transition-colors ml-auto">
              <Trash2 className="w-3.5 h-3.5" /> Eliminar
            </button>
          )}
        </div>
      )}
    </motion.div>
  )
}

function VideoModal({ grabacion, sesion, onClose }) {
  const tipo = detectVideoType(grabacion.url_video)
  const embedUrl = getEmbedUrl(grabacion.url_video)
  const meta = TYPE_META[tipo]
  const Icon = meta.Icon

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.93, opacity: 0 }} transition={{ type: "spring", stiffness: 320, damping: 28 }}
        onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full ${meta.bg} ${meta.color} ${meta.border} border flex-shrink-0`}>
              <Icon className="w-3 h-3" />{meta.label}
            </span>
            <h2 className="text-sm font-semibold text-slate-800 truncate">{grabacion.titulo}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors ml-2 flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="bg-black aspect-video w-full">
          {embedUrl && (tipo === "youtube" || tipo === "drive" || tipo === "vimeo") ? (
            <iframe src={embedUrl} title={grabacion.titulo} className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          ) : tipo === "direct" && embedUrl ? (
            <video src={embedUrl} controls className="w-full h-full" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white/50 gap-3">
              <Film className="w-10 h-10" />
              <p className="text-sm">No se puede previsualizar este enlace</p>
              <a href={grabacion.url_video} target="_blank" rel="noopener noreferrer"
                className="text-xs underline text-white/70 hover:text-white">Abrir en nueva pestaña</a>
            </div>
          )}
        </div>
        <div className="px-5 py-4 flex flex-wrap gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" />{sesion?.titulo ?? `Sesión #${grabacion.id_sesion}`}</span>
          <span className="flex items-center gap-1.5"><Camera className="w-3.5 h-3.5" />{grabacion.camara}</span>
          <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{grabacion.nombre_solicitante} {grabacion.apellido_solicitante}</span>
          {grabacion.etiquetas?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {grabacion.etiquetas.map(e => (
                <span key={e.id_etiqueta} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <Tag className="w-2.5 h-2.5" />{e.nombre}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

function FormModal({ isEdit, formData, setFormData, formError, formLoading, sesiones, etiquetas, onSave, onClose }) {
  const tipoDetectado = detectVideoType(formData.url_video)
  const meta = TYPE_META[tipoDetectado]
  const Icon = meta.Icon

  function toggleEtiqueta(id) {
    setFormData(prev => ({
      ...prev,
      etiquetas: prev.etiquetas.includes(id) ? prev.etiquetas.filter(e => e !== id) : [...prev.etiquetas, id]
    }))
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }} transition={{ type: "spring", stiffness: 340, damping: 30 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1e3a5f] flex items-center justify-center">
              <Video className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-base font-semibold text-slate-800">{isEdit ? "Editar grabación" : "Nueva grabación"}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="px-6 py-5 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Título <span className="text-red-400">*</span></label>
            <input type="text" placeholder="Ej. Evaluación inicial — Paciente A" value={formData.titulo}
              onChange={e => setFormData(p => ({ ...p, titulo: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Sesión asociada <span className="text-red-400">*</span></label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select value={formData.id_sesion} onChange={e => setFormData(p => ({ ...p, id_sesion: e.target.value }))}
                className="w-full appearance-none pl-9 pr-8 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition cursor-pointer">
                <option value="">Seleccionar sesión…</option>
                {sesiones.map(s => <option key={s.id_sesion} value={s.id_sesion}>{s.titulo}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">URL del video <span className="text-red-400">*</span></label>
            <div className="relative">
              <input type="url" placeholder="https://youtube.com/watch?v=… o drive.google.com/…"
                value={formData.url_video} onChange={e => setFormData(p => ({ ...p, url_video: e.target.value }))}
                className="w-full px-3.5 py-2.5 pr-10 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition" />
              {formData.url_video && <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${meta.color}`}><Icon className="w-4 h-4" /></span>}
            </div>
            {formData.url_video && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className={`mt-1.5 text-[11px] flex items-center gap-1 ${tipoDetectado !== "unknown" ? "text-green-600" : "text-amber-600"}`}>
                {tipoDetectado !== "unknown"
                  ? <><Check className="w-3 h-3" />Detectado: {meta.label}</>
                  : <><AlertTriangle className="w-3 h-3" />Formato no reconocido</>}
              </motion.p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Descripción</label>
            <textarea rows={2} placeholder="Descripción opcional…" value={formData.descripcion}
              onChange={e => setFormData(p => ({ ...p, descripcion: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">Etiquetas</label>
            <div className="flex flex-wrap gap-2">
              {etiquetas.map(e => {
                const sel = formData.etiquetas.includes(e.id_etiqueta)
                return (
                  <button key={e.id_etiqueta} type="button" onClick={() => toggleEtiqueta(e.id_etiqueta)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium border transition-all ${
                      sel ? "bg-[#1e3a5f] text-white border-[#1e3a5f]" : "bg-slate-50 text-slate-500 border-slate-200 hover:border-[#1e3a5f]/30"
                    }`}>
                    <Tag className="w-2.5 h-2.5" />{e.nombre}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-xs font-medium text-slate-700">Visible para estudiantes</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{formData.visible ? "La grabación es visible" : "La grabación está oculta"}</p>
            </div>
            <button type="button" onClick={() => setFormData(p => ({ ...p, visible: !p.visible }))}
              className={`relative w-11 h-6 rounded-full transition-colors ${formData.visible ? "bg-[#1e3a5f]" : "bg-slate-200"}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.visible ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>
          <AnimatePresence>
            {formError && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />{formError}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-6 pb-6 pt-2 flex items-center justify-end gap-2.5 flex-shrink-0 border-t border-slate-100">
          <button onClick={onClose} disabled={formLoading}
            className="px-4 py-2.5 text-sm text-slate-600 hover:text-slate-800 border border-slate-200 rounded-xl transition-colors disabled:opacity-50">
            Cancelar
          </button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={onSave} disabled={formLoading}
            className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium bg-[#1e3a5f] hover:bg-[#16304f] text-white rounded-xl transition-colors disabled:opacity-60">
            {formLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Guardando…</> : <><Check className="w-4 h-4" />{isEdit ? "Guardar cambios" : "Registrar"}</>}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function EliminarModal({ grabacion, onConfirm, onClose }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }} transition={{ type: "spring", stiffness: 340, damping: 30 }}
        onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Eliminar grabación</h3>
            <p className="text-xs text-slate-500 mt-0.5">Esta acción no se puede deshacer</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 mb-6">
          ¿Estás seguro de que deseas eliminar <span className="font-medium text-slate-800">"{grabacion.titulo}"</span>?
        </p>
        <div className="flex items-center justify-end gap-2.5">
          <button onClick={onClose} className="px-4 py-2.5 text-sm text-slate-600 hover:text-slate-800 border border-slate-200 rounded-xl transition-colors">Cancelar</button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={onConfirm}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors">
            <Trash2 className="w-4 h-4" /> Eliminar
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function Toast({ message, type }) {
  const styles = { success: "bg-emerald-600", warning: "bg-amber-500", error: "bg-red-500" }
  return (
    <motion.div initial={{ opacity: 0, y: 16, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${styles[type] ?? styles.success}`}>
      {type === "error" && <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
      {type === "success" && <Check className="w-4 h-4 flex-shrink-0" />}
      {type === "warning" && <EyeOff className="w-4 h-4 flex-shrink-0" />}
      {message}
    </motion.div>
  )
}