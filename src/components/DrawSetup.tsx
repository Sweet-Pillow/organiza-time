import { useMemo, useState } from 'react'
import { drawTeams, type DrawResult } from '../lib/drawTeams'
import type { Player } from '../types/player'
import { TeamResult } from './TeamResult'

type DrawSetupProps = {
  players: Player[]
}

export function DrawSetup({ players }: DrawSetupProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [teamSize, setTeamSize] = useState(6)
  const [result, setResult] = useState<DrawResult | null>(null)

  const selectedPlayers = useMemo(
    () => players.filter((player) => selectedIds.has(player.id)),
    [players, selectedIds],
  )

  const teamCount =
    teamSize > 0 ? Math.floor(selectedPlayers.length / teamSize) : 0
  const leftoverCount =
    teamSize > 0 ? selectedPlayers.length - teamCount * teamSize : selectedPlayers.length

  function togglePlayer(id: string) {
    setResult(null)
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    setResult(null)
    if (selectedIds.size === players.length) {
      setSelectedIds(new Set())
      return
    }
    setSelectedIds(new Set(players.map((p) => p.id)))
  }

  function handleDraw() {
    if (teamCount < 1) return
    setResult(drawTeams(selectedPlayers, teamSize))
  }

  if (players.length === 0) {
    return (
      <p className="text-sm text-stone-500">
        Cadastre jogadores na aba Jogadores antes de sortear os times.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-semibold text-stone-900">
            Quem vai jogar
          </h2>
          <button
            type="button"
            onClick={toggleAll}
            className="text-sm font-medium text-teal-800 underline-offset-2 hover:underline"
          >
            {selectedIds.size === players.length ? 'Desmarcar todos' : 'Marcar todos'}
          </button>
        </div>

        <ul className="grid gap-2 sm:grid-cols-2">
          {players.map((player) => {
            const checked = selectedIds.has(player.id)
            return (
              <li key={player.id}>
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition ${
                    checked
                      ? 'border-teal-600 bg-teal-50'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => togglePlayer(player.id)}
                    className="size-4 accent-teal-700"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-stone-900">
                      {player.nome}
                    </span>
                    <span className="text-xs text-stone-500">
                      {player.estrelas}★ · {player.sexo === 'feminino' ? 'F' : 'M'}
                    </span>
                  </span>
                </label>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-stone-200 bg-white/80 p-4 sm:p-5">
        <label className="flex max-w-xs flex-col gap-1.5 text-sm">
          <span className="font-medium text-stone-700">Pessoas por time</span>
          <input
            type="number"
            min={1}
            max={Math.max(selectedPlayers.length, 1)}
            value={teamSize}
            onChange={(e) => {
              setResult(null)
              setTeamSize(Math.max(1, Number(e.target.value) || 1))
            }}
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none ring-teal-600/30 focus:ring-2"
          />
        </label>

        <p className="text-sm text-stone-600">
          <strong>{selectedPlayers.length}</strong> participante
          {selectedPlayers.length !== 1 ? 's' : ''} →{' '}
          {teamCount > 0 ? (
            <>
              <strong>{teamCount}</strong> time{teamCount !== 1 ? 's' : ''} de{' '}
              <strong>{teamSize}</strong>
              {leftoverCount > 0 ? (
                <>
                  {' '}
                  ({leftoverCount} sobrando)
                </>
              ) : null}
            </>
          ) : (
            <span>selecione mais jogadores ou reduza o tamanho do time</span>
          )}
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={teamCount < 1}
            onClick={handleDraw}
            className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            {result ? 'Sortear de novo' : 'Sortear times'}
          </button>
        </div>
      </section>

      {result ? (
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-2xl font-semibold text-stone-900">
            Resultado
          </h2>
          <TeamResult result={result} />
        </section>
      ) : null}
    </div>
  )
}
