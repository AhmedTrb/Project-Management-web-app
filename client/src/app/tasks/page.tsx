"use client";
import { useGetUserTasksQuery } from '@/state/api';
import React from 'react'
import Board from '../projects/BoardView/Board';
import { CircularProgress } from '@mui/material';

type Props = {}

export default function Tasks ({}: Props) {
    const {data:tasks, isLoading} = useGetUserTasksQuery();

    if(isLoading){
        return <div className='flex justify-center items-center h-screen w-full'><CircularProgress /> </div>
    }
  return (
    <div className='flex flex-col gap-y-4 px-6 py-4'>
        <h1 className='text-3xl font-bold text-secondary-950'>My Tasks :</h1>
        <Board id='1' tasks={tasks} setIsNewTaskModalOpen={()=>{}}/>
    </div>
  )
}