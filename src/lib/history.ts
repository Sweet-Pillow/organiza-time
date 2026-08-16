import type { DrawResult } from './drawTeams'

export type DrawHistoryEntry = {
  id: string
  createdAt: string
  teamSize: number
  balanceByGender: boolean
  teams: Array<{
    incomplete: boolean
    players: Array<{ id: string; nome: string; sexo: string; estrelas: number }>
  }>
}

const STORAGE_KEY = 'organiza-time:draw-history'
const MAX_ENTRIES = 12

export function loadDrawHistory(): DrawHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isHistoryEntry).slice(0, MAX_ENTRIES)
  } catch {
    return []
  }
}

function isHistoryEntry(value: unknown): value is DrawHistoryEntry {
  if (!value || typeof value !== 'object') return false
  const entry = value as Record<string, unknown>
  return (
    typeof entry.id === 'string' &&
    typeof entry.createdAt === 'string' &&
    typeof entry.teamSize === 'number' &&
    Array.isArray(entry.teams)
  )
}

export function saveDrawHistory(entries: DrawHistoryEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)))
}

export function appendDrawHistory(
  entries: DrawHistoryEntry[],
  result: DrawResult,
  teamSize: number,
  balanceByGender: boolean,
): DrawHistoryEntry[] {
  const entry: DrawHistoryEntry = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    teamSize,
    balanceByGender,
    teams: result.teams.map((team) => ({
      incomplete: team.incomplete,
      players: team.players.map((player) => ({
        id: player.id,
        nome: player.nome,
        sexo: player.sexo,
        estrelas: player.estrelas,
      })),
    })),
  }

  return [entry, ...entries].slice(0, MAX_ENTRIES)
}

export function formatHistoryDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
