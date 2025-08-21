"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
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
  deleteGuestHistory: (historyId: string) => void // Nova função
}

const HotelContext = createContext<HotelContextType | undefined>(undefined)

// Mock data (mantido igual)
const initialRooms: Room[] = [
  // 1º Andar
  {
    id: "1",
    number: "101",
    type: "Casal",
    capacity: 2,
    beds: 1,
    price: 120,
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
    amenities: ["wifi", "tv"],
    status: "available",
  },
  {
    id: "3",
    number: "103",
    type: "Solteiro",
    capacity: 1,
    beds: 1,
    price: 100,
    amenities: ["wifi", "tv"],
    status: "available",
  },
  {
    id: "4",
    number: "104",
    type: "Solteiro",
    capacity: 1,
    beds: 1,
    price: 100,
    amenities: ["wifi", "tv"],
    status: "available",
  },

  // 2º Andar
  {
    id: "5",
    number: "201",
    type: "Casal com AR",
    capacity: 2,
    beds: 1,
    price: 149,
    amenities: ["wifi", "tv", "ar-condicionado"],
    status: "available",
  },
  {
    id: "6",
    number: "202",
    type: "Triplo",
    capacity: 3,
    beds: 2,
    price: 100,
    amenities: ["wifi", "tv"],
    status: "available",
  },
  {
    id: "7",
    number: "203",
    type: "Casal com AR",
    capacity: 2,
    beds: 1,
    price: 149,
    amenities: ["wifi", "tv", "ar-condicionado"],
    status: "available",
  },
  {
    id: "8",
    number: "204",
    type: "Solteiro",
    capacity: 1,
    beds: 1,
    price: 100,
    amenities: ["wifi", "tv"],
    status: "available",
  },
  {
    id: "9",
    number: "205",
    type: "Casal",
    capacity: 2,
    beds: 1,
    price: 120,
    amenities: ["wifi", "tv"],
    status: "available",
  },
  {
    id: "10",
    number: "206",
    type: "Solteiro",
    capacity: 1,
    beds: 1,
    price: 100,
    amenities: ["wifi", "tv"],
    status: "available",
  },
  {
    id: "11",
    number: "207",
    type: "Solteiro",
    capacity: 1,
    beds: 1,
    price: 100,
    amenities: ["wifi", "tv"],
    status: "available",
  },
  {
    id: "12",
    number: "208",
    type: "Casal",
    capacity: 2,
    beds: 1,
    price: 120,
    amenities: ["wifi", "tv"],
    status: "available",
  },
  {
    id: "13",
    number: "209",
    type: "Solteiro",
    capacity: 1,
    beds: 1,
    price: 100,
    amenities: ["wifi", "tv"],
    status: "available",
  },
  {
    id: "14",
    number: "210",
    type: "Casal",
    capacity: 2,
    beds: 1,
    price: 120,
    amenities: ["wifi", "tv"],
    status: "available",
  },

  // 3º Andar
  {
    id: "15",
    number: "301",
    type: "Casal com AR",
    capacity: 2,
    beds: 1,
    price: 149,
    amenities: ["wifi", "tv", "ar-condicionado"],
    status: "available",
  },
  {
    id: "16",
    number: "302",
    type: "Triplo",
    capacity: 3,
    beds: 2,
    price: 100,
    amenities: ["wifi", "tv"],
    status: "available",
  },
  {
    id: "17",
    number: "303",
    type: "Casal com AR",
    capacity: 2,
    beds: 1,
    price: 149,
    amenities: ["wifi", "tv", "ar-condicionado"],
    status: "available",
  },
  {
    id: "18",
    number: "304",
    type: "Solteiro",
    capacity: 1,
    beds: 1,
    price: 100,
    amenities: ["wifi", "tv"],
    status: "available",
  },
  {
    id: "19",
    number: "305",
    type: "Casal",
    capacity: 2,
    beds: 1,
    price: 120,
    amenities: ["wifi", "tv"],
    status: "available",
  },
  {
    id: "20",
    number: "306",
    type: "Solteiro",
    capacity: 1,
    beds: 1,
    price: 100,
    amenities: ["wifi", "tv"],
    status: "available",
  },
  {
    id: "21",
    number: "307",
    type: "Solteiro",
    capacity: 1,
    beds: 1,
    price: 100,
    amenities: ["wifi", "tv"],
    status: "available",
  },
  {
    id: "22",
    number: "308",
    type: "Casal",
    capacity: 2,
    beds: 1,
    price: 120,
    amenities: ["wifi", "tv"],
    status: "available",
  },
  {
    id: "23",
    number: "309",
    type: "Casal",
    capacity: 2,
    beds: 1,
    price: 120,
    amenities: ["wifi", "tv"],
    status: "available",
  },
  {
    id: "24",
    number: "310",
    type: "Casal",
    capacity: 2,
    beds: 1,
    price: 120,
    amenities: ["wifi", "tv"],
    status: "available",
  },

  // 4º Andar
  {
    id: "25",
    number: "401",
    type: "Casal",
    capacity: 2,
    beds: 1,
    price: 120,
    amenities: ["wifi", "tv"],
    status: "available",
  },
  {
    id: "26",
    number: "402",
    type: "Triplo",
    capacity: 3,
    beds: 2,
    price: 100,
    amenities: ["wifi", "tv"],
    status: "available",
  },
  {
    id: "27",
    number: "403",
    type: "Casal",
    capacity: 2,
    beds: 1,
    price: 120,
    amenities: ["wifi", "tv"],
    status: "available",
  },
  {
    id: "28",
    number: "404",
    type: "Solteiro",
    capacity: 1,
    beds: 1,
    price: 100,
    amenities: ["wifi", "tv"],
    status: "available",
  },
  {
    id: "29",
    number: "405",
    type: "Casal",
    capacity: 2,
    beds: 1,
    price: 120,
    amenities: ["wifi", "tv"],
    status: "available",
  },
  {
    id: "30",
    number: "406",
    type: "Solteiro",
    capacity: 1,
    beds: 1,
    price: 100,
    amenities: ["wifi", "tv"],
    status: "available",
  },
  {
    id: "31",
    number: "407",
    type: "Solteiro",
    capacity: 1,
    beds: 1,
    price: 100,
    amenities: ["wifi", "tv"],
    status: "available",
  },
  {
    id: "32",
    number: "408",
    type: "Casal",
    capacity: 2,
    beds: 1,
    price: 120,
    amenities: ["wifi", "tv"],
    status: "available",
  },
  {
    id: "33",
    number: "409",
    type: "Casal",
    capacity: 2,
    beds: 1,
    price: 120,
    amenities: ["wifi", "tv"],
    status: "available",
  },
  {
    id: "34",
    number: "410",
    type: "Casal",
    capacity: 2,
    beds: 1,
    price: 120,
    amenities: ["wifi", "tv"],
    status: "available",
  },

  // 5º Andar
  {
    id: "35",
    number: "501",
    type: "Casal com AR",
    capacity: 2,
    beds: 1,
    price: 149,
    amenities: ["wifi", "tv", "ar-condicionado"],
    status: "available",
  },
  {
    id: "36",
    number: "502",
    type: "Triplo",
    capacity: 3,
    beds: 2,
    price: 100,
    amenities: ["wifi", "tv"],
    status: "available",
  },
  {
    id: "37",
    number: "503",
    type: "Casal com AR",
    capacity: 2,
    beds: 1,
    price: 149,
    amenities: ["wifi", "tv", "ar-condicionado"],
    status: "available",
  },
  {
    id: "38",
    number: "504",
    type: "Solteiro",
    capacity: 1,
    beds: 1,
    price: 100,
    amenities: ["wifi", "tv"],
    status: "available",
  },
  {
    id: "39",
    number: "505",
    type: "Casal",
    capacity: 2,
    beds: 1,
    price: 120,
    amenities: ["wifi", "tv"],
    status: "available",
  },
  {
    id: "40",
    number: "506",
    type: "Solteiro",
    capacity: 1,
    beds: 1,
    price: 100,
    amenities: ["wifi", "tv"],
    status: "available",
  },
  {
    id: "41",
    number: "507",
    type: "Solteiro",
    capacity: 1,
    beds: 1,
    price: 100,
    amenities: ["wifi", "tv"],
    status: "available",
  },
  {
    id: "42",
    number: "508",
    type: "Casal",
    capacity: 2,
    beds: 1,
    price: 120,
    amenities: ["wifi", "tv"],
    status: "available",
  },
  {
    id: "43",
    number: "509",
    type: "Casal",
    capacity: 2,
    beds: 1,
    price: 120,
    amenities: ["wifi", "tv"],
    status: "available",
  },
  {
    id: "44",
    number: "510",
    type: "Casal com AR",
    capacity: 2,
    beds: 1,
    price: 149,
    amenities: ["wifi", "tv", "ar-condicionado"],
    status: "available",
  },

  // 6º Andar
  {
    id: "45",
    number: "601",
    type: "Solteiro",
    capacity: 1,
    beds: 1,
    price: 100,
    amenities: ["wifi", "tv"],
    status: "available",
  },
  {
    id: "46",
    number: "602",
    type: "Solteiro",
    capacity: 1,
    beds: 1,
    price: 100,
    amenities: ["wifi", "tv"],
    status: "available",
  },
  {
    id: "47",
    number: "603",
    type: "Casal",
    capacity: 2,
    beds: 1,
    price: 120,
    amenities: ["wifi", "tv"],
    status: "available",
  },
  {
    id: "48",
    number: "604",
    type: "Casal",
    capacity: 2,
    beds: 1,
    price: 120,
    amenities: ["wifi", "tv"],
    status: "available",
  },
  {
    id: "49",
    number: "605",
    type: "Casal",
    capacity: 2,
    beds: 1,
    price: 120,
    amenities: ["wifi", "tv"],
    status: "available",
  },
]

