import type { PlayerFiltersState } from '../types/filters'
import type { Player } from '../types/player'

function normalizeName(value: string) {
  return value
    .trim()
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

export function filterPlayers(players: Player[], filters: PlayerFiltersState) {
  const query = normalizeName(filters.nome)

  return players.filter((player) => {
    if (query && !normalizeName(player.nome).includes(query)) return false
    if (filters.sexo !== 'todos' && player.sexo !== filters.sexo) return false
    if (filters.posicao !== 'todos' && player.posicao !== filters.posicao) return false
    if (filters.estrelas !== 'todos' && player.estrelas !== filters.estrelas) {
      return false
    }
    return true
  })
}
