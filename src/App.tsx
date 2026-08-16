import { useMemo, useState } from 'react'
import { DrawSetup } from './components/DrawSetup'
import { PlayerFilters } from './components/PlayerFilters'
import { PlayerForm } from './components/PlayerForm'
import { PlayerList } from './components/PlayerList'
import { usePlayers } from './hooks/usePlayers'
import { EMPTY_FILTERS, type PlayerFiltersState } from './types/filters'
import type { Player, PlayerInput } from './types/player'

type Tab = 'jogadores' | 'sorteio'

function normalizeName(value: string) {
  return value
    .trim()
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

function filterPlayers(players: Player[], filters: PlayerFiltersState) {
  const query = normalizeName(filters.nome)

  return players.filter((player) => {
    if (query && !normalizeName(player.nome).includes(query)) return false
    if (filters.sexo !== 'todos' && player.sexo !== filters.sexo) return false
    if (filters.posicao !== 'todos' && player.posicao !== filters.posicao) return false
    if (filters.estrelas !== 'todos' && player.estrelas !== filters.estrelas) {
      return false
    }
    return true
  })
}

export default function App() {
  const { players, addPlayer, updatePlayer, removePlayer } = usePlayers()
  const [tab, setTab] = useState<Tab>('jogadores')
  const [editing, setEditing] = useState<Player | null>(null)
  const [filters, setFilters] = useState<PlayerFiltersState>(EMPTY_FILTERS)

  const filteredPlayers = useMemo(
    () => filterPlayers(players, filters),
    [players, filters],
  )

  const mulheres = players.filter((p) => p.sexo === 'feminino').length
  const homens = players.filter((p) => p.sexo === 'masculino').length

  function handleSubmit(input: PlayerInput) {
    if (editing) {
      updatePlayer(editing.id, input)
      setEditing(null)
      return
    }
    addPlayer(input)
  }

  function handleRemove(id: string) {
    if (editing?.id === id) setEditing(null)
    removePlayer(id)
  }

  return (
    <div className="min-h-svh bg-[radial-gradient(ellipse_at_top,_#e8f5ef_0%,_#f7f3ea_45%,_#efe8dc_100%)] text-stone-800">
      <div className="court-lines pointer-events-none fixed inset-0 opacity-[0.07]" aria-hidden />

      <header className="relative border-b border-stone-900/10">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 sm:px-6 sm:py-10">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-800/70">
            Vôlei
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
            organiza-time
          </h1>
          <p className="max-w-lg text-base text-stone-600 sm:text-lg">
            Cadastre o elenco, escolha quem joga e sorteie times equilibrados por
            nível e gênero.
          </p>
        </div>
      </header>

      <nav className="relative border-b border-stone-900/10 bg-white/40 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl gap-1 px-4 sm:px-6">
          {(
            [
              { id: 'jogadores', label: 'Jogadores' },
              { id: 'sorteio', label: 'Sorteio' },
            ] as const
          ).map((item) => {
            const active = tab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`relative px-4 py-3 text-sm font-semibold transition ${
                  active
                    ? 'text-teal-900'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {item.label}
                {active ? (
                  <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-teal-700" />
                ) : null}
              </button>
            )
          })}
        </div>
      </nav>

      <main className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        {tab === 'jogadores' ? (
          <div className="flex flex-col gap-8">
            <p className="text-sm text-stone-600">
              <strong>{players.length}</strong> jogador
              {players.length !== 1 ? 'es' : ''} · {mulheres} mulher
              {mulheres !== 1 ? 'es' : ''} · {homens}{' '}
              {homens !== 1 ? 'homens' : 'homem'}
            </p>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_1fr]">
              <section className="rounded-xl border border-stone-200 bg-white/90 p-4 shadow-sm sm:p-5">
                <h2 className="mb-4 font-display text-xl font-semibold text-stone-900">
                  {editing ? 'Editar jogador' : 'Novo jogador'}
                </h2>
                <PlayerForm
                  key={editing?.id ?? 'new'}
                  initial={editing}
                  onSubmit={handleSubmit}
                  onCancel={() => setEditing(null)}
                />
              </section>

              <section className="flex flex-col gap-3">
                <h2 className="font-display text-xl font-semibold text-stone-900">
                  Elenco
                </h2>
                <PlayerFilters
                  value={filters}
                  onChange={setFilters}
                  resultCount={filteredPlayers.length}
                  totalCount={players.length}
                />
                <PlayerList
                  players={filteredPlayers}
                  totalCount={players.length}
                  onEdit={setEditing}
                  onRemove={handleRemove}
                />
              </section>
            </div>
          </div>
        ) : (
          <DrawSetup players={players} />
        )}
      </main>
    </div>
  )
}
