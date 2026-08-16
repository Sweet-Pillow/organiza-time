import type { DrawResult } from '../lib/drawTeams'
import { teamStats } from '../lib/drawTeams'
import type { Player } from '../types/player'
import { POSICAO_LABELS } from '../types/player'
import { StarRating } from './StarRating'

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
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {result.teams.map((team, index) => {
          const stats = teamStats(team)
          return (
            <section
              key={index}
              className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
            >
              <header className="mb-3 flex items-baseline justify-between gap-2 border-b border-stone-100 pb-3">
                <h3 className="font-display text-xl font-semibold text-stone-900">
                  Time {index + 1}
                </h3>
                <p className="text-sm text-stone-500">
                  {stats.stars} ★ · {stats.mulheres}♀ {stats.homens}♂
                </p>
              </header>
              <ul className="flex flex-col gap-2">
                {team.map((player: Player) => (
                  <li key={player.id} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-stone-800">{player.nome}</p>
                      <p className="text-xs text-stone-500">
                        {POSICAO_LABELS[player.posicao]}
                      </p>
                    </div>
                    <StarRating value={player.estrelas} readOnly size="sm" />
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
