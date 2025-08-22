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

// 🔧 CORREÇÃO: Usuários mock salvos no localStorage para persistência
const getStoredUsers = () => {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem("hotel_users")
  if (stored) {
    return JSON.parse(stored)
  }

  // Usuários padrão se não existir nada
  const defaultUsers = [
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

  // Salvar usuários padrão
  localStorage.setItem("hotel_users", JSON.stringify(defaultUsers))
  return defaultUsers
}

const saveUsers = (users: any[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("hotel_users", JSON.stringify(users))
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // 🔧 CORREÇÃO: Verificar se há usuário salvo no localStorage
    const savedUser = localStorage.getItem("hotel_current_user")
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        setIsAuthenticated(true)
        console.log("✅ Usuário restaurado do localStorage:", userData.email)
      } catch (error) {
        console.error("❌ Erro ao restaurar usuário:", error)
        localStorage.removeItem("hotel_current_user")
      }
    }
  }, [])

  const login = async (email: string, password: string) => {
    // Simular delay da API
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 🔧 CORREÇÃO: Buscar usuários do localStorage
    const users = getStoredUsers()
    const foundUser = users.find((u: any) => u.email === email && u.password === password)

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      setIsAuthenticated(true)

      // 🔧 CORREÇÃO: Salvar usuário atual no localStorage
      localStorage.setItem("hotel_current_user", JSON.stringify(userWithoutPassword))
      console.log("✅ Login realizado com sucesso:", userWithoutPassword.email)
    } else {
      throw new Error("Email ou senha incorretos")
    }
  }

  const register = async (userData: Omit<User, "id" | "role"> & { password: string }) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 🔧 CORREÇÃO: Verificar se já existe no localStorage
    const users = getStoredUsers()
    const exists = users.find((u: any) => u.email === userData.email)
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

    // 🔧 CORREÇÃO: Adicionar novo usuário ao localStorage
    const newUserWithPassword = { ...newUser, password: userData.password }
    const updatedUsers = [...users, newUserWithPassword]
    saveUsers(updatedUsers)

    setUser(newUser)
    setIsAuthenticated(true)

    // 🔧 CORREÇÃO: Salvar usuário atual no localStorage
    localStorage.setItem("hotel_current_user", JSON.stringify(newUser))
    console.log("✅ Usuário registrado com sucesso:", newUser.email)
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)

    // 🔧 CORREÇÃO: Remover usuário atual do localStorage
    localStorage.removeItem("hotel_current_user")
    console.log("✅ Logout realizado com sucesso")
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
