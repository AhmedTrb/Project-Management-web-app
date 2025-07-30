'use client'
  
import Navbar from '@/components/Navbar/Navbar';
import Sidebar from '@/components/Sidebar/Sidebar';
import React, { useEffect } from 'react';
import ProjectModal from '@/components/ProjectModal';
import {  selectCurrentToken } from '@/state/authSlice';
import { useRouter } from 'next/navigation';
import { TaskDetailsModal } from '@/components/TaskDetailsModal';
import LandingPage from './LandingPage';
import { useAppSelector } from './redux';


export default function DashboardLayout({children}: {children: React.ReactNode}) {
  const token = useAppSelector(selectCurrentToken);

  const router = useRouter()
  const isSidebarOpen = useAppSelector((state) => state.global.isSidebarOpen);

  useEffect(() => {
    if (!token) {
      router.replace('/')
      router.refresh()
    }
  }, [token, router])

  if (!token) return <LandingPage />

  return (
    <div>
      <TaskDetailsModal />
      <ProjectModal />
      <div className="flex w-full min-h-screen text-gray-700 bg-white">
        <Sidebar />
        <div className={`flex flex-col w-full transition-all duration-300 ease-in-out`}>
            <Navbar />
            {children}
        </div>
    </div>
    </div>
  )
}