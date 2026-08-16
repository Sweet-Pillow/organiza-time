import { useMemo, useRef, useState, type PointerEvent } from 'react'
import {
  getDrawBalanceSummary,
  movePlayerToTeam,
  swapPlayers,
} from '../lib/drawBalance'
import type { DrawResult } from '../lib/drawTeams'
import { teamStats } from '../lib/drawTeams'
import type { TeamsEventInfo } from '../lib/teamsImage'
import type { Player } from '../types/player'
import { POSICAO_LABELS } from '../types/player'
import { GenderIcon } from './GenderIcon'
import { TeamsShare } from './TeamsShare'

type TeamResultProps = {
  result: DrawResult
  teamSize: number
  event: TeamsEventInfo
  onChange: (next: DrawResult) => void
}

type DragSession = {
  playerId: string
  fromTeam: number
  startX: number
  startY: number
  x: number
  y: number
  active: boolean
  pointerId: number
}

type DropTarget =
  | { kind: 'team'; teamIndex: number }
  | { kind: 'player'; teamIndex: number; playerId: string }

const DRAG_THRESHOLD_PX = 8

function readDropTarget(
  clientX: number,
  clientY: number,
  draggingId: string,
): DropTarget | null {
  const el = document.elementFromPoint(clientX, clientY)
  if (!el) return null

  const playerEl = el.closest('[data-player-id]') as HTMLElement | null
  const playerId = playerEl?.dataset.playerId
  if (playerId && playerId !== draggingId) {
    const teamIndex = Number(playerEl?.dataset.teamIndex)
    if (Number.isInteger(teamIndex)) {
      return { kind: 'player', teamIndex, playerId }
    }
  }

  const teamEl = el.closest('[data-team-index]') as HTMLElement | null
  const teamIndex = Number(teamEl?.dataset.teamIndex)
  if (Number.isInteger(teamIndex)) {
    return { kind: 'team', teamIndex }
  }

  return null
}

