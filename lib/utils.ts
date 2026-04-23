export function formatMinutes(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

export function getTodayBR(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' })
}

export function calcProgress(studiedMin: number, goalHours: number): number {
  if (goalHours === 0) return 100
  return Math.min(100, Math.round((studiedMin / (goalHours * 60)) * 100))
}

export function calcStreak(sessionDates: string[]): number {
  if (sessionDates.length === 0) return 0

  const today = getTodayBR()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' })

  const unique = Array.from(new Set(sessionDates)).sort().reverse()

  // Se hoje não tem sessão, começar a contar do ontem
  const startDate = unique[0] === today ? today : unique[0] === yesterdayStr ? yesterdayStr : null
  if (!startDate) return 0

  let streak = 0
  const current = new Date(startDate + 'T12:00:00')

  for (const date of unique) {
    const expected = current.toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' })
    if (date === expected) {
      streak++
      current.setDate(current.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}
