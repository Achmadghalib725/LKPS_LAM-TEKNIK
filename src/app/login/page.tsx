'use client'

import { useState, Suspense } from 'react'
import { authClient } from '@/lib/auth-client'
import { useRouter, useSearchParams } from 'next/navigation'
import { GraduationCap, LogIn, AlertCircle, Loader2, KeyRound } from 'lucide-react'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawCallbackUrl = searchParams.get('callbackUrl')
  const callbackUrl = rawCallbackUrl && rawCallbackUrl.startsWith('/') ? rawCallbackUrl : '/dashboard'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await authClient.signIn.email({
        email: email.trim().toLowerCase(),
        password,
      })

      if (result.error) {
        setError(result.error.message || 'Email atau password salah. Silakan coba lagi.')
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="login-brand">
        <div className="login-brand-icon">
          <GraduationCap size={22} strokeWidth={2} />
        </div>
        <div>
          <h1 className="login-brand-title">Penyusun LKPS LAM Teknik</h1>
          <p className="login-brand-subtitle">
            Laporan Kinerja Program Studi untuk akreditasi program studi
          </p>
        </div>
      </div>

      <div className="login-card">
        <div className="login-card-header">
          <h2 className="login-card-title">Masuk</h2>
          <p className="login-card-subtitle">Gunakan email dan kata sandi akun Anda.</p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '16px', alignItems: 'center' }}>
            <AlertCircle size={16} strokeWidth={2} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="admin@lkps.ac.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label htmlFor="password" className="form-label">
              Kata sandi
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            id="btn-login"
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="spin" size={16} strokeWidth={2} />
                Memproses...
              </>
            ) : (
              <>
                <LogIn size={16} strokeWidth={1.75} />
                Masuk
              </>
            )}
          </button>
        </form>

        <div style={{ 
          marginTop: '20px', 
          padding: '12px 14px', 
          background: 'var(--bg-secondary)', 
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '8px' }}>
            <KeyRound size={13} style={{ color: 'var(--primary)' }} />
            <p style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>
              Demo Credentials
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { role: 'Admin UPPS', email: 'adminupps@lkps.ac.id' },
              { role: 'Op. S1 Arsitektur', email: 'operator.arsitektur@lkps.ac.id' },
              { role: 'Op. S1 Informatika', email: 'operator.informatika@lkps.ac.id' },
              { role: 'Reviewer Internal', email: 'asesor@lkps.ac.id' },
            ].map((u) => (
              <div key={u.email} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="text-xs text-muted">{u.role}</span>
                <button
                  type="button"
                  className="text-xs font-semibold"
                  style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={() => { setEmail(u.email); setPassword('password123') }}
                >
                  {u.email}
                </button>
              </div>
            ))}
            <p className="text-xs text-muted" style={{ textAlign: 'center', marginTop: '4px' }}>
              Kata sandi: <strong>password123</strong>
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted" style={{ marginTop: '20px', textAlign: 'center' }}>
        Akun dibuat oleh admin. Lupa kata sandi? Hubungi admin untuk mengatur ulang.
      </p>
    </>
  )
}

export default function LoginPage() {
  return (
    <div className="login-page">
      <Suspense fallback={
        <div className="login-card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <Loader2 className="spin text-accent-blue" size={32} />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  )
}
