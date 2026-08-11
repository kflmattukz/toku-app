import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { authClient } from '#/lib/auth-client'
import { useEffect } from 'react'

export const Route = createFileRoute('/_app/dashboard')({ component: Dashboard })

function Dashboard() {
  const { data: session } = authClient.useSession()
  const navigate = useNavigate()

  const store = useQuery(
    api.stores.getByUserId,
    session ? { userId: session.user.id, userEmail: session.user.email } : 'skip',
  )

  useEffect(() => {
    if (store === undefined) return // still loading
    if (store === null) {
      navigate({ to: '/onboarding' })
    } else {
      navigate({ to: '/kasir' })
    }
  }, [store, navigate])

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <p style={{ color: 'var(--color-text-2)', fontSize: 14 }}>Memuat...</p>
    </div>
  )
}
