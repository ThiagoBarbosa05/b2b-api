import { Contact } from '../interfaces/ploomes/contact'
import { ploomesApi } from '../lib/api'
import { env } from '../lib/env'

interface GetContactApiResponse {
  value: Contact[]
}

interface CreateContactRequest {
  Name: string
  Neighborhood: string
  ZipCode: string
  Register: string
  LegalName: string
  Email: string
  StreetAddressNumber: string
  TypeId: number
  Phones: {
    PhoneNumber: string
  }[]
  OtherProperties: {
    FieldKey: string
    StringValue: string
  }[]
}

export class PloomesService {
  private userKey: string

  constructor() {
    this.userKey = env.PLOOMES_USER_KEY
  }

  async getContact(contactDocument: string): Promise<Contact | null> {
    const response = await ploomesApi.get<GetContactApiResponse>(
      `/Contacts?$filter=(((TypeId+eq+1)))+and+TypeId+eq+1+and+Register+eq+%27${contactDocument}%27&$expand=Owner($select=Id,Name, Email)&preload=true`,
      {
        headers: {
          'User-Key': this.userKey,
        },
      },
    )

    if (response.data.value.length === 0) {
      return null
    }

    return response.data.value[0]
  }

  async createContact(contact: CreateContactRequest) {
    await ploomesApi.post(
      `/Contacts`,
      { ...contact, ZipCode: this.formatZipCode(contact.ZipCode) },
      {
        headers: {
          'User-Key': this.userKey,
        },
      },
    )
  }

  private formatZipCode(zipCode: string): number {
    return Number(zipCode.replace(/[^0-9]/g, ''))
  }
}
