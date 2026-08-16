import type { DrawResult } from '../lib/drawTeams'
import { teamStats } from '../lib/drawTeams'
import type { Player } from '../types/player'
import { POSICAO_LABELS } from '../types/player'
import { TeamsShare } from './TeamsShare'

type TeamResultProps = {
  result: DrawResult
  teamSize: number
}

export function TeamResult({ result, teamSize }: TeamResultProps) {
  if (result.teams.length === 0) {
    return (
      <p className="text-sm text-stone-500">
        Não foi possível formar times com a seleção e o tamanho atuais.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        {result.teams.map((team, index) => {
          const stats = teamStats(team.players)
          const incomplete = team.incomplete

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
                    ? `${team.players.length} de ${teamSize} jogadores`
                    : null}
                  {incomplete ? ' · ' : null}
                  {stats.stars} ★ · {stats.mulheres}♀ {stats.homens}♂
                </p>
              </header>
              <ul className="flex flex-col divide-y divide-stone-100">
                {team.players.map((player: Player) => (
                  <li key={player.id} className="py-1.5">
                    <p className="truncate text-sm font-medium text-stone-800 sm:text-base">
                      {player.nome}
                    </p>
                    <p className="hidden text-xs text-stone-500 sm:block">
                      {POSICAO_LABELS[player.posicao]}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>
      <TeamsShare result={result} teamSize={teamSize} />
    </div>
  )
}
