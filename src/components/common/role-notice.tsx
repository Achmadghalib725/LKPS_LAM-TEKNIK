'use client'

import { useSession } from '@/lib/auth-client'
import { canEditModule, LkpsModule, UserRole } from '@/lib/permissions'
import { Lock, Eye, ShieldAlert, Info } from 'lucide-react'

export function useModulePermission(moduleName: LkpsModule) {
  const { data: session, status } = useSession()
  const role = session?.user?.role as UserRole | undefined
  const canEdit = canEditModule(role, moduleName)
  const isAsesor = role === 'ASESOR'
  const isOperator = role === 'OPERATOR_PRODI'
  const isUpps = role === 'ADMIN_UPPS'
  const isSuperAdmin = role === 'SUPER_ADMIN'

  return {
    role,
    canEdit,
    isAsesor,
    isOperator,
    isUpps,
    isSuperAdmin,
    loading: status === 'loading',
  }
}

interface RoleNoticeProps {
  module: LkpsModule
  customMessage?: string
}

export default function RoleNotice({ module: moduleName, customMessage }: RoleNoticeProps) {
  const { role, canEdit, isAsesor, isOperator, isUpps } = useModulePermission(moduleName)

  if (canEdit || !role) return null

  return (
    <div
      className="alert alert-info animate-fade-in"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
        padding: '12px 18px',
        borderRadius: 'var(--radius-md)',
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        color: '#1e40af',
        fontSize: '13px',
      }}
    >
      <Lock size={17} strokeWidth={2} style={{ flexShrink: 0, color: 'var(--accent-blue)' }} />
      <div style={{ flex: 1, lineHeight: 1.5 }}>
        <strong>Mode Tinjau (Read-Only): </strong>
        {customMessage ? (
          customMessage
        ) : isAsesor ? (
          'Anda masuk sebagai Asesor Internal. Seluruh formulir terkunci dan tombol ubah/simpan dinonaktifkan demi menjaga integritas data audit.'
        ) : isOperator ? (
          'Anda masuk sebagai Operator Prodi. Data modul ini merupakan kewenangan institusi/fakultas yang dikelola oleh Admin UPPS.'
        ) : isUpps ? (
          'Anda masuk sebagai Admin UPPS. Data operasional mikro ini diisi dan dikelola langsung oleh Operator Program Studi.'
        ) : (
          'Akun Anda tidak memiliki hak akses tulis pada modul ini.'
        )}
      </div>
      <span
        className="badge"
        style={{
          background: '#dbeafe',
          color: '#1d4ed8',
          border: '1px solid #bfdbfe',
          fontSize: '11px',
          fontWeight: 700,
          whiteSpace: 'nowrap',
        }}
      >
        Hanya Baca
      </span>
    </div>
  )
}
