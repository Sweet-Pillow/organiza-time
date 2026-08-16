import type { DrawConstraints } from './constraints'
import type { Player, Sexo } from '../types/player'

export type DrawnTeam = {
  players: Player[]
  incomplete: boolean
}

export type DrawResult = {
  teams: DrawnTeam[]
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

function placePlayer(
  teams: Player[][],
  player: Player,
  teamIndex: number,
  teamSize: number,
): boolean {
  if (teamIndex < 0 || teamIndex >= teams.length) return false
  if (teams[teamIndex].some((p) => p.id === player.id)) return true
  if (teams[teamIndex].length >= teamSize) return false
  teams[teamIndex].push(player)
  return true
}

function applyConstraints(
  participants: Player[],
  teams: Player[][],
  teamSize: number,
  constraints: DrawConstraints,
): Player[] {
  const byId = new Map(participants.map((player) => [player.id, player]))
  const placed = new Set<string>()

  for (const [playerId, teamIndex] of Object.entries(constraints.teamLocks)) {
    const player = byId.get(playerId)
    if (!player || placed.has(playerId)) continue
    const target = Math.min(Math.max(0, teamIndex), teams.length - 1)
    if (placePlayer(teams, player, target, teamSize)) placed.add(playerId)
  }

  for (const [idA, idB] of constraints.pairs) {
    const playerA = byId.get(idA)
    const playerB = byId.get(idB)
    if (!playerA || !playerB) continue

    if (placed.has(idA) && placed.has(idB)) continue

    if (placed.has(idA) !== placed.has(idB)) {
      const fixedId = placed.has(idA) ? idA : idB
      const other = placed.has(idA) ? playerB : playerA
      const otherId = other.id
      const teamIndex = teams.findIndex((team) => team.some((p) => p.id === fixedId))
      if (teamIndex >= 0 && placePlayer(teams, other, teamIndex, teamSize)) {
        placed.add(otherId)
      }
      continue
    }

    let teamIndex = teams.findIndex((team) => team.length + 2 <= teamSize)
    if (teamIndex === -1) teamIndex = pickTeamIndex(teams, teamSize)
    if (teamIndex === -1) continue
    if (placePlayer(teams, playerA, teamIndex, teamSize)) placed.add(idA)
    if (placePlayer(teams, playerB, teamIndex, teamSize)) placed.add(idB)
  }

  return participants.filter((player) => !placed.has(player.id))
}

function fillRemaining(
  players: Player[],
  teams: Player[][],
  teamSize: number,
  balanceByGender: boolean,
) {
  if (!balanceByGender) {
    assignByLowestStars(players, teams, teamSize)
    return
  }

  const bySexo: Record<Sexo, Player[]> = { feminino: [], masculino: [] }
  for (const player of players) bySexo[player.sexo].push(player)

  const minority =
    bySexo.feminino.length <= bySexo.masculino.length ? 'feminino' : 'masculino'
  const majority: Sexo = minority === 'feminino' ? 'masculino' : 'feminino'

  const afterMinority = assignRoundRobin(bySexo[minority], teams, teamSize)
  assignByLowestStars(
    shuffleStableByStars([...bySexo[majority], ...afterMinority]),
    teams,
    teamSize,
  )
}

export type DrawOptions = {
  balanceByGender?: boolean
  constraints?: DrawConstraints
}

export function drawTeams(
  players: Player[],
  teamSize: number,
  options: DrawOptions = {},
): DrawResult {
  const { balanceByGender = true, constraints } = options

  if (teamSize < 1 || players.length === 0) {
    return { teams: [] }
  }

  const shuffled = shuffleStableByStars(players)
  const fullTeamCount = Math.floor(players.length / teamSize)
  const remainder = players.length % teamSize

  if (fullTeamCount === 0) {
    return {
      teams: [{ players: shuffled, incomplete: true }],
    }
  }

  const teamCount = fullTeamCount + (remainder > 0 ? 1 : 0)
  const teams: Player[][] = Array.from({ length: teamCount }, () => [])
  const remaining = constraints
    ? applyConstraints(shuffled, teams, teamSize, constraints)
    : [...shuffled]

  // Fill full-size teams (0..fullTeamCount-1) first, then incomplete bucket
  const fullTeams = teams.slice(0, fullTeamCount)
  const incompleteTeam = remainder > 0 ? teams[fullTeamCount] : null

  const fullSlots = fullTeams.reduce(
    (sum, team) => sum + Math.max(0, teamSize - team.length),
    0,
  )
  const incompleteSlots = incompleteTeam
    ? Math.max(0, remainder - incompleteTeam.length)
    : 0

  const forFull = remaining.slice(0, fullSlots)
  const forIncomplete = remaining.slice(fullSlots, fullSlots + incompleteSlots)

  fillRemaining(forFull, fullTeams, teamSize, balanceByGender)

  if (incompleteTeam) {
    for (const player of forIncomplete) {
      if (incompleteTeam.length < remainder) incompleteTeam.push(player)
    }
  }

  return {
    teams: teams
      .filter((team) => team.length > 0)
      .map((teamPlayers) => ({
        players: teamPlayers,
        incomplete: teamPlayers.length < teamSize,
      })),
  }
}

export function teamStats(team: Player[]) {
  const stars = teamStars(team)
  const mulheres = team.filter((p) => p.sexo === 'feminino').length
  const homens = team.filter((p) => p.sexo === 'masculino').length
  return { stars, mulheres, homens }
}
