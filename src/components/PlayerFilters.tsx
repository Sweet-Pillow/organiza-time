import type { Estrelas, Posicao, Sexo } from '../types/player'
import { POSICAO_LABELS, SEXO_LABELS } from '../types/player'
import type { PlayerFiltersState } from '../types/filters'
import { EMPTY_FILTERS } from '../types/filters'

type PlayerFiltersProps = {
  value: PlayerFiltersState
  onChange: (next: PlayerFiltersState) => void
  resultCount: number
  totalCount: number
  mulheres: number
  homens: number
}

const fieldClass =
  'rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none ring-teal-600/30 focus:ring-2'

export function PlayerFilters({
  value,
  onChange,
  resultCount,
  totalCount,
  mulheres,
  homens,
}: PlayerFiltersProps) {
  const hasActiveFilters =
    value.nome.trim() !== '' ||
    value.sexo !== 'todos' ||
    value.posicao !== 'todos' ||
    value.estrelas !== 'todos'

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-stone-200 bg-white/90 p-2.5 sm:gap-3 sm:p-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="sr-only">Buscar nome</span>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-stone-400">
            ⌕
          </span>
          <input
            type="search"
            value={value.nome}
            onChange={(e) => onChange({ ...value, nome: e.target.value })}
            placeholder="Buscar jogador pelo nome…"
            className={`${fieldClass} w-full pl-9`}
          />
        </div>
      </label>

      <details className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-1 py-1.5 text-sm font-medium text-stone-600 sm:hidden">
          <span>Filtros avançados</span>
          <span className="transition group-open:rotate-180">⌄</span>
        </summary>

        <div className="hidden grid-cols-3 gap-2 pt-2 group-open:grid sm:grid sm:pt-0">
          <label className="flex min-w-0 flex-col gap-1 text-xs sm:text-sm">
            <span className="font-medium text-stone-700">Gênero</span>
            <select
              value={value.sexo}
              onChange={(e) =>
                onChange({ ...value, sexo: e.target.value as PlayerFiltersState['sexo'] })
              }
              className={`${fieldClass} min-w-0 px-2 sm:px-3`}
            >
              <option value="todos">Todos</option>
              {(Object.keys(SEXO_LABELS) as Sexo[]).map((sexo) => (
                <option key={sexo} value={sexo}>
                  {SEXO_LABELS[sexo]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-w-0 flex-col gap-1 text-xs sm:text-sm">
            <span className="font-medium text-stone-700">Posição</span>
            <select
              value={value.posicao}
              onChange={(e) =>
                onChange({
                  ...value,
                  posicao: e.target.value as PlayerFiltersState['posicao'],
                })
              }
              className={`${fieldClass} min-w-0 px-2 sm:px-3`}
            >
              <option value="todos">Todas</option>
              {(Object.keys(POSICAO_LABELS) as Posicao[]).map((posicao) => (
                <option key={posicao} value={posicao}>
                  {POSICAO_LABELS[posicao]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-w-0 flex-col gap-1 text-xs sm:text-sm">
            <span className="font-medium text-stone-700">Estrelas</span>
            <select
              value={value.estrelas}
              onChange={(e) => {
                const raw = e.target.value
                onChange({
                  ...value,
                  estrelas: raw === 'todos' ? 'todos' : (Number(raw) as Estrelas),
                })
              }}
              className={`${fieldClass} min-w-0 px-2 sm:px-3`}
            >
              <option value="todos">Todas</option>
              {([1, 2, 3, 4, 5] as const).map((star) => (
                <option key={star} value={star}>
                  {star} ★
                </option>
              ))}
            </select>
          </label>
        </div>
      </details>

      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-stone-500 sm:text-sm">
        <p>
          Mostrando <strong className="text-stone-700">{resultCount}</strong> de{' '}
          <strong className="text-stone-700">{totalCount}</strong>
          <span className="text-stone-400"> · </span>
          {mulheres} mulher{mulheres !== 1 ? 'es' : ''}
          <span className="text-stone-400"> · </span>
          {homens} {homens !== 1 ? 'homens' : 'homem'}
        </p>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={() => onChange(EMPTY_FILTERS)}
            className="font-medium text-teal-800 underline-offset-2 hover:underline"
          >
            Limpar filtros
          </button>
        ) : null}
      </div>
    </div>
  )
}
