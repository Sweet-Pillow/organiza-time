import { useEffect, useState } from 'react'
import { loadPlayers, savePlayers } from '../lib/storage'
import type { Player, PlayerInput } from '../types/player'

function createId(): string {
  return crypto.randomUUID()
}

function normalizeName(value: string) {
  return value
    .trim()
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>(() => loadPlayers())

  useEffect(() => {
    savePlayers(players)
  }, [players])

  function addPlayer(input: PlayerInput) {
    const player: Player = { ...input, id: createId() }
    setPlayers((current) => [...current, player])
  }

  function updatePlayer(id: string, input: PlayerInput) {
    setPlayers((current) =>
      current.map((player) => (player.id === id ? { ...player, ...input } : player)),
    )
  }

  function removePlayer(id: string) {
    setPlayers((current) => current.filter((player) => player.id !== id))
  }

  function importPlayers(incoming: Player[]) {
    const existingIds = new Set(players.map((player) => player.id))
    const existingNames = new Set(players.map((player) => normalizeName(player.nome)))
    const toAdd: Player[] = []
    let skipped = 0

    for (const player of incoming) {
      const nameKey = normalizeName(player.nome)
      if (existingNames.has(nameKey)) {
        skipped += 1
        continue
      }

      const id = existingIds.has(player.id) ? createId() : player.id
      existingIds.add(id)
      existingNames.add(nameKey)
      toAdd.push({
        ...player,
        id,
        nome: player.nome.trim(),
      })
    }

    if (toAdd.length > 0) {
      setPlayers((current) => [...current, ...toAdd])
    }

    return { added: toAdd.length, skipped }
  }

  return {
    players,
    addPlayer,
    updatePlayer,
    removePlayer,
    importPlayers,
  }
}
