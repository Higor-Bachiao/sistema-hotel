"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import type { Room, Reservation, HotelFilters, HotelStatistics, Expense, Guest } from "@/types/hotel"
import { getNumberOfNights } from "@/lib/price-utils"
import { HotelAPI } from "@/lib/hotel-api"

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
  syncData: () => Promise<void>
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
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [filters, setFilters] = useState<HotelFilters>({
    type: "",
    status: "",
    minPrice: 0,
    maxPrice: 1000,
  })

  // 🔄 Função para sincronizar dados
  const syncData = async () => {
    try {
      console.log("🔄 Sincronizando dados...")

      // Carregar quartos
      const roomsFromDB = await HotelAPI.getAllRooms()
      setRooms(roomsFromDB)

      // Carregar reservas futuras
      try {
        const reservationsFromDB = await HotelAPI.getFutureReservations()
        setFutureReservations(reservationsFromDB)
      } catch (reservationError) {
        console.warn("⚠️ Erro ao carregar reservas futuras:", reservationError)
      }

      setLastSync(new Date())
      setError(null)
      console.log("✅ Sincronização concluída")
    } catch (error: any) {
      console.error("❌ Erro na sincronização:", error)
      setError(`Erro de sincronização: ${error.message}`)
    }
  }

  // 🔄 Carregar dados do banco na inicialização
  useEffect(() => {
    const loadDataFromDatabase = async () => {
      try {
        setIsLoading(true)
        setError(null)

        console.log("🔍 Carregando dados iniciais...")

        // Primeira sincronização
        await syncData()

        // Carregar histórico do localStorage (por enquanto)
        const storedHistory = localStorage.getItem("hotel_guest_history")
        if (storedHistory) {
          const parsedHistory = JSON.parse(storedHistory)
          setGuestHistory(parsedHistory)
          console.log(`✅ ${parsedHistory.length} registros de histórico carregados`)
        }
      } catch (error: any) {
        console.error("❌ Erro ao carregar dados do banco:", error)
        setError(`Erro ao conectar com o banco: ${error.message}`)

        // Fallback para localStorage
        console.log("🔄 Tentando carregar do localStorage...")
        const storedRooms = localStorage.getItem("hotel_rooms")
        if (storedRooms) {
          const parsedRooms = JSON.parse(storedRooms)
          setRooms(parsedRooms)
          console.log("✅ Dados carregados do localStorage")
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadDataFromDatabase()
  }, [])

  // 🔄 Configurar sincronização automática a cada 10 segundos
  useEffect(() => {
    if (!isLoading && !error) {
      console.log("⏰ Iniciando sincronização automática (10s)")

      syncIntervalRef.current = setInterval(async () => {
        await syncData()
      }, 10000) // 10 segundos

      // Cleanup
      return () => {
        if (syncIntervalRef.current) {
          clearInterval(syncIntervalRef.current)
          console.log("⏹️ Sincronização automática parada")
        }
      }
    }
  }, [isLoading, error])

  // 🔄 Sincronizar quando a aba volta ao foco
  useEffect(() => {
    const handleFocus = () => {
      console.log("👁️ Aba voltou ao foco - sincronizando...")
      syncData()
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("👁️ Página ficou visível - sincronizando...")
        syncData()
      }
    }

    window.addEventListener("focus", handleFocus)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      window.removeEventListener("focus", handleFocus)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  // 💾 Backup no localStorage (apenas para histórico)
  useEffect(() => {
    localStorage.setItem("hotel_guest_history", JSON.stringify(guestHistory))
  }, [guestHistory])

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
  const addRoom = async (room: Omit<Room, "id" | "status" | "guest">) => {
    try {
      setError(null)
      console.log("🏨 Adicionando novo quarto:", room)

      const result = await HotelAPI.createRoom({
        ...room,
        status: "available",
      })

      // Sincronizar imediatamente após criar
      await syncData()

      console.log("✅ Quarto adicionado com sucesso")
    } catch (error: any) {
      console.error("❌ Erro ao adicionar quarto:", error)
      setError(`Erro ao adicionar quarto: ${error.message}`)
      throw error
    }
  }

  const updateRoom = async (roomId: string, updates: Partial<Room>) => {
    try {
      setError(null)
      console.log("🔄 Atualizando quarto:", roomId, updates)

      await HotelAPI.updateRoom(roomId, updates)

      // Sincronizar imediatamente após atualizar
      await syncData()

      console.log("✅ Quarto atualizado com sucesso")
    } catch (error: any) {
      console.error("❌ Erro ao atualizar quarto:", error)
      setError(`Erro ao atualizar quarto: ${error.message}`)
      throw error
    }
  }

  const deleteRoom = async (roomId: string) => {
    try {
      setError(null)
      console.log("🗑️ Deletando quarto:", roomId)

      await HotelAPI.deleteRoom(roomId)

      // Sincronizar imediatamente após deletar
      await syncData()

      console.log("✅ Quarto deletado com sucesso")
    } catch (error: any) {
      console.error("❌ Erro ao deletar quarto:", error)
      setError(`Erro ao deletar quarto: ${error.message}`)
      throw error
    }
  }

  const checkoutRoom = async (roomId: string) => {
    try {
      setError(null)
      console.log("🚪 Fazendo checkout do quarto:", roomId)

      // Encontrar o quarto antes de fazer checkout
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

      await HotelAPI.updateRoomStatus(roomId, "available")

      // Sincronizar imediatamente após checkout
      await syncData()

      console.log("✅ Checkout realizado com sucesso")
    } catch (error: any) {
      console.error("❌ Erro ao fazer checkout:", error)
      setError(`Erro ao fazer checkout: ${error.message}`)
      throw error
    }
  }

  // 📅 Funções de reserva
  const makeReservation = async (reservation: Omit<Reservation, "id" | "createdAt">) => {
    try {
      setError(null)
      console.log("📅 Fazendo reserva:", reservation)

      await HotelAPI.createReservation(reservation)

      // Sincronizar imediatamente após fazer reserva
      await syncData()

      // Adicionar ao histórico
      addToGuestHistory(reservation.guest, reservation.roomId, "active")

      console.log("✅ Reserva realizada com sucesso")
    } catch (error: any) {
      console.error("❌ Erro ao fazer reserva:", error)
      setError(`Erro ao fazer reserva: ${error.message}`)
      throw error
    }
  }

  const cancelFutureReservation = async (reservationId: string) => {
    try {
      setError(null)
      console.log("❌ Cancelando reserva:", reservationId)

      // Encontrar a reserva antes de cancelar
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

      await HotelAPI.cancelReservation(reservationId)

      // Sincronizar imediatamente após cancelar
      await syncData()

      console.log("✅ Reserva cancelada com sucesso")
    } catch (error: any) {
      console.error("❌ Erro ao cancelar reserva:", error)
      setError(`Erro ao cancelar reserva: ${error.message}`)
      throw error
    }
  }

  // 💰 Função de despesas
  const addExpenseToRoom = async (roomId: string, expense: Expense) => {
    try {
      setError(null)
      console.log("💰 Adicionando despesa:", roomId, expense)

      const room = rooms.find((r) => r.id === roomId)
      if (!room?.guest) {
        throw new Error("Quarto não tem hóspede ativo")
      }

      // Por enquanto, vamos simular um guestId
      const guestId = `guest_${roomId}_${Date.now()}`

      // Adicionar no banco (quando implementarmos)
      // await HotelAPI.addExpense(guestId, expense)

      // Atualizar localmente
      setRooms((prevRooms) =>
        prevRooms.map((room) => {
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

      console.log("✅ Despesa adicionada com sucesso")
    } catch (error: any) {
      console.error("❌ Erro ao adicionar despesa:", error)
      setError(`Erro ao adicionar despesa: ${error.message}`)
      throw error
    }
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
        syncData,
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
