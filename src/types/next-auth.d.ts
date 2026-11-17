import { DefaultSession } from 'next-auth'
import { DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: 'ADMIN_UPPS' | 'OPERATOR_PRODI' | 'ASESOR' | 'GUEST' | 'SUPER_ADMIN'
    } & DefaultSession['user']
  }

  interface User {
    id?: string
    role?: 'ADMIN_UPPS' | 'OPERATOR_PRODI' | 'ASESOR' | 'GUEST' | 'SUPER_ADMIN'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    role?: 'ADMIN_UPPS' | 'OPERATOR_PRODI' | 'ASESOR' | 'GUEST' | 'SUPER_ADMIN'
  }
}
