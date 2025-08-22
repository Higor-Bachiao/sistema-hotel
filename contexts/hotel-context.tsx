"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import type { Room, Reservation, HotelFilters, HotelStatistics, Expense, Guest } from "@/types/hotel"
import { getNumberOfNights } from "@/lib/price-utils"

// Nova interface para histórico de hóspedes
interface GuestHistory {
  id: string
  guest: Guest
  roomNumber: string
  roomType: string
  checkInDate: string
  checkOutDate: string
  totalPrice: number
  status: "active" | "completed" | "cancelled"
  createdAt: string
}

interface HotelContextType {
  rooms: Room[]
  filteredRooms: Room[]
  filters: HotelFilters
  setFilters: (filters: HotelFilters) => void
  clearFilters: () => void
  searchRooms: (term: string) => void
  addRoom: (room: Omit<Room, "id" | "status" | "guest">) => void
  updateRoom: (roomId: string, updates: Partial<Room>) => void
  deleteRoom: (roomId: string) => void
  checkoutRoom: (roomId: string) => void
  makeReservation: (reservation: Omit<Reservation, "id" | "createdAt">) => Promise<void>
  addExpenseToRoom: (roomId: string, expense: Expense) => void
  getStatistics: () => HotelStatistics
  getFutureReservations: () => Room[]
  futureReservations: Reservation[]
  cancelFutureReservation: (reservationId: string) => void
  guestHistory: GuestHistory[]
  getGuestHistory: () => GuestHistory[]
  deleteGuestHistory: (historyId: string) => void
  isLoading: boolean
  error: string | null
  lastSync: Date | null
  isOnline: boolean
}

const HotelContext = createContext<HotelContextType | undefined>(undefined)

