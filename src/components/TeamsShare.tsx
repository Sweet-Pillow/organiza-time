import { useState } from 'react'
import type { DrawResult } from '../lib/drawTeams'
import {
  downloadImage,
  generateTeamsImage,
  type TeamsEventInfo,
} from '../lib/teamsImage'

type TeamsShareProps = {
  result: DrawResult
  teamSize: number
  event: TeamsEventInfo
}

function shareText(event: TeamsEventInfo): string {
  const parts = ['Confira os times sorteados!']
  if (event.date.trim()) {
    const [y, m, d] = event.date.split('-')
    parts.push(d && m && y ? `${d}/${m}/${y}` : event.date.trim())
  }
  if (event.time.trim()) parts.push(event.time.trim())
  if (event.location.trim()) parts.push(event.location.trim())
  return parts.join(' · ')
}

export function TeamsShare({ result, teamSize, event }: TeamsShareProps) {
  const [generating, setGenerating] = useState(false)
  const [message, setMessage] = useState('')

  async function createImage() {
    setGenerating(true)
    setMessage('')
    try {
      return await generateTeamsImage(result, teamSize, event)
    } finally {
      setGenerating(false)
    }
  }

  async function handleDownload() {
    try {
      const blob = await createImage()
      downloadImage(blob)
      setMessage('Imagem baixada com sucesso.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível gerar a imagem.')
    }
  }

  async function handleShare() {
    try {
      const blob = await createImage()
      const file = new File([blob], 'times-volei-dos-forrozeiros.png', {
        type: 'image/png',
      })
      const shareData: ShareData = {
        title: 'Times — Vôlei dos Forrozeiros',
        text: shareText(event),
        files: [file],
      }

      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData)
        setMessage('Imagem compartilhada.')
        return
      }

      downloadImage(blob)
      setMessage(
        'Seu navegador não compartilha arquivos. A imagem foi baixada para você enviar no WhatsApp.',
      )
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setMessage(
        error instanceof Error ? error.message : 'Não foi possível compartilhar a imagem.',
      )
    }
  }

  return (
    <section className="border-brand/15 bg-brand/5 mt-2 rounded-xl border p-3 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display font-semibold text-stone-900">
            Imagem dos times
          </h3>
          <p className="mt-0.5 text-xs text-stone-600 sm:text-sm">
            Gera uma arte com a logo e todos os times para compartilhar.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleShare}
            disabled={generating}
            className="bg-brand hover:bg-brand-hover flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold text-white transition disabled:cursor-wait disabled:opacity-60 sm:flex-none"
          >
            {generating ? 'Gerando…' : 'Compartilhar no WhatsApp'}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={generating}
            className="rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 disabled:cursor-wait disabled:opacity-60"
          >
            Baixar
          </button>
        </div>
      </div>
      {message ? (
        <p className="mt-3 text-xs text-stone-600" role="status">
          {message}
        </p>
      ) : null}
    </section>
  )
}
