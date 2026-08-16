import { useEffect, useState } from 'react'
import { loadPlayers, savePlayers } from '../lib/storage'
import type { Player, PlayerInput } from '../types/player'

function createId(): string {
  return crypto.randomUUID()
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

  return {
    players,
    addPlayer,
    updatePlayer,
    removePlayer,
  }
}
