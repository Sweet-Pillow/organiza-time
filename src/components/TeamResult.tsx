import { useMemo, useState } from 'react'
import {
  getDrawBalanceSummary,
  movePlayerToTeam,
  swapPlayers,
} from '../lib/drawBalance'
import type { DrawResult } from '../lib/drawTeams'
import { teamStats } from '../lib/drawTeams'
import type { Player } from '../types/player'
import { POSICAO_LABELS } from '../types/player'
import { GenderIcon } from './GenderIcon'
import { TeamsShare } from './TeamsShare'

type TeamResultProps = {
  result: DrawResult
  teamSize: number
  onChange: (next: DrawResult) => void
}

export function TeamResult({ result, teamSize, onChange }: TeamResultProps) {
  const [pickedId, setPickedId] = useState<string | null>(null)
  const balance = useMemo(() => getDrawBalanceSummary(result), [result])

  if (result.teams.length === 0) {
    return (
      <p className="text-sm text-stone-500">
        Não foi possível formar times com a seleção e o tamanho atuais.
      </p>
    )
  }

  function handlePlayerClick(player: Player, teamIndex: number) {
    if (!pickedId) {
      setPickedId(player.id)
      return
    }

    if (pickedId === player.id) {
      setPickedId(null)
      return
    }

    const pickedTeam = result.teams.findIndex((team) =>
      team.players.some((p) => p.id === pickedId),
    )

    if (pickedTeam === teamIndex) {
      setPickedId(player.id)
      return
    }

    onChange(swapPlayers(result, pickedId, player.id, teamSize))
    setPickedId(null)
  }

  function handleMoveToTeam(teamIndex: number) {
    if (!pickedId) return
    onChange(movePlayerToTeam(result, pickedId, teamIndex, teamSize))
    setPickedId(null)
  }

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <section className="rounded-xl border border-brand/15 bg-brand/5 p-3 sm:p-4">
        <h3 className="font-display text-base font-semibold text-stone-900">
          Equilíbrio do sorteio
        </h3>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4 sm:text-sm">
          <div className="rounded-lg bg-white/80 p-2">
            <dt className="text-stone-500">Diff. média ★</dt>
            <dd className="font-semibold text-stone-900">{balance.maxAverageDiff}</dd>
          </div>
          <div className="rounded-lg bg-white/80 p-2">
            <dt className="text-stone-500">Diff. mulheres</dt>
            <dd className="font-semibold text-stone-900">{balance.maxWomenDiff}</dd>
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
      </section>

      <p className="text-xs text-stone-500 sm:text-sm">
        {pickedId
          ? 'Toque em outro jogador para trocar, ou no botão do time para mover.'
          : 'Toque em um jogador para ajustar os times manualmente.'}
      </p>

      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        {result.teams.map((team, index) => {
          const stats = teamStats(team.players)
          const incomplete = team.incomplete
          const average = balance.teamAverages[index]

          return (
            <section
              key={index}
              className={`min-w-0 rounded-xl border p-2.5 shadow-sm sm:p-4 ${
                incomplete
                  ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-300/70'
                  : 'border-stone-200 bg-white'
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
                {pickedId ? (
                  <button
                    type="button"
                    onClick={() => handleMoveToTeam(index)}
                    className="mt-2 rounded-md bg-brand px-2 py-1 text-[11px] font-semibold text-white"
                  >
                    Mover para cá
                  </button>
                ) : null}
              </header>
              <ul className="flex flex-col divide-y divide-stone-100">
                {team.players.map((player: Player) => {
                  const selected = pickedId === player.id
                  return (
                    <li key={player.id}>
                      <button
                        type="button"
                        onClick={() => handlePlayerClick(player, index)}
                        className={`flex w-full items-center gap-2 py-1.5 text-left transition ${
                          selected ? 'rounded-md bg-accent-soft px-1' : ''
                        }`}
                      >
                        <GenderIcon sexo={player.sexo} className="size-3.5 shrink-0" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-stone-800 sm:text-base">
                            {player.nome}
                          </span>
                          <span className="hidden text-xs text-stone-500 sm:block">
                            {POSICAO_LABELS[player.posicao]}
                          </span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </div>
      <TeamsShare result={result} teamSize={teamSize} />
    </div>
  )
}
