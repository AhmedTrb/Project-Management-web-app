import React from 'react'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { useGetProjectTasksQuery } from '@/state/api';
import Loader from '@/components/Loader/Loader';
import { TaskAssignment } from '@/app/types/types';



type Props = {
    id: string;
}

export default function ListView({id}: Props) {
  const {data: tasks, isLoading} = useGetProjectTasksQuery({projectId: id});
  if(isLoading) return <Loader /> ;

  const priorityColorMap = {
    low: "bg-green-400 bg-opacity-20 text-green-400",
    medium: "bg-orange-400 bg-opacity-20 text-orange-400", 
    high: "bg-red-500 bg-opacity-20 text-red-500"
  };

  const statusColorMap = {
    "to do": "bg-primary-400 bg-opacity-20 text-primary-400",
    "in progress": "bg-blue-400 bg-opacity-20 text-blue-400", 
    "blocked": "bg-red-500 bg-opacity-20 text-red-500",
    "under review": "bg-yellow-400 bg-opacity-20 text-yellow-400",
    "completed": "bg-green-400 bg-opacity-20 text-green-400"
  };

  const columns: GridColDef[] = [
    { field: 'title', headerName: 'Title', width: 200 },
    { field: 'status', headerName: 'Status', width: 130,renderCell:(prev)=> {
      return <span className={`h-5 px-1 py-0.5 rounded text-sm font-normal text-center ${statusColorMap[prev.value.toLowerCase() as keyof typeof statusColorMap]}`}>{prev.value.toLowerCase()}</span>
    }},
    { field: 'priority', headerName: 'Priority', width: 100, renderCell: (params) => (
      <span className={`h-5 px-1 py-0.5 rounded text-sm font-normal text-center ${priorityColorMap[params.value.toLowerCase() as keyof typeof priorityColorMap]}`}>{params.value.toLowerCase()}</span>
    )},
    { field: 'startDate', headerName: 'start Date', width: 120,renderCell:(prev)=><span className='text-sm font-normal'>{new Date(prev.value).toLocaleDateString()}</span> },
    { field: 'dueDate', headerName: 'Due Date', width: 120,renderCell:(prev)=><span className='text-sm font-normal'>{new Date(prev.value).toLocaleDateString()}</span> },
  ];
  const dataGridClassNames ="border border-gray-200 bg-white shadow dark:border-stroke-dark dark:bg-dark-secondary dark:text-gray-200";
  return ( 
    <div className="h-[540px] overflow-y-auto w-full">
      <DataGrid
        rows={tasks || []}
        columns={columns}
        className={dataGridClassNames}
        sx={{width:"fit-content", height:"fit-content", minWidth: 600, maxWidth: '100%'}}
      />
    </div>
  )
}