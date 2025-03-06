'use client'
  
import Navbar from '@/components/Navbar/Navbar'
import Sidebar from '@/components/Sidebar/Sidebar'
import React, { useEffect } from 'react'
import StoreProvider, { useAppSelector } from './redux'
import ProjectModal from '@/components/ProjectModal'
import Authentication from './authentication/page'
import {  selectCurrentToken } from '@/state/authSlice'
import { useRouter } from 'next/navigation'
import { TaskDetailsModal } from '@/components/TaskDetailsModal'


function DashboardLayout({children}: {children: React.ReactNode}) {
  const token = useAppSelector(selectCurrentToken);

  const router = useRouter()
  const isSidebarOpen = useAppSelector((state) => state.global.isSidebarOpen);

  useEffect(() => {
    if (!token) {
      router.replace('/authentication')
      router.refresh()
    }
  }, [token, router])

  if (!token) return <Authentication />

  return (
    <div>
      <TaskDetailsModal />
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