export function HotelProvider({ children }: { children: ReactNode }) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([])
  const [futureReservations, setFutureReservations] = useState<Reservation[]>([])
  const [guestHistory, setGuestHistory] = useState<GuestHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastSyncRef = useRef<string>("")

  const [filters, setFilters] = useState<HotelFilters>({
    type: "",
    status: "",
    minPrice: 0,
    maxPrice: 1000,
  })

  // 🌐 Monitorar status de conexão
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // 🔄 Função para sincronizar dados automaticamente
  const syncData = async (silent = true) => {
    if (!isOnline) return

    try {
      if (!silent) {
        console.log("🔄 Sincronizando dados...")
      }

      // Buscar dados atualizados do localStorage de outros dispositivos/abas
      const storedRooms = localStorage.getItem("hotel_rooms")
      const storedReservations = localStorage.getItem("hotel_future_reservations")
      const storedHistory = localStorage.getItem("hotel_guest_history")
      const storedLastUpdate = localStorage.getItem("hotel_last_update")

      // Verificar se houve mudanças desde a última sincronização
      if (storedLastUpdate && storedLastUpdate !== lastSyncRef.current) {
        if (storedRooms) {
          const parsedRooms = JSON.parse(storedRooms)
          setRooms(parsedRooms)
        }

        if (storedReservations) {
          const parsedReservations = JSON.parse(storedReservations)
          setFutureReservations(parsedReservations)
        }

        if (storedHistory) {
          const parsedHistory = JSON.parse(storedHistory)
          setGuestHistory(parsedHistory)
        }

        lastSyncRef.current = storedLastUpdate
        setLastSync(new Date())

        if (!silent) {
          console.log("✅ Dados sincronizados com sucesso")
        }
      }

      setError(null)
    } catch (error: any) {
      console.error("❌ Erro na sincronização:", error)
      setError(`Erro de sincronização: ${error.message}`)
    }
  }

  // 💾 Função para salvar dados e notificar outras abas
  const saveToStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data))
    const timestamp = Date.now().toString()
    localStorage.setItem("hotel_last_update", timestamp)
    lastSyncRef.current = timestamp

    // Disparar evento para outras abas
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "hotel_last_update",
        newValue: timestamp,
        oldValue: lastSyncRef.current,
      }),
    )
  }

  // 🔄 Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = () => {
      try {
        setIsLoading(true)

        // Carregar quartos
        const storedRooms = localStorage.getItem("hotel_rooms")
        if (storedRooms) {
          const parsedRooms = JSON.parse(storedRooms)
          setRooms(parsedRooms)
        } else {
          // Dados iniciais se não existir nada
          const initialRooms: Room[] = [
            {
              id: "1",
              number: "101",
              type: "Solteiro",
              capacity: 1,
              beds: 1,
              price: 80,
              amenities: ["wifi", "tv"],
              status: "available",
            },
            {
              id: "2",
              number: "102",
              type: "Casal",
              capacity: 2,
              beds: 1,
              price: 120,
              amenities: ["wifi", "tv", "ar-condicionado"],
              status: "available",
            },
            {
              id: "3",
              number: "103",
              type: "Triplo",
              capacity: 3,
              beds: 2,
              price: 150,
              amenities: ["wifi", "tv", "minibar"],
              status: "available",
            },
          ]
          setRooms(initialRooms)
          saveToStorage("hotel_rooms", initialRooms)
        }

        // Carregar reservas futuras
        const storedReservations = localStorage.getItem("hotel_future_reservations")
        if (storedReservations) {
          const parsedReservations = JSON.parse(storedReservations)
          setFutureReservations(parsedReservations)
        }

        // Carregar histórico
        const storedHistory = localStorage.getItem("hotel_guest_history")
        if (storedHistory) {
          const parsedHistory = JSON.parse(storedHistory)
          setGuestHistory(parsedHistory)
        }

        // Definir timestamp inicial
        const storedLastUpdate = localStorage.getItem("hotel_last_update")
        if (storedLastUpdate) {
          lastSyncRef.current = storedLastUpdate
        }

        setLastSync(new Date())
        console.log("✅ Dados iniciais carregados")
      } catch (error: any) {
        console.error("❌ Erro ao carregar dados:", error)
        setError(`Erro ao carregar dados: ${error.message}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
  }, [])

  // 🔄 Configurar sincronização automática a cada 5 segundos
  useEffect(() => {
    if (!isLoading && isOnline) {
      console.log("⏰ Iniciando sincronização automática (5s)")

      syncIntervalRef.current = setInterval(() => {
        syncData(true) // silent = true
      }, 5000) // 5 segundos

      return () => {
        if (syncIntervalRef.current) {
          clearInterval(syncIntervalRef.current)
          console.log("⏹️ Sincronização automática parada")
        }
      }
    }
  }, [isLoading, isOnline])

  // 🔄 Sincronizar quando a aba volta ao foco
  useEffect(() => {
    const handleFocus = () => {
      console.log("👁️ Aba voltou ao foco - sincronizando...")
      syncData(false)
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("👁️ Página ficou visível - sincronizando...")
        syncData(false)
      }
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "hotel_last_update" && e.newValue !== lastSyncRef.current) {
        console.log("🔄 Detectada mudança em outra aba - sincronizando...")
        syncData(false)
      }
    }

    window.addEventListener("focus", handleFocus)
    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("focus", handleFocus)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  // 💾 Salvar dados quando mudarem
  useEffect(() => {
    if (!isLoading) {
      saveToStorage("hotel_rooms", rooms)
    }
  }, [rooms, isLoading])

  useEffect(() => {
    if (!isLoading) {
      saveToStorage("hotel_future_reservations", futureReservations)
    }
  }, [futureReservations, isLoading])

  useEffect(() => {
    if (!isLoading) {
      saveToStorage("hotel_guest_history", guestHistory)
    }
  }, [guestHistory, isLoading])

  // 📊 Aplicar filtros
  useEffect(() => {
    let filtered = rooms

    if (filters.type) {
      filtered = filtered.filter((room) => room.type === filters.type)
    }

    if (filters.status) {
      filtered = filtered.filter((room) => {
        if (filters.status === "available") {
          return room.status === "available"
        } else {
          return room.status === filters.status
        }
      })
    }

    if (filters.minPrice > 0) {
      filtered = filtered.filter((room) => room.price >= filters.minPrice)
    }

    if (filters.maxPrice < 1000) {
      filtered = filtered.filter((room) => room.price <= filters.maxPrice)
    }

    setFilteredRooms(filtered)
  }, [rooms, filters])

  // 📝 Função para adicionar ao histórico
  const addToGuestHistory = (guest: Guest, roomId: string, status: "active" | "completed" | "cancelled" = "active") => {
    const room = rooms.find((r) => r.id === roomId)
    if (!room) return

    const nights = getNumberOfNights(guest.checkIn, guest.checkOut)
    const totalPrice =
      room.price * guest.guests * nights + (guest.expenses?.reduce((sum, exp) => sum + exp.value, 0) || 0)

    const historyEntry: GuestHistory = {
      id: Date.now().toString(),
      guest,
      roomNumber: room.number,
      roomType: room.type,
      checkInDate: guest.checkIn,
      checkOutDate: guest.checkOut,
      totalPrice,
      status,
      createdAt: new Date().toISOString(),
    }

    setGuestHistory((prev) => [historyEntry, ...prev])
  }

  // 🔍 Funções de busca e filtro
  const clearFilters = () => {
    setFilters({
      type: "",
      status: "",
      minPrice: 0,
      maxPrice: 1000,
    })
  }

  const searchRooms = (term: string) => {
    if (!term) {
      setFilteredRooms(rooms)
      return
    }

    const filtered = rooms.filter(
      (room) =>
        room.number.toLowerCase().includes(term.toLowerCase()) ||
        room.type.toLowerCase().includes(term.toLowerCase()) ||
        room.guest?.name?.toLowerCase().includes(term.toLowerCase()),
    )

    setFilteredRooms(filtered)
  }

  // 🏨 Funções de gerenciamento de quartos
  const addRoom = (room: Omit<Room, "id" | "status" | "guest">) => {
    const newRoom: Room = {
      ...room,
      id: Date.now().toString(),
      status: "available",
    }

    setRooms((prev) => [...prev, newRoom])
    console.log("✅ Quarto adicionado:", newRoom)
  }

  const updateRoom = (roomId: string, updates: Partial<Room>) => {
    setRooms((prev) => prev.map((room) => (room.id === roomId ? { ...room, ...updates } : room)))
    console.log("✅ Quarto atualizado:", roomId, updates)
  }

  const deleteRoom = (roomId: string) => {
    setRooms((prev) => prev.filter((room) => room.id !== roomId))
    console.log("✅ Quarto deletado:", roomId)
  }

  const checkoutRoom = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId)
    if (room && room.guest) {
      // Atualizar status no histórico para "completed"
      setGuestHistory((prev) =>
        prev.map((entry) =>
          entry.roomNumber === room.number && entry.guest.name === room.guest?.name && entry.status === "active"
            ? { ...entry, status: "completed" }
            : entry,
        ),
      )
    }

    setRooms((prev) =>
      prev.map((room) => (room.id === roomId ? { ...room, status: "available", guest: undefined } : room)),
    )
    console.log("✅ Checkout realizado:", roomId)
  }

  // 📅 Funções de reserva - CORRIGIDO
  const makeReservation = async (reservation: Omit<Reservation, "id" | "createdAt">) => {
    const newReservation: Reservation = {
      ...reservation,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }

    // 🔧 CORREÇÃO: Comparar datas corretamente
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Zerar horas para comparação precisa

    const checkInDate = new Date(reservation.guest.checkIn)
    checkInDate.setHours(0, 0, 0, 0) // Zerar horas para comparação precisa

    console.log("📅 Comparando datas:", {
      today: today.toDateString(),
      checkIn: checkInDate.toDateString(),
      isToday: checkInDate.getTime() === today.getTime(),
      isFuture: checkInDate.getTime() > today.getTime(),
    })

    // Se o check-in é hoje ou no passado, ocupar o quarto imediatamente
    if (checkInDate.getTime() <= today.getTime()) {
      console.log("🏨 Reserva para hoje/passado - ocupando quarto imediatamente")
      setRooms((prev) =>
        prev.map((room) =>
          room.id === reservation.roomId ? { ...room, status: "occupied", guest: reservation.guest } : room,
        ),
      )
    } else {
      // Se é para o futuro, adicionar às reservas futuras
      console.log("📅 Reserva futura - adicionando à lista de reservas futuras")
      setFutureReservations((prev) => [...prev, newReservation])
    }

    // Adicionar ao histórico
    addToGuestHistory(reservation.guest, reservation.roomId, "active")

    console.log("✅ Reserva criada:", newReservation)
  }

  const cancelFutureReservation = (reservationId: string) => {
    const reservation = futureReservations.find((r) => r.id === reservationId)
    if (reservation) {
      // Atualizar status no histórico para "cancelled"
      setGuestHistory((prev) =>
        prev.map((entry) =>
          entry.guest.name === reservation.guest.name &&
          entry.checkInDate === reservation.guest.checkIn &&
          entry.status === "active"
            ? { ...entry, status: "cancelled" }
            : entry,
        ),
      )
    }

    setFutureReservations((prev) => prev.filter((r) => r.id !== reservationId))
    console.log("✅ Reserva cancelada:", reservationId)
  }

  // 💰 Função de despesas
  const addExpenseToRoom = (roomId: string, expense: Expense) => {
    setRooms((prev) =>
      prev.map((room) => {
        if (room.id === roomId && room.guest) {
          const updatedRoom = {
            ...room,
            guest: {
              ...room.guest,
              expenses: [...(room.guest.expenses || []), expense],
            },
          }

          // Atualizar também no histórico
          setGuestHistory((prevHistory) =>
            prevHistory.map((entry) =>
              entry.roomNumber === room.number && entry.guest.name === room.guest?.name && entry.status === "active"
                ? {
                    ...entry,
                    totalPrice: entry.totalPrice + expense.value,
                    guest: {
                      ...entry.guest,
                      expenses: [...(entry.guest.expenses || []), expense],
                    },
                  }
                : entry,
            ),
          )

          return updatedRoom
        }
        return room
      }),
    )

    console.log("✅ Despesa adicionada:", roomId, expense)
  }

  // 📊 Funções de estatísticas
  const getStatistics = (): HotelStatistics => {
    const totalRooms = rooms.length
    const occupiedRooms = rooms.filter((room) => room.status === "occupied").length
    const availableRooms = rooms.filter((room) => room.status === "available").length
    const reservedRooms = futureReservations.length
    const maintenanceRooms = rooms.filter((room) => room.status === "maintenance").length

    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0

    const roomsByType = rooms.reduce(
      (acc, room) => {
        acc[room.type] = (acc[room.type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const monthlyRevenue = rooms
      .filter((room) => room.status === "occupied" && room.guest)
      .reduce((total, room) => {
        const nights = room.guest ? getNumberOfNights(room.guest.checkIn, room.guest.checkOut) : 0
        const expensesTotal = room.guest?.expenses?.reduce((sum, exp) => sum + exp.value, 0) || 0
        return total + room.price * (room.guest?.guests || 0) * nights + expensesTotal
      }, 0)

    const activeGuests = rooms
      .filter((room) => room.guest && room.status === "occupied")
      .reduce((total, room) => total + (room.guest?.guests || 0), 0)

    return {
      totalRooms,
      occupiedRooms,
      availableRooms,
      reservedRooms,
      maintenanceRooms,
      occupancyRate,
      roomsByType,
      monthlyRevenue,
      activeGuests,
    }
  }

  const getFutureReservations = (): Room[] => {
    return futureReservations
      .map((reservation) => {
        const room = rooms.find((r) => r.id === reservation.roomId)
        if (!room) return null

        return {
          ...room,
          status: "reserved" as const,
          guest: reservation.guest,
        }
      })
      .filter(Boolean) as Room[]
  }

  const getGuestHistory = (): GuestHistory[] => {
    return guestHistory.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  const deleteGuestHistory = (historyId: string) => {
    setGuestHistory((prev) => prev.filter((entry) => entry.id !== historyId))
  }

  return (
    <HotelContext.Provider
      value={{
        rooms,
        filteredRooms,
        filters,
        setFilters,
        clearFilters,
        searchRooms,
        addRoom,
        updateRoom,
        deleteRoom,
        checkoutRoom,
        makeReservation,
        addExpenseToRoom,
        getStatistics,
        getFutureReservations,
        futureReservations,
        cancelFutureReservation,
        guestHistory,
        getGuestHistory,
        deleteGuestHistory,
        isLoading,
        error,
        lastSync,
        isOnline,
      }}
    >
      {children}
    </HotelContext.Provider>
  )
}

export function useHotel() {
  const context = useContext(HotelContext)
  if (context === undefined) {
    throw new Error("useHotel must be used within a HotelProvider")
  }
  return context
}