export function HotelProvider({ children }: { children: ReactNode }) {
  const [rooms, setRooms] = useState<Room[]>(initialRooms)
  const [filteredRooms, setFilteredRooms] = useState<Room[]>(initialRooms)
  const [futureReservations, setFutureReservations] = useState<Reservation[]>([])
  const [guestHistory, setGuestHistory] = useState<GuestHistory[]>([])
  const [filters, setFilters] = useState<HotelFilters>({
    type: "",
    status: "",
    minPrice: 0,
    maxPrice: 1000,
  })

  useEffect(() => {
    const storedRooms = localStorage.getItem("hotel_rooms")
    const storedReservations = localStorage.getItem("hotel_future_reservations")
    const storedHistory = localStorage.getItem("hotel_guest_history")

    if (storedRooms) {
      const parsedRooms = JSON.parse(storedRooms)
      setRooms(parsedRooms)
      setFilteredRooms(parsedRooms)
    }

    if (storedReservations) {
      const parsedReservations = JSON.parse(storedReservations)
      setFutureReservations(parsedReservations)
    }

    if (storedHistory) {
      const parsedHistory = JSON.parse(storedHistory)
      setGuestHistory(parsedHistory)
    }

    // Verificar se alguma reserva futura deve ser ativada hoje
    checkAndActivateFutureReservations()
  }, [])

  useEffect(() => {
    localStorage.setItem("hotel_rooms", JSON.stringify(rooms))
  }, [rooms])

  useEffect(() => {
    localStorage.setItem("hotel_future_reservations", JSON.stringify(futureReservations))
  }, [futureReservations])

  useEffect(() => {
    localStorage.setItem("hotel_guest_history", JSON.stringify(guestHistory))
  }, [guestHistory])

  // Função para adicionar ao histórico
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

    setGuestHistory((prev) => [historyEntry, ...prev]) // Adicionar no início (mais recente primeiro)
  }

  // Função para verificar e ativar reservas futuras que chegaram na data
  const checkAndActivateFutureReservations = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    setFutureReservations((prevReservations) => {
      const reservationsToActivate = prevReservations.filter((reservation) => {
        const checkInDate = new Date(reservation.guest.checkIn)
        checkInDate.setHours(0, 0, 0, 0)
        return checkInDate <= today
      })

      // Ativar as reservas que chegaram na data
      reservationsToActivate.forEach((reservation) => {
        setRooms((prevRooms) =>
          prevRooms.map((room) =>
            room.id === reservation.roomId
              ? {
                  ...room,
                  status: "occupied",
                  guest: {
                    ...reservation.guest,
                    expenses: [],
                  },
                }
              : room,
          ),
        )
        // Adicionar ao histórico quando ativar
        addToGuestHistory(reservation.guest, reservation.roomId, "active")
      })

      // Remover as reservas ativadas da lista de futuras
      return prevReservations.filter((reservation) => {
        const checkInDate = new Date(reservation.guest.checkIn)
        checkInDate.setHours(0, 0, 0, 0)
        return checkInDate > today
      })
    })
  }

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

  const addRoom = (room: Omit<Room, "id" | "status" | "guest">) => {
    const newRoom: Room = {
      ...room,
      id: Date.now().toString(),
      status: "available",
    }
    setRooms((prev) => [...prev, newRoom])
  }

  const updateRoom = (roomId: string, updates: Partial<Room>) => {
    setRooms((prev) => prev.map((room) => (room.id === roomId ? { ...room, ...updates } : room)))
  }

  const deleteRoom = (roomId: string) => {
    setRooms((prev) => prev.filter((room) => room.id !== roomId))
    // Também remover reservas futuras para este quarto
    setFutureReservations((prev) => prev.filter((reservation) => reservation.roomId !== roomId))
  }

  const checkoutRoom = (roomId: string) => {
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

    setRooms((prev) =>
      prev.map((room) => (room.id === roomId ? { ...room, status: "available", guest: undefined } : room)),
    )
    // Também remover da lista de reservas futuras se existir
    setFutureReservations((prev) => prev.filter((reservation) => reservation.roomId !== roomId))
  }

  const makeReservation = async (reservation: Omit<Reservation, "id" | "createdAt">) => {
    // Simular delay de API
    await new Promise((resolve) => setTimeout(resolve, 500))

    const checkInDate = new Date(reservation.guest.checkIn)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    checkInDate.setHours(0, 0, 0, 0)

    const newReservation: Reservation = {
      id: Date.now().toString(),
      roomId: reservation.roomId,
      guest: reservation.guest,
      createdAt: new Date().toISOString(),
    }

    if (checkInDate <= today) {
      // Reserva para hoje ou passado - ocupar o quarto imediatamente
      setRooms((prev) =>
        prev.map((room) =>
          room.id === reservation.roomId
            ? {
                ...room,
                status: "occupied",
                guest: {
                  ...reservation.guest,
                  expenses: [],
                },
              }
            : room,
        ),
      )
      // Adicionar ao histórico imediatamente
      addToGuestHistory(reservation.guest, reservation.roomId, "active")
    } else {
      // Reserva futura - adicionar à lista de reservas futuras, quarto continua disponível
      setFutureReservations((prev) => [...prev, newReservation])
      // Adicionar ao histórico como reserva futura
      addToGuestHistory(reservation.guest, reservation.roomId, "active")
    }

    console.log("Reservation confirmed, email sent to:", reservation.guest.email)
  }

  const addExpenseToRoom = (roomId: string, expense: Expense) => {
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
  }

  const getStatistics = (): HotelStatistics => {
    const totalRooms = rooms.length
    const occupiedRooms = rooms.filter((room) => room.status === "occupied").length
    const availableRooms = rooms.filter((room) => room.status === "available").length
    const reservedRooms = futureReservations.length // Usar a lista de reservas futuras
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
    // Criar objetos Room virtuais para as reservas futuras
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

  const cancelFutureReservation = (reservationId: string) => {
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

    setFutureReservations((prev) => prev.filter((reservation) => reservation.id !== reservationId))
  }

  const getGuestHistory = (): GuestHistory[] => {
    return guestHistory.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  // Nova função para deletar do histórico
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
        deleteGuestHistory, // Nova função exportada
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
