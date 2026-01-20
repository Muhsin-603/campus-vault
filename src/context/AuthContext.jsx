import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken) {
      setToken(storedToken)
      setUser(storedUser ? JSON.parse(storedUser) : null)
    }
    
    setLoading(false)
  }, [])

  const login = (user, token) => {
    setUser(user)
    setToken(token)
    localStorage.setItem('authToken', token)
    localStorage.setItem('user', JSON.stringify(user))
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  }

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token,
    userRole: user?.role
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
