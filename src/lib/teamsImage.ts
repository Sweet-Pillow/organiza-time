import type { DrawResult } from './drawTeams'
import { teamStats } from './drawTeams'

const WIDTH = 1080
const PADDING = 48
const GAP = 24
const COLUMNS = 2
const BRAND = '#00293D'
const ACCENT = '#A7E60F'
const PAPER = '#F5F7F2'
const MUTED = '#647079'
const WARNING = '#F59E0B'

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Não foi possível carregar a logo.'))
    image.src = source
  })
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath()
  context.roundRect(x, y, width, height, radius)
}

function fitText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  if (context.measureText(text).width <= maxWidth) return text

  let shortened = text
  while (shortened.length > 1 && context.measureText(`${shortened}…`).width > maxWidth) {
    shortened = shortened.slice(0, -1)
  }
  return `${shortened}…`
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Não foi possível gerar a imagem.'))
    }, 'image/png')
  })
}

export type TeamsEventInfo = {
  date: string
  time: string
  location: string
}

function formatDateLabel(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim())
  if (!match) return isoDate.trim()
  return `${match[3]}/${match[2]}/${match[1]}`
}

function eventDetailLines(event: TeamsEventInfo): string[] {
  const lines: string[] = []
  const dateLabel = event.date.trim() ? formatDateLabel(event.date) : ''
  const timeLabel = event.time.trim()
  if (dateLabel && timeLabel) lines.push(`${dateLabel} · ${timeLabel}`)
  else if (dateLabel) lines.push(dateLabel)
  else if (timeLabel) lines.push(timeLabel)

  const location = event.location.trim()
  if (location) lines.push(location)
  return lines
}

export async function generateTeamsImage(
  result: DrawResult,
  teamSize: number,
  event: TeamsEventInfo = { date: '', time: '', location: '' },
): Promise<Blob> {
  const logo = await loadImage(
    `${import.meta.env.BASE_URL}logo-volei-dos-forrozeiros.jpg`,
  )
  const details = eventDetailLines(event)
  const maxPlayers = Math.max(...result.teams.map((team) => team.players.length), 1)
  const cardHeight = Math.max(250, 112 + maxPlayers * 52)
  const rows = Math.ceil(result.teams.length / COLUMNS)
  const detailsBlock = details.length > 0 ? 18 + details.length * 34 : 0
  const headerHeight = 310 + detailsBlock
  const footerHeight = 72
  const height = headerHeight + rows * cardHeight + (rows - 1) * GAP + footerHeight

  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = height
  const context = canvas.getContext('2d')

  if (!context) throw new Error('Seu navegador não permite gerar a imagem.')

  context.fillStyle = PAPER
  context.fillRect(0, 0, WIDTH, height)
  context.fillStyle = BRAND
  context.fillRect(0, 0, WIDTH, 262)

  const logoSize = 205
  const logoX = (WIDTH - logoSize) / 2
  context.drawImage(logo, logoX, 20, logoSize, logoSize)

  context.fillStyle = ACCENT
  context.fillRect(PADDING, 249, WIDTH - PADDING * 2, 5)
  context.fillStyle = BRAND
  context.textAlign = 'center'
  context.font = '700 34px system-ui, sans-serif'
  context.fillText('TIMES SORTEADOS', WIDTH / 2, 294)

  details.forEach((line, index) => {
    context.fillStyle = MUTED
    context.font = `${index === 0 ? '600' : '500'} 24px system-ui, sans-serif`
    context.fillText(
      fitText(context, line, WIDTH - PADDING * 2),
      WIDTH / 2,
      334 + index * 34,
    )
  })

  const cardWidth = (WIDTH - PADDING * 2 - GAP) / COLUMNS

  result.teams.forEach((team, index) => {
    const column = index % COLUMNS
    const row = Math.floor(index / COLUMNS)
    const x = PADDING + column * (cardWidth + GAP)
    const y = headerHeight + row * (cardHeight + GAP)
    const stats = teamStats(team.players)

    context.fillStyle = team.incomplete ? '#FFF7E6' : '#FFFFFF'
    roundedRect(context, x, y, cardWidth, cardHeight, 22)
    context.fill()
    context.strokeStyle = team.incomplete ? WARNING : '#DCE2DF'
    context.lineWidth = team.incomplete ? 4 : 2
    context.stroke()

    context.textAlign = 'left'
    context.fillStyle = BRAND
    context.font = '700 30px system-ui, sans-serif'
    context.fillText(`Time ${index + 1}`, x + 24, y + 44)

    if (team.incomplete) {
      context.fillStyle = WARNING
      roundedRect(context, x + cardWidth - 166, y + 17, 142, 34, 17)
      context.fill()
      context.fillStyle = '#FFFFFF'
      context.textAlign = 'center'
      context.font = '700 15px system-ui, sans-serif'
      context.fillText('INCOMPLETO', x + cardWidth - 95, y + 40)
    }

    context.textAlign = 'left'
    context.fillStyle = MUTED
    context.font = '500 18px system-ui, sans-serif'
    const summary = team.incomplete
      ? `${team.players.length} de ${teamSize} jogadores · ${stats.mulheres}♀ ${stats.homens}♂`
      : `${team.players.length} jogadores · ${stats.mulheres}♀ ${stats.homens}♂`
    context.fillText(summary, x + 24, y + 76)

    context.strokeStyle = '#E7EBE9'
    context.lineWidth = 2
    context.beginPath()
    context.moveTo(x + 24, y + 94)
    context.lineTo(x + cardWidth - 24, y + 94)
    context.stroke()

    team.players.forEach((player, playerIndex) => {
      const playerY = y + 128 + playerIndex * 52
      context.fillStyle = ACCENT
      context.beginPath()
      context.arc(x + 34, playerY - 7, 7, 0, Math.PI * 2)
      context.fill()

      context.fillStyle = BRAND
      context.font = '600 23px system-ui, sans-serif'
      context.fillText(
        fitText(context, player.nome, cardWidth - 78),
        x + 54,
        playerY,
      )
    })
  })

  context.fillStyle = BRAND
  context.textAlign = 'center'
  context.font = '500 18px system-ui, sans-serif'
  context.fillText(
    'Vôlei dos Forrozeiros',
    WIDTH / 2,
    height - 28,
  )

  return canvasToBlob(canvas)
}

export function downloadImage(blob: Blob) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'times-volei-dos-forrozeiros.png'
  anchor.click()
  URL.revokeObjectURL(url)
}
