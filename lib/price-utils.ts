import type { Expense } from "@/types/hotel" // Importar Expense

// Função para calcular o número de noites
export function getNumberOfNights(checkInDate: string, checkOutDate: string): number {
  if (!checkInDate || !checkOutDate) {
    return 0
  }
  const checkIn = new Date(checkInDate)
  const checkOut = new Date(checkOutDate)

  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays > 0 ? diffDays : 1
}

// Função para calcular o preço total da estadia, incluindo despesas
export function calculateTotalStayPrice(
  basePricePerPerson: number,
  numberOfGuests: number,
  checkInDate: string, // Formato YYYY-MM-DD
  checkOutDate: string, // Formato YYYY-MM-DD
  additionalExpenses: Expense[] = [], // Novo parâmetro opcional
): number {
  const nights = getNumberOfNights(checkInDate, checkOutDate)
  const stayPrice = basePricePerPerson * numberOfGuests * nights

  const totalExpenses = additionalExpenses.reduce((sum, expense) => sum + expense.value, 0)

  return stayPrice + totalExpenses
}
