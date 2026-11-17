/**
 * Client Service untuk One Data UNILA (myUnila API Web Service)
 * Menggunakan token JWT berbasis ID Aplikasi dan Akun PJ
 */

interface MyUnilaToken {
  accessToken: string
  expiresAt: number
}

let cachedToken: MyUnilaToken | null = null

export async function getMyUnilaToken(): Promise<string> {
  const now = Date.now()
  if (cachedToken && cachedToken.expiresAt > now + 60000) {
    return cachedToken.accessToken
  }

  const baseUrl = process.env.MYUNILA_API_URL || 'https://my.unila.ac.id/gateway/api-service'
  const appId = process.env.MYUNILA_APP_ID || '86EC2197-76D0-4BE8-91EC-2C161E1BF0AC'
  const username = process.env.MYUNILA_USERNAME || '2317051023'
  const password = process.env.MYUNILA_PASSWORD || '07022005'

  const res = await fetch(`${baseUrl}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id_aplikasi: appId,
      username,
      password,
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Otentikasi MyUnila gagal (${res.status}): ${errText}`)
  }

  const json = await res.json()
  const token = json.data?.access_token
  const expiresIn = json.data?.expires_in || 3600

  if (!token) {
    throw new Error('Token MyUnila tidak ditemukan di respons otentikasi')
  }

  cachedToken = {
    accessToken: token,
    expiresAt: now + expiresIn * 1000,
  }

  return token
}

export async function fetchMyUnila(endpoint: string, params: Record<string, any> = {}): Promise<any> {
  const token = await getMyUnilaToken()
  const baseUrl = process.env.MYUNILA_API_URL || 'https://my.unila.ac.id/gateway/api-service'

  const query = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') {
      query.append(k, String(v))
    }
  }

  const url = `${baseUrl}${endpoint}${query.toString() ? '?' + query.toString() : ''}`

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Gagal mengambil data dari endpoint ${endpoint} (Status ${res.status})`)
  }

  return res.json()
}
