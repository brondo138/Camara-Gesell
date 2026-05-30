import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import {
  Camera, CalendarCheck, CheckCircle2,
  ChevronRight, ChevronLeft, MapPin,
  Clock, AlertCircle, Check, Loader2
} from "lucide-react"
import { useAuth } from "../hooks/useAuth"
import { getCamaras } from "../services/camarasService"
import { createReserva } from "../services/reservasService"

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function addHour(hora) {
  const [h, m] = hora.split(":").map(Number)
  return `${String(h + 1).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

function getTodayISO() {
  return new Date().toISOString().split("T")[0]
}

const HORAS = ["07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"]

// ─── ANIMACIONES ──────────────────────────────────────────────────────────────

const stepVariants = {
  enter:  { opacity: 0, x: 24 },
  center: { opacity: 1, x: 0,   transition: { duration: 0.28, ease: "easeOut" } },
  exit:   { opacity: 0, x: -24, transition: { duration: 0.2 } },
}

// ─── STEP 1 — ELEGIR CÁMARA ───────────────────────────────────────────────────

function StepCamara({ camaras, loadingCamaras, selected, onSelect }) {
  if (loadingCamaras) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <Loader2 className="w-7 h-7 animate-spin mb-2" />
        <p className="text-sm">Cargando salas disponibles…</p>
      </div>
    )
  }

  return (
    <motion.div key="step1" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-slate-800">Elige una sala</h2>
        <p className="text-xs text-slate-400 mt-0.5">Solo se muestran salas disponibles.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {camaras.map(c => {
          const activa     = Boolean(c.activa)
          const isSelected = selected?.id_camara === c.id_camara
          return (
            <motion.button
              key={c.id_camara}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => activa && onSelect(c)}
              disabled={!activa}
              className={`
                text-left w-full rounded-xl border p-4 transition-all duration-150
                ${!activa
                  ? "opacity-40 cursor-not-allowed border-slate-100 bg-slate-50"
                  : isSelected
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/20"
                    : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm"
                }
              `}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "bg-blue-600" : "bg-slate-100"}`}>
                  <Camera size={17} className={isSelected ? "text-white" : "text-slate-500"} />
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                    <Check size={12} className="text-white" />
                  </div>
                )}
                {!activa && (
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">
                    No disponible
                  </span>
                )}
              </div>
              <p className={`font-semibold text-sm mb-1 ${isSelected ? "text-blue-800" : "text-slate-800"}`}>
                {c.nombre}
              </p>
              {c.ubicacion && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <MapPin size={11} className="text-slate-300 shrink-0" /> {c.ubicacion}
                </div>
              )}
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}

// ─── STEP 2 — FECHA, HORA Y MOTIVO ───────────────────────────────────────────

function StepFecha({ camara, fecha, setFecha, horaInicio, setHoraInicio, motivo, setMotivo, errors }) {
  const horaFin      = horaInicio ? addHour(horaInicio) : null
  const horasValidas = HORAS.slice(0, -1)

  return (
    <motion.div key="step2" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-slate-800">Fecha y horario</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Reservando: <span className="font-medium text-slate-600">{camara.nombre}</span>
        </p>
      </div>

      {/* Fecha */}
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1.5">
          Fecha <span className="text-red-400">*</span>
        </label>
        <input
          type="date"
          min={getTodayISO()}
          value={fecha}
          onChange={e => { setFecha(e.target.value); setHoraInicio("") }}
          className={`w-full h-10 px-3 rounded-xl border text-sm text-slate-700
            bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all
            ${errors.fecha ? "border-red-300 bg-red-50" : "border-slate-200"}`}
        />
        {errors.fecha && (
          <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
            <AlertCircle size={11} />{errors.fecha}
          </p>
        )}
      </div>

      {/* Horarios */}
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1.5">
          Hora de inicio <span className="text-red-400">*</span>
          {horaFin && <span className="text-slate-400 font-normal ml-1">→ fin estimado {horaFin}</span>}
        </label>
        {!fecha ? (
          <p className="text-xs text-slate-400 italic">Selecciona una fecha primero.</p>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {horasValidas.map(h => {
              const seleccion = horaInicio === h
              return (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHoraInicio(h)}
                  className={`
                    h-9 rounded-lg text-xs font-medium border transition-all
                    ${seleccion
                      ? "bg-blue-600 border-blue-600 text-white ring-2 ring-blue-500/20"
                      : "bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50"
                    }
                  `}
                >
                  {h}
                </button>
              )
            })}
          </div>
        )}
        {errors.horaInicio && (
          <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1">
            <AlertCircle size={11} />{errors.horaInicio}
          </p>
        )}
        <p className="text-[11px] text-slate-400 mt-2">Las sesiones tienen una duración de 1 hora.</p>
      </div>

      {/* Motivo */}
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1.5">
          Motivo de la reserva <span className="text-red-400">*</span>
        </label>
        <textarea
          value={motivo}
          onChange={e => setMotivo(e.target.value)}
          placeholder="Describe brevemente el propósito de la sesión..."
          rows={3}
          className={`w-full px-3 py-2.5 rounded-xl border text-sm text-slate-800 placeholder:text-slate-400
            bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all resize-none
            ${errors.motivo ? "border-red-300 bg-red-50" : "border-slate-200"}`}
        />
        {errors.motivo && (
          <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
            <AlertCircle size={11} />{errors.motivo}
          </p>
        )}
      </div>
    </motion.div>
  )
}

