'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from '@/lib/auth-client'
import { Bell, ChevronRight, Eye, ExternalLink, Check, CheckCheck, Clock } from 'lucide-react'
import Link from 'next/link'

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN_UPPS: 'Admin UPPS',
  PENANGGUNG_JAWAB: 'Admin UPPS',
  OPERATOR_PRODI: 'Operator Prodi',
  ASESOR: 'Asesor Internal',
  GUEST: 'Guest (SSO)',
}

const roleBadgeClass: Record<string, string> = {
  SUPER_ADMIN: 'role-badge-super_admin',
  ADMIN_UPPS: 'role-badge-admin_upps',
  PENANGGUNG_JAWAB: 'role-badge-admin_upps',
  OPERATOR_PRODI: 'role-badge-operator_prodi',
  ASESOR: 'role-badge-asesor',
  GUEST: 'badge badge-gray',
}

interface NotificationItem {
  id: string
  pesan: string
  tautan?: string | null
  dibaca: boolean
  createdAt: string
  kategori?: string
}

interface HeaderProps {
  title: string
  subtitle?: string
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { data: session } = useSession()
  const user = session?.user
  const role = user?.role ?? 'OPERATOR_PRODI'
  const name = user?.name ?? 'Pengguna'
  const initials = name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()

  const [notifs, setNotifs] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotif, setShowNotif] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  const fetchNotifs = async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setNotifs(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (err) {
      console.error('Failed to load notifications:', err)
    }
  }

  useEffect(() => {
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotif(false)
      }
    }
    if (showNotif) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNotif])

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true }),
      })
      setNotifs((prev) => prev.map((n) => ({ ...n, dibaca: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error(err)
    }
  }

  const handleMarkSingleRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setNotifs((prev) =>
        prev.map((n) => (n.id === id ? { ...n, dibaca: true } : n))
      )
      setUnreadCount((c) => Math.max(0, c - 1))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
      <header className="header">
        <div className="header-left">
          <div>
            <div className="page-title">{title}</div>
            {subtitle && (
              <div className="breadcrumb">
                <span>LKPS</span>
                <span className="breadcrumb-sep">
                  <ChevronRight size={12} strokeWidth={2} />
                </span>
                <span>{subtitle}</span>
              </div>
            )}
          </div>
        </div>

        <div className="header-right">
          {/* Switcher to LED */}
          <a
            href="http://localhost:3002"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '5px 10px' }}
            title="Buka Penyusun LED LAM Teknik"
          >
            <span>Buka LED</span>
            <ExternalLink size={13} strokeWidth={1.8} />
          </a>

          {/* Role badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className={roleBadgeClass[role] ?? 'role-badge-operator_prodi'}>
              {roleLabels[role] ?? role}
            </span>
            {role === 'OPERATOR_PRODI' && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: 'rgba(79, 142, 247, 0.12)',
                  color: 'var(--accent-blue, #4f8ef7)',
                  border: '1px solid rgba(79, 142, 247, 0.25)',
                }}
              >
                {user?.name?.replace('Operator Prodi ', '') || 'Prodi'}
              </span>
            )}
          </div>

          {/* Notification bell & Dropdown */}
          <div style={{ position: 'relative' }} ref={notifRef}>
            <button
              id="btn-notif"
              className="header-icon-btn"
              aria-label="Notifications"
              onClick={() => setShowNotif((v) => !v)}
              style={{ position: 'relative' }}
            >
              <Bell size={17} strokeWidth={1.75} />
              {unreadCount > 0 && <span className="notification-dot" />}
            </button>

            {showNotif && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '10px',
                  width: '360px',
                  maxWidth: '90vw',
                  background: 'var(--bg-card, #1e2430)',
                  border: '1px solid var(--border-color, #2d3748)',
                  borderRadius: '12px',
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)',
                  zIndex: 9999,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border-color, #2d3748)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'var(--bg-secondary, #181d28)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Pemberitahuan
                    </span>
                    {unreadCount > 0 && (
                      <span
                        style={{
                          fontSize: '11px',
                          background: 'rgba(239, 68, 68, 0.2)',
                          color: '#f87171',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontWeight: 700,
                        }}
                      >
                        {unreadCount} baru
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-blue, #4f8ef7)',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <CheckCheck size={14} />
                      Tandai dibaca
                    </button>
                  )}
                </div>

                <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                  {notifs.length === 0 ? (
                    <div style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <Bell size={28} strokeWidth={1.5} style={{ opacity: 0.4, margin: '0 auto 8px' }} />
                      <p style={{ fontSize: '13px', margin: 0 }}>Tidak ada pemberitahuan baru.</p>
                    </div>
                  ) : (
                    notifs.map((n) => (
                      <div
                        key={n.id}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid var(--border-color, #2d3748)',
                          background: n.dibaca ? 'transparent' : 'rgba(79, 142, 247, 0.05)',
                          display: 'flex',
                          gap: '12px',
                          alignItems: 'flex-start',
                          transition: 'background 0.2s',
                        }}
                      >
                        <div
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: n.dibaca ? 'transparent' : 'var(--accent-blue, #4f8ef7)',
                            marginTop: '6px',
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          {n.kategori && (
                            <span
                              style={{
                                fontSize: '10px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                color: 'var(--text-muted)',
                                fontWeight: 600,
                              }}
                            >
                              {n.kategori}
                            </span>
                          )}
                          <p
                            style={{
                              fontSize: '12px',
                              lineHeight: '1.4',
                              color: 'var(--text-primary)',
                              margin: '2px 0 6px 0',
                            }}
                          >
                            {n.pesan}
                          </p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span
                              style={{
                                fontSize: '11px',
                                color: 'var(--text-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Clock size={11} />
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              {n.tautan && (
                                <Link
                                  href={n.tautan}
                                  onClick={() => setShowNotif(false)}
                                  style={{
                                    fontSize: '11px',
                                    color: 'var(--accent-blue, #4f8ef7)',
                                    textDecoration: 'none',
                                    fontWeight: 500,
                                  }}
                                >
                                  Lihat Modul
                                </Link>
                              )}
                              {!n.dibaca && (
                                <button
                                  onClick={() => handleMarkSingleRead(n.id)}
                                  title="Tandai dibaca"
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    padding: '2px',
                                  }}
                                >
                                  <Check size={12} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="avatar">{initials}</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {name}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {user?.email}
              </span>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}

