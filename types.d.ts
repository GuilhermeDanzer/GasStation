// types.d.ts

type PriceType = {
  id: number
  label?: string
  value?: string
  isEditing?: boolean
  name?: string
  price?: number
}
type Theme = {
  dark: boolean
  colors: {
    primary: string
    background: string
    card: string
    text: string
    border: string
    notification: string
  }
}
type GasStationType = {
  id: number
  name: string
  city: string
  state: string
  address: string
  price: PriceType[]
  total_reactions: number
}
type UserReaction = {
  id: number
  user_id: number
  station_id: number
  reaction: 'like' | 'dislike'
  created_at: string
  updated_at: string
}

type CreateGasStationResponse = {
  id: number
  name: string
  city: string
  state: string
  address: string
  createAt: string
  updatedAt: string
}
type PickerType = {
  label: string
  value: string
}

type Regiao = {
  id: number
  sigla: string
  nome: string
}

type UF = {
  id: number
  sigla: string
  nome: string
  regiao: Regiao
}

type Mesorregiao = {
  id: number
  nome: string
  UF: UF
}

type Microrregiao = {
  id: number
  nome: string
  mesorregiao: Mesorregiao
}

type RegiaoIntermediaria = {
  id: number
  nome: string
  UF: UF
}

type RegiaoImediata = {
  id: number
  nome: string
  'regiao-intermediaria': RegiaoIntermediaria
}

type Municipio = {
  id: number
  nome: string
  microrregiao: Microrregiao
  'regiao-imediata': RegiaoImediata
}