// ─── STEP 3 — CONFIRMACIÓN ────────────────────────────────────────────────────

function StepConfirmar({ camara, fecha, horaInicio, motivo, user }) {
  function formatFechaLarga(iso) {
    const [y, m, d] = iso.split("-")
    const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"]
    return `${parseInt(d)} de ${meses[parseInt(m) - 1]} de ${y}`
  }

  const rows = [
    { label: "Solicitante", value: `${user?.nombre ?? "Usuario"} (${user?.rol ?? ""})` },
    { label: "Sala",        value: `${camara.nombre}${camara.ubicacion ? ` — ${camara.ubicacion}` : ""}` },
    { label: "Fecha",       value: formatFechaLarga(fecha) },
    { label: "Horario",     value: `${horaInicio} – ${addHour(horaInicio)}` },
    { label: "Motivo",      value: motivo },
  ]

  return (
    <motion.div key="step3" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-slate-800">Confirmar reserva</h2>
        <p className="text-xs text-slate-400 mt-0.5">Revisa los datos antes de enviar.</p>
      </div>
      <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex gap-4 px-4 py-3">
            <span className="text-xs text-slate-400 w-24 shrink-0 pt-0.5">{label}</span>
            <span className="text-xs text-slate-700 font-medium leading-relaxed">{value}</span>
          </div>
        ))}
      </div>
      <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <AlertCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 leading-relaxed">
          Tu reserva quedará en estado <strong>pendiente</strong> hasta que un administrador la apruebe.
        </p>
      </div>
    </motion.div>
  )
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

const STEPS = ["Sala", "Fecha y hora", "Confirmar"]

