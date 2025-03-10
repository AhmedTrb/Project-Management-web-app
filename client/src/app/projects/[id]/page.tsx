'use client'
import { Plus } from 'lucide-react';
import React, { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Board from '../BoardView/Board';
import NewTaskModal from '@/components/TaskModal';
import { useParams } from 'next/navigation';
import Graph from '../GraphView/Graph';
import ListView from '../ListView/List';
import { useGetProjectByIdQuery, useGetProjectTasksQuery, useGetProjectTeamMembersQuery } from '@/state/api';
import InviteMemberModal from '@/components/InviteMemberModal';
import { CircularProgress } from '@mui/material';


const ProjectPage = () => {
  const { id } = useParams<{ id: string }>();

  
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isInviteMemberModalOpen, setIsInviteMemberModalOpen] = useState(false);
  const [isActiveTab, setIsActiveTab] = useState("BOARD");
  const { data: project} = useGetProjectByIdQuery({projectId: id});
  const {data:projectTeamMembers} = useGetProjectTeamMembersQuery({projectId: id});
  const {data:tasks, isLoading, isError} = useGetProjectTasksQuery({projectId: id});
  return (
    <div className='flex flex-col justify-start w-full gap-y-6 p-10'>

      {/* New Task Modal and Task details Modal */}
      <InviteMemberModal  isOpen={isInviteMemberModalOpen} onClose={()=>setIsInviteMemberModalOpen(false)}/>
      <NewTaskModal projectId={id} isOpen={isNewTaskModalOpen} onClose={()=>setIsNewTaskModalOpen(false)}/>
      

      {/* Header */}
      <div className='flex flex-col lg:flex-row lg:justify-between lg:items-center md:flex-col md:items-start sm:items-start sm:flex-col items-start w-full gap-y-6 border-b border-gray-200 pb-4'>
        
        <div><h1 className='text-3xl font-semibold text-secondary-950'>{project?.name}</h1></div>
        
        <div className='flex justify-end items-center gap-x-4'>
          {/* Invite button */}
          <div className="flex items-center gap-x-2">
            <button className='bg-primary-600 bg-opacity-40 text-white p-1 rounded-md' onClick={() => setIsInviteMemberModalOpen(true)}>
              <Plus size={14} className='text-primary-600'/>
            </button>
            <p className='text-sm text-primary-600'>Invite</p>
          </div>
          {/* project team members avatars*/}
          <AvatarGroup total={projectTeamMembers?.length} spacing="medium">
            {projectTeamMembers?.map((teamMember) => (
              <Avatar key={teamMember.userId} src={teamMember.user.profilePictureUrl} />
            ))}
          </AvatarGroup>
        </div>
      </div>
      {/* Project Details */}
      <div className='flex flex-col gap-y-4'>
        <h3 className='text-lg font-semibold text-secondary-950'>Project Details :</h3>
        <p className='text-sm text-gray-600 leading-tight tracking-tight w-1/2 '>{project?.description}</p>
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
        {isError && <p className='text-red-500'>An error occurred</p>}
        {isLoading ? <div className='flex justify-center items-center h-64 w-full'><CircularProgress /> </div> :
        isActiveTab === "BOARD" && (
          <Board id={id} setIsNewTaskModalOpen={setIsNewTaskModalOpen} tasks={tasks}/>
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