export function TeamResult({ result, teamSize, event, onChange }: TeamResultProps) {
  const [drag, setDrag] = useState<DragSession | null>(null)
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null)
  const [showBalance, setShowBalance] = useState(false)
  const dragRef = useRef<DragSession | null>(null)
  const balance = useMemo(() => getDrawBalanceSummary(result), [result])

  const draggingPlayer = drag?.active
    ? result.teams
        .flatMap((team) => team.players)
        .find((player) => player.id === drag.playerId)
    : undefined

  const balanceSummary = `Diff ★ ${balance.maxAverageDiff} · Diff ♀ ${balance.maxWomenDiff}`

  if (result.teams.length === 0) {
    return (
      <p className="text-sm text-stone-500">
        Não foi possível formar times com a seleção e o tamanho atuais.
      </p>
    )
  }

  function clearDrag() {
    dragRef.current = null
    setDrag(null)
    setDropTarget(null)
  }

  function applyDrop(session: DragSession, target: DropTarget | null) {
    if (!target || target.teamIndex === session.fromTeam) {
      clearDrag()
      return
    }

    if (target.kind === 'player') {
      onChange(swapPlayers(result, session.playerId, target.playerId, teamSize))
    } else {
      onChange(movePlayerToTeam(result, session.playerId, target.teamIndex, teamSize))
    }
    clearDrag()
  }

  function handlePointerDown(
    event: PointerEvent<HTMLElement>,
    player: Player,
    teamIndex: number,
  ) {
    if (event.button !== 0) return

    const session: DragSession = {
      playerId: player.id,
      fromTeam: teamIndex,
      startX: event.clientX,
      startY: event.clientY,
      x: event.clientX,
      y: event.clientY,
      active: false,
      pointerId: event.pointerId,
    }
    dragRef.current = session
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    const session = dragRef.current
    if (!session || session.pointerId !== event.pointerId) return

    const next: DragSession = {
      ...session,
      x: event.clientX,
      y: event.clientY,
    }

    if (!session.active) {
      const distance = Math.hypot(
        event.clientX - session.startX,
        event.clientY - session.startY,
      )
      if (distance < DRAG_THRESHOLD_PX) return
      next.active = true
    }

    dragRef.current = next
    setDrag(next)
    setDropTarget(readDropTarget(event.clientX, event.clientY, session.playerId))
  }

  function handlePointerUp(event: PointerEvent<HTMLElement>) {
    const session = dragRef.current
    if (!session || session.pointerId !== event.pointerId) return

    try {
      event.currentTarget.releasePointerCapture(event.pointerId)
    } catch {
      // already released
    }

    if (!session.active) {
      clearDrag()
      return
    }

    const target = readDropTarget(event.clientX, event.clientY, session.playerId)
    applyDrop(session, target)
  }

  function handlePointerCancel(event: PointerEvent<HTMLElement>) {
    const session = dragRef.current
    if (!session || session.pointerId !== event.pointerId) return
    clearDrag()
  }

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <p className="text-xs text-stone-500 sm:text-sm">
        Arraste um jogador para outro time (mover) ou solte em cima de alguém
        (trocar).
      </p>

      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        {result.teams.map((team, index) => {
          const stats = teamStats(team.players)
          const incomplete = team.incomplete
          const average = balance.teamAverages[index]
          const teamIsDrop =
            drag?.active &&
            dropTarget?.teamIndex === index &&
            dropTarget.kind === 'team'
          const teamHasPlayerDrop =
            drag?.active &&
            dropTarget?.teamIndex === index &&
            dropTarget.kind === 'player'

          return (
            <section
              key={index}
              data-team-index={index}
              className={`min-w-0 rounded-xl border p-2.5 shadow-sm transition sm:p-4 ${
                incomplete
                  ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-300/70'
                  : 'border-stone-200 bg-white'
              } ${
                teamIsDrop || teamHasPlayerDrop
                  ? 'ring-brand/40 border-brand ring-2'
                  : ''
              }`}
            >
              <header className="mb-2 border-b border-stone-100 pb-2 sm:mb-3 sm:pb-3">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <h3 className="font-display text-base font-semibold text-stone-900 sm:text-xl">
                    Time {index + 1}
                  </h3>
                  {incomplete ? (
                    <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white sm:text-xs">
                      Incompleto
                    </span>
                  ) : null}
                </div>
                <p
                  className={`mt-1 text-[11px] sm:text-sm ${
                    incomplete ? 'font-medium text-amber-800' : 'text-stone-500'
                  }`}
                >
                  {incomplete
                    ? `${team.players.length} de ${teamSize} · `
                    : null}
                  média {average}★ · {stats.mulheres}♀ {stats.homens}♂
                </p>
              </header>
              <ul className="flex min-h-12 flex-col divide-y divide-stone-100">
                {team.players.map((player: Player) => {
                  const isDragging = drag?.active && drag.playerId === player.id
                  const isSwapTarget =
                    dropTarget?.kind === 'player' &&
                    dropTarget.playerId === player.id

                  return (
                    <li key={player.id}>
                      <div
                        data-player-id={player.id}
                        data-team-index={index}
                        onPointerDown={(e) => handlePointerDown(e, player, index)}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerCancel}
                        className={`flex touch-none select-none items-center gap-2 py-1.5 transition ${
                          isDragging
                            ? 'pointer-events-none opacity-35'
                            : 'cursor-grab active:cursor-grabbing'
                        } ${
                          isSwapTarget
                            ? 'rounded-md bg-accent-soft ring-brand/30 ring-2'
                            : ''
                        }`}
                      >
                        <span
                          className="flex w-3 shrink-0 flex-col items-center gap-0.5"
                          aria-hidden
                        >
                          <span className="h-0.5 w-2.5 rounded-full bg-stone-300" />
                          <span className="h-0.5 w-2.5 rounded-full bg-stone-300" />
                          <span className="h-0.5 w-2.5 rounded-full bg-stone-300" />
                        </span>
                        <GenderIcon
                          sexo={player.sexo}
                          className="size-3.5 shrink-0"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-stone-800 sm:text-base">
                            {player.nome}
                          </span>
                          <span className="hidden text-xs text-stone-500 sm:block">
                            {POSICAO_LABELS[player.posicao]}
                          </span>
                        </span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </div>

      {draggingPlayer && drag?.active ? (
        <div
          aria-hidden
          className="pointer-events-none fixed z-50 flex items-center gap-2 rounded-lg border border-brand/20 bg-white px-3 py-2 shadow-lg"
          style={{
            left: drag.x + 12,
            top: drag.y + 12,
            width: 'max-content',
            maxWidth: '12rem',
          }}
        >
          <GenderIcon sexo={draggingPlayer.sexo} className="size-3.5 shrink-0" />
          <span className="truncate text-sm font-medium text-stone-800">
            {draggingPlayer.nome}
          </span>
        </div>
      ) : null}

      <TeamsShare result={result} teamSize={teamSize} event={event} />

      <section className="rounded-xl border border-brand/15 bg-brand/5">
        <button
          type="button"
          onClick={() => setShowBalance((value) => !value)}
          className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left sm:px-4 sm:py-2.5"
        >
          <span className="min-w-0">
            <span className="font-display block text-sm font-semibold text-stone-900">
              Equilíbrio do sorteio
            </span>
            {!showBalance ? (
              <span className="mt-0.5 block truncate text-[11px] text-stone-500">
                {balanceSummary}
              </span>
            ) : null}
          </span>
          <span className="shrink-0 text-stone-400">
            {showBalance ? '−' : '+'}
          </span>
        </button>
        {showBalance ? (
          <dl className="grid grid-cols-2 gap-2 border-t border-brand/10 p-3 text-xs sm:grid-cols-4 sm:p-4 sm:text-sm">
            <div className="rounded-lg bg-white/80 p-2">
              <dt className="text-stone-500">Diff. média ★</dt>
              <dd className="font-semibold text-stone-900">
                {balance.maxAverageDiff}
              </dd>
            </div>
            <div className="rounded-lg bg-white/80 p-2">
              <dt className="text-stone-500">Diff. mulheres</dt>
              <dd className="font-semibold text-stone-900">
                {balance.maxWomenDiff}
              </dd>
            </div>
            <div className="col-span-2 rounded-lg bg-white/80 p-2">
              <dt className="text-stone-500">Média ★ por time</dt>
              <dd className="font-semibold text-stone-900">
                {balance.teamAverages
                  .map((avg, index) => `T${index + 1}: ${avg}`)
                  .join(' · ')}
              </dd>
            </div>
            <div className="col-span-2 rounded-lg bg-white/80 p-2 sm:col-span-4">
              <dt className="text-stone-500">Mulheres por time</dt>
              <dd className="font-semibold text-stone-900">
                {balance.womenPerTeam
                  .map((count, index) => `T${index + 1}: ${count}`)
                  .join(' · ')}{' '}
                <span className="font-normal text-stone-500">
                  (total {balance.totalWomen})
                </span>
              </dd>
            </div>
          </dl>
        ) : null}
      </section>
    </div>
  )
}
