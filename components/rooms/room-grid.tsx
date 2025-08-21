"use client"

import { useState } from "react"
import { useHotel } from "@/contexts/hotel-context"
import RoomCard from "./room-card"
import RoomFilters from "./room-filters"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function RoomGrid() {
  const { rooms, filteredRooms, searchRooms } = useHotel()
  const [searchTerm, setSearchTerm] = useState("")

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    searchRooms(value)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar quartos..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <RoomFilters />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Nenhum quarto encontrado com os filtros aplicados.</p>
        </div>
      )}
    </div>
  )
}
