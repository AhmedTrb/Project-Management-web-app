"use client"
import { Project } from '@/app/types/types';
import { useGetProjectByIdQuery, } from '@/state/api';
import { Avatar, AvatarGroup } from '@mui/material';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import React from 'react'

type Props = {
    project: Project
}

export default function Card({project}: Props) {

    const endDate = project?.endDate ? new Date(project?.endDate) : new Date();

    const priorityColorMap = {
        low: "bg-green-400 bg-opacity-20 text-green-400",
        medium: "bg-orange-400 bg-opacity-20 text-orange-400", 
        high: "bg-red-500 bg-opacity-20 text-red-500"
      };
  return (
    <div className='bg-white rounded-lg px-3 py-6 shadow-lg felx flex-col justify-start items-center gap-y-8 w-1/4'>
      {/* <img src='/projectCover.png' alt='project' className='w-full h-40 rounded-lg object-cover' /> */}
      <h2 className='text-lg font-bold text-secondary-950'>{project?.name}</h2>
      <div className='mt-5'>
        <p className='text-sm text-gray-500 line-clamp-2 truncate'>{project?.description}</p>

      </div>
      <div className='flex justify-center gap-7 items-center w-full'>
        <div>
          <AvatarGroup max={10} sx={{width: 20, height: 20}} >
            <Avatar src={""} sx={{width: 20, height: 20}} />
            <Avatar src={""} sx={{width: 20, height: 20}} />
            <Avatar src={""} sx={{width: 20, height: 20}} />
          </AvatarGroup>
        </div>

        <div className='flex justify-start items-center gap-x-2'>
          <Clock className='w-4 h-4 text-gray-500' />
          <p className='text-sm text-gray-500'>{format(new Date(endDate), 'MM/dd/yyyy')}</p>
        </div>
      </div>
    </div>
  )
}