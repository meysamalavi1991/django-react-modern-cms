const ACCESS_TOKEN_KEY = 'modern_cms_access_token'
const REFRESH_TOKEN_KEY = 'modern_cms_refresh_token'

function readToken(key) {
  try {
    return window.sessionStorage.getItem(key)
  } catch {
    return null
  }
}

export const authStorage = {
  getAccessToken() {
    return readToken(ACCESS_TOKEN_KEY)
  },

  getRefreshToken() {
    return readToken(REFRESH_TOKEN_KEY)
  },

  setTokens(tokens) {
    try {
      window.sessionStorage.setItem(ACCESS_TOKEN_KEY, tokens.access)
      window.sessionStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh)
    } catch {
      throw new Error('ذخیره نشست امکان‌پذیر نیست.')
    }
  },

  clearTokens() {
    try {
      window.sessionStorage.removeItem(ACCESS_TOKEN_KEY)
      window.sessionStorage.removeItem(REFRESH_TOKEN_KEY)
    } catch {
      // Storage may be unavailable in restricted browser contexts.
    }
  },
}
