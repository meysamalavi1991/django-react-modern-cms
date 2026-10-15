import api from '../../../core/api/axios'

export const authApi = {
  async login(credentials) {
    const { data } = await api.post('/auth/login/', credentials)
    return data
  },

  async logout(refreshToken) {
    const { data } = await api.post('/auth/logout/', {
      refresh: refreshToken,
    })

    return data
  },
}
