import type { AxiosResponse } from 'axios'
import api from '@/api/config'

export type Response<T> = {
  message?: string
  errors?: Error,
} & T

export type LoginTransactionResponse = {
  token: string
}

export const login = async (email: string, password: string) => {
  const { data }: AxiosResponse<Response<LoginTransactionResponse>> =
    await api.post('auth/login', {
      username: email,
      password,
    })
    console.log(data)
  return data
}
