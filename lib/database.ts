import mysql from "mysql2/promise"

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "hotel",
  port: Number.parseInt(process.env.DB_PORT || "3306"),
}

export async function getConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig)
    return connection
  } catch (error) {
    console.error("❌ Erro ao conectar com MySQL:", error)
    throw error
  }
}

export async function executeQuery(query: string, params: any[] = []) {
  const connection = await getConnection()
  try {
    console.log("🔍 Executando query:", query.substring(0, 100) + "...")
    const [results] = await connection.execute(query, params)
    return results
  } catch (error) {
    console.error("❌ Erro na query:", error)
    throw error
  } finally {
    await connection.end()
  }
}
