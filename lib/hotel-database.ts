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
            expenses: [], // Será carregado separadamente se necessário
          }
        : undefined,
    }))
  }

  static async createRoom(room: Omit<Room, "id">): Promise<string> {
    const id = `room_${Date.now()}`
    const query = `
      INSERT INTO rooms (id, number, type, capacity, beds, price, amenities, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
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
    const connection = await getConnection()
    try {
      await connection.beginTransaction()

      // Atualizar status do quarto
      await connection.execute("UPDATE rooms SET status = ? WHERE id = ?", [status, roomId])

      if (status === "occupied" && guest) {
        // Criar guest
        const guestId = `guest_${Date.now()}`
        await connection.execute(
          `
          INSERT INTO guests (id, name, email, phone, cpf, check_in, check_out, num_guests)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
          [guestId, guest.name, guest.email, guest.phone, guest.cpf, guest.checkIn, guest.checkOut, guest.guests],
        )

        // Criar reserva ativa
        const reservationId = `res_${Date.now()}`
        await connection.execute(
          `
          INSERT INTO reservations (id, room_id, guest_id, status)
          VALUES (?, ?, ?, 'active')
        `,
          [reservationId, roomId, guestId],
        )
      } else if (status === "available") {
        // Liberar quarto - marcar reserva como completed
        await connection.execute(
          `
          UPDATE reservations 
          SET status = 'completed' 
          WHERE room_id = ? AND status = 'active'
        `,
          [roomId],
        )
      }

      await connection.commit()
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      await connection.end()
    }
  }

  // ==================== RESERVATIONS ====================
  static async getFutureReservations(): Promise<Reservation[]> {
    const query = `
      SELECT r.*, g.*, rooms.number, rooms.type
      FROM reservations r
      JOIN guests g ON r.guest_id = g.id
      JOIN rooms ON r.room_id = rooms.id
      WHERE r.status = 'future' AND g.check_in > CURDATE()
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
    const connection = await getConnection()

    try {
      await connection.beginTransaction()

      // Criar guest
      const guestId = `guest_${Date.now()}`
      await connection.execute(
        `
        INSERT INTO guests (id, name, email, phone, cpf, check_in, check_out, num_guests)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [guestId, guest.name, guest.email, guest.phone, guest.cpf, guest.checkIn, guest.checkOut, guest.guests],
      )

      // Verificar se é reserva futura ou ativa
      const checkInDate = new Date(guest.checkIn)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      checkInDate.setHours(0, 0, 0, 0)

      const status = checkInDate <= today ? "active" : "future"

      // Criar reserva
      const reservationId = `res_${Date.now()}`
      await connection.execute(
        `
        INSERT INTO reservations (id, room_id, guest_id, status)
        VALUES (?, ?, ?, ?)
      `,
        [reservationId, roomId, guestId, status],
      )

      // Se for reserva ativa, atualizar status do quarto
      if (status === "active") {
        await connection.execute("UPDATE rooms SET status = 'occupied' WHERE id = ?", [roomId])
      }

      await connection.commit()
      return reservationId
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      await connection.end()
    }
  }

  static async cancelReservation(reservationId: string): Promise<void> {
    await executeQuery("UPDATE reservations SET status = 'cancelled' WHERE id = ?", [reservationId])
  }

  // ==================== EXPENSES ====================
  static async addExpense(guestId: string, expense: Expense): Promise<void> {
    await executeQuery(
      `
      INSERT INTO expenses (guest_id, description, value)
      VALUES (?, ?, ?)
    `,
      [guestId, expense.description, expense.value],
    )
  }

  static async getGuestExpenses(guestId: string): Promise<Expense[]> {
    const results = (await executeQuery("SELECT description, value FROM expenses WHERE guest_id = ?", [
      guestId,
    ])) as any[]

    return results.map((row) => ({
      description: row.description,
      value: Number.parseFloat(row.value),
    }))
  }

  // ==================== MAINTENANCE ====================
  static async activateFutureReservations(): Promise<void> {
    const connection = await getConnection()
    try {
      await connection.beginTransaction()

      // Buscar reservas que devem ser ativadas hoje
      const [reservations] = await connection.execute(`
        SELECT r.id, r.room_id
        FROM reservations r
        JOIN guests g ON r.guest_id = g.id
        WHERE r.status = 'future' AND g.check_in <= CURDATE()
      `)

      const reservationsArray = reservations as any[]

      for (const reservation of reservationsArray) {
        // Ativar reserva
        await connection.execute("UPDATE reservations SET status = 'active' WHERE id = ?", [reservation.id])

        // Ocupar quarto
        await connection.execute("UPDATE rooms SET status = 'occupied' WHERE id = ?", [reservation.room_id])
      }

      await connection.commit()
      console.log(`✅ ${reservationsArray.length} reservas ativadas automaticamente`)
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      await connection.end()
    }
  }
}
