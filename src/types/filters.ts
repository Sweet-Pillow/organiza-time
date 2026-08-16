import type { Estrelas, Posicao, Sexo } from '../types/player'

export type PlayerFiltersState = {
  nome: string
  sexo: Sexo | 'todos'
  posicao: Posicao | 'todos'
  estrelas: Estrelas | 'todos'
}

export const EMPTY_FILTERS: PlayerFiltersState = {
  nome: '',
  sexo: 'todos',
  posicao: 'todos',
  estrelas: 'todos',
}
