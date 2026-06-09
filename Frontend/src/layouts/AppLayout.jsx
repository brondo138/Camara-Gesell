import { useState } from "react"
import { Outlet, NavLink, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard, Users, Camera, CalendarCheck,
  Video, BookOpen, BarChart2, UserCircle,
  LogOut, Menu,  ChevronRight, Building2
} from "lucide-react"
import { useAuth } from "../hooks/useAuth"
import { cn } from "../utils/cn"

const NAV_ITEMS = [
  { to: "/dashboard",   label: "Dashboard",    icon: LayoutDashboard, roles: ["admin","docente","estudiante"] },
  { to: "/usuarios",    label: "Usuarios",     icon: Users,           roles: ["admin"] },
  { to: "/camaras",     label: "Cámaras",      icon: Camera,          roles: ["admin"] },
  { to: "/grupos",      label: "Grupos",       icon: Users,           roles: ["admin","docente"] },
  { to: "/reservas",    label: "Reservas",     icon: CalendarCheck,   roles: ["admin","docente","estudiante"] },
  { to: "/sesiones",    label: "Sesiones",     icon: Video,           roles: ["admin","docente","estudiante"] },
  { to: "/grabaciones", label: "Grabaciones",  icon: BookOpen,        roles: ["admin","docente"] },
  { to: "/reportes",    label: "Reportes",     icon: BarChart2,       roles: ["admin","docente"] },
  { to: "/perfil",      label: "Mi perfil",    icon: UserCircle,      roles: ["admin","docente","estudiante"] },
]

function NavItem({ item, collapsed, onClick }) {
  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className={({ isActive }) => cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative",
        isActive
          ? "bg-navy-600 text-white"
          : "text-slate-400 hover:bg-navy-800 hover:text-white"
      )}
    >
      {({ isActive }) => (
        <>
          <item.icon size={18} className="shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap"
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>
          {isActive && !collapsed && (
            <ChevronRight size={14} className="ml-auto shrink-0 text-blue-300" />
          )}
          {collapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-navy-900 text-white text-xs rounded-md
                            opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity
                            whitespace-nowrap z-50 shadow-lg">
              {item.label}
            </div>
          )}
        </>
      )}
    </NavLink>
  )
}

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const visibleItems = NAV_ITEMS.filter(i => i.roles.includes(user?.rol))

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const roleLabel = {
    admin: "Administrador",
    docente: "Docente",
    estudiante: "Estudiante",
  }

  const sidebarContent = (onItemClick) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-5 border-b border-navy-700",
        collapsed && "justify-center px-3"
      )}>
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
          <Building2 size={16} className="text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <p className="text-white font-semibold text-sm leading-tight">GesellApp</p>
              <p className="text-navy-400 text-xs">Gestión clínica</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {visibleItems.map(item => (
          <NavItem
            key={item.to}
            item={item}
            collapsed={collapsed}
            onClick={onItemClick}
          />
        ))}
      </nav>

      {/* User footer */}
      <div className={cn(
        "p-3 border-t border-navy-700",
        collapsed && "flex justify-center"
      )}>
        {!collapsed ? (
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold shrink-0">
              {user?.nombre?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.nombre ?? "Usuario"}</p>
              <p className="text-navy-400 text-xs truncate">{roleLabel[user?.rol] ?? user?.rol}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-navy-400 hover:text-red-400 transition-colors p-1 rounded"
              title="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="text-navy-400 hover:text-red-400 transition-colors p-2 rounded-lg"
            title="Cerrar sesión"
          >
            <LogOut size={18} />
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* Sidebar desktop */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="hidden md:flex flex-col bg-navy-900 relative shrink-0 overflow-hidden"
      >
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="absolute top-4 right-3 w-7 h-7 bg-navy-700 hover:bg-navy-600
                     rounded-lg flex items-center justify-center z-10 transition-colors shadow"
          title={collapsed ? "Expandir menú" : "Contraer menú"}
        >
          <motion.div animate={{ rotate: collapsed ? 0 : 180 }} transition={{ duration: 0.25 }}>
            <ChevronRight size={12} className="text-white" />
          </motion.div>
        </button>

        {sidebarContent(undefined)}
      </motion.aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="fixed top-0 left-0 h-full w-60 bg-navy-900 z-40 md:hidden flex flex-col"
            >
              {sidebarContent(() => setMobileOpen(false))}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-4 shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden text-slate-500 hover:text-slate-700 transition-colors"
          >
            <Menu size={20} />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-navy-700 flex items-center justify-center text-white text-xs font-semibold">
              {user?.nombre?.[0]?.toUpperCase() ?? "U"}
            </div>
            <span className="text-sm text-slate-700 font-medium hidden sm:block">
              {user?.nombre ?? "Usuario"}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </main>

      </div>
    </div>
  )
}
