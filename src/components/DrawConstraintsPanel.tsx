import type { DrawConstraints } from '../lib/constraints'
import { findPairPartner, setTeamLock, togglePair } from '../lib/constraints'
import type { Player } from '../types/player'

type DrawConstraintsPanelProps = {
  players: Player[]
  selectedIds: Set<string>
  constraints: DrawConstraints
  teamCountHint: number
  onChange: (next: DrawConstraints) => void
}

export function DrawConstraintsPanel({
  players,
  selectedIds,
  constraints,
  teamCountHint,
  onChange,
}: DrawConstraintsPanelProps) {
  const selectedPlayers = players.filter((player) => selectedIds.has(player.id))
  const teamOptions = Math.max(teamCountHint, 2)

  if (selectedPlayers.length === 0) {
    return (
      <p className="text-xs text-stone-500">
        Selecione jogadores para definir travas e pares.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-stone-500">
        Trave alguém em um time ou una um casal/par para não separar no sorteio.
      </p>
      <ul className="flex flex-col gap-2">
        {selectedPlayers.map((player) => {
          const lock = constraints.teamLocks[player.id]
          const partnerId = findPairPartner(constraints, player.id)
          const partner = partnerId
            ? players.find((p) => p.id === partnerId)
            : null

          return (
            <li
              key={player.id}
              className="flex flex-col gap-2 rounded-lg border border-stone-200 bg-white p-2.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="truncate text-sm font-medium text-stone-800">
                {player.nome}
              </p>
              <div className="flex flex-wrap gap-2">
                <label className="flex items-center gap-1.5 text-xs text-stone-600">
                  Time
                  <select
                    value={lock === undefined ? '' : String(lock)}
                    onChange={(e) => {
                      const value = e.target.value
                      onChange(
                        setTeamLock(
                          constraints,
                          player.id,
                          value === '' ? null : Number(value),
                        ),
                      )
                    }}
                    className="rounded-md border border-stone-300 bg-white px-2 py-1 text-xs text-stone-800"
                  >
                    <option value="">Livre</option>
                    {Array.from({ length: teamOptions }, (_, index) => (
                      <option key={index} value={index}>
                        Time {index + 1}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex min-w-0 items-center gap-1.5 text-xs text-stone-600">
                  Par
                  <select
                    value={partnerId ?? ''}
                    onChange={(e) => {
                      const nextPartner = e.target.value
                      let next = constraints
                      if (partnerId) {
                        next = togglePair(next, player.id, partnerId)
                      }
                      if (nextPartner) {
                        next = togglePair(next, player.id, nextPartner)
                      }
                      onChange(next)
                    }}
                    className="max-w-36 rounded-md border border-stone-300 bg-white px-2 py-1 text-xs text-stone-800"
                  >
                    <option value="">Nenhum</option>
                    {selectedPlayers
                      .filter((other) => other.id !== player.id)
                      .map((other) => (
                        <option key={other.id} value={other.id}>
                          {other.nome}
                        </option>
                      ))}
                  </select>
                </label>
              </div>
              {partner ? (
                <p className="text-[11px] text-violet-700 sm:w-full">
                  Junto com {partner.nome}
                </p>
              ) : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
