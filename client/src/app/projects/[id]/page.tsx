'use client'
import { List, Plus } from 'lucide-react';
import React, { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Board from '../BoardView/Board';
import NewTaskModal from '@/components/TaskModal';
import { useParams } from 'next/navigation';
import Graph from '../GraphView/Graph';
import ListView from '../ListView/List';


type Props = {
  
};

const ProjectPage = ({}: Props) => {
  const { id } = useParams<{ id: string }>();
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isActiveTab, setIsActiveTab] = useState("BOARD");
  

  return (
    <div className='flex flex-col justify-start w-full gap-y-6 p-10'>

      {/* New Task Modal */}
      <NewTaskModal projectId={id} isOpen={isNewTaskModalOpen} onClose={()=>setIsNewTaskModalOpen(false)}/>
      {/* Header */}
      <div className='flex justify-between items-start sm:flex-col   md:flex-row border-b border-gray-200 pb-4'>
        <div className='flex flex-col gap-y-4 w-1/2 '>
          <h1 className='text-3xl font-semibold text-secondary-950'>Project Name</h1>
        </div>
        <div className='flex justify-end items-center gap-x-4 w-1/2 sm:w-full   '>
          {/* Invite button */}
          <div className="flex items-center gap-x-2">
            <button className='bg-primary-600 bg-opacity-40 text-white p-1 rounded-md'>
              <Plus size={14} className='text-primary-600'/>
            </button>
            <p className='text-sm text-primary-600'>Invite</p>
          </div>
          {/* project team members avatars*/}
          <AvatarGroup total={4} spacing="medium">
            <Avatar alt="Remy Sharp"  sx={{ width: 30, height: 30 }} />
            <Avatar alt="Travis Howard"  sx={{ width: 30, height: 30 }} />
            <Avatar alt="Agnes Walker" sx={{ width: 30, height: 30 }} />
            <Avatar alt="Trevor Henderson"  sx={{ width: 30, height: 30 }} />
          </AvatarGroup>
        </div>
      </div>
      {/* Project Details */}
      <div className='flex flex-col gap-y-4'>
        <h3 className='text-lg font-semibold text-secondary-950'>Project Details :</h3>
        <p className='text-sm text-gray-600 leading-tight tracking-tight w-1/2 '>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse repellendus porro praesentium accusamus nobis ducimus aperiam dolore eius distinctio explicabo amet, voluptatum necessitatibus soluta tempore voluptatibus fugiat ipsa! Quisquam, maiores.</p>
      </div>
      {/* Project Tasks */}
      <div className='flex flex-col gap-y-4'>
        <h1 className='text-lg font-semibold text-secondary-950'>Tasks :</h1>
        {/* View Tabs */}
        <div className='flex justify-start items-center gap-x-4'>
          <button className={`text-md text-secondary-950 px-2 ${isActiveTab === "BOARD" ? "font-semibold border-b-2 border-secondary-950" : ""}` } onClick={() => setIsActiveTab("BOARD")}>Board</button>
          <button className={`text-md text-secondary-950 px-2 ${isActiveTab === "LIST" ? "font-semibold border-b-2 border-secondary-950" : ""}` } onClick={() => setIsActiveTab("LIST")}>List</button>
          <button className={`text-md text-secondary-950 px-2${isActiveTab === "GRAPH" ? "font-semibold border-b-2 border-secondary-950" : ""}` } onClick={() => setIsActiveTab("GRAPH")}>Graph</button>
        </div>
        {/* View Content */}
        {isActiveTab === "BOARD" && (
          <Board id={id} setIsNewTaskModalOpen={setIsNewTaskModalOpen} />
        )}
        {isActiveTab === "GRAPH" && (
          <Graph id={id} />
        )}
        {isActiveTab === "LIST" && (
          <ListView id={id} />
        )}  
      </div>
    </div>
  )
}

export default ProjectPage

