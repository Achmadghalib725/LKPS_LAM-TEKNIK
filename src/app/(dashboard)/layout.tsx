import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import Providers from '@/components/Providers'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard – LKPS LAM Teknik',
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <Providers>
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          {children}
        </div>
      </div>
    </Providers>
  )
}
