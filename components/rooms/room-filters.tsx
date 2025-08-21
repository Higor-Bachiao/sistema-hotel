"use client"

import { useHotel } from "@/contexts/hotel-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Filter, X } from "lucide-react"

export default function RoomFilters() {
  const { filters, setFilters, clearFilters } = useHotel()

  const roomTypes = ["Solteiro", "Casal", "Casal com AR", "Triplo"]
  const statusOptions = [
    { value: "available", label: "Disponível" },
    { value: "occupied", label: "Ocupado" },
    { value: "maintenance", label: "Manutenção" },
    { value: "reserved", label: "Reservado" },
  ]

  const hasActiveFilters = filters.type || filters.status || filters.minPrice || filters.maxPrice

  return (
    <div className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
            {hasActiveFilters && <span className="ml-1 bg-blue-600 text-white text-xs rounded-full w-2 h-2"></span>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Tipo de Quarto</DropdownMenuLabel>
          {roomTypes.map((type) => (
            <DropdownMenuItem
              key={type}
              onClick={() => setFilters({ ...filters, type: filters.type === type ? "" : type })}
              className={filters.type === type ? "bg-blue-50" : ""}
            >
              {type}
              {filters.type === type && <span className="ml-auto">✓</span>}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          <DropdownMenuLabel>Status</DropdownMenuLabel>
          {statusOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setFilters({ ...filters, status: filters.status === option.value ? "" : option.value })}
              className={filters.status === option.value ? "bg-blue-50" : ""}
            >
              {option.label}
              {filters.status === option.value && <span className="ml-auto">✓</span>}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="w-4 h-4 mr-1" />
          Limpar
        </Button>
      )}
    </div>
  )
}
