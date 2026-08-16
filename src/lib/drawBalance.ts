import type { DrawnTeam, DrawResult } from './drawTeams'
import { teamStats } from './drawTeams'
import type { Player } from '../types/player'

export type DrawBalanceSummary = {
  teamAverages: number[]
  maxAverageDiff: number
  womenPerTeam: number[]
  maxWomenDiff: number
  totalWomen: number
}

export function getDrawBalanceSummary(result: DrawResult): DrawBalanceSummary {
  const teamAverages = result.teams.map((team) => {
    if (team.players.length === 0) return 0
    const { stars } = teamStats(team.players)
    return Math.round((stars / team.players.length) * 10) / 10
  })

  const womenPerTeam = result.teams.map((team) => teamStats(team.players).mulheres)
  const maxAverageDiff =
    teamAverages.length <= 1
      ? 0
      : Math.round((Math.max(...teamAverages) - Math.min(...teamAverages)) * 10) / 10
  const maxWomenDiff =
    womenPerTeam.length <= 1
      ? 0
      : Math.max(...womenPerTeam) - Math.min(...womenPerTeam)

  return {
    teamAverages,
    maxAverageDiff,
    womenPerTeam,
    maxWomenDiff,
    totalWomen: womenPerTeam.reduce((sum, n) => sum + n, 0),
  }
}

export function movePlayerToTeam(
  result: DrawResult,
  playerId: string,
  toTeamIndex: number,
  teamSize: number,
): DrawResult {
  if (toTeamIndex < 0 || toTeamIndex >= result.teams.length) return result

  let fromTeamIndex = -1
  let player: Player | undefined

  for (let i = 0; i < result.teams.length; i += 1) {
    const found = result.teams[i].players.find((p) => p.id === playerId)
    if (found) {
      fromTeamIndex = i
      player = found
      break
    }
  }

  if (!player || fromTeamIndex === -1 || fromTeamIndex === toTeamIndex) return result

  const teams: DrawnTeam[] = result.teams.map((team, index) => {
    if (index === fromTeamIndex) {
      return {
        ...team,
        players: team.players.filter((p) => p.id !== playerId),
      }
    }
    if (index === toTeamIndex) {
      return {
        ...team,
        players: [...team.players, player],
      }
    }
    return team
  })

  return {
    teams: teams.map((team) => ({
      ...team,
      incomplete: team.players.length < teamSize,
    })),
  }
}

export function swapPlayers(
  result: DrawResult,
  playerIdA: string,
  playerIdB: string,
  teamSize: number,
): DrawResult {
  if (playerIdA === playerIdB) return result

  let teamA = -1
  let teamB = -1
  let playerA: Player | undefined
  let playerB: Player | undefined

  for (let i = 0; i < result.teams.length; i += 1) {
    for (const player of result.teams[i].players) {
      if (player.id === playerIdA) {
        teamA = i
        playerA = player
      }
      if (player.id === playerIdB) {
        teamB = i
        playerB = player
      }
    }
  }

  if (!playerA || !playerB || teamA === -1 || teamB === -1) return result
  if (teamA === teamB) return result

  const teams: DrawnTeam[] = result.teams.map((team, index) => {
    if (index === teamA) {
      return {
        ...team,
        players: team.players.map((p) => (p.id === playerIdA ? playerB! : p)),
      }
    }
    if (index === teamB) {
      return {
        ...team,
        players: team.players.map((p) => (p.id === playerIdB ? playerA! : p)),
      }
    }
    return team
  })

  return {
    teams: teams.map((team) => ({
      ...team,
      incomplete: team.players.length < teamSize,
    })),
  }
}
