'use client'
  
import Navbar from '@/components/Navbar/Navbar'
import Sidebar from '@/components/Sidebar/Sidebar'
import React, { use, useEffect } from 'react'
import StoreProvider, { useAppSelector, useAppDispatch } from './redux'
import ProjectModal from '@/components/ProjectModal'
import Authentication from './authentication/page'
import { logOut, selectCurrentToken, setCredentials } from '@/state/authSlice'
import { useGetAuthenticatedUserQuery } from '@/state/api'
import { useRouter } from 'next/navigation'

type Props = {}

function DashboardLayout({children}: {children: React.ReactNode}) {
  const token = useAppSelector(selectCurrentToken);

  const router = useRouter()
  const isSidebarOpen = useAppSelector((state) => state.global.isSidebarOpen);

  useEffect(() => {
    if (!token) {
      router.replace('/authentication')
    }
  }, [token, router])

  if (!token) return <Authentication />

  return (
    <div>
      <ProjectModal />
      <div className='flex w-full min-h-screen text-gray-700 bg-white'>
        <Sidebar />
        <div className={`flex flex-col w-full ${isSidebarOpen ? 'ml-60' : 'ml-16'} transition-all duration-300 ease-in-out`}>
            <Navbar />
            {children}
        </div>
    </div>
    </div>
  )
}


const DashboardWrapper = ({children}: {children: React.ReactNode}) => {
  
    return (
      <StoreProvider>
        <DashboardLayout>
            {children}
        </DashboardLayout>
      </StoreProvider>
    )
}

export default DashboardWrapper


