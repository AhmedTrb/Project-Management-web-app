"use client"
import { Project } from '@/app/types/types';
import { useGetProjectByIdQuery, } from '@/state/api';
import { Avatar, AvatarGroup } from '@mui/material';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import Link from 'next/link';
import React from 'react'

type Props = {
    project: Project
}

export default function ProjectCard({project}: Props) {

    const endDate = project?.endDate ? new Date(project?.endDate) : new Date();

    const priorityColorMap = {
        low: "bg-green-400 bg-opacity-20 text-green-400",
        medium: "bg-orange-400 bg-opacity-20 text-orange-400", 
        high: "bg-red-500 bg-opacity-20 text-red-500"
      };
  return (
    <Link href={`/projects/${project?.id}`} className='block'>
    <div className="bg-white rounded-lg p-4 shadow-sm flex flex-col justify-start items-start gap-y-4 w-72 h-80 mb-4 ml-2 cursor-pointer hover:shadow-xl transition-shadow duration-300 ease-in-out overflow-visible">
    <img
      src="/projectCover.png"
      alt="project"
      className="w-full h-32 rounded-lg object-cover"
    />
    <h2 className="text-lg font-bold text-secondary-950 text-start">
      {project?.name}
    </h2>

    <div className="h-12 overflow-hidden">
      <p className="text-sm text-gray-500 line-clamp-2">{project?.description}</p>
    </div>

    <div className="flex justify-between gap-7 items-center w-full mt-auto">
      <div className="ml-8">
        <AvatarGroup max={10} sx={{ width: 20, height: 20 }}>
          <Avatar src={""} sx={{ width: 20, height: 20 }} />
          <Avatar src={""} sx={{ width: 20, height: 20 }} />
          <Avatar src={""} sx={{ width: 20, height: 20 }} />
        </AvatarGroup>
      </div>

      <div className="flex justify-start items-center gap-x-2 mr-4">
        <Clock className="w-4 h-4 text-gray-500" />
        <p className="text-sm text-gray-500">
          {format(new Date(endDate), "MM/dd/yyyy")}
        </p>
      </div>
    </div>
  </div>
</Link>

  )
}