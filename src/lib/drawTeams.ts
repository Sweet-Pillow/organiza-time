import type { Player, Sexo } from '../types/player'

export type DrawResult = {
  teams: Player[][]
  leftover: Player[]
}

function shuffleStableByStars(players: Player[]): Player[] {
  const buckets = new Map<number, Player[]>()
  for (const player of players) {
    const list = buckets.get(player.estrelas) ?? []
    list.push(player)
    buckets.set(player.estrelas, list)
  }

  for (const list of buckets.values()) {
    for (let i = list.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[list[i], list[j]] = [list[j], list[i]]
    }
  }

  return [...buckets.entries()]
    .sort((a, b) => b[0] - a[0])
    .flatMap(([, list]) => list)
}

function teamStars(team: Player[]): number {
  return team.reduce((sum, player) => sum + player.estrelas, 0)
}

function pickTeamIndex(teams: Player[][], teamSize: number): number {
  let bestIndex = -1
  let bestStars = Number.POSITIVE_INFINITY

  for (let i = 0; i < teams.length; i += 1) {
    if (teams[i].length >= teamSize) continue
    const stars = teamStars(teams[i])
    if (stars < bestStars || (stars === bestStars && bestIndex === -1)) {
      bestStars = stars
      bestIndex = i
    }
  }

  return bestIndex
}

function assignRoundRobin(
  players: Player[],
  teams: Player[][],
  teamSize: number,
): Player[] {
  const remaining: Player[] = []
  let cursor = 0

  for (const player of players) {
    let placed = false
    for (let offset = 0; offset < teams.length; offset += 1) {
      const index = (cursor + offset) % teams.length
      if (teams[index].length < teamSize) {
        teams[index].push(player)
        cursor = (index + 1) % teams.length
        placed = true
        break
      }
    }
    if (!placed) remaining.push(player)
  }

  return remaining
}

function assignByLowestStars(
  players: Player[],
  teams: Player[][],
  teamSize: number,
): Player[] {
  const leftover: Player[] = []

  for (const player of players) {
    const index = pickTeamIndex(teams, teamSize)
    if (index === -1) {
      leftover.push(player)
      continue
    }
    teams[index].push(player)
  }

  return leftover
}

export function drawTeams(players: Player[], teamSize: number): DrawResult {
  if (teamSize < 1 || players.length < teamSize) {
    return { teams: [], leftover: [...players] }
  }

  const teamCount = Math.floor(players.length / teamSize)
  const shuffled = shuffleStableByStars(players)
  const participants = shuffled.slice(0, teamCount * teamSize)
  const leftover = shuffled.slice(teamCount * teamSize)

  const teams: Player[][] = Array.from({ length: teamCount }, () => [])

  const bySexo: Record<Sexo, Player[]> = {
    feminino: [],
    masculino: [],
  }

  for (const player of participants) {
    bySexo[player.sexo].push(player)
  }

  const minority =
    bySexo.feminino.length <= bySexo.masculino.length ? 'feminino' : 'masculino'
  const majority: Sexo = minority === 'feminino' ? 'masculino' : 'feminino'

  const afterMinority = assignRoundRobin(bySexo[minority], teams, teamSize)
  const majorityPool = shuffleStableByStars([...bySexo[majority], ...afterMinority])
  const extraLeftover = assignByLowestStars(majorityPool, teams, teamSize)

  return {
    teams,
    leftover: [...leftover, ...extraLeftover],
  }
}

export function teamStats(team: Player[]) {
  const stars = teamStars(team)
  const mulheres = team.filter((p) => p.sexo === 'feminino').length
  const homens = team.filter((p) => p.sexo === 'masculino').length
  return { stars, mulheres, homens }
}
