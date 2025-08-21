"use client"

import { useState } from "react"
import { useHotel } from "@/contexts/hotel-context"
import { useAuth } from "@/contexts/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Hotel, Users, Calendar, BarChart3, History, Settings, Wifi, WifiOff, Clock, CheckCircle } from "lucide-react"
import RoomGrid from "@/components/rooms/room-grid"
import RoomFilters from "@/components/rooms/room-filters"
import StatisticsPanel from "@/components/dashboard/statistics-panel"
import FutureReservationsList from "@/components/reservations/future-reservations-list"
import AdminPanel from "@/components/admin/admin-panel"

export default function HotelDashboard() {
  const { user } = useAuth()
  const { rooms, filteredRooms, isLoading, error, lastSync, isOnline, guestHistory, getGuestHistory } = useHotel()
  const [activeTab, setActiveTab] = useState("rooms")

  const formatLastSync = (date: Date | null) => {
    if (!date) return "Nunca"
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)

    if (seconds < 60) return `${seconds}s atrás`
    if (minutes < 60) return `${minutes}min atrás`
    return date.toLocaleTimeString()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando sistema do hotel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header com status de sincronização */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Hotel className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Sistema Hotel</h1>
                <p className="text-gray-600">Bem-vindo, {user?.name}</p>
              </div>
            </div>

            {/* Status de conexão e sincronização */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {isOnline ? <Wifi className="w-4 h-4 text-green-600" /> : <WifiOff className="w-4 h-4 text-red-600" />}
                <span className={`text-sm ${isOnline ? "text-green-600" : "text-red-600"}`}>
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Última sync: {formatLastSync(lastSync)}</span>
              </div>

              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-600">Auto-sync ativo</span>
              </div>
            </div>
          </div>

          {/* Alertas */}
          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {!isOnline && (
            <Alert className="mb-4 border-yellow-200 bg-yellow-50">
              <AlertDescription className="text-yellow-800">
                Você está offline. As alterações serão sincronizadas quando a conexão for restaurada.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Quartos</CardTitle>
              <Hotel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rooms.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quartos Ocupados</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {rooms.filter((room) => room.status === "occupied").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quartos Disponíveis</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {rooms.filter((room) => room.status === "available").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {rooms.length > 0
                  ? Math.round((rooms.filter((room) => room.status === "occupied").length / rooms.length) * 100)
                  : 0}
                %
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs principais */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="rooms" className="flex items-center gap-2">
              <Hotel className="w-4 h-4" />
              Quartos
            </TabsTrigger>
            <TabsTrigger value="reservations" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Reservas
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Estatísticas
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Histórico
            </TabsTrigger>
            {(user?.role === "admin" || user?.role === "staff") && (
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Administração
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="rooms" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
                <CardDescription>Filtre os quartos por tipo, status e preço</CardDescription>
              </CardHeader>
              <CardContent>
                <RoomFilters />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Quartos ({filteredRooms.length})</span>
                  <Badge variant="outline" className="ml-2">
                    Sincronização automática ativa
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Visualize e gerencie todos os quartos do hotel. Os dados são sincronizados automaticamente entre
                  dispositivos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RoomGrid />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reservations">
            <Card>
              <CardHeader>
                <CardTitle>Próximas Reservas</CardTitle>
                <CardDescription>Gerencie as reservas futuras do hotel</CardDescription>
              </CardHeader>
              <CardContent>
                <FutureReservationsList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statistics">
            <StatisticsPanel />
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Hóspedes</CardTitle>
                <CardDescription>Histórico completo de todos os hóspedes que passaram pelo hotel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getGuestHistory().length > 0 ? (
                    <div className="space-y-2">
                      {getGuestHistory().map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">{entry.guest.name}</p>
                            <p className="text-sm text-gray-600">
                              Quarto {entry.roomNumber} ({entry.roomType}) - {entry.checkInDate} a {entry.checkOutDate}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">R$ {entry.totalPrice.toFixed(2)}</p>
                            <Badge
                              variant={
                                entry.status === "completed"
                                  ? "default"
                                  : entry.status === "active"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {entry.status === "completed"
                                ? "Concluído"
                                : entry.status === "active"
                                  ? "Ativo"
                                  : "Cancelado"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum histórico encontrado</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {(user?.role === "admin" || user?.role === "staff") && (
            <TabsContent value="admin">
              <AdminPanel />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}
