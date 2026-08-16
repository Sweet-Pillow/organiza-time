import { useMemo, useState } from 'react'
import { drawTeams, type DrawResult } from '../lib/drawTeams'
import { filterPlayers } from '../lib/filterPlayers'
import { EMPTY_FILTERS, type PlayerFiltersState } from '../types/filters'
import type { Player } from '../types/player'
import { POSICAO_LABELS } from '../types/player'
import { GenderIcon } from './GenderIcon'
import { PlayerFilters } from './PlayerFilters'
import { TeamResult } from './TeamResult'

type DrawSetupProps = {
  players: Player[]
}

export function DrawSetup({ players }: DrawSetupProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [teamSizeInput, setTeamSizeInput] = useState('4')
  const [balanceByGender, setBalanceByGender] = useState(true)
  const [result, setResult] = useState<DrawResult | null>(null)
  const [filters, setFilters] = useState<PlayerFiltersState>(EMPTY_FILTERS)

  const teamSize = teamSizeInput === '' ? 0 : Number(teamSizeInput)

  const visiblePlayers = useMemo(
    () => filterPlayers(players, filters),
    [players, filters],
  )

  const selectedPlayers = useMemo(
    () => players.filter((player) => selectedIds.has(player.id)),
    [players, selectedIds],
  )

  const mulheres = players.filter((p) => p.sexo === 'feminino').length
  const homens = players.filter((p) => p.sexo === 'masculino').length

  const allVisibleSelected =
    visiblePlayers.length > 0 &&
    visiblePlayers.every((player) => selectedIds.has(player.id))

  const teamCount =
    teamSize > 0 ? Math.floor(selectedPlayers.length / teamSize) : 0
  const leftoverCount =
    teamSize > 0 ? selectedPlayers.length % teamSize : 0
  const canDraw =
    selectedPlayers.length > 0 && Number.isFinite(teamSize) && teamSize > 0

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
    if (!canDraw) return
    setResult(drawTeams(selectedPlayers, teamSize, { balanceByGender }))
  }

  function handleTeamSizeChange(raw: string) {
    setResult(null)
    if (raw === '') {
      setTeamSizeInput('')
      return
    }

    const parsed = Number(raw)
    if (!Number.isFinite(parsed) || parsed < 0) return
    setTeamSizeInput(String(Math.floor(parsed)))
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
            className="text-brand text-sm font-medium underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:text-stone-400 disabled:no-underline"
          >
            {allVisibleSelected ? 'Desmarcar visíveis' : 'Marcar visíveis'}
          </button>
        </div>

        <PlayerFilters
          value={filters}
          onChange={setFilters}
          resultCount={visiblePlayers.length}
          totalCount={players.length}
          mulheres={mulheres}
          homens={homens}
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
                      ? 'border-brand bg-accent-soft'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePlayer(player.id)}
                      className="accent-brand size-4 shrink-0"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-stone-900 sm:text-base">
                        {player.nome}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1.5 text-xs text-stone-500">
                        <span>{player.estrelas}★</span>
                        <span className="text-stone-300" aria-hidden>
                          ·
                        </span>
                        <span className="inline-flex items-center gap-0.5">
                          <GenderIcon sexo={player.sexo} />
                          <span className="sr-only">
                            {player.sexo === 'feminino' ? 'Feminino' : 'Masculino'}
                          </span>
                        </span>
                        <span className="hidden items-center gap-1.5 sm:inline-flex">
                          <span className="text-stone-300" aria-hidden>
                            ·
                          </span>
                          {POSICAO_LABELS[player.posicao]}
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

      <section className="sticky bottom-2 z-10 flex flex-col gap-3 rounded-xl border border-stone-200 bg-white/95 p-3 shadow-lg backdrop-blur-md sm:static sm:gap-4 sm:p-5 sm:shadow-none">
        <div className="grid grid-cols-[6.5rem_1fr] items-end gap-3 sm:grid-cols-none sm:flex sm:flex-col sm:items-stretch">
          <label className="flex flex-col gap-1 text-xs sm:max-w-xs sm:gap-1.5 sm:text-sm">
            <span className="font-medium text-stone-700">Por time</span>
            <input
              type="number"
              min={0}
              max={Math.max(selectedPlayers.length, 1)}
              value={teamSizeInput}
              onChange={(e) => handleTeamSizeChange(e.target.value)}
              className="focus:ring-brand/30 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none focus:ring-2"
            />
          </label>

          <div className="flex">
            <button
              type="button"
              disabled={!canDraw}
              onClick={handleDraw}
              className="bg-brand hover:bg-brand-hover w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-stone-300 sm:w-auto sm:py-2"
            >
              {result ? 'Sortear de novo' : 'Sortear times'}
            </button>
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-700">
          <input
            type="checkbox"
            checked={balanceByGender}
            onChange={(e) => {
              setResult(null)
              setBalanceByGender(e.target.checked)
            }}
            className="accent-brand size-4"
          />
          <span>Balancear por gênero</span>
        </label>

        <p className="text-xs text-stone-600 sm:text-sm">
          <strong>{selectedPlayers.length}</strong> participante
          {selectedPlayers.length !== 1 ? 's' : ''} →{' '}
          {canDraw ? (
            <>
              {teamCount > 0 ? (
                <>
                  <strong>{teamCount}</strong> time{teamCount !== 1 ? 's' : ''} de{' '}
                  <strong>{teamSize}</strong>
                </>
              ) : null}
              {leftoverCount > 0 ? (
                <>
                  {teamCount > 0 ? ' + ' : null}
                  <strong>1</strong> incompleto ({leftoverCount}/
                  {teamSize})
                </>
              ) : null}
            </>
          ) : (
            <span>selecione jogadores para sortear</span>
          )}
        </p>
      </section>

      {result ? (
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-xl font-semibold text-stone-900 sm:text-2xl">
            Resultado
          </h2>
          <TeamResult result={result} teamSize={teamSize} />
        </section>
      ) : null}
    </div>
  )
}
