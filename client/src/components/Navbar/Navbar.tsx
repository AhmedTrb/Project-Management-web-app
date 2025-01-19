"use client"
import { assets } from '@/app/assets/assets'
import { Bell, CalendarDays, ChevronDown, Search } from 'lucide-react'
import React, { useState } from 'react'


type Props = {}

function Navbar({}: Props) {
    const [dropDownIsOpen, setDropDownIsOpen] = useState(false);
  return (
    <div className='flex items-center justify-between h-16 px-10 md:px-8 w-full border-b border-[#d5d5d5]'>
        {/* SEARCH BAR */}
        <div className='bg-gray-100 rounded-md px-2 py-1 flex items-center gap-x-2 w-1/3'>
            <Search size={20} className='text-gray-500'/>
            <input type="text" placeholder='Search' className='bg-transparent outline-none border-none w-full'/>
        </div>

        {/* USER PROFILE */}
        <div className='flex items-center justify-between gap-12'>
            {/* Icons */}
            <div className='flex items-center justify-between gap-4'>
                <CalendarDays size={25} className='text-gray-500 cursor-pointer'/>
                <div>
                    <div className='relative cursor-pointer'>
                        <div className='absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full'></div>
                        <Bell size={25} className='text-gray-500'/>
                    </div>
                </div>
            </div>
            {/* Profile */}
            <div className='flex items-center justify-between gap-x-12'>
                <div className='flex flex-col gap-1'>
                    <p className='text-sm font-medium'>John Doe</p>
                    <p className='text-xs text-gray-500'>TN ,Tunis</p>
                </div>
                <div className='flex items-center justify-start gap-3'>
                    {/* <img src={assets.profilePicture} alt='profile' width={40} height={40} className='rounded-full'/> */}
                    <div className='relative ' onMouseEnter={() => setDropDownIsOpen(true)} onMouseLeave={() => setDropDownIsOpen(false)}>
                        <ChevronDown size={25} className='text-gray-500 cursor-pointer hover:transform-rotate-180 hover:text-black duration-300'/>
                        {dropDownIsOpen && (
                            <div className='absolute top-5 right-0 w-40 bg-white shadow rounded-md p-2 border border-gray-200 flex flex-col gap-y-2 z-50'>
                                <div className='cursor-pointer border-b border-red-600'>
                                    <p className='text-sm  text-red-500  mb-1 hover:text-red-600 hover:bg-red-300 hover:bg-opacity-40 rounded-md px-2 py-1'>Logout</p>
                                </div>
                                <div className='cursor-pointer border-b border-gray-500'>
                                    <p className='text-sm  text-gray-500  mb-1 hover:text-gray-950 hover:bg-gray-100 rounded-md px-2 py-1'>Profile</p>
                                </div>
                            </div>
                        )}
                    </div>
                    
                </div>
            </div>
        </div>
    </div>
  )
}

export default Navbar