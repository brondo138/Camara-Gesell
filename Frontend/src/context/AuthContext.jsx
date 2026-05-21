import { useState, useCallback } from "react"
import { AuthContext } from "./authContextCore"

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("gesell_user")
    return saved ? JSON.parse(saved) : null
  })

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
