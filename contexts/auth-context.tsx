"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "staff" | "guest"
  phone?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: Omit<User, "id" | "role"> & { password: string }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Usuários mock - simples e direto
const mockUsers = [
  {
    id: "1",
    name: "Administrador",
    email: "admin@hotel.com",
    password: "admin123",
    role: "admin" as const,
    phone: "(11) 99999-9999",
  },
  {
    id: "2",
    name: "Funcionário",
    email: "staff@hotel.com",
    password: "staff123",
    role: "staff" as const,
    phone: "(11) 88888-8888",
  },
  {
    id: "3",
    name: "Hóspede",
    email: "guest@hotel.com",
    password: "guest123",
    role: "guest" as const,
    phone: "(11) 77777-7777",
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Verificar se há usuário salvo
    const savedUser = localStorage.getItem("hotel_user")
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        setIsAuthenticated(true)
      } catch (error) {
        localStorage.removeItem("hotel_user")
      }
    }
  }, [])

  const login = async (email: string, password: string) => {
    // Simular delay da API
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Buscar usuário
    const foundUser = mockUsers.find((u) => u.email === email && u.password === password)

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      setIsAuthenticated(true)
      localStorage.setItem("hotel_user", JSON.stringify(userWithoutPassword))
    } else {
      throw new Error("Email ou senha incorretos")
    }
  }

  const register = async (userData: Omit<User, "id" | "role"> & { password: string }) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Verificar se já existe
    const exists = mockUsers.find((u) => u.email === userData.email)
    if (exists) {
      throw new Error("Este email já está cadastrado")
    }

    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      role: "guest",
      phone: userData.phone,
    }

    setUser(newUser)
    setIsAuthenticated(true)
    localStorage.setItem("hotel_user", JSON.stringify(newUser))
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("hotel_user")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
