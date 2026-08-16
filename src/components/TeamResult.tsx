import type { DrawResult } from '../lib/drawTeams'
import { teamStats } from '../lib/drawTeams'
import type { Player } from '../types/player'
import { POSICAO_LABELS } from '../types/player'

type TeamResultProps = {
  result: DrawResult
}

export function TeamResult({ result }: TeamResultProps) {
  if (result.teams.length === 0) {
    return (
      <p className="text-sm text-stone-500">
        Não foi possível formar times com a seleção e o tamanho atuais.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        {result.teams.map((team, index) => {
          const stats = teamStats(team)
          return (
            <section
              key={index}
              className="min-w-0 rounded-xl border border-stone-200 bg-white p-2.5 shadow-sm sm:p-4"
            >
              <header className="mb-2 border-b border-stone-100 pb-2 sm:mb-3 sm:flex sm:items-baseline sm:justify-between sm:gap-2 sm:pb-3">
                <h3 className="font-display text-base font-semibold text-stone-900 sm:text-xl">
                  Time {index + 1}
                </h3>
                <p className="whitespace-nowrap text-[11px] text-stone-500 sm:text-sm">
                  {stats.stars} ★ · {stats.mulheres}♀ {stats.homens}♂
                </p>
              </header>
              <ul className="flex flex-col divide-y divide-stone-100">
                {team.map((player: Player) => (
                  <li key={player.id} className="flex items-center justify-between gap-1 py-1.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-stone-800 sm:text-base">
                        {player.nome}
                      </p>
                      <p className="hidden text-xs text-stone-500 sm:block">
                        {POSICAO_LABELS[player.posicao]}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-amber-600 sm:text-sm">
                      {player.estrelas}★
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>

      {result.leftover.length > 0 ? (
        <section className="rounded-xl border border-dashed border-amber-300 bg-amber-50/80 p-4">
          <h3 className="font-semibold text-amber-900">Fora do sorteio</h3>
          <p className="mt-1 text-sm text-amber-800/80">
            Sobrou{result.leftover.length > 1 ? 'ram' : ''} {result.leftover.length}{' '}
            jogador{result.leftover.length > 1 ? 'es' : ''} — ajuste a seleção ou o
            tamanho do time.
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {result.leftover.map((player) => (
              <li
                key={player.id}
                className="rounded-full bg-white px-3 py-1 text-sm text-stone-700 ring-1 ring-amber-200"
              >
                {player.nome}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
