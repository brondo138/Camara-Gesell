import { useState, useCallback } from "react"
import { AuthContext } from "./authContextCore"

export function AuthProvider({ children }) {
  // Al inicializar: solo restaurar la sesión si AMBOS token y usuario existen en localStorage.
  // Si falta cualquiera de los dos, la sesión se considera inválida y se limpia.
  const [user, setUser] = useState(() => {
    const savedUser  = localStorage.getItem("gesell_user")
    const savedToken = localStorage.getItem("gesell_token")

    if (savedUser && savedToken) {
      try {
        return JSON.parse(savedUser)
      } catch {
        // JSON corrupto → limpiar
        localStorage.removeItem("gesell_user")
        localStorage.removeItem("gesell_token")
        return null
      }
    }

    // Si solo existe uno de los dos, limpiar ambos para evitar estados inconsistentes
    localStorage.removeItem("gesell_user")
    localStorage.removeItem("gesell_token")
    return null
  })

  // login recibe el objeto de usuario que ya viene normalizado desde authService.
  // El token ya fue guardado en localStorage por loginRequest() en authService.js,
  // aquí solo guardamos el usuario para completar la sesión.
  const login = useCallback((userData) => {
    localStorage.setItem("gesell_user", JSON.stringify(userData))
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("gesell_token")
    localStorage.removeItem("gesell_user")
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
