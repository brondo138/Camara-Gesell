import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  User, Mail, Lock, Edit2, Save, X,
  CheckCircle2, AlertCircle, Eye, EyeOff,
  ShieldCheck, Camera, KeyRound
} from "lucide-react"
import { useAuth } from "../hooks/useAuth"

// ─── Animaciones ──────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

const itemVariants = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ROL_CONFIG = {
  admin:      { label: "Administrador", color: "bg-blue-50 text-blue-700 border-blue-200"       },
  docente:    { label: "Docente",       color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  estudiante: { label: "Practicante",   color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
}

function RolBadge({ rol }) {
  const cfg = ROL_CONFIG[rol] ?? { label: rol, color: "bg-slate-100 text-slate-600 border-slate-200" }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
      <ShieldCheck size={12} />
      {cfg.label}
    </span>
  )
}

function InputField({ id, label, type = "text", value, onChange, disabled, icon: Icon, rightElement, error, placeholder }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-slate-500">{label}</label>
      <div className="relative flex items-center">
        {Icon && (
          <span className="absolute left-3 text-slate-400 pointer-events-none">
            <Icon size={15} />
          </span>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`
            w-full h-10 rounded-xl border text-sm transition-all
            ${Icon ? "pl-9" : "pl-3"} ${rightElement ? "pr-10" : "pr-3"}
            ${disabled
              ? "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed"
              : error
                ? "bg-red-50 border-red-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
                : "bg-slate-50 border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            }
          `}
        />
        {rightElement && (
          <span className="absolute right-3">{rightElement}</span>
        )}
      </div>
      {error && (
        <p className="text-[11px] text-red-500 flex items-center gap-1">
          <AlertCircle size={11} />{error}
        </p>
      )}
    </div>
  )
}

// ─── Toast de feedback ────────────────────────────────────────────────────────

function Toast({ message, type }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      exit={{    opacity: 0, y: 16, scale: 0.96 }}
      transition={{ duration: 0.22 }}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5
        px-4 py-3 rounded-xl shadow-lg border text-sm font-medium
        ${type === "success"
          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
          : "bg-red-50 border-red-200 text-red-800"
        }`}
    >
      {type === "success"
        ? <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
        : <AlertCircle  size={16} className="text-red-500 shrink-0" />
      }
      {message}
    </motion.div>
  )
}

// ─── Sección: Datos personales ────────────────────────────────────────────────

function SeccionDatos({ user, onSave }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm]       = useState({ nombre: user?.nombre ?? "", apellido: user?.apellido ?? "", correo: user?.correo ?? "" })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: "" }))
  }

  const validate = () => {
    const e = {}
    if (!form.nombre.trim())   e.nombre   = "El nombre es obligatorio."
    if (!form.apellido.trim()) e.apellido = "El apellido es obligatorio."
    if (!form.correo.trim())   e.correo   = "El correo es obligatorio."
    if (form.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo))
      e.correo = "Ingresa un correo válido."
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setLoading(true)
    // ── Conectar al backend: PUT /api/usuarios/:id ────────────────────────
    // await api.put(`/usuarios/${user.id_usuario}`, {
    //   nombre:   form.nombre,
    //   apellido: form.apellido,
    //   correo:   form.correo,
    //   id_rol:   user.id_rol,
    //   activo:   true,
    // })
    // ─────────────────────────────────────────────────────────────────────
    await new Promise(r => setTimeout(r, 700))
    setLoading(false)
    setEditing(false)
    onSave({ ...user, ...form })
  }

  const handleCancel = () => {
    setForm({ nombre: user?.nombre ?? "", apellido: user?.apellido ?? "", correo: user?.correo ?? "" })
    setErrors({})
    setEditing(false)
  }

  return (
    <motion.div variants={itemVariants} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <User size={15} className="text-blue-600" />
          <h2 className="text-sm font-semibold text-slate-800">Datos personales</h2>
        </div>

        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs text-slate-600 font-medium transition-colors"
          >
            <Edit2 size={13} /> Editar
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 h-8 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs text-slate-500 font-medium transition-colors"
            >
              <X size={13} /> Cancelar
            </button>
            <motion.button
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold transition-colors disabled:opacity-60"
            >
              {loading
                ? <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="3"/><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
                : <Save size={13} />
              }
              {loading ? "Guardando..." : "Guardar"}
            </motion.button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-5 py-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            id="nombre" label="Nombre"
            value={form.nombre} onChange={e => set("nombre", e.target.value)}
            disabled={!editing} icon={User}
            error={errors.nombre}
          />
          <InputField
            id="apellido" label="Apellido"
            value={form.apellido} onChange={e => set("apellido", e.target.value)}
            disabled={!editing} icon={User}
            error={errors.apellido}
          />
        </div>
        <InputField
          id="correo" label="Correo electrónico"
          type="email"
          value={form.correo} onChange={e => set("correo", e.target.value)}
          disabled={!editing} icon={Mail}
          error={errors.correo}
        />

        {/* Rol — siempre de solo lectura */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-slate-500">Rol en el sistema</span>
          <div className="flex items-center gap-2 h-10 px-3 bg-slate-50 border border-slate-100 rounded-xl">
            <RolBadge rol={user?.rol} />
            <span className="text-xs text-slate-400">— asignado por administración</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Sección: Cambiar contraseña ──────────────────────────────────────────────

function SeccionContrasena({ user, onToast }) {
  const [open, setOpen]           = useState(false)
  const [show, setShow]           = useState({ actual: false, nueva: false, confirmar: false })
  const [form, setForm]           = useState({ actual: "", nueva: "", confirmar: "" })
  const [errors, setErrors]       = useState({})
  const [loading, setLoading]     = useState(false)

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: "" }))
  }

  const toggleShow = (field) => setShow(s => ({ ...s, [field]: !s[field] }))

  const validate = () => {
    const e = {}
    if (!form.actual)              e.actual    = "Ingresa tu contraseña actual."
    if (!form.nueva)               e.nueva     = "Ingresa la nueva contraseña."
    if (form.nueva.length < 6)     e.nueva     = "Mínimo 6 caracteres."
    if (form.nueva === form.actual) e.nueva    = "La nueva contraseña debe ser diferente."
    if (!form.confirmar)           e.confirmar = "Confirma la nueva contraseña."
    if (form.nueva && form.confirmar && form.nueva !== form.confirmar)
      e.confirmar = "Las contraseñas no coinciden."
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setLoading(true)
    // ── Conectar al backend: PATCH /api/usuarios/:id/contrasena ───────────
    // await api.patch(`/usuarios/${user.id_usuario}/contrasena`, {
    //   nuevaContrasena: form.nueva,
    // })
    // ─────────────────────────────────────────────────────────────────────
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    setForm({ actual: "", nueva: "", confirmar: "" })
    setOpen(false)
    onToast({ message: "Contraseña actualizada correctamente.", type: "success" })
  }

  const handleCancel = () => {
    setForm({ actual: "", nueva: "", confirmar: "" })
    setErrors({})
    setOpen(false)
  }

  const eyeBtn = (field) => (
    <button
      type="button"
      onClick={() => toggleShow(field)}
      className="text-slate-400 hover:text-slate-600 transition-colors"
    >
      {show[field] ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  )

  return (
    <motion.div variants={itemVariants} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <KeyRound size={15} className="text-blue-600" />
          <h2 className="text-sm font-semibold text-slate-800">Seguridad</h2>
        </div>
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs text-slate-600 font-medium transition-colors"
          >
            <Lock size={13} /> Cambiar contraseña
          </button>
        )}
      </div>

      <div className="px-5 py-5">
        <AnimatePresence mode="wait">
          {!open ? (
            <motion.div
              key="closed"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <Lock size={16} className="text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Contraseña</p>
                <p className="text-xs text-slate-400">••••••••  — última actualización desconocida</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.22 }}
              className="space-y-4"
            >
              <InputField
                id="actual" label="Contraseña actual"
                type={show.actual ? "text" : "password"}
                value={form.actual} onChange={e => set("actual", e.target.value)}
                icon={Lock} error={errors.actual}
                placeholder="••••••••"
                rightElement={eyeBtn("actual")}
              />
              <InputField
                id="nueva" label="Nueva contraseña"
                type={show.nueva ? "text" : "password"}
                value={form.nueva} onChange={e => set("nueva", e.target.value)}
                icon={Lock} error={errors.nueva}
                placeholder="Mínimo 6 caracteres"
                rightElement={eyeBtn("nueva")}
              />
              <InputField
                id="confirmar" label="Confirmar nueva contraseña"
                type={show.confirmar ? "text" : "password"}
                value={form.confirmar} onChange={e => set("confirmar", e.target.value)}
                icon={Lock} error={errors.confirmar}
                placeholder="Repite la nueva contraseña"
                rightElement={eyeBtn("confirmar")}
              />

              {/* Indicador de fuerza */}
              {form.nueva && (
                <div className="space-y-1.5">
                  <div className="flex gap-1">
                    {[1,2,3,4].map(i => {
                      const strength =
                        [form.nueva.length >= 6, /[A-Z]/.test(form.nueva), /[0-9]/.test(form.nueva), /[^A-Za-z0-9]/.test(form.nueva)]
                          .filter(Boolean).length
                      return (
                        <div key={i} className={`flex-1 h-1 rounded-full transition-all ${
                          i <= strength
                            ? strength <= 1 ? "bg-red-400"
                            : strength === 2 ? "bg-amber-400"
                            : strength === 3 ? "bg-blue-400"
                            : "bg-emerald-500"
                            : "bg-slate-100"
                        }`} />
                      )
                    })}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {(() => {
                      const s = [form.nueva.length >= 6, /[A-Z]/.test(form.nueva), /[0-9]/.test(form.nueva), /[^A-Za-z0-9]/.test(form.nueva)].filter(Boolean).length
                      return s <= 1 ? "Débil — agrega mayúsculas, números o símbolos"
                           : s === 2 ? "Regular"
                           : s === 3 ? "Buena"
                           : "Muy segura"
                    })()}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={handleCancel}
                  className="h-8 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs text-slate-500 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <motion.button
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-1.5 h-8 px-4 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold transition-colors disabled:opacity-60"
                >
                  {loading
                    ? <><svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="3"/><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg> Guardando...</>
                    : <><Save size={13} /> Actualizar contraseña</>
                  }
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Perfil() {
  const { user, login } = useAuth()
  const [toast, setToast] = useState(null)

  const showToast = ({ message, type }) => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Actualiza el contexto local cuando el usuario edita sus datos
  const handleDatosGuardados = (updatedUser) => {
    login(updatedUser)
    showToast({ message: "Datos actualizados correctamente.", type: "success" })
  }

  // Iniciales para el avatar
  const initials = [user?.nombre?.[0], user?.apellido?.[0]]
    .filter(Boolean).join("").toUpperCase() || "U"

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl mx-auto space-y-5"
      >
        {/* Header de página */}
        <motion.div variants={itemVariants}>
          <h1 className="text-xl font-semibold text-slate-800 leading-tight">Mi perfil</h1>
          <p className="text-sm text-slate-400 mt-0.5">Consulta y edita tu información personal.</p>
        </motion.div>

        {/* Tarjeta de identidad */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl border border-slate-200 px-5 py-5 flex items-center gap-4"
        >
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-md shadow-blue-900/20">
              <span className="text-white font-bold text-xl tracking-tight">{initials}</span>
            </div>
            {/* Indicador de rol como dot */}
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center
              ${user?.rol === "admin" ? "bg-blue-600" : user?.rol === "docente" ? "bg-indigo-500" : "bg-emerald-500"}`}>
              <ShieldCheck size={10} className="text-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-slate-800 truncate">
              {user?.nombre} {user?.apellido}
            </p>
            <p className="text-xs text-slate-400 truncate mb-2">{user?.correo}</p>
            <RolBadge rol={user?.rol} />
          </div>
        </motion.div>

        {/* Sección datos personales */}
        <SeccionDatos user={user} onSave={handleDatosGuardados} />

        {/* Sección contraseña */}
        <SeccionContrasena user={user} onToast={showToast} />

        {/* Nota informativa */}
        <motion.div
          variants={itemVariants}
          className="flex items-start gap-2.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"
        >
          <AlertCircle size={14} className="text-slate-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 leading-relaxed">
            Para cambiar tu <strong>rol</strong> o desactivar tu cuenta, contacta a un administrador del sistema.
          </p>
        </motion.div>
      </motion.div>

      {/* Toast global */}
      <AnimatePresence>
        {toast && <Toast key="toast" message={toast.message} type={toast.type} />}
      </AnimatePresence>
    </>
  )
}