import type { Player } from '../types/player'
import { POSICAO_LABELS, SEXO_LABELS } from '../types/player'
import { StarRating } from './StarRating'

type PlayerListProps = {
  players: Player[]
  onEdit: (player: Player) => void
  onRemove: (id: string) => void
}

export function PlayerList({ players, onEdit, onRemove }: PlayerListProps) {
  if (players.length === 0) {
    return (
      <p className="text-sm text-stone-500">
        Nenhum jogador cadastrado ainda. Use o formulário ao lado para começar.
      </p>
    )
  }

  return (
    <ul className="divide-y divide-stone-200 overflow-hidden rounded-xl border border-stone-200 bg-white">
      {players.map((player) => (
        <li
          key={player.id}
          className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <p className="truncate font-semibold text-stone-900">{player.nome}</p>
            <p className="mt-0.5 text-sm text-stone-500">
              {SEXO_LABELS[player.sexo]} · {POSICAO_LABELS[player.posicao]}
            </p>
            <div className="mt-1">
              <StarRating value={player.estrelas} readOnly size="sm" />
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => onEdit(player)}
              className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => onRemove(player.id)}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50"
            >
              Excluir
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
