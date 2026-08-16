import type { DrawHistoryEntry } from '../lib/history'
import { formatHistoryDate } from '../lib/history'

type DrawHistoryPanelProps = {
  entries: DrawHistoryEntry[]
  onRestore: (entry: DrawHistoryEntry) => void
  onClear: () => void
}

export function DrawHistoryPanel({
  entries,
  onRestore,
  onClear,
}: DrawHistoryPanelProps) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-stone-500">
        Ainda não há sorteios salvos. Os próximos resultados aparecem aqui.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-stone-600">
          Últimos {entries.length} sorteio{entries.length !== 1 ? 's' : ''}
        </p>
        <button
          type="button"
          onClick={onClear}
          className="text-sm font-medium text-red-700 underline-offset-2 hover:underline"
        >
          Limpar histórico
        </button>
      </div>
      <ul className="flex flex-col gap-2">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="rounded-xl border border-stone-200 bg-white p-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium text-stone-900">
                  {formatHistoryDate(entry.createdAt)}
                </p>
                <p className="text-xs text-stone-500">
                  {entry.teams.length} time{entry.teams.length !== 1 ? 's' : ''} ·{' '}
                  {entry.teamSize}/time
                  {entry.balanceByGender ? ' · gênero' : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRestore(entry)}
                className="rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs font-semibold text-stone-700 transition hover:bg-stone-50"
              >
                Ver de novo
              </button>
            </div>
            <div className="mt-2 grid gap-1 text-xs text-stone-600 sm:grid-cols-2">
              {entry.teams.map((team, index) => (
                <p key={index} className="truncate">
                  <span className="font-semibold text-stone-800">
                    T{index + 1}
                    {team.incomplete ? '*' : ''}:
                  </span>{' '}
                  {team.players.map((p) => p.nome).join(', ')}
                </p>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
