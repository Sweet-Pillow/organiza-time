import type { Player } from '../types/player'
import { POSICAO_LABELS, SEXO_LABELS } from '../types/player'
import { StarRating } from './StarRating'

type PlayerListProps = {
  players: Player[]
  totalCount: number
  onEdit: (player: Player) => void
  onRemove: (player: Player) => void
}

export function PlayerList({
  players,
  totalCount,
  onEdit,
  onRemove,
}: PlayerListProps) {
  if (totalCount === 0) {
    return (
      <p className="text-sm text-stone-500">
        Nenhum jogador cadastrado ainda. Toque em “+ Jogador” para começar.
      </p>
    )
  }

  if (players.length === 0) {
    return (
      <p className="text-sm text-stone-500">
        Nenhum jogador encontrado com esses filtros.
      </p>
    )
  }

  return (
    <ul className="divide-y divide-stone-200 overflow-hidden rounded-xl border border-stone-200 bg-white">
      {players.map((player) => (
        <li
          key={player.id}
          className="flex items-center gap-2 px-3 py-2.5 sm:px-4 sm:py-3"
        >
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <p className="truncate font-semibold text-stone-900">{player.nome}</p>
              <span className="shrink-0 text-xs font-semibold text-amber-600">
                {player.estrelas}★
              </span>
            </div>
            <p className="truncate text-xs text-stone-500 sm:text-sm">
              {SEXO_LABELS[player.sexo]} · {POSICAO_LABELS[player.posicao]}
            </p>
            <div className="mt-1 hidden sm:block">
              <StarRating value={player.estrelas} readOnly size="sm" />
            </div>
          </div>
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={() => onEdit(player)}
              className="flex size-9 items-center justify-center rounded-lg border border-stone-300 text-stone-700 transition hover:bg-stone-50 sm:size-auto sm:px-3 sm:py-1.5 sm:text-sm sm:font-medium"
              aria-label={`Editar ${player.nome}`}
            >
              <span aria-hidden className="sm:hidden">✎</span>
              <span className="hidden sm:inline">Editar</span>
            </button>
            <button
              type="button"
              onClick={() => onRemove(player)}
              className="flex size-9 items-center justify-center rounded-lg border border-red-200 text-red-700 transition hover:bg-red-50 sm:size-auto sm:px-3 sm:py-1.5 sm:text-sm sm:font-medium"
              aria-label={`Excluir ${player.nome}`}
            >
              <span aria-hidden className="sm:hidden">×</span>
              <span className="hidden sm:inline">Excluir</span>
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
