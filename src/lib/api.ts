import axios from 'axios'

export const blingApi = axios.create({
  baseURL: 'https://api.bling.com.br/Api/v3',
})

export const ploomesApi = axios.create({
  baseURL: 'https://api2.ploomes.com',
})
