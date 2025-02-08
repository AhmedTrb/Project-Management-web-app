import React from 'react'

type Props = {
    status: string
}

export const Status =({status}: Props) =>{
    const statusColor =
    status === "To Do"
      ? "bg-green-400 bg-opacity-20 text-green-400"
      : status === "In Progress"
      ? "bg-blue-400 bg-opacity-20 text-blue-400"
      : status === "Under Review"
      ? "bg-yellow-400  bg-opacity-20 text-yellow-500"
      : "bg-red-400 bg-opacity-20 text-red-400";
  return (
    <div className={`px-2 rounded-md text-sm ${statusColor}`}>{status}</div>
  )
}