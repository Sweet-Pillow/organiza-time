import { useState, type FormEvent } from 'react'
import type { Estrelas, Player, PlayerInput, Posicao, Sexo } from '../types/player'
import { POSICAO_LABELS, SEXO_LABELS } from '../types/player'
import { StarRating } from './StarRating'

type PlayerFormProps = {
  initial?: Player | null
  onSubmit: (input: PlayerInput) => void
  onCancel?: () => void
}

const emptyForm: PlayerInput = {
  nome: '',
  sexo: 'masculino',
  posicao: 'qualquer',
  estrelas: 3,
}

function toInput(player?: Player | null): PlayerInput {
  if (!player) return emptyForm
  return {
    nome: player.nome,
    sexo: player.sexo,
    posicao: player.posicao,
    estrelas: player.estrelas,
  }
}

export function PlayerForm({ initial, onSubmit, onCancel }: PlayerFormProps) {
  const [form, setForm] = useState<PlayerInput>(() => toInput(initial))
  const editing = Boolean(initial)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const nome = form.nome.trim()
    if (!nome) return
    onSubmit({ ...form, nome })
    if (!initial) setForm(emptyForm)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-stone-700">Nome</span>
        <input
          required
          value={form.nome}
          onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
          placeholder="Nome do jogador"
          className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none ring-teal-600/30 focus:ring-2"
        />
      </label>

      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        <label className="flex min-w-0 flex-col gap-1.5 text-sm">
          <span className="font-medium text-stone-700">Sexo</span>
          <select
            value={form.sexo}
            onChange={(e) => setForm((f) => ({ ...f, sexo: e.target.value as Sexo }))}
            className="min-w-0 rounded-lg border border-stone-300 bg-white px-2 py-2 text-stone-900 outline-none ring-teal-600/30 focus:ring-2 sm:px-3"
          >
            {(Object.keys(SEXO_LABELS) as Sexo[]).map((sexo) => (
              <option key={sexo} value={sexo}>
                {SEXO_LABELS[sexo]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-0 flex-col gap-1.5 text-sm">
          <span className="font-medium text-stone-700">Posição</span>
          <select
            value={form.posicao}
            onChange={(e) =>
              setForm((f) => ({ ...f, posicao: e.target.value as Posicao }))
            }
            className="min-w-0 rounded-lg border border-stone-300 bg-white px-2 py-2 text-stone-900 outline-none ring-teal-600/30 focus:ring-2 sm:px-3"
          >
            {(Object.keys(POSICAO_LABELS) as Posicao[]).map((posicao) => (
              <option key={posicao} value={posicao}>
                {POSICAO_LABELS[posicao]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-stone-700">Nível (estrelas)</span>
        <StarRating
          value={form.estrelas}
          onChange={(estrelas: Estrelas) => setForm((f) => ({ ...f, estrelas }))}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          className="flex-1 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 sm:flex-none sm:py-2"
        >
          {editing ? 'Salvar alterações' : 'Cadastrar jogador'}
        </button>
        {editing && onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
          >
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  )
}
