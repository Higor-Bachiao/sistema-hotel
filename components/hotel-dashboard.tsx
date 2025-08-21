"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useHotel } from "@/contexts/hotel-context"
import LoginForm from "./auth/login-form"
import Navbar from "./layout/navbar"
import RoomGrid from "./rooms/room-grid"
import AdminPanel from "./admin/admin-panel"
import FutureReservationsList from "./reservations/future-reservations-list"
import StatisticsPanel from "./dashboard/statistics-panel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Loader2, Wifi, WifiOff, RefreshCw, Clock } from "lucide-react"

export default function HotelDashboard() {
  const { user, isAuthenticated } = useAuth()
  const { isLoading, error, lastSync, syncData } = useHotel()
  const [activeTab, setActiveTab] = useState("rooms")
  const [isSyncing, setIsSyncing] = useState(false)

  if (!isAuthenticated) {
    return <LoginForm />
  }

  const handleManualSync = async () => {
    setIsSyncing(true)
    try {
      await syncData()
    } finally {
      setIsSyncing(false)
    }
  }

  // Definir abas baseado no role do usuário
  const getAvailableTabs = () => {
    const tabs = []

    // Todos podem ver quartos e reservas
    tabs.push({ value: "rooms", label: "Quartos" }, { value: "future-reservations", label: "Reservas Futuras" })

    // Admin e Staff podem administrar
    if (user?.role === "admin" || user?.role === "staff") {
      tabs.push({ value: "admin", label: "Administração" })
    }

    // Apenas Admin pode ver estatísticas
    if (user?.role === "admin") {
      tabs.push({ value: "statistics", label: "Estatísticas" })
    }

    return tabs
  }

  const availableTabs = getAvailableTabs()

  // Verificar se a aba ativa está disponível
  const isTabAvailable = availableTabs.some((tab) => tab.value === activeTab)
  const currentTab = isTabAvailable ? activeTab : "rooms"

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Sistema de Gerenciamento Hoteleiro</h1>
              <p className="text-gray-600">
                Bem-vindo, {user?.name}!{user?.role === "admin" && " (Administrador)"}
                {user?.role === "staff" && " (Funcionário)"}
                {user?.role === "guest" && " (Hóspede)"}
              </p>
            </div>

            {/* Painel de Status e Sincronização */}
            <div className="flex items-center gap-4">
              {/* Status da Conexão */}
              <div className="flex items-center gap-2">
                {error ? (
                  <div className="flex items-center gap-2 text-red-600">
                    <WifiOff className="w-4 h-4" />
                    <span className="text-sm">Offline</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-600">
                    <Wifi className="w-4 h-4" />
                    <span className="text-sm">Online</span>
                  </div>
                )}
              </div>

              {/* Última Sincronização */}
              {lastSync && (
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Sync: {lastSync.toLocaleTimeString()}</span>
                </div>
              )}

              {/* Botão de Sincronização Manual */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualSync}
                disabled={isSyncing}
                className="flex items-center gap-2 bg-transparent"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
                {isSyncing ? "Sincronizando..." : "Sincronizar"}
              </Button>
            </div>
          </div>
        </div>

        {/* Alerta de erro */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Erro de Conexão:</strong> {error}
              <br />
              <span className="text-sm">O sistema está funcionando offline com dados locais.</span>
            </AlertDescription>
          </Alert>
        )}

        {/* Alerta de Sincronização */}
        {!error && lastSync && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Wifi className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Sistema Sincronizado:</strong> Dados atualizados automaticamente a cada 10 segundos.
              <br />
              <span className="text-sm">
                Última sincronização: {lastSync.toLocaleString()} | Todos os dispositivos recebem atualizações em tempo
                real.
              </span>
            </AlertDescription>
          </Alert>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-lg">Carregando dados do sistema...</span>
            </div>
          </div>
        ) : (
          <Tabs value={currentTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1 mb-8">
              {availableTabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="text-sm">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="rooms" className="mt-0">
              <RoomGrid />
            </TabsContent>

            <TabsContent value="future-reservations" className="mt-0">
              <FutureReservationsList />
            </TabsContent>

            {/* Admin e Staff podem administrar */}
            {(user?.role === "admin" || user?.role === "staff") && (
              <TabsContent value="admin" className="mt-0">
                <AdminPanel />
              </TabsContent>
            )}

            {/* Apenas Admin pode ver estatísticas */}
            {user?.role === "admin" && (
              <TabsContent value="statistics" className="mt-0">
                <StatisticsPanel />
              </TabsContent>
            )}
          </Tabs>
        )}
      </main>
    </div>
  )
}
