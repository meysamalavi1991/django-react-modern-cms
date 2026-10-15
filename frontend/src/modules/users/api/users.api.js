import api from '../../../core/api/axios'

export const usersApi = {
  async getMe() {
    const { data } = await api.get('/users/me/')
    return data.data
  },
}
