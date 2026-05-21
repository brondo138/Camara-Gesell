import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  CalendarDays,
  BarChart3,
  ShieldCheck,
  Building2,
  Mail,
  Lock,
  LogIn,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../services/authService";

// ─── Animation variants ───────────────────────────────────────────────────────

const panelVariants = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.07,
      delayChildren: 0.15,
    },
  },
};

const fieldVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const features = [
  {
    icon: <Eye size={15} />,
    text: "Observación supervisada a través del espejo unidireccional",
  },
  {
    icon: <CalendarDays size={15} />,
    text: "Reserva de salas y gestión de horarios de práctica",
  },
  {
    icon: <BarChart3 size={15} />,
    text: "Reportes de desempeño y seguimiento académico",
  },
  {
    icon: <ShieldCheck size={15} />,
    text: "Acceso por roles — confidencialidad garantizada",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function InputField({
  id,
  label,
  type = "text",
  placeholder,
  icon,
  rightElement,
  value,
  onChange,
}) {
  return (
    <motion.div variants={fieldVariants} className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-xs font-medium text-slate-500 tracking-wide"
      >
        {label}
      </label>

      <div className="relative flex items-center">
        <span className="absolute left-3 text-slate-400 pointer-events-none">
          {icon}
        </span>

        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={type === "password" ? "current-password" : "email"}
          className="
            w-full h-11 pl-10 pr-10 rounded-xl
            bg-slate-50 border border-slate-200
            text-slate-800 text-sm placeholder:text-slate-400
            focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400
            transition-all duration-150
          "
        />

        {rightElement && (
          <span className="absolute right-3">{rightElement}</span>
        )}
      </div>
    </motion.div>
  );
}

function FeatureItem({ icon, text }) {
  return (
    <motion.div variants={fieldVariants} className="flex items-start gap-3">
      <div className="mt-0.5 w-7 h-7 rounded-lg bg-blue-900/30 border border-blue-700/30 flex items-center justify-center flex-shrink-0 text-blue-300">
        {icon}
      </div>
      <p className="text-xs text-blue-200/50 leading-relaxed pt-1">{text}</p>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const testLogin = (rol) => {
    login({
      id: 1,
      nombre: "Juan Pérez",
      rol,
    });
    navigate("/dashboard");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const user = await loginRequest({
        correo: email,
        contrasena: password,
      });

      login(user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 font-sans">
      <div
        className="
          w-full max-w-4xl flex rounded-2xl overflow-hidden
          shadow-2xl shadow-slate-900/15 border border-slate-200/60
        "
        style={{ minHeight: 580 }}
      >
        {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
        <motion.div
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          className="
            hidden md:flex flex-col justify-between
            bg-[#0f2044] px-10 py-10 flex-1
            relative overflow-hidden
          "
        >
          {/* Subtle background glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 20% 70%, rgba(59,130,246,0.09) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 80% 15%, rgba(99,102,241,0.06) 0%, transparent 60%)",
            }}
          />

          {/* Grid texture */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.025]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg,rgba(255,255,255,.6) 0,rgba(255,255,255,.6) .5px,transparent .5px,transparent 44px),repeating-linear-gradient(90deg,rgba(255,255,255,.6) 0,rgba(255,255,255,.6) .5px,transparent .5px,transparent 44px)",
            }}
          />

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative z-10"
          >
            <div className="flex items-center gap-2.5 mb-10">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/25 flex items-center justify-center">
                <Eye size={18} className="text-blue-300" />
              </div>
              <span className="text-white/90 font-semibold text-[15px] tracking-tight">
                GesellApp
              </span>
              <span className="text-[9px] bg-blue-500/15 text-blue-300 border border-blue-400/20 px-2 py-0.5 rounded-full">
                Clínica Psicológica
              </span>
            </div>

            <h1 className="text-white font-semibold text-2xl leading-snug tracking-tight mb-3">
              Observa, aprende<br />
              y{" "}
              <span className="text-blue-400">practica</span>{" "}
              en tiempo real
            </h1>
            <p className="text-blue-200/40 text-[13px] leading-relaxed max-w-xs">
              Plataforma de gestión para sesiones en Cámara Gesell, prácticas supervisadas y seguimiento académico clínico.
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            variants={formVariants}
            initial="hidden"
            animate="visible"
            className="relative z-10"
          >
            <div className="flex flex-col gap-3.5 mb-8">
              {features.map((f, i) => (
                <FeatureItem key={i} icon={f.icon} text={f.text} />
              ))}
            </div>

            <div className="border-t border-white/[0.06] pt-5 flex items-center gap-2">
              <Building2 size={14} className="text-white/20" />
              <span className="text-white/20 text-[11px]">
                Facultad de Humanidades · Carrera de Psicología
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* ── RIGHT PANEL ────────────────────────────────────────────────── */}
        <motion.div
          variants={formVariants}
          initial="hidden"
          animate="visible"
          className="bg-white flex flex-col justify-center px-9 py-10 w-full md:w-[420px] flex-shrink-0"
        >
          {/* Header */}
          <motion.div variants={fieldVariants} className="mb-7">
            {/* Mobile logo */}
            <div className="flex md:hidden items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Eye size={16} className="text-white" />
              </div>
              <span className="text-slate-800 font-semibold text-sm">GesellApp</span>
            </div>

            <h2 className="text-slate-900 font-semibold text-xl mb-1 tracking-tight">
              Iniciar sesión
            </h2>
            <p className="text-slate-400 text-xs leading-relaxed">
              Ingresa con tus credenciales institucionales. El sistema
              identificará tu rol automáticamente.
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <InputField
              id="email"
              label="Correo institucional"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@universidad.edu"
              icon={<Mail size={17} />}
            />

            <InputField
              id="password"
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={<Lock size={17} />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              }
            />

            {/* Remember + Forgot */}
            <motion.div
              variants={fieldVariants}
              className="flex items-center justify-between"
            >
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  role="checkbox"
                  aria-checked={rememberMe}
                  tabIndex={0}
                  onClick={() => setRememberMe((v) => !v)}
                  onKeyDown={(e) => e.key === " " && setRememberMe((v) => !v)}
                  className={`
                    w-4 h-4 rounded-[4px] border flex items-center justify-center
                    transition-all duration-150 cursor-pointer
                    ${rememberMe
                      ? "bg-blue-600 border-blue-600"
                      : "bg-white border-slate-300"
                    }
                  `}
                >
                  <AnimatePresence>
                    {rememberMe && (
                      <motion.svg
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        width="10" height="10" viewBox="0 0 10 10" fill="none"
                      >
                        <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </motion.svg>
                    )}
                  </AnimatePresence>
                </div>
                <span className="text-xs text-slate-500">Mantener sesión</span>
              </label>

              <button
                type="button"
                className="text-xs text-blue-600 hover:text-blue-700 transition-colors font-medium"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </motion.div>

            {/* Submit */}
            <motion.div variants={fieldVariants}>
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="
                  w-full h-11 rounded-xl
                  bg-blue-700 hover:bg-blue-800
                  text-white text-sm font-semibold
                  flex items-center justify-center gap-2
                  transition-colors duration-150
                  disabled:opacity-60 disabled:cursor-not-allowed
                  shadow-sm shadow-blue-900/20
                "
              >
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <svg
                        className="animate-spin"
                        width="16" height="16" viewBox="0 0 24 24" fill="none"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="3" />
                        <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Verificando...
                    </motion.span>
                  ) : (
                    <motion.span
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <LogIn size={17} />
                      Ingresar a la plataforma
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>

            {error && (
              <motion.p
                variants={fieldVariants}
                className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2"
              >
                {error}
              </motion.p>
            )}

            {/* Divider */}
            <motion.div variants={fieldVariants} className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-[10px] text-slate-400">o continúa con</span>
              <div className="flex-1 h-px bg-slate-100" />
            </motion.div>

            {/* SSO */}
            <motion.div variants={fieldVariants}>
              <motion.button
                type="button"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="
                  w-full h-10 rounded-xl
                  bg-slate-50 hover:bg-slate-100
                  border border-slate-200
                  text-slate-500 text-xs font-medium
                  flex items-center justify-center gap-2
                  transition-colors duration-150
                "
              >
                <GraduationCap size={16} className="text-slate-400" />
                SSO Institucional — Cuenta universitaria
                <span className="ml-1 text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-md">
                  Próximamente
                </span>
              </motion.button>
            </motion.div>

            {/* Footer */}
            {/* Login de prueba */}
            <motion.div
              variants={fieldVariants}
              className="flex flex-col gap-2 mt-2"
            >
              <p className="text-[11px] text-slate-400 text-center">
                Acceso rápido para pruebas
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => testLogin("admin")}
                  className="
                    flex-1 h-9 rounded-lg
                    bg-red-500 hover:bg-red-600
                    text-white text-xs font-medium
                    transition-colors
                  "
                >
                  Admin
                </button>

                <button
                  type="button"
                  onClick={() => testLogin("docente")}
                  className="
                    flex-1 h-9 rounded-lg
                    bg-amber-500 hover:bg-amber-600
                    text-white text-xs font-medium
                    transition-colors
                  "
                >
                  Docente
                </button>

                <button
                  type="button"
                  onClick={() => testLogin("estudiante")}
                  className="
                    flex-1 h-9 rounded-lg
                    bg-emerald-500 hover:bg-emerald-600
                    text-white text-xs font-medium
                    transition-colors
                  "
                >
                  Estudiante
                </button>
              </div>
            </motion.div>

            <motion.p
              variants={fieldVariants}
              className="text-center text-[10px] text-slate-400 leading-relaxed mt-1"
            >
              Al ingresar aceptas los términos de confidencialidad clínica.{" "}
              <br />
              ¿Problemas de acceso?{" "}
              <span className="text-blue-600 cursor-pointer hover:underline">
                Contacta a soporte técnico
              </span>
            </motion.p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
