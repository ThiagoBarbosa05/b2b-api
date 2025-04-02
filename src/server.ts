import express from 'express'
import cron from 'node-cron'
import { blingFactory } from './factories/bling-factory'
import { queueFactory } from './factories/queue-factory'
import { ContactDetails } from './interfaces/bling/contact-details'
import { ploomesFactory } from './factories/ploomes-factory'
import { authFactory } from './factories/auth-factory'

const app = express()
app.use(express.json())

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Renova o token de acesso do Bling
// cron.schedule('*/1 * * * *', async () => {
//   const auth = authFactory()

//   const { refresh_token: storedRefreshToken } = await auth.getStoredToken()

//   console.log(`
//        🔑 Refresh token armazenado no Dynamo: ${storedRefreshToken}
//     `)

//   const { access_token: newAccessToken, refresh_token: newRefreshToken } =
//     await auth.getNewToken(storedRefreshToken)

//   console.log(`
//       🔑 Novo Access token: ${newAccessToken}
//       🔑 Novo Refresh token: ${newRefreshToken}
//    `)

//   const { access_token, refresh_token } = await auth.updateToken({
//     access_token: newAccessToken,
//     refresh_token: newRefreshToken,
//   })

//   console.log(`
//     🔑 Access token atualizado: ${access_token}
//     🔑 Refresh token atualizado: ${refresh_token}
//  `)
// })

// Recuperando clientes do bling
cron.schedule('*/1 * * * *', async () => {
  const bling = blingFactory()
  const ploomes = ploomesFactory()

  const nfeList = await bling.listNfes()

  console.log(
    '📃 Listando Notas Fiscais Emitidas: ' + nfeList.map((nfe) => nfe.numero),
  )

  console.log(`
    -----------------------------------------------
    - Listando os contatos de cada nota do bling
    -----------------------------------------------
  `)

  for (const nfe of nfeList) {
    try {
      await delay(2000)
      const contact = await bling.getContactDetails({
        contactId: nfe.contato.id,
      })

      console.log(
        `✅ Cliente: nome: ${contact.nome}, Documento: ${contact.numeroDocumento}`,
      )

      // console.log(`
      //   🌐 Armazenando o cliente ${contact.nome} para a fila.
      //   `)

      // await queue.sendMessage(JSON.stringify(contact))

      console.log(`
          ‼️ Verificando se o contato ${contact.nome} já existe no ploomes
        `)

      const existingContact = await ploomes.getContact(contact.numeroDocumento)

      if (!existingContact) {
        console.log(`
           --------------------------------------------
            ❌ Contato não existe - criar novo contato
           --------------------------------------------
          `)

        const { Id: ploomesContactId } = await ploomes.createContact({
          Name: contact.nome + ' TESTE',
          Neighborhood: contact.endereco.geral.bairro,
          LegalName: contact.fantasia,
          Email: contact.email,
          ZipCode: contact.endereco.geral.cep,
          Register: contact.numeroDocumento,
          StreetAddressNumber: contact.endereco.geral.numero,
          StreetAddress: contact.endereco.geral.endereco,
          TypeId: 1,
          Phones: [
            {
              PhoneNumber: contact.telefone,
            },
          ],
          OtherProperties: [
            {
              FieldKey: 'contact_FA7A15F7-5ED9-4730-AB2E-8F090180F4B7',
              ObjectValueId: 795033,
            },
            {
              FieldKey: 'contact_467DDF14-FCC3-4AC3-8B3C-919519E1A38A',
              ObjectValueId: 795030,
            },
            {
              FieldKey: 'contact_796DB62A-10C9-4347-B20D-29E358229CC8',
              IntegerValue: Number(contact.ie),
            },
          ],
        })

        console.log(`
          ✅ contato ${contact.nome} ${ploomesContactId} criado
        `)

        console.log(`
          ⏳ Criando tarefa para o contato: ${contact.nome}
          `)

        await ploomes.createTask({
          Title: 'Tarefa TESTE',
          Description: `Testando a criação de tarefa - contato ${contact.nome} criado.`,
          ContactId: ploomesContactId,
        })
      }

      console.log(`
        ⏳ Criando tarefa para o contato: ${contact.nome}
        `)

      await ploomes.createTask({
        Title: 'Tarefa TESTE',
        Description: `Testando a criação de tarefa - contato ${contact.nome} existente`,
        ContactId: existingContact?.Id,
      })
    } catch (error) {
      console.log('Erro ao realizar busca do contato', error)
    }
  }

  console.log('✅ Processo finalizado --> Bling')
})

