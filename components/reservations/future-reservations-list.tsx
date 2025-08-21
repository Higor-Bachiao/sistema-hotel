"use client"

import { useHotel } from "@/contexts/hotel-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar, User, Mail, Phone, X } from "lucide-react"

export default function FutureReservationsList() {
  const { getFutureReservations, cancelFutureReservation, futureReservations } = useHotel()
  const futureReservationsRooms = getFutureReservations()

  const handleCancelReservation = (reservationId: string, guestName: string, roomNumber: string) => {
    if (confirm(`Tem certeza que deseja cancelar a reserva de ${guestName} para o quarto ${roomNumber}?`)) {
      cancelFutureReservation(reservationId)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Próximas Reservas
          </CardTitle>
          <CardDescription>Lista de quartos reservados para datas futuras.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {futureReservationsRooms.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quarto</TableHead>
                  <TableHead>Hóspede</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Hóspedes</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {futureReservationsRooms.map((room) => {
                  // Encontrar a reserva correspondente para obter o ID
                  const reservation = futureReservations.find((r) => r.roomId === room.id)

                  return (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">
                        Quarto {room.number} ({room.type})
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>{room.guest?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {room.guest?.checkIn
                          ? format(new Date(room.guest.checkIn), "dd/MM/yyyy", { locale: ptBR })
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {room.guest?.checkOut
                          ? format(new Date(room.guest.checkOut), "dd/MM/yyyy", { locale: ptBR })
                          : "N/A"}
                      </TableCell>
                      <TableCell>{room.guest?.guests}</TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm space-y-1">
                          {room.guest?.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-muted-foreground" />
                              <span>{room.guest.email}</span>
                            </div>
                          )}
                          {room.guest?.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-muted-foreground" />
                              <span>{room.guest.phone}</span>
                            </div>
                          )}
                          {!room.guest?.email && !room.guest?.phone && (
                            <span className="text-muted-foreground text-xs">Não informado</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {reservation && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleCancelReservation(reservation.id, room.guest?.name || "Hóspede", room.number)
                            }
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancelar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="p-6 text-center text-muted-foreground">Nenhuma reserva futura encontrada.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
