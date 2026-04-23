export type Subject = {
  id: string
  user_id: string
  nome: string
  cor: string
  created_at: string
}

export type Session = {
  id: string
  user_id: string
  subject_id: string | null
  duracao_min: number
  criado_em: string
}

export type DailyGoal = {
  id: string
  user_id: string
  descricao: string
  concluida: boolean
  data: string
  created_at: string
}

export type Settings = {
  id: string
  user_id: string
  foco_min: number
  pausa_curta_min: number
  pausa_longa_min: number
  ciclos_ate_pausa_longa: number
  meta_horas_dia: number
}

export const SUBJECT_COLORS = [
  '#6366f1', '#ec4899', '#f59e0b', '#10b981',
  '#3b82f6', '#ef4444', '#8b5cf6', '#14b8a6',
]
