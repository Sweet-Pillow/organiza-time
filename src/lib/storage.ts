import type { Player } from '../types/player'

const STORAGE_KEY = 'organiza-time:players'

function isPlayer(value: unknown): value is Player {
  if (!value || typeof value !== 'object') return false
  const p = value as Record<string, unknown>
  return (
    typeof p.id === 'string' &&
    typeof p.nome === 'string' &&
    (p.sexo === 'masculino' || p.sexo === 'feminino') &&
    (p.posicao === 'ataque' ||
      p.posicao === 'defesa' ||
      p.posicao === 'levantamento' ||
      p.posicao === 'qualquer') &&
    typeof p.estrelas === 'number' &&
    p.estrelas >= 1 &&
    p.estrelas <= 5
  )
}

export function loadPlayers(): Player[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isPlayer)
  } catch {
    return []
  }
}

export function savePlayers(players: Player[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(players))
}
