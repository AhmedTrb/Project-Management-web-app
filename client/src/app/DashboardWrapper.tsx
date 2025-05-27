'use client'

import React, { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import StoreProvider, { useAppSelector } from './redux'
import { selectCurrentToken } from '@/state/authSlice'

import DashboardLayout from './DashboardLayout'
import LandingPage from './LandingPage'
import Authentication from './authentication/page'

export default function DashboardWrapper({ children }: { children: React.ReactNode }) {
  // Pathname & router must be fetched at the top level (before hooks inside StoreProvider)
  const path = usePathname()
  const router = useRouter()

  return (
    <StoreProvider>
      <InnerRouterGuard path={path} router={router}>
        {children}
      </InnerRouterGuard>
    </StoreProvider>
  )
}

type InnerRouterGuardProps = {
  path: string
  router: ReturnType<typeof useRouter>
  children: React.ReactNode
}

function InnerRouterGuard({ path, router, children }: InnerRouterGuardProps) {
  const token = useAppSelector(selectCurrentToken);
  const isDashboardRoute = path === "/";

  // Only redirect when hitting a protected route without a token
  useEffect(() => {
    if (isDashboardRoute && !token) {
      router.replace('/')   // send them back to landing
    }
  }, [isDashboardRoute, token, router])

  if (isDashboardRoute && !token) {
    return <LandingPage />
  }
  if (path === '/authentication') {
    return <Authentication />
  }

  
  return <DashboardLayout>{children}</DashboardLayout>
}
