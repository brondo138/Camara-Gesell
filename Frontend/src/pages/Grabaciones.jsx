import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video, Search, Plus, X, Pencil, Trash2, Play,
  MonitorPlay, HardDrive, Film, Calendar, BookOpen,
  Filter, ChevronDown, AlertTriangle, Check, Link2
} from "lucide-react";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const SESIONES_MOCK = [
  { id: 1, nombre: "Sesión 001 — Evaluación inicial", fecha: "2025-05-10" },
  { id: 2, nombre: "Sesión 002 — Terapia cognitiva", fecha: "2025-05-13" },
  { id: 3, nombre: "Sesión 003 — Seguimiento grupal", fecha: "2025-05-17" },
  { id: 4, nombre: "Sesión 004 — Entrevista clínica", fecha: "2025-05-20" },
  { id: 5, nombre: "Sesión 005 — Cierre de caso", fecha: "2025-05-24" },
];

const GRABACIONES_MOCK = [
  {
    id: 1,
    titulo: "Evaluación Inicial — Paciente A",
    sesionId: 1,
    fecha: "2025-05-10",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    subidaPor: "Dr. Martínez",
  },
  {
    id: 2,
    titulo: "Sesión Cognitiva — Registro completo",
    sesionId: 2,
    fecha: "2025-05-13",
    url: "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view",
    subidaPor: "Dra. Rodríguez",
  },
  {
    id: 3,
    titulo: "Observación grupal — Segmento 1",
    sesionId: 3,
    fecha: "2025-05-17",
    url: "https://youtu.be/ScMzIvxBSi4",
    subidaPor: "Dr. López",
  },
  {
    id: 4,
    titulo: "Entrevista clínica — Parte A",
    sesionId: 4,
    fecha: "2025-05-20",
    url: "https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9I0J/view",
    subidaPor: "Dra. García",
  },
  {
    id: 5,
    titulo: "Entrevista clínica — Parte B",
    sesionId: 4,
    fecha: "2025-05-20",
    url: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    subidaPor: "Dra. García",
  },
  {
    id: 6,
    titulo: "Cierre de caso — Resumen final",
    sesionId: 5,
    fecha: "2025-05-24",
    url: "https://vimeo.com/123456789",
    subidaPor: "Dr. Martínez",
  },
];

// ─── UTILIDADES URL ───────────────────────────────────────────────────────────
function detectVideoType(url) {
  if (!url) return "unknown";
  if (/youtube\.com|youtu\.be/.test(url)) return "youtube";
  if (/drive\.google\.com/.test(url)) return "drive";
  if (/vimeo\.com/.test(url)) return "vimeo";
  if (/\.(mp4|webm|ogg)$/i.test(url)) return "direct";
  return "unknown";
}

function getEmbedUrl(url) {
  const type = detectVideoType(url);
  if (type === "youtube") {
    const match = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  }
  if (type === "drive") {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    return match ? `https://drive.google.com/file/d/${match[1]}/preview` : null;
  }
  if (type === "vimeo") {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? `https://player.vimeo.com/video/${match[1]}` : null;
  }
  if (type === "direct") return url;
  return null;
}

const TYPE_META = {
  youtube:  { label: "YouTube",      Icon: MonitorPlay, color: "text-red-500",   bg: "bg-red-50",   border: "border-red-200"  },
  drive:    { label: "Google Drive", Icon: HardDrive,   color: "text-blue-600",  bg: "bg-blue-50",  border: "border-blue-200" },
  vimeo:    { label: "Vimeo",        Icon: Film,        color: "text-sky-500",   bg: "bg-sky-50",   border: "border-sky-200"  },
  direct:   { label: "Video MP4",    Icon: Film,        color: "text-green-600", bg: "bg-green-50", border: "border-green-200"},
  unknown:  { label: "Enlace",       Icon: Link2,       color: "text-gray-500",  bg: "bg-gray-50",  border: "border-gray-200" },
};

