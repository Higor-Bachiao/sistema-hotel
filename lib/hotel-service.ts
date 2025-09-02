import { executeQuery, getConnection } from "./database"
import type { Room, Reservation, Expense } from "@/types/hotel"

export class HotelService {
  // ROOMS
  static async getAllRooms(): Promise<Room[]> {
    const query = "SELECT * FROM rooms ORDER BY number"
    const results = (await executeQuery(query)) as any[]

    return results.map((row) => ({
      id: row.id,
      number: row.number,
      type: row.type,
      capacity: row.capacity,
      beds: row.beds,
      price: Number.parseFloat(row.price),
      amenities: JSON.parse(row.amenities || "[]"),
      status: row.status,
    }))
  }

  static async createRoom(room: Omit<Room, "id">): Promise<string> {
    const id = Date.now().toString()
    const query = `
      INSERT INTO rooms (id, number, type, capacity, beds, price, amenities, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `
    await executeQuery(query, [
      id,
      room.number,
      room.type,
      room.capacity,
      room.beds,
      room.price,
      JSON.stringify(room.amenities),
      room.status,
    ])
    return id
  }

  static async updateRoom(id: string, updates: Partial<Room>): Promise<void> {
    const fields = Object.keys(updates)
      .map((key, idx) => `${key} = $${idx + 1}`)
      .join(", ")
    const values = Object.entries(updates).map(([key, value]) =>
      key === "amenities" ? JSON.stringify(value) : value
    )

    const query = `UPDATE rooms SET ${fields} WHERE id = $${values.length + 1}`
    await executeQuery(query, [...values, id])
  }

  static async deleteRoom(id: string): Promise<void> {
    await executeQuery("DELETE FROM rooms WHERE id = $1", [id])
  }

  // RESERVATIONS
  static async getFutureReservations(): Promise<Reservation[]> {
    const query = `
      SELECT r.*, g.*, rooms.number, rooms.type
      FROM reservations r
      JOIN guests g ON r.guest_id = g.id
      JOIN rooms ON r.room_id = rooms.id
      WHERE r.status = 'future' AND g.check_in > CURRENT_DATE
      ORDER BY g.check_in
    `
    const results = (await executeQuery(query)) as any[]

    return results.map((row) => ({
      id: row.id,
      roomId: row.room_id,
      guest: {
        name: row.name,
        email: row.email,
        phone: row.phone,
        cpf: row.cpf,
        checkIn: row.check_in,
        checkOut: row.check_out,
        guests: row.num_guests,
      },
      createdAt: row.created_at,
    }))
  }

  static async createReservation(reservation: Omit<Reservation, "id" | "createdAt">): Promise<string> {
    const client = await getConnection()

    try {
      await client.query("BEGIN")

      // Criar guest
      const guestId = Date.now().toString()
      await client.query(
        `
        INSERT INTO guests (id, name, email, phone, cpf, check_in, check_out, num_guests)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
        [
          guestId,
          reservation.guest.name,
          reservation.guest.email,
          reservation.guest.phone,
          reservation.guest.cpf,
          reservation.guest.checkIn,
          reservation.guest.checkOut,
          reservation.guest.guests,
        ],
      )

      // Criar reserva
      const reservationId = (Date.now() + 1).toString()
      const checkInDate = new Date(reservation.guest.checkIn)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const status = checkInDate <= today ? "active" : "future"

      await client.query(
        `
        INSERT INTO reservations (id, room_id, guest_id, status)
        VALUES ($1, $2, $3, $4)
      `,
        [reservationId, reservation.roomId, guestId, status],
      )

      // Atualizar status do quarto se necessário
      if (status === "active") {
        await client.query("UPDATE rooms SET status = $1 WHERE id = $2", ["occupied", reservation.roomId])
      }

      await client.query("COMMIT")
      return reservationId
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
  }

  static async cancelReservation(reservationId: string): Promise<void> {
    await executeQuery("UPDATE reservations SET status = $1 WHERE id = $2", ["cancelled", reservationId])
  }

  // EXPENSES
  static async addExpense(guestId: string, expense: Expense): Promise<void> {
    await executeQuery(
      `
      INSERT INTO expenses (guest_id, description, value)
      VALUES ($1, $2, $3)
    `,
      [guestId, expense.description, expense.value],
    )
  }

  static async getGuestExpenses(guestId: string): Promise<Expense[]> {
    const results = (await executeQuery("SELECT description, value FROM expenses WHERE guest_id = $1", [
      guestId,
    ])) as any[]

    return results.map((row) => ({
      description: row.description,
      value: Number.parseFloat(row.value),
    }))
  }
}