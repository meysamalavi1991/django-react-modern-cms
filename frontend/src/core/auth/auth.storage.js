let accessToken = null
let refreshToken = null

export const authStorage = {
  getAccessToken() {
    return accessToken
  },

  getRefreshToken() {
    return refreshToken
  },

  setTokens(tokens) {
    accessToken = tokens.access
    refreshToken = tokens.refresh
  },

  clearTokens() {
    accessToken = null
    refreshToken = null
  },
}
