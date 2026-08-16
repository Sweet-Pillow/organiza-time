export type Sexo = 'masculino' | 'feminino'

export type Posicao = 'ataque' | 'defesa' | 'levantamento' | 'qualquer'

export type Estrelas = 1 | 2 | 3 | 4 | 5

export type Player = {
  id: string
  nome: string
  sexo: Sexo
  posicao: Posicao
  estrelas: Estrelas
}

export type PlayerInput = Omit<Player, 'id'>

export const POSICAO_LABELS: Record<Posicao, string> = {
  ataque: 'Ataque',
  defesa: 'Defesa',
  levantamento: 'Levantamento',
  qualquer: 'Qualquer',
}

export const SEXO_LABELS: Record<Sexo, string> = {
  masculino: 'Masculino',
  feminino: 'Feminino',
}
