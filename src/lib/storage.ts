import type { Player } from '../types/player'

export const STORAGE_KEY = 'organiza-time:players'

export function isPlayer(value: unknown): value is Player {
  if (!value || typeof value !== 'object') return false
  const p = value as Record<string, unknown>
  return (
    typeof p.id === 'string' &&
    typeof p.nome === 'string' &&
    p.nome.trim().length > 0 &&
    (p.sexo === 'masculino' || p.sexo === 'feminino') &&
    (p.posicao === 'ataque' ||
      p.posicao === 'defesa' ||
      p.posicao === 'levantamento' ||
      p.posicao === 'qualquer') &&
    typeof p.estrelas === 'number' &&
    Number.isInteger(p.estrelas) &&
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

export function exportPlayersJson(players: Player[]): string {
  return JSON.stringify(players)
}

export type ParsePlayersResult =
  | { ok: true; players: Player[] }
  | { ok: false; error: string }

export function parsePlayersJson(raw: string): ParsePlayersResult {
  const trimmed = raw.trim()
  if (!trimmed) {
    return { ok: false, error: 'A área de transferência está vazia.' }
  }

  try {
    const parsed: unknown = JSON.parse(trimmed)
    if (!Array.isArray(parsed)) {
      return {
        ok: false,
        error: 'O conteúdo colado não é uma lista de jogadores válida.',
      }
    }

    const players = parsed.filter(isPlayer)
    if (players.length === 0) {
      return {
        ok: false,
        error: 'Nenhum jogador válido encontrado no conteúdo colado.',
      }
    }

    if (players.length !== parsed.length) {
      return {
        ok: false,
        error:
          'O conteúdo tem itens inválidos. Exporte o elenco pelo app e tente de novo.',
      }
    }

    return { ok: true, players }
  } catch {
    return {
      ok: false,
      error: 'O conteúdo colado não é um JSON válido de elenco.',
    }
  }
}
