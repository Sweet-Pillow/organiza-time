import { useMemo, useState } from 'react'
import { drawTeams, type DrawResult } from '../lib/drawTeams'
import { filterPlayers } from '../lib/filterPlayers'
import { EMPTY_FILTERS, type PlayerFiltersState } from '../types/filters'
import type { Player } from '../types/player'
import { POSICAO_LABELS } from '../types/player'
import { PlayerFilters } from './PlayerFilters'
import { TeamResult } from './TeamResult'

type DrawSetupProps = {
  players: Player[]
}

export function DrawSetup({ players }: DrawSetupProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [teamSize, setTeamSize] = useState(4)
  const [result, setResult] = useState<DrawResult | null>(null)
  const [filters, setFilters] = useState<PlayerFiltersState>(EMPTY_FILTERS)

  const visiblePlayers = useMemo(
    () => filterPlayers(players, filters),
    [players, filters],
  )

  const selectedPlayers = useMemo(
    () => players.filter((player) => selectedIds.has(player.id)),
    [players, selectedIds],
  )

  const allVisibleSelected =
    visiblePlayers.length > 0 &&
    visiblePlayers.every((player) => selectedIds.has(player.id))

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

  function toggleVisible() {
    setResult(null)
    setSelectedIds((current) => {
      const next = new Set(current)
      if (allVisibleSelected) {
        for (const player of visiblePlayers) next.delete(player.id)
      } else {
        for (const player of visiblePlayers) next.add(player.id)
      }
      return next
    })
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
    <div className="flex flex-col gap-5 sm:gap-8">
      <section className="flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold text-stone-900 sm:text-2xl">
            Quem vai jogar
          </h2>
          <button
            type="button"
            onClick={toggleVisible}
            disabled={visiblePlayers.length === 0}
            className="text-sm font-medium text-teal-800 underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:text-stone-400 disabled:no-underline"
          >
            {allVisibleSelected ? 'Desmarcar visíveis' : 'Marcar visíveis'}
          </button>
        </div>

        <PlayerFilters
          value={filters}
          onChange={setFilters}
          resultCount={visiblePlayers.length}
          totalCount={players.length}
        />

        {visiblePlayers.length === 0 ? (
          <p className="text-sm text-stone-500">
            Nenhum jogador encontrado com esses filtros.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-1.5 sm:gap-2">
            {visiblePlayers.map((player) => {
              const checked = selectedIds.has(player.id)
              return (
                <li key={player.id}>
                  <label
                    className={`flex min-h-14 cursor-pointer items-center gap-2 rounded-lg border px-2 py-2 transition sm:gap-3 sm:rounded-xl sm:px-3 sm:py-2.5 ${
                      checked
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePlayer(player.id)}
                      className="size-4 shrink-0 accent-teal-700"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-stone-900 sm:text-base">
                        {player.nome}
                      </span>
                      <span className="text-xs text-stone-500">
                        {player.estrelas}★ · {player.sexo === 'feminino' ? 'F' : 'M'}
                        <span className="hidden sm:inline">
                          {' '}· {POSICAO_LABELS[player.posicao]}
                        </span>
                      </span>
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        )}

        {selectedPlayers.length > 0 ? (
          <p className="text-sm text-stone-500">
            <strong className="text-stone-700">{selectedPlayers.length}</strong>{' '}
            selecionado{selectedPlayers.length !== 1 ? 's' : ''}
            {filters.nome ||
            filters.sexo !== 'todos' ||
            filters.posicao !== 'todos' ||
            filters.estrelas !== 'todos'
              ? ' (filtros só alteram a lista; a seleção permanece)'
              : null}
          </p>
        ) : null}
      </section>

      <section className="sticky bottom-2 z-10 grid grid-cols-[6.5rem_1fr] items-end gap-3 rounded-xl border border-stone-200 bg-white/95 p-3 shadow-lg backdrop-blur-md sm:static sm:flex sm:flex-col sm:items-stretch sm:gap-4 sm:p-5 sm:shadow-none">
        <label className="flex flex-col gap-1 text-xs sm:max-w-xs sm:gap-1.5 sm:text-sm">
          <span className="font-medium text-stone-700">Por time</span>
          <input
            type="number"
            min={1}
            max={Math.max(selectedPlayers.length, 1)}
            value={teamSize}
            onChange={(e) => {
              setResult(null)
              setTeamSize(Math.max(1, Number(e.target.value) || 1))
            }}
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none ring-teal-600/30 focus:ring-2"
          />
        </label>

        <p className="col-span-2 order-3 text-xs text-stone-600 sm:order-0 sm:text-sm">
          <strong>{selectedPlayers.length}</strong> participante
          {selectedPlayers.length !== 1 ? 's' : ''} →{' '}
          {teamCount > 0 ? (
            <>
              <strong>{teamCount}</strong> time{teamCount !== 1 ? 's' : ''} de{' '}
              <strong>{teamSize}</strong>
              {leftoverCount > 0 ? <> ({leftoverCount} sobrando)</> : null}
            </>
          ) : (
            <span>selecione mais jogadores ou reduza o tamanho do time</span>
          )}
        </p>

        <div className="flex">
          <button
            type="button"
            disabled={teamCount < 1}
            onClick={handleDraw}
            className="w-full rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-stone-300 sm:w-auto sm:py-2"
          >
            {result ? 'Sortear de novo' : 'Sortear times'}
          </button>
        </div>
      </section>

      {result ? (
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-xl font-semibold text-stone-900 sm:text-2xl">
            Resultado
          </h2>
          <TeamResult result={result} />
        </section>
      ) : null}
    </div>
  )
}
