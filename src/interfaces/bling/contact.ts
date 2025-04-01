import { Address } from './address'

export interface Contact {
  id: number
  nome: string
  numeroDocumento: string
  ie: string
  telefone: string
  email: string
  endereco: Address
}
