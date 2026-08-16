import { useCallback, useMemo, useState } from 'react'
import { DrawSetup } from './components/DrawSetup'
import { Modal } from './components/Modal'
import { PlayerFilters } from './components/PlayerFilters'
import { PlayerForm } from './components/PlayerForm'
import { PlayerList } from './components/PlayerList'
import { usePlayers } from './hooks/usePlayers'
import { filterPlayers } from './lib/filterPlayers'
import {
  exportPlayersJson,
  parsePlayersJson,
} from './lib/storage'
import { EMPTY_FILTERS, type PlayerFiltersState } from './types/filters'
import type { Player, PlayerInput } from './types/player'

type Tab = 'jogadores' | 'sorteio'

export default function App() {
  const { players, addPlayer, updatePlayer, removePlayer, importPlayers } =
    usePlayers()
  const [tab, setTab] = useState<Tab>('jogadores')
  const [editing, setEditing] = useState<Player | null>(null)
  const [filters, setFilters] = useState<PlayerFiltersState>(EMPTY_FILTERS)
  const [modalOpen, setModalOpen] = useState(false)
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null)
  const [rosterMessage, setRosterMessage] = useState('')

  const filteredPlayers = useMemo(
    () => filterPlayers(players, filters),
    [players, filters],
  )

  const mulheres = players.filter((p) => p.sexo === 'feminino').length
  const homens = players.filter((p) => p.sexo === 'masculino').length

  const closeModal = useCallback(() => {
    setModalOpen(false)
    setEditing(null)
  }, [])

  const closeDeleteModal = useCallback(() => {
    setPlayerToDelete(null)
  }, [])

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(player: Player) {
    setEditing(player)
    setModalOpen(true)
  }

  function handleSubmit(input: PlayerInput) {
    if (editing) {
      updatePlayer(editing.id, input)
    } else {
      addPlayer(input)
    }
    closeModal()
  }

  function requestRemove(player: Player) {
    setPlayerToDelete(player)
  }

  function confirmRemove() {
    if (!playerToDelete) return
    if (editing?.id === playerToDelete.id) closeModal()
    removePlayer(playerToDelete.id)
    setPlayerToDelete(null)
  }

  async function handleExport() {
    try {
      await navigator.clipboard.writeText(exportPlayersJson(players))
      setRosterMessage(
        players.length === 0
          ? 'Elenco vazio copiado.'
          : `Elenco com ${players.length} jogador${players.length !== 1 ? 'es' : ''} copiado.`,
      )
    } catch {
      setRosterMessage('Não foi possível copiar o elenco. Verifique a permissão da área de transferência.')
    }
  }

  async function handleImport() {
    try {
      const raw = await navigator.clipboard.readText()
      const parsed = parsePlayersJson(raw)
      if (!parsed.ok) {
        setRosterMessage(parsed.error)
        return
      }

      const { added, skipped } = importPlayers(parsed.players)
      if (added === 0 && skipped > 0) {
        setRosterMessage(
          `Nenhum jogador novo. ${skipped} já existiam no elenco.`,
        )
        return
      }
      if (skipped > 0) {
        setRosterMessage(
          `${added} jogador${added !== 1 ? 'es' : ''} importado${added !== 1 ? 's' : ''}. ${skipped} ignorado${skipped !== 1 ? 's' : ''} (já existiam).`,
        )
        return
      }
      setRosterMessage(
        `${added} jogador${added !== 1 ? 'es' : ''} importado${added !== 1 ? 's' : ''} com sucesso.`,
      )
    } catch {
      setRosterMessage(
        'Não foi possível ler a área de transferência. Copie o elenco e permita o acesso ao colar.',
      )
    }
  }

  return (
    <div className="min-h-svh bg-[radial-gradient(ellipse_at_top,#f1fbd8_0%,#f7f8f3_45%,#eef2f4_100%)] text-stone-800">
      <div className="court-lines pointer-events-none fixed inset-0 opacity-[0.07]" aria-hidden />

      <header className="relative border-b border-stone-900/10">
        <div className="mx-auto flex max-w-5xl items-baseline gap-3 px-4 py-4 sm:px-6">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-stone-900">
            Vôlei dos Forrozeiros
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
                    ? 'text-brand'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {item.label}
                {active ? (
                  <span className="bg-accent absolute inset-x-2 bottom-0 h-0.5 rounded-full" />
                ) : null}
              </button>
            )
          })}
        </div>
      </nav>

      <main className="relative mx-auto max-w-5xl px-3 py-5 sm:px-6 sm:py-8">
        {tab === 'jogadores' ? (
          <div className="flex flex-col gap-4 sm:gap-6">
            <section className="flex min-w-0 flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-xl font-semibold text-stone-900">
                  Elenco
                </h2>
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleExport}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-800 transition hover:bg-sky-100"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden
                      className="size-4 shrink-0"
                    >
                      <path
                        d="M12 3v10m0-10 3.5 3.5M12 3 8.5 6.5M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Exportar
                  </button>
                  <button
                    type="button"
                    onClick={handleImport}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-800 transition hover:bg-violet-100"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden
                      className="size-4 shrink-0"
                    >
                      <path
                        d="M12 13V3m0 10 3.5-3.5M12 13 8.5 9.5M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Importar
                  </button>
                  <button
                    type="button"
                    onClick={openCreate}
                    className="bg-brand hover:bg-brand-hover inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-white transition"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden
                      className="size-4 shrink-0"
                    >
                      <path
                        d="M12 5v14M5 12h14"
                        stroke="currentColor"
                        strokeWidth="2.25"
                        strokeLinecap="round"
                      />
                    </svg>
                    Jogador
                  </button>
                </div>
              </div>
              {rosterMessage ? (
                <p className="text-xs text-stone-600 sm:text-sm" role="status">
                  {rosterMessage}
                </p>
              ) : null}
              <PlayerFilters
                value={filters}
                onChange={setFilters}
                resultCount={filteredPlayers.length}
                totalCount={players.length}
                mulheres={mulheres}
                homens={homens}
              />
              <PlayerList
                players={filteredPlayers}
                totalCount={players.length}
                onEdit={openEdit}
                onRemove={requestRemove}
              />
            </section>
          </div>
        ) : (
          <DrawSetup players={players} />
        )}
      </main>

      <Modal
        open={modalOpen}
        title={editing ? 'Editar jogador' : 'Novo jogador'}
        onClose={closeModal}
      >
        <PlayerForm
          key={editing?.id ?? 'new'}
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
      </Modal>

      <Modal
        open={Boolean(playerToDelete)}
        title="Excluir jogador"
        onClose={closeDeleteModal}
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-stone-600">
            Tem certeza que deseja excluir{' '}
            <strong className="text-stone-900">{playerToDelete?.nome}</strong>? Essa
            ação não pode ser desfeita.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={confirmRemove}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 sm:flex-none"
            >
              Excluir
            </button>
            <button
              type="button"
              onClick={closeDeleteModal}
              className="rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
