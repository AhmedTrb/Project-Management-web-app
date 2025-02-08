import { Priority } from '@/app/types/types'
import React from 'react'

type Props = {
    priority:Priority
}

export const PriorityComponent = ({priority}: Props) => {
    const priorityColorMap = { 
        low: "bg-green-400 bg-opacity-20 text-green-400",
        medium: "bg-orange-400 bg-opacity-20 text-orange-400", 
        high: "bg-red-500 bg-opacity-20 text-red-500"
      };

  return (
    <div className={`${priorityColorMap[priority]} px-2 py-0 flex items-center justify-center text-sm rounded-sm`}>{priority}</div>
  )
}