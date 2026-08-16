import { useMemo, useState } from 'react'
import { DrawSetup } from './components/DrawSetup'
import { PlayerFilters } from './components/PlayerFilters'
import { PlayerForm } from './components/PlayerForm'
import { PlayerList } from './components/PlayerList'
import { usePlayers } from './hooks/usePlayers'
import { filterPlayers } from './lib/filterPlayers'
import { EMPTY_FILTERS, type PlayerFiltersState } from './types/filters'
import type { Player, PlayerInput } from './types/player'

type Tab = 'jogadores' | 'sorteio'

export default function App() {
  const { players, addPlayer, updatePlayer, removePlayer } = usePlayers()
  const [tab, setTab] = useState<Tab>('jogadores')
  const [editing, setEditing] = useState<Player | null>(null)
  const [filters, setFilters] = useState<PlayerFiltersState>(EMPTY_FILTERS)
  const [showForm, setShowForm] = useState(false)

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
      setShowForm(false)
      return
    }
    addPlayer(input)
    setShowForm(false)
  }

  function handleRemove(id: string) {
    if (editing?.id === id) setEditing(null)
    removePlayer(id)
  }

  function handleEdit(player: Player) {
    setEditing(player)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-svh bg-[radial-gradient(ellipse_at_top,#e8f5ef_0%,#f7f3ea_45%,#efe8dc_100%)] text-stone-800">
      <div className="court-lines pointer-events-none fixed inset-0 opacity-[0.07]" aria-hidden />

      <header className="relative border-b border-stone-900/10">
        <div className="mx-auto flex max-w-5xl items-baseline gap-3 px-4 py-4 sm:px-6">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-stone-900">
            organiza-time
          </h1>
          <p className="hidden text-sm text-stone-500 sm:block">
            Times de vôlei equilibrados
          </p>
        </div>
      </header>

      <nav className="sticky top-0 z-20 border-b border-stone-900/10 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl px-2 sm:gap-1 sm:px-6">
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
                className={`relative flex-1 px-4 py-3 text-sm font-semibold transition sm:flex-none ${
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

      <main className="relative mx-auto max-w-5xl px-3 py-5 sm:px-6 sm:py-8">
        {tab === 'jogadores' ? (
          <div className="flex flex-col gap-4 sm:gap-6">
            <p className="text-sm text-stone-600">
              <strong>{players.length}</strong> jogador
              {players.length !== 1 ? 'es' : ''} · {mulheres} mulher
              {mulheres !== 1 ? 'es' : ''} · {homens}{' '}
              {homens !== 1 ? 'homens' : 'homem'}
            </p>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-8">
              <section className="rounded-xl border border-stone-200 bg-white/90 shadow-sm">
                <button
                  type="button"
                  onClick={() => {
                    if (showForm && editing) setEditing(null)
                    setShowForm((current) => !current)
                  }}
                  className="flex w-full items-center justify-between p-3 text-left lg:pointer-events-none lg:p-5 lg:pb-0"
                >
                  <h2 className="font-display text-lg font-semibold text-stone-900 sm:text-xl">
                    {editing ? 'Editar jogador' : 'Novo jogador'}
                  </h2>
                  <span className="text-xl text-teal-800 lg:hidden" aria-hidden>
                    {showForm ? '−' : '+'}
                  </span>
                </button>
                <div className={`${showForm ? 'block' : 'hidden'} px-3 pb-4 lg:block lg:p-5`}>
                  <PlayerForm
                    key={editing?.id ?? 'new'}
                    initial={editing}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                      setEditing(null)
                      setShowForm(false)
                    }}
                  />
                </div>
              </section>

              <section className="flex min-w-0 flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-semibold text-stone-900">
                    Elenco
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(null)
                      setShowForm(true)
                    }}
                    className="rounded-lg bg-teal-700 px-3 py-2 text-sm font-semibold text-white lg:hidden"
                  >
                    + Jogador
                  </button>
                </div>
                <PlayerFilters
                  value={filters}
                  onChange={setFilters}
                  resultCount={filteredPlayers.length}
                  totalCount={players.length}
                />
                <PlayerList
                  players={filteredPlayers}
                  totalCount={players.length}
                  onEdit={handleEdit}
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
