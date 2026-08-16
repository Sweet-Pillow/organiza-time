import type { Estrelas, Posicao, Sexo } from '../types/player'
import { POSICAO_LABELS, SEXO_LABELS } from '../types/player'
import type { PlayerFiltersState } from '../types/filters'
import { EMPTY_FILTERS } from '../types/filters'

type PlayerFiltersProps = {
  value: PlayerFiltersState
  onChange: (next: PlayerFiltersState) => void
  resultCount: number
  totalCount: number
}

const fieldClass =
  'rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none ring-teal-600/30 focus:ring-2'

export function PlayerFilters({
  value,
  onChange,
  resultCount,
  totalCount,
}: PlayerFiltersProps) {
  const hasActiveFilters =
    value.nome.trim() !== '' ||
    value.sexo !== 'todos' ||
    value.posicao !== 'todos' ||
    value.estrelas !== 'todos'

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white/90 p-3 sm:p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1 text-sm sm:col-span-2 lg:col-span-1">
          <span className="font-medium text-stone-700">Buscar nome</span>
          <input
            type="search"
            value={value.nome}
            onChange={(e) => onChange({ ...value, nome: e.target.value })}
            placeholder="Digite o nome…"
            className={fieldClass}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-stone-700">Gênero</span>
          <select
            value={value.sexo}
            onChange={(e) =>
              onChange({ ...value, sexo: e.target.value as PlayerFiltersState['sexo'] })
            }
            className={fieldClass}
          >
            <option value="todos">Todos</option>
            {(Object.keys(SEXO_LABELS) as Sexo[]).map((sexo) => (
              <option key={sexo} value={sexo}>
                {SEXO_LABELS[sexo]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-stone-700">Posição</span>
          <select
            value={value.posicao}
            onChange={(e) =>
              onChange({
                ...value,
                posicao: e.target.value as PlayerFiltersState['posicao'],
              })
            }
            className={fieldClass}
          >
            <option value="todos">Todas</option>
            {(Object.keys(POSICAO_LABELS) as Posicao[]).map((posicao) => (
              <option key={posicao} value={posicao}>
                {POSICAO_LABELS[posicao]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
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
            className={fieldClass}
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

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-stone-500">
        <p>
          Mostrando <strong className="text-stone-700">{resultCount}</strong> de{' '}
          <strong className="text-stone-700">{totalCount}</strong>
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
