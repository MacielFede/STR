import api from '@/api/config'

export const login = (email: string, password: string) => {
  api.post('authentications/login/', {
    email,
    password,
  })
}
