"use client"

import { useHotel } from "@/contexts/hotel-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import {
  Users,
  Bed,
  DollarSign,
  TrendingUp,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock,
  History,
  User,
  Mail,
  Phone,
  Trash2,
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function StatisticsPanel() {
  const { getStatistics, getGuestHistory, deleteGuestHistory } = useHotel()
  const stats = getStatistics()
  const guestHistory = getGuestHistory()

  // Dados para o gráfico de barras (quartos por tipo)
  const roomTypeData = Object.entries(stats.roomsByType).map(([type, count]) => ({
    type,
    count,
  }))

  // Dados para o gráfico de pizza (status dos quartos) - apenas com valores > 0
  const statusData = [
    { name: "Disponível", value: stats.availableRooms, color: "#10B981" },
    { name: "Ocupado", value: stats.occupiedRooms, color: "#EF4444" },
    { name: "Reservado", value: stats.reservedRooms, color: "#3B82F6" },
    { name: "Manutenção", value: stats.maintenanceRooms, color: "#F59E0B" },
  ].filter((item) => item.value > 0) // Filtrar apenas valores maiores que 0

  // Custom label para o gráfico de pizza
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    if (percent < 0.05) return null // Não mostrar label se for menos de 5%

    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-blue-100 text-blue-800">Ativo</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Concluído</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleDeleteHistory = (historyId: string, guestName: string) => {
    if (confirm(`Tem certeza que deseja excluir o registro de ${guestName} do histórico?`)) {
      deleteGuestHistory(historyId)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card: Total de Quartos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Quartos</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRooms}</div>
            <p className="text-xs text-muted-foreground">
              {stats.occupiedRooms} ocupados de {stats.totalRooms}
            </p>
          </CardContent>
        </Card>

        {/* Card: Taxa de Ocupação */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.occupancyRate.toFixed(1)}%</div>
            <Progress value={stats.occupancyRate} className="mt-2" />
          </CardContent>
        </Card>

        {/* Card: Receita Mensal */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.monthlyRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Baseado nas reservas ativas</p>
          </CardContent>
        </Card>

        {/* Card: Hóspedes Ativos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hóspedes Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeGuests}</div>
            <p className="text-xs text-muted-foreground">Pessoas hospedadas atualmente</p>
          </CardContent>
        </Card>
      </div>

      {/* Status dos Quartos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponíveis</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.availableRooms}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ocupados</CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.occupiedRooms}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservados</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.reservedRooms}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manutenção</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.maintenanceRooms}</div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras - Quartos por Tipo */}
        <Card>
          <CardHeader>
            <CardTitle>Quartos por Tipo</CardTitle>
            <CardDescription>Distribuição dos quartos por categoria</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={roomTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Status dos Quartos */}
        <Card>
          <CardHeader>
            <CardTitle>Status dos Quartos</CardTitle>
            <CardDescription>Distribuição atual por status</CardDescription>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={100}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="#fff"
                    strokeWidth={2}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} quartos`, name]} labelStyle={{ color: "#000" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <p>Nenhum dado disponível para exibir</p>
              </div>
            )}

            {/* Legenda personalizada */}
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {statusData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-sm text-muted-foreground">
                    {entry.name}: {entry.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Hóspedes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Histórico de Hóspedes
          </CardTitle>
          <CardDescription>
            Registro completo de todas as reservas e estadias ({guestHistory.length} registros)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {guestHistory.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hóspede</TableHead>
                    <TableHead>Quarto</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Pessoas</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guestHistory.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{entry.guest.name}</div>
                            {entry.guest.cpf && (
                              <div className="text-xs text-muted-foreground">CPF: {entry.guest.cpf}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">Quarto {entry.roomNumber}</div>
                          <div className="text-xs text-muted-foreground">{entry.roomType}</div>
                        </div>
                      </TableCell>
                      <TableCell>{format(new Date(entry.checkInDate), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                      <TableCell>{format(new Date(entry.checkOutDate), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                      <TableCell>{entry.guest.guests}</TableCell>
                      <TableCell className="font-medium">R$ {entry.totalPrice.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(entry.status)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs space-y-1">
                          {entry.guest.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-muted-foreground" />
                              <span>{entry.guest.email}</span>
                            </div>
                          )}
                          {entry.guest.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-muted-foreground" />
                              <span>{entry.guest.phone}</span>
                            </div>
                          )}
                          {!entry.guest.email && !entry.guest.phone && (
                            <span className="text-muted-foreground">Não informado</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteHistory(entry.id, entry.guest.name)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum histórico de hóspedes encontrado.</p>
              <p className="text-sm">Faça algumas reservas para ver o histórico aqui.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo Detalhado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Resumo Operacional
          </CardTitle>
          <CardDescription>Visão geral das operações do hotel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium">Ocupação</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Taxa atual:</span>
                  <span className="font-medium">{stats.occupancyRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Quartos ocupados:</span>
                  <span>
                    {stats.occupiedRooms}/{stats.totalRooms}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Hóspedes ativos:</span>
                  <span>{stats.activeGuests} pessoas</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Reservas</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Reservas futuras:</span>
                  <span className="font-medium">{stats.reservedRooms}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quartos disponíveis:</span>
                  <span>{stats.availableRooms}</span>
                </div>
                <div className="flex justify-between">
                  <span>Em manutenção:</span>
                  <span>{stats.maintenanceRooms}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Financeiro</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Receita mensal:</span>
                  <span className="font-medium">R$ {stats.monthlyRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Receita por quarto:</span>
                  <span>R$ {stats.totalRooms > 0 ? (stats.monthlyRevenue / stats.totalRooms).toFixed(2) : "0.00"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Receita por hóspede:</span>
                  <span>
                    R$ {stats.activeGuests > 0 ? (stats.monthlyRevenue / stats.activeGuests).toFixed(2) : "0.00"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
