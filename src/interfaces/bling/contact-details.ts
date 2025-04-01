import { Address } from './address'

interface AddressDetails {
  geral: Address
}

export interface ContactDetails {
  id: number
  nome: string
  numeroDocumento: string
  celular: string
  telefone: string
  fantasia: string
  ie: string
  email: string
  endereco: AddressDetails
  tiposContato: {
    id: number
    descricao: string
  }
}