// ─── ROL SIMULADO (cambiar para pruebas) ──────────────────────────────────────
const ROL = "admin"; // "admin" | "docente" | "estudiante"

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function Grabaciones() {
  const [grabaciones, setGrabaciones]   = useState(GRABACIONES_MOCK);
  const [busqueda, setBusqueda]         = useState("");
  const [filtroSesion, setFiltroSesion] = useState("");
  const [filtroTipo, setFiltroTipo]     = useState("");
  const [modalVideo, setModalVideo]     = useState(null);   // grabacion obj
  const [modalForm, setModalForm]       = useState(null);   // null | "nueva" | grabacion obj
  const [modalEliminar, setModalEliminar] = useState(null); // grabacion obj
  const [formData, setFormData]         = useState({ titulo: "", sesionId: "", url: "" });
  const [formError, setFormError]       = useState("");

  // ── Filtrado ──────────────────────────────────────────────────────────────
  const grabacionesFiltradas = useMemo(() => {
    return grabaciones.filter((g) => {
      const sesion = SESIONES_MOCK.find((s) => s.id === g.sesionId);
      const matchBusqueda =
        g.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        sesion?.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const matchSesion  = filtroSesion ? g.sesionId === parseInt(filtroSesion) : true;
      const matchTipo    = filtroTipo   ? detectVideoType(g.url) === filtroTipo  : true;
      return matchBusqueda && matchSesion && matchTipo;
    });
  }, [grabaciones, busqueda, filtroSesion, filtroTipo]);

  // ── Form helpers ──────────────────────────────────────────────────────────
  function abrirNueva() {
    setFormData({ titulo: "", sesionId: "", url: "" });
    setFormError("");
    setModalForm("nueva");
  }
  function abrirEditar(g) {
    setFormData({ titulo: g.titulo, sesionId: g.sesionId, url: g.url });
    setFormError("");
    setModalForm(g);
  }
  function guardarGrabacion() {
    if (!formData.titulo.trim()) return setFormError("El título es obligatorio.");
    if (!formData.sesionId)      return setFormError("Selecciona una sesión.");
    if (!formData.url.trim())    return setFormError("La URL es obligatoria.");
    if (detectVideoType(formData.url) === "unknown")
      return setFormError("URL no reconocida. Usa YouTube, Google Drive, Vimeo o un MP4 directo.");

    if (modalForm === "nueva") {
      const nueva = {
        id: Date.now(),
        titulo: formData.titulo,
        sesionId: parseInt(formData.sesionId),
        fecha: new Date().toISOString().slice(0, 10),
        url: formData.url,
        subidaPor: "Admin (tú)",
      };
      setGrabaciones((prev) => [nueva, ...prev]);
    } else {
      setGrabaciones((prev) =>
        prev.map((g) =>
          g.id === modalForm.id
            ? { ...g, titulo: formData.titulo, sesionId: parseInt(formData.sesionId), url: formData.url }
            : g
        )
      );
    }
    setModalForm(null);
  }
  function eliminarGrabacion() {
    setGrabaciones((prev) => prev.filter((g) => g.id !== modalEliminar.id));
    setModalEliminar(null);
  }

  const puedeSubir   = ROL === "admin" || ROL === "docente";
  const puedeEliminar = ROL === "admin";

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ── HEADER ── */}
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
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={abrirNueva}
              className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#16304f] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nueva grabación
            </motion.button>
          )}
        </div>
      </div>

      {/* ── FILTROS ── */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-wrap gap-3">
          {/* Búsqueda */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por título o sesión…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition"
            />
          </div>
          {/* Filtro sesión */}
          <div className="relative">
            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={filtroSesion}
              onChange={(e) => setFiltroSesion(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition cursor-pointer"
            >
              <option value="">Todas las sesiones</option>
              {SESIONES_MOCK.map((s) => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
          {/* Filtro tipo */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition cursor-pointer"
            >
              <option value="">Todos los tipos</option>
              <option value="youtube">YouTube</option>
              <option value="drive">Google Drive</option>
              <option value="vimeo">Vimeo</option>
              <option value="direct">MP4 directo</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ── CARDS GRID ── */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {grabacionesFiltradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Video className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">No se encontraron grabaciones</p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence>
              {grabacionesFiltradas.map((g) => (
                <GrabacionCard
                  key={g.id}
                  grabacion={g}
                  sesion={SESIONES_MOCK.find((s) => s.id === g.sesionId)}
                  puedeSubir={puedeSubir}
                  puedeEliminar={puedeEliminar}
                  onPlay={() => setModalVideo(g)}
                  onEdit={() => abrirEditar(g)}
                  onDelete={() => setModalEliminar(g)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* ── MODAL: REPRODUCTOR ── */}
      <AnimatePresence>
        {modalVideo && (
          <VideoModal
            grabacion={modalVideo}
            sesion={SESIONES_MOCK.find((s) => s.id === modalVideo.sesionId)}
            onClose={() => setModalVideo(null)}
          />
        )}
      </AnimatePresence>

      {/* ── MODAL: FORMULARIO ── */}
      <AnimatePresence>
        {modalForm && (
          <FormModal
            isEdit={modalForm !== "nueva"}
            formData={formData}
            setFormData={setFormData}
            formError={formError}
            onSave={guardarGrabacion}
            onClose={() => setModalForm(null)}
          />
        )}
      </AnimatePresence>

      {/* ── MODAL: CONFIRMAR ELIMINAR ── */}
      <AnimatePresence>
        {modalEliminar && (
          <EliminarModal
            grabacion={modalEliminar}
            onConfirm={eliminarGrabacion}
            onClose={() => setModalEliminar(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── CARD ─────────────────────────────────────────────────────────────────────
function GrabacionCard({ grabacion, sesion, puedeSubir, puedeEliminar, onPlay, onEdit, onDelete }) {
  const tipo = detectVideoType(grabacion.url);
  const meta = TYPE_META[tipo];
  const Icon = meta.Icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.22 }}
      className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-slate-300 transition-all group"
    >
      {/* Thumbnail / play area */}
      <button
        onClick={onPlay}
        className="w-full h-36 bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8e] flex items-center justify-center relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,white,transparent)]" />
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center"
        >
          <Play className="w-6 h-6 text-white fill-white ml-0.5" />
        </motion.div>
        {/* Badge tipo */}
        <span className={`absolute top-3 right-3 flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full ${meta.bg} ${meta.color} ${meta.border} border`}>
          <Icon className="w-3 h-3" />
          {meta.label}
        </span>
      </button>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-slate-800 leading-snug mb-2 line-clamp-2">
          {grabacion.titulo}
        </h3>
        <div className="flex items-start gap-1.5 mb-1">
          <BookOpen className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
          <span className="text-xs text-slate-500 line-clamp-1">{sesion?.nombre ?? "Sesión desconocida"}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="text-xs text-slate-500">
            {new Date(grabacion.fecha + "T00:00:00").toLocaleDateString("es-SV", {
              year: "numeric", month: "long", day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Acciones */}
      {(puedeSubir || puedeEliminar) && (
        <div className="px-4 pb-4 flex items-center gap-2">
          {puedeSubir && (
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#1e3a5f] border border-slate-200 hover:border-[#1e3a5f]/30 rounded-lg px-3 py-1.5 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Editar
            </button>
          )}
          {puedeEliminar && (
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 border border-slate-200 hover:border-red-200 rounded-lg px-3 py-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Eliminar
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ─── MODAL REPRODUCTOR ────────────────────────────────────────────────────────
function VideoModal({ grabacion, sesion, onClose }) {
  const tipo      = detectVideoType(grabacion.url);
  const embedUrl  = getEmbedUrl(grabacion.url);
  const meta      = TYPE_META[tipo];
  const Icon      = meta.Icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.93, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.93, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden"
      >
        {/* Header modal */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full ${meta.bg} ${meta.color} ${meta.border} border flex-shrink-0`}>
              <Icon className="w-3 h-3" />
              {meta.label}
            </span>
            <h2 className="text-sm font-semibold text-slate-800 truncate">{grabacion.titulo}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors ml-2 flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player */}
        <div className="bg-black aspect-video w-full">
          {embedUrl && (tipo === "youtube" || tipo === "drive" || tipo === "vimeo") ? (
            <iframe
              src={embedUrl}
              title={grabacion.titulo}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : tipo === "direct" && embedUrl ? (
            <video src={embedUrl} controls className="w-full h-full" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white/50 gap-3">
              <Film className="w-10 h-10" />
              <p className="text-sm">No se puede previsualizar este enlace</p>
              <a
                href={grabacion.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs underline text-white/70 hover:text-white"
              >
                Abrir en nueva pestaña
              </a>
            </div>
          )}
        </div>

        {/* Metadatos debajo del player */}
        <div className="px-5 py-4 flex flex-wrap gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            {sesion?.nombre ?? "Sesión desconocida"}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(grabacion.fecha + "T00:00:00").toLocaleDateString("es-SV", {
              year: "numeric", month: "long", day: "numeric",
            })}
          </span>
          <span className="flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5" />
            Subida por {grabacion.subidaPor}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── MODAL FORMULARIO ─────────────────────────────────────────────────────────
function FormModal({ isEdit, formData, setFormData, formError, onSave, onClose }) {
  const tipoDetectado = detectVideoType(formData.url);
  const meta = TYPE_META[tipoDetectado];
  const Icon = meta.Icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1e3a5f] flex items-center justify-center">
              <Video className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-base font-semibold text-slate-800">
              {isEdit ? "Editar grabación" : "Nueva grabación"}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Título */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Título</label>
            <input
              type="text"
              placeholder="Ej. Evaluación inicial — Paciente A"
              value={formData.titulo}
              onChange={(e) => setFormData((p) => ({ ...p, titulo: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition"
            />
          </div>

          {/* Sesión */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Sesión asociada</label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={formData.sesionId}
                onChange={(e) => setFormData((p) => ({ ...p, sesionId: e.target.value }))}
                className="w-full appearance-none pl-9 pr-8 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition cursor-pointer"
              >
                <option value="">Seleccionar sesión…</option>
                {SESIONES_MOCK.map((s) => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* URL */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">URL del video</label>
            <div className="relative">
              <input
                type="url"
                placeholder="https://youtube.com/watch?v=… o drive.google.com/…"
                value={formData.url}
                onChange={(e) => setFormData((p) => ({ ...p, url: e.target.value }))}
                className="w-full px-3.5 py-2.5 pr-10 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition"
              />
              {formData.url && (
                <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${meta.color}`}>
                  <Icon className="w-4 h-4" />
                </span>
              )}
            </div>
            {/* Detección en tiempo real */}
            {formData.url && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-1.5 text-[11px] flex items-center gap-1 ${
                  tipoDetectado !== "unknown" ? "text-green-600" : "text-amber-600"
                }`}
              >
                {tipoDetectado !== "unknown" ? (
                  <><Check className="w-3 h-3" /> Detectado: {meta.label}</>
                ) : (
                  <><AlertTriangle className="w-3 h-3" /> Formato no reconocido</>
                )}
              </motion.p>
            )}
          </div>

          {/* Error */}
          <AnimatePresence>
            {formError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5"
              >
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                {formError}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm text-slate-600 hover:text-slate-800 border border-slate-200 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onSave}
            className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium bg-[#1e3a5f] hover:bg-[#16304f] text-white rounded-xl transition-colors"
          >
            <Check className="w-4 h-4" />
            {isEdit ? "Guardar cambios" : "Registrar"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── MODAL CONFIRMAR ELIMINAR ─────────────────────────────────────────────────
function EliminarModal({ grabacion, onConfirm, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
      >
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
          ¿Estás seguro de que deseas eliminar{" "}
          <span className="font-medium text-slate-800">"{grabacion.titulo}"</span>?
        </p>
        <div className="flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm text-slate-600 hover:text-slate-800 border border-slate-200 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onConfirm}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}