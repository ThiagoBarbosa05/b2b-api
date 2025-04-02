import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { Nfe } from '../interfaces/bling/nfe'
import { blingApi } from '../lib/api'
import { ContactDetails } from '../interfaces/bling/contact-details'
import { AuthService } from './auth-service'
import { authFactory } from '../factories/auth-factory'

interface GetNfeApiResponse {
  data: Nfe[]
}

interface GetContactDetailsApiResponse {
  data: ContactDetails
}

interface GetContactDetailsRequest {
  contactId: number
}

export class BlingService {
  private authFactory: AuthService

  constructor() {
    this.authFactory = authFactory()
    dayjs.extend(utc)
    dayjs.extend(timezone)
  }

  async listNfes(): Promise<Nfe[]> {
    const startOfDay = dayjs.utc().local().startOf('day').subtract(7, 'day')
    const endOfDay = dayjs.utc().local().endOf('day').subtract(7, 'day')
    const { access_token } = await this.authFactory.getStoredToken()

    const response = await blingApi.get<GetNfeApiResponse>(
      `/nfe?dataEmissaoInicial=${startOfDay.format('YYYY-MM-DD HH:mm:ss')}&dataEmissaoFinal=${endOfDay.format('YYYY-MM-DD HH:mm:ss')}&limite=10`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    )

    const nonDuplicateContacts = Array.from(
      new Map(
        response.data.data.map((nfe) => [nfe.contato.numeroDocumento, nfe]),
      ).values(),
    )

    return nonDuplicateContacts
  }

  async getContactDetails({
    contactId,
  }: GetContactDetailsRequest): Promise<ContactDetails> {
    const { access_token } = await this.authFactory.getStoredToken()

    const response = await blingApi.get<GetContactDetailsApiResponse>(
      `/contatos/${contactId}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    )

    return response.data.data
  }
}