// Integrando com o ploomes
// cron.schedule('*/1 * * * *', async () => {
//   const queue = queueFactory()
//   const ploomes = ploomesFactory()

//   const messages = await queue.receiveMessage()

//   const contacts: ContactDetails[] | undefined = messages?.map((message) =>
//     JSON.parse(message.Body!),
//   )

//   console.log(`
//       🌐 contatos armazenados na fila: ${contacts?.map((contact) => contact.nome)}
//     `)

//   // if (contacts) {
//   //   for (const contact of contacts) {
//   //     console.log(`
//   //         ‼️ Verificando se o contato ${contact.nome} já existe no ploomes
//   //       `)

//   //     const existingContact = await ploomes.getContact(contact.numeroDocumento)

//   //     if (!existingContact) {
//   //       console.log(`
//   //          --------------------------------------------
//   //           ❌ Contato não existe - criar novo contato
//   //          --------------------------------------------
//   //         `)

//   //       await ploomes.createContact({
//   //         Name: contact.nome,
//   //         Neighborhood: contact.endereco.geral.bairro,
//   //         LegalName: contact.fantasia,
//   //         Email: contact.email,
//   //         ZipCode: contact.endereco.geral.cep,
//   //         Register: contact.numeroDocumento,
//   //         StreetAddressNumber: contact.endereco.geral.endereco,
//   //         TypeId: 1,
//   //         Phones: [
//   //           {
//   //             PhoneNumber: contact.telefone,
//   //           },
//   //         ],
//   //         OtherProperties: [
//   //           {
//   //             FieldKey: 'contact_FA7A15F7-5ED9-4730-AB2E-8F090180F4B7',
//   //             StringValue: 'SIM',
//   //           },
//   //           {
//   //             FieldKey: 'contact_467DDF14-FCC3-4AC3-8B3C-919519E1A38A',
//   //             StringValue: 'SIM',
//   //           },
//   //           {
//   //             FieldKey: 'contact_796DB62A-10C9-4347-B20D-29E358229CC8',
//   //             StringValue: contact.ie,
//   //           },
//   //         ],
//   //       })
//   //       console.log(`
//   //         ✅ contato ${contact.nome} criado
//   //       `)
//   //     }

//   //     console.log(`
//   //         --------------------------------------------
//   //         ⏳ Em andamento... - Criar tarefa
//   //         --------------------------------------------
//   //       `)
//   //   }
//   // }
// })

// app.get('/', async (req, res) => {
//   // const client = new DynamoDBClient({
//   //   region: 'us-east-2',
//   //   credentials: {
//   //     accessKeyId: env.AWS_ACCESS_KEY_ID,
//   //     secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
//   //   },
//   // })
//   const auth = authFactory()
//   const db = new DynamoRepository()

//   const response = await db.updateTokens({
//     access_token: 'T05aa3347458d879d0544b490d99c8c67146f503',
//     refresh_token: 'R00495e7e0795c0cfb1c09e500a0be6f87af7f90',
//   })

//   // const params: PutItemCommandInput = {
//   //   TableName: 'BlingToken',
//   //   Item: {
//   //     id: {
//   //       S: 'Bling',
//   //     },
//   //     tokens: {
//   //       M: {
//   //         access_token: {
//   //           S: env.BLING_ACCESS_TOKEN,
//   //         },
//   //         refresh_token: {
//   //           S: env.BLING_REFRESH_TOKEN,
//   //         },
//   //       },
//   //     },
//   //   },
//   // }

//   // const command = new PutItemCommand(params)
//   // const response = await client.send(command)

//   // const params: GetItemInput = {
//   //   TableName: 'BlingToken',
//   //   Key: {
//   //     id: {
//   //       S: 'Bling',
//   //     },
//   //   },
//   // }

//   // const command = new GetItemCommand(params)
//   // const response = await client.send(command)

//   // const result = await auth.getNewToken(
//   //   response.Item?.tokens.M?.refresh_token.S ?? '',
//   // )
//   // const auth = authFactory()

//   // const response = await auth.getNewToken(env.BLING_REFRESH_TOKEN)

//   return res.send({
//     result: response,
//   })
// })

app.listen(4000, () => {
  console.log('Server is listening on http://localhost:4000')
})
