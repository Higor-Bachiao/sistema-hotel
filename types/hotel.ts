export interface Room {
  id: string
  number: string
  type: string
  capacity: number
  beds: number
  price: number // Preço por pessoa
  amenities: string[]
  status: "available" | "occupied" | "maintenance" | "reserved"
  guest?: Guest
}

// Novo: Interface para despesas
export interface Expense {
  description: string
  value: number
}

// Atualizado: Campos email, cpf e phone agora são opcionais
export interface Guest {
  name: string
  email?: string // Agora opcional
  phone?: string // Agora opcional
  cpf?: string // Agora opcional
  checkIn: string
  checkOut: string
  guests: number
  expenses?: Expense[]
}

export interface Reservation {
  id: string
  roomId: string
  guest: Guest
  createdAt: string
}

export interface HotelFilters {
  type: string
  status: string
  minPrice: number
  maxPrice: number
}

export interface HotelStatistics {
  totalRooms: number
  occupiedRooms: number
  availableRooms: number
  reservedRooms: number
  maintenanceRooms: number
  occupancyRate: number
  roomsByType: Record<string, number>
  monthlyRevenue: number
  activeGuests: number
}
