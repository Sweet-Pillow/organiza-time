import { useEffect, useMemo, useState } from 'react'
import {
  EMPTY_CONSTRAINTS,
  loadConstraints,
  saveConstraints,
  type DrawConstraints,
} from '../lib/constraints'
import { drawTeams, type DrawResult } from '../lib/drawTeams'
import { filterPlayers } from '../lib/filterPlayers'
import type { TeamsEventInfo } from '../lib/teamsImage'
import {
  appendDrawHistory,
  loadDrawHistory,
  saveDrawHistory,
  type DrawHistoryEntry,
} from '../lib/history'
import { EMPTY_FILTERS, type PlayerFiltersState } from '../types/filters'
import type { Player } from '../types/player'
import { POSICAO_LABELS } from '../types/player'
import { DrawConstraintsPanel } from './DrawConstraintsPanel'
import { DrawHistoryPanel } from './DrawHistoryPanel'
import { GenderIcon } from './GenderIcon'
import { PlayerFilters } from './PlayerFilters'
import { TeamResult } from './TeamResult'

type DrawSetupProps = {
  players: Player[]
  onGoToPlayers: () => void
}

export function DrawSetup({ players, onGoToPlayers }: DrawSetupProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [teamSizeInput, setTeamSizeInput] = useState('4')
  const [eventDate, setEventDate] = useState(() => {
    const now = new Date()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${now.getFullYear()}-${month}-${day}`
  })
  const [eventTime, setEventTime] = useState('')
  const [eventLocation, setEventLocation] = useState('')
  const [balanceByGender, setBalanceByGender] = useState(true)
  const [result, setResult] = useState<DrawResult | null>(null)
  const [filters, setFilters] = useState<PlayerFiltersState>(EMPTY_FILTERS)
  const [constraints, setConstraints] = useState<DrawConstraints>(() =>
    loadConstraints(),
  )
  const [history, setHistory] = useState<DrawHistoryEntry[]>(() => loadDrawHistory())
  const [showRules, setShowRules] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const teamSize = teamSizeInput === '' ? 0 : Number(teamSizeInput)

  useEffect(() => {
    saveConstraints(constraints)
  }, [constraints])

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
  const teamCountHint = canDraw
    ? teamCount + (leftoverCount > 0 ? 1 : 0)
    : 4

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
    const next = drawTeams(selectedPlayers, teamSize, {
      balanceByGender,
      constraints,
    })
    setResult(next)
    if (next.teams.length > 0) {
      const updated = appendDrawHistory(history, next, teamSize, balanceByGender)
      setHistory(updated)
      saveDrawHistory(updated)
    }
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

  function restoreHistory(entry: DrawHistoryEntry) {
    const restored: DrawResult = {
      teams: entry.teams.map((team) => ({
        incomplete: team.incomplete,
        players: team.players.map((player) => {
          const live = players.find((p) => p.id === player.id)
          if (live) return live
          return {
            id: player.id,
            nome: player.nome,
            sexo: player.sexo === 'feminino' ? 'feminino' : 'masculino',
            posicao: 'qualquer',
            estrelas: Math.min(5, Math.max(1, player.estrelas)) as 1 | 2 | 3 | 4 | 5,
          }
        }),
      })),
    }
    setTeamSizeInput(String(entry.teamSize))
    setBalanceByGender(entry.balanceByGender)
    setResult(restored)
    setShowHistory(false)
  }

  if (players.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-stone-300 bg-white/70 p-6 text-center">
        <h2 className="font-display text-xl font-semibold text-stone-900">
          Nenhum jogador cadastrado
        </h2>
        <p className="mt-2 text-sm text-stone-600">
          Cadastre o elenco antes de montar os times do dia.
        </p>
        <button
          type="button"
          onClick={onGoToPlayers}
          className="bg-brand hover:bg-brand-hover mt-4 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition"
        >
          Ir para Jogadores
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 sm:gap-8">
      <section className="flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold text-stone-900 sm:text-2xl">
            Quem vai jogar
          </h2>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setShowHistory((value) => !value)}
              className="text-sm font-medium text-stone-600 underline-offset-2 hover:underline"
            >
              {showHistory ? 'Ocultar histórico' : 'Histórico'}
            </button>
            <button
              type="button"
              onClick={toggleVisible}
              disabled={visiblePlayers.length === 0}
              className="text-brand text-sm font-medium underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:text-stone-400 disabled:no-underline"
            >
              {allVisibleSelected ? 'Desmarcar visíveis' : 'Marcar todos'}
            </button>
          </div>
        </div>

        {showHistory ? (
          <div className="rounded-xl border border-stone-200 bg-white/80 p-3 sm:p-4">
            <DrawHistoryPanel
              entries={history}
              onRestore={restoreHistory}
              onClear={() => {
                setHistory([])
                saveDrawHistory([])
              }}
            />
          </div>
        ) : null}

        <PlayerFilters
          value={filters}
          onChange={setFilters}
          resultCount={visiblePlayers.length}
          totalCount={players.length}
          mulheres={mulheres}
          homens={homens}
        />

        {selectedPlayers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-stone-300 bg-white/70 p-4 text-center">
            <p className="text-sm text-stone-600">
              Nenhum jogador selecionado para o sorteio.
            </p>
            <button
              type="button"
              onClick={toggleVisible}
              disabled={visiblePlayers.length === 0}
              className="bg-brand hover:bg-brand-hover mt-3 rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:bg-stone-300"
            >
              Marcar todos
            </button>
          </div>
        ) : null}

        {visiblePlayers.length === 0 ? (
          <p className="text-sm text-stone-500">
            Nenhum jogador encontrado com esses filtros.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-1.5 sm:gap-2">
            {visiblePlayers.map((player) => {
              const checked = selectedIds.has(player.id)
              const locked = constraints.teamLocks[player.id]
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
                      <span className="flex items-center gap-1 truncate text-sm font-medium text-stone-900 sm:text-base">
                        {player.nome}
                        {locked !== undefined ? (
                          <span className="rounded bg-brand/10 px-1 text-[10px] font-semibold text-brand">
                            T{locked + 1}
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1.5 text-xs text-stone-500">
                        <span>{player.estrelas}★</span>
                        <span className="text-stone-300" aria-hidden>
                          ·
                        </span>
                        <GenderIcon sexo={player.sexo} />
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
          </p>
        ) : null}

        <div className="rounded-xl border border-stone-200 bg-white/80 p-3 sm:p-4">
          <button
            type="button"
            onClick={() => setShowRules((value) => !value)}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="font-display text-base font-semibold text-stone-900">
              Travas e pares
            </span>
            <span className="text-stone-500">{showRules ? '−' : '+'}</span>
          </button>
          {showRules ? (
            <div className="mt-3">
              <DrawConstraintsPanel
                players={players}
                selectedIds={selectedIds}
                constraints={constraints}
                teamCountHint={teamCountHint}
                onChange={(next) => {
                  setResult(null)
                  setConstraints(next)
                }}
              />
              {(Object.keys(constraints.teamLocks).length > 0 ||
                constraints.pairs.length > 0) && (
                <button
                  type="button"
                  onClick={() => {
                    setResult(null)
                    setConstraints(EMPTY_CONSTRAINTS)
                  }}
                  className="mt-3 text-xs font-medium text-red-700 underline-offset-2 hover:underline"
                >
                  Limpar travas e pares
                </button>
              )}
            </div>
          ) : null}
        </div>
      </section>

      <section className="sticky bottom-2 z-10 flex flex-col gap-3 rounded-xl border border-stone-200 bg-white/95 p-3 shadow-lg backdrop-blur-md sm:static sm:gap-4 sm:p-5 sm:shadow-none">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          <label className="flex flex-col gap-1 text-xs sm:gap-1.5 sm:text-sm">
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
          <label className="flex flex-col gap-1 text-xs sm:gap-1.5 sm:text-sm">
            <span className="font-medium text-stone-700">Data</span>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="focus:ring-brand/30 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none focus:ring-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs sm:gap-1.5 sm:text-sm">
            <span className="font-medium text-stone-700">Horário</span>
            <input
              type="time"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              className="focus:ring-brand/30 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none focus:ring-2"
            />
          </label>
          <label className="col-span-2 flex flex-col gap-1 text-xs sm:col-span-1 sm:gap-1.5 sm:text-sm">
            <span className="font-medium text-stone-700">Local</span>
            <input
              type="text"
              value={eventLocation}
              onChange={(e) => setEventLocation(e.target.value)}
              placeholder="Ex.: Quadra do clube"
              className="focus:ring-brand/30 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none focus:ring-2"
            />
          </label>
        </div>

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
                  <strong>1</strong> incompleto ({leftoverCount}/{teamSize})
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
          <TeamResult
            result={result}
            teamSize={teamSize || 1}
            event={
              {
                date: eventDate,
                time: eventTime,
                location: eventLocation,
              } satisfies TeamsEventInfo
            }
            onChange={setResult}
          />
        </section>
      ) : null}
    </div>
  )
}
