'use client'
  
import Navbar from '@/components/Navbar/Navbar'
import Sidebar from '@/components/Sidebar/Sidebar'
import React from 'react'
import StoreProvider, { useAppSelector, useAppDispatch } from './redux'
import Modal from '@/components/Modal'
import { toggleModal } from '@/state'
import ProjectModal from '@/components/ProjectModal'

type Props = {}

function DashboardLayout({children}: {children: React.ReactNode}) {
  
  return (
    <div>
      <ProjectModal />
      <div className='flex w-full min-h-screen text-gray-700 bg-white'>
        <Sidebar />
        <div className='flex flex-col w-full ml-60'>
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