'use client'
  
import Navbar from '@/components/Navbar/Navbar'
import Sidebar from '@/components/Sidebar/Sidebar'
import React, { useEffect } from 'react'
import StoreProvider, { useAppSelector, useAppDispatch } from './redux'
import ProjectModal from '@/components/ProjectModal'
import Authentication from './authentication/page'
import { setCredentials } from '@/state/authSlice'
import { useGetAuthenticatedUserQuery } from '@/state/api'
import { useRouter } from 'next/navigation'

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

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  
  // Get token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  
  // Skip query if no token exists
  const { data: result, isLoading } = useGetAuthenticatedUserQuery(undefined, {
    skip: !token,
  });

  useEffect(() => {
    const handleAuth = async () => {
      if (token && result?.user) {
        dispatch(setCredentials({ user: result.user, token }));
        router.refresh(); 
      } else if (!token && user) {
        
        router.refresh(); 
      }
    };

    handleAuth();
  }, [token, result, dispatch, router, user]);

  // Show loading state while checking authentication
  if (isLoading) {
    return <div>Loading...</div>; 
  }

  
  if (!token) return <Authentication />;
  

  // If authenticated, show children
  return <>{children}</>;
};
const DashboardWrapper = ({children}: {children: React.ReactNode}) => {
  
    return (
      <StoreProvider>
        <AuthProvider>
        <DashboardLayout>
            {children}
        </DashboardLayout>
        </AuthProvider>
      </StoreProvider>
    )
}

export default DashboardWrapper


