import pkg from "pg"
const { Pool } = pkg

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "Higao12!",
  database: process.env.DB_NAME || "hotel",
  port: Number.parseInt(process.env.DB_PORT || "5432"),
  ssl: {
    rejectUnauthorized: false, // importante para Neon
  },
}

const pool = new Pool(dbConfig)

export async function getConnection() {
  try {
    const client = await pool.connect()
    return client
  } catch (error) {
    console.error("❌ Erro ao conectar com PostgreSQL:", error)
    throw error
  }
}

export async function executeQuery(query: string, params: any[] = []) {
  const client = await getConnection()
  try {
    console.log("🔍 Executando query:", query.substring(0, 100) + "...")
    const { rows } = await client.query(query, params)
    return rows
  } catch (error) {
    console.error("❌ Erro na query:", error)
    throw error
  } finally {
    client.release()
  }
}