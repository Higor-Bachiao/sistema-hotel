import { executeQuery, getConnection } from "./database"
import type { Room, Reservation, Guest, Expense } from "@/types/hotel"

export class HotelDatabase {
  // ==================== ROOMS ====================
  static async getAllRooms(): Promise<Room[]> {
    const query = `
      SELECT r.*, 
             g.name as guest_name, g.email as guest_email, g.phone as guest_phone,
             g.cpf as guest_cpf, g.check_in, g.check_out, g.num_guests
      FROM rooms r
      LEFT JOIN reservations res ON r.id = res.room_id AND res.status = 'active'
      LEFT JOIN guests g ON res.guest_id = g.id
      ORDER BY r.number
    `
    const results = (await executeQuery(query)) as any[]

    return results.map((row) => ({
      id: row.id,
      number: row.number,
      type: row.type,
      capacity: row.capacity,
      beds: row.beds,
      price: Number.parseFloat(row.price),
      amenities: row.amenities ? JSON.parse(row.amenities) : [],
      status: row.status,
      guest: row.guest_name
        ? {
            name: row.guest_name,
            email: row.guest_email,
            phone: row.guest_phone,
            cpf: row.guest_cpf,
            checkIn: row.check_in,
            checkOut: row.check_out,
            guests: row.num_guests,
            expenses: [],
          }
        : undefined,
    }))
  }

  static async createRoom(room: Omit<Room, "id">): Promise<string> {
    const id = `room_${Date.now()}`
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
      room.status || "available",
    ])
    return id
  }

  static async updateRoomStatus(roomId: string, status: string, guest?: Guest): Promise<void> {
    const client = await getConnection()
    try {
      await client.query("BEGIN")

      // Atualizar status do quarto
      await client.query("UPDATE rooms SET status = $1 WHERE id = $2", [status, roomId])

      if (status === "occupied" && guest) {
        const guestId = `guest_${Date.now()}`
        await client.query(
          `
          INSERT INTO guests (id, name, email, phone, cpf, check_in, check_out, num_guests)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `,
          [guestId, guest.name, guest.email, guest.phone, guest.cpf, guest.checkIn, guest.checkOut, guest.guests],
        )

        const reservationId = `res_${Date.now()}`
        await client.query(
          `
          INSERT INTO reservations (id, room_id, guest_id, status)
          VALUES ($1, $2, $3, 'active')
        `,
          [reservationId, roomId, guestId],
        )
      } else if (status === "available") {
        await client.query(
          `
          UPDATE reservations 
          SET status = 'completed' 
          WHERE room_id = $1 AND status = 'active'
        `,
          [roomId],
        )
      }

      await client.query("COMMIT")
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
  }

  // ==================== RESERVATIONS ====================
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

  static async createReservation(roomId: string, guest: Guest): Promise<string> {
    const client = await getConnection()
    try {
      await client.query("BEGIN")

      const guestId = `guest_${Date.now()}`
      await client.query(
        `
        INSERT INTO guests (id, name, email, phone, cpf, check_in, check_out, num_guests)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
        [guestId, guest.name, guest.email, guest.phone, guest.cpf, guest.checkIn, guest.checkOut, guest.guests],
      )

      const checkInDate = new Date(guest.checkIn)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      checkInDate.setHours(0, 0, 0, 0)

      const status = checkInDate <= today ? "active" : "future"

      const reservationId = `res_${Date.now()}`
      await client.query(
        `
        INSERT INTO reservations (id, room_id, guest_id, status)
        VALUES ($1, $2, $3, $4)
      `,
        [reservationId, roomId, guestId, status],
      )

      if (status === "active") {
        await client.query("UPDATE rooms SET status = 'occupied' WHERE id = $1", [roomId])
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
    await executeQuery("UPDATE reservations SET status = 'cancelled' WHERE id = $1", [reservationId])
  }

  // ==================== EXPENSES ====================
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

  // ==================== MAINTENANCE ====================
  static async activateFutureReservations(): Promise<void> {
    const client = await getConnection()
    try {
      await client.query("BEGIN")

      const { rows: reservations } = await client.query(`
        SELECT r.id, r.room_id
        FROM reservations r
        JOIN guests g ON r.guest_id = g.id
        WHERE r.status = 'future' AND g.check_in <= CURRENT_DATE
      `)

      for (const reservation of reservations) {
        await client.query("UPDATE reservations SET status = 'active' WHERE id = $1", [reservation.id])
        await client.query("UPDATE rooms SET status = 'occupied' WHERE id = $1", [reservation.room_id])
      }

      await client.query("COMMIT")
      console.log(`✅ ${reservations.length} reservas ativadas automaticamente`)
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
  }
}