export type DrawConstraints = {
  /** playerId -> índice do time (0-based) */
  teamLocks: Record<string, number>
  /** pares que devem ficar no mesmo time */
  pairs: Array<[string, string]>
}

export const EMPTY_CONSTRAINTS: DrawConstraints = {
  teamLocks: {},
  pairs: [],
}

const STORAGE_KEY = 'organiza-time:constraints'

export function loadConstraints(): DrawConstraints {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_CONSTRAINTS
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return EMPTY_CONSTRAINTS
    const data = parsed as Record<string, unknown>
    const teamLocks =
      data.teamLocks && typeof data.teamLocks === 'object' && !Array.isArray(data.teamLocks)
        ? Object.fromEntries(
            Object.entries(data.teamLocks as Record<string, unknown>).filter(
              ([, value]) => typeof value === 'number' && value >= 0,
            ) as Array<[string, number]>,
          )
        : {}
    const pairs = Array.isArray(data.pairs)
      ? data.pairs.filter(
          (pair): pair is [string, string] =>
            Array.isArray(pair) &&
            pair.length === 2 &&
            typeof pair[0] === 'string' &&
            typeof pair[1] === 'string' &&
            pair[0] !== pair[1],
        )
      : []
    return { teamLocks, pairs }
  } catch {
    return EMPTY_CONSTRAINTS
  }
}

export function saveConstraints(constraints: DrawConstraints): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(constraints))
}

export function setTeamLock(
  constraints: DrawConstraints,
  playerId: string,
  teamIndex: number | null,
): DrawConstraints {
  const teamLocks = { ...constraints.teamLocks }
  if (teamIndex === null) delete teamLocks[playerId]
  else teamLocks[playerId] = teamIndex
  return { ...constraints, teamLocks }
}

export function togglePair(
  constraints: DrawConstraints,
  playerIdA: string,
  playerIdB: string,
): DrawConstraints {
  if (playerIdA === playerIdB) return constraints

  const [a, b] = playerIdA < playerIdB ? [playerIdA, playerIdB] : [playerIdB, playerIdA]
  const exists = constraints.pairs.some(
    ([x, y]) => (x === a && y === b) || (x === b && y === a),
  )

  if (exists) {
    return {
      ...constraints,
      pairs: constraints.pairs.filter(
        ([x, y]) => !((x === a && y === b) || (x === b && y === a)),
      ),
    }
  }

  return {
    ...constraints,
    pairs: [...constraints.pairs, [a, b]],
  }
}

export function findPairPartner(
  constraints: DrawConstraints,
  playerId: string,
): string | null {
  for (const [a, b] of constraints.pairs) {
    if (a === playerId) return b
    if (b === playerId) return a
  }
  return null
}
