"use client"

import { useState } from "react"
import { useHotel } from "@/contexts/hotel-context"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Bed, DollarSign } from "lucide-react"

export default function AdminPanel() {
  const { rooms, addRoom, updateRoom, deleteRoom } = useHotel()
  const { user } = useAuth()
  const [showAddRoom, setShowAddRoom] = useState(false)
  const [editingRoom, setEditingRoom] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState<number>(0)

  const [newRoom, setNewRoom] = useState({
    number: "",
    type: "",
    capacity: 2,
    beds: 1,
    price: 0,
    amenities: [] as string[],
  })

  const roomTypes = ["Solteiro", "Casal", "Casal com AR", "Triplo"]
  const amenityOptions = ["wifi", "tv", "minibar", "balcony", "parking", "breakfast", "gym", "pool", "ar-condicionado"]

  const handleAddRoom = () => {
    if (!newRoom.number || !newRoom.type || newRoom.price <= 0) {
      alert("Preencha todos os campos obrigatórios")
      return
    }

    addRoom({
      number: newRoom.number,
      type: newRoom.type,
      capacity: newRoom.capacity,
      beds: newRoom.beds,
      price: newRoom.price,
      amenities: newRoom.amenities,
    })

    setNewRoom({
      number: "",
      type: "",
      capacity: 2,
      beds: 1,
      price: 0,
      amenities: [],
    })
    setShowAddRoom(false)
  }

  const handleDeleteRoom = (roomId: string) => {
    if (confirm("Tem certeza que deseja excluir este quarto?")) {
      deleteRoom(roomId)
    }
  }

  const handleEditPrice = (roomId: string, currentPrice: number) => {
    setEditingRoom(roomId)
    setEditPrice(currentPrice)
  }

  const handleSavePrice = (roomId: string) => {
    if (editPrice <= 0) {
      alert("O preço deve ser maior que zero")
      return
    }

    updateRoom(roomId, { price: editPrice })
    setEditingRoom(null)
    setEditPrice(0)
  }

  const handleCancelEdit = () => {
    setEditingRoom(null)
    setEditPrice(0)
  }

  const toggleAmenity = (amenity: string) => {
    setNewRoom((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {user?.role === "admin" ? "Painel Administrativo" : "Painel de Gerenciamento"}
          </h2>
          <p className="text-gray-600">
            {user?.role === "admin" ? "Controle total do sistema" : "Gerencie quartos e reservas"}
          </p>
        </div>
      </div>

      <Tabs defaultValue="rooms" className="w-full">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="rooms" className="flex items-center gap-2">
            <Bed className="w-4 h-4" />
            Gerenciar Quartos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rooms" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Quartos do Hotel</h3>
              <p className="text-sm text-gray-600">Adicione, edite ou remova quartos do sistema</p>
            </div>
            <Dialog open={showAddRoom} onOpenChange={setShowAddRoom}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Quarto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Quarto</DialogTitle>
                  <DialogDescription>Preencha os dados do novo quarto</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="number">Número</Label>
                      <Input
                        id="number"
                        value={newRoom.number}
                        onChange={(e) => setNewRoom((prev) => ({ ...prev, number: e.target.value }))}
                        placeholder="101"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">Tipo</Label>
                      <Select
                        value={newRoom.type}
                        onValueChange={(value) => setNewRoom((prev) => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {roomTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Capacidade</Label>
                      <Input
                        id="capacity"
                        type="number"
                        min="1"
                        max="10"
                        value={newRoom.capacity}
                        onChange={(e) => setNewRoom((prev) => ({ ...prev, capacity: Number.parseInt(e.target.value) }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="beds">Camas</Label>
                      <Input
                        id="beds"
                        type="number"
                        min="1"
                        max="5"
                        value={newRoom.beds}
                        onChange={(e) => setNewRoom((prev) => ({ ...prev, beds: Number.parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Preço (R$ por pessoa/noite)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newRoom.price}
                      onChange={(e) => setNewRoom((prev) => ({ ...prev, price: Number.parseFloat(e.target.value) }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Comodidades</Label>
                    <div className="flex flex-wrap gap-2">
                      {amenityOptions.map((amenity) => (
                        <Badge
                          key={amenity}
                          variant={newRoom.amenities.includes(amenity) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleAmenity(amenity)}
                        >
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button onClick={handleAddRoom} className="w-full">
                    Adicionar Quarto
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Capacidade</TableHead>
                    <TableHead>Preço/Pessoa</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">{room.number}</TableCell>
                      <TableCell>{room.type}</TableCell>
                      <TableCell>{room.capacity} pessoas</TableCell>
                      <TableCell>
                        {editingRoom === room.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={editPrice}
                              onChange={(e) => setEditPrice(Number.parseFloat(e.target.value))}
                              className="w-24"
                            />
                            <Button size="sm" onClick={() => handleSavePrice(room.id)}>
                              ✓
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                              ✕
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span>R$ {room.price.toFixed(2)}</span>
                            <Button size="sm" variant="ghost" onClick={() => handleEditPrice(room.id, room.price)}>
                              <DollarSign className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={room.status === "available" ? "default" : "secondary"}>
                          {room.status === "available"
                            ? "Disponível"
                            : room.status === "occupied"
                              ? "Ocupado"
                              : room.status === "maintenance"
                                ? "Manutenção"
                                : "Reservado"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteRoom(room.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