export default function NuevaReserva() {
  const { user }   = useAuth()
  const navigate   = useNavigate()

  const [step, setStep]             = useState(0)
  const [camara, setCamara]         = useState(null)
  const [fecha, setFecha]           = useState("")
  const [horaInicio, setHoraInicio] = useState("")
  const [motivo, setMotivo]         = useState("")
  const [errors, setErrors]         = useState({})
  const [submitted, setSubmitted]   = useState(false)
  const [loading, setLoading]       = useState(false)
  const [submitError, setSubmitError] = useState("")

  // Cámaras desde el backend
  const [camaras, setCamaras]           = useState([])
  const [loadingCamaras, setLoadingCamaras] = useState(true)

  useEffect(() => {
    async function cargar() {
      try {
        const data = await getCamaras()
        // Solo mostrar cámaras activas
        setCamaras(data.filter(c => Boolean(c.activa)))
      } catch {
        setCamaras([])
      } finally {
        setLoadingCamaras(false)
      }
    }
    cargar()
  }, [])

  // ── Validación por step ──────────────────────────────────────────────────
  const validateStep = () => {
    const e = {}
    if (step === 0 && !camara)       e.camara     = "Selecciona una sala."
    if (step === 1) {
      if (!fecha)                    e.fecha      = "Selecciona una fecha."
      if (!horaInicio)               e.horaInicio = "Selecciona una hora de inicio."
      if (!motivo.trim())            e.motivo     = "El motivo es obligatorio."
      if (motivo.trim().length < 10) e.motivo     = "El motivo debe tener al menos 10 caracteres."
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
    if (!validateStep()) return
    setErrors({})
    setStep(s => s + 1)
  }

  const handleBack = () => {
    setErrors({})
    setStep(s => s - 1)
  }

  // ── Submit real al backend ───────────────────────────────────────────────
  const handleSubmit = async () => {
    setLoading(true)
    setSubmitError("")
    try {
      await createReserva({
        id_camara:              camara.id_camara,
        id_usuario_solicitante: user?.id,
        fecha,
        hora_inicio:            horaInicio,
        hora_fin:               addHour(horaInicio),
        motivo:                 motivo.trim(),
      })
      setSubmitted(true)
    } catch (err) {
      setSubmitError(err?.response?.data?.message ?? "Error al crear la reserva. Inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  // ── Pantalla de éxito ────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="max-w-md mx-auto pt-16 text-center space-y-5">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 14 }}
          className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto"
        >
          <CheckCircle2 size={32} className="text-emerald-600" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-lg font-semibold text-slate-800">¡Reserva enviada!</h2>
          <p className="text-sm text-slate-500 mt-1 leading-relaxed">
            Tu solicitud para <strong>{camara?.nombre}</strong> el <strong>{fecha}</strong> a las{" "}
            <strong>{horaInicio}</strong> está pendiente de aprobación.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          className="flex items-center justify-center gap-3"
        >
          <button
            onClick={() => navigate("/reservas")}
            className="h-9 px-5 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm text-slate-600 font-medium transition-colors"
          >
            Ver mis reservas
          </button>
          <button
            onClick={() => { setStep(0); setCamara(null); setFecha(""); setHoraInicio(""); setMotivo(""); setSubmitted(false) }}
            className="h-9 px-5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold transition-colors"
          >
            Nueva reserva
          </button>
        </motion.div>
      </div>
    )
  }

  // ─── RENDER PRINCIPAL ─────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/reservas")}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-slate-800 leading-tight">Nueva reserva</h1>
          <p className="text-xs text-slate-400 mt-0.5">Completa los pasos para solicitar una sala.</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-0">
        {STEPS.map((label, i) => {
          const done    = i < step
          const current = i === step
          return (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2 shrink-0">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all
                  ${done    ? "bg-blue-600 border-blue-600 text-white"
                  : current ? "bg-white border-blue-600 text-blue-600"
                  :           "bg-white border-slate-200 text-slate-400"}`}>
                  {done ? <Check size={14} /> : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block
                  ${current ? "text-slate-800" : done ? "text-blue-600" : "text-slate-400"}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-3 transition-all ${done ? "bg-blue-300" : "bg-slate-200"}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Contenido del step */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 min-h-[340px]">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <StepCamara
              key="s0"
              camaras={camaras}
              loadingCamaras={loadingCamaras}
              selected={camara}
              onSelect={c => { setCamara(c); setErrors({}) }}
            />
          )}
          {step === 1 && (
            <StepFecha
              key="s1"
              camara={camara}
              fecha={fecha}           setFecha={setFecha}
              horaInicio={horaInicio} setHoraInicio={setHoraInicio}
              motivo={motivo}         setMotivo={setMotivo}
              errors={errors}
            />
          )}
          {step === 2 && (
            <StepConfirmar
              key="s2"
              camara={camara} fecha={fecha}
              horaInicio={horaInicio} motivo={motivo} user={user}
            />
          )}
        </AnimatePresence>

        {errors.camara && (
          <p className="text-[11px] text-red-500 mt-3 flex items-center gap-1">
            <AlertCircle size={11} />{errors.camara}
          </p>
        )}
      </div>

      {/* Error de submit */}
      <AnimatePresence>
        {submitError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
          >
            <AlertCircle size={14} className="flex-shrink-0" />
            {submitError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navegación */}
      <div className="flex items-center justify-between">
        <button
          onClick={step === 0 ? () => navigate("/reservas") : handleBack}
          className="flex items-center gap-1.5 h-9 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm text-slate-600 font-medium transition-colors"
        >
          <ChevronLeft size={16} />
          {step === 0 ? "Cancelar" : "Atrás"}
        </button>

        {step < STEPS.length - 1 ? (
          <motion.button
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            onClick={handleNext}
            className="flex items-center gap-1.5 h-9 px-5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold transition-colors shadow-sm"
          >
            Siguiente <ChevronRight size={16} />
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-1.5 h-9 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors shadow-sm disabled:opacity-60"
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Enviando…</>
              : <><CheckCircle2 size={16} /> Confirmar reserva</>
            }
          </motion.button>
        )}
      </div>
    </div>
  )
}