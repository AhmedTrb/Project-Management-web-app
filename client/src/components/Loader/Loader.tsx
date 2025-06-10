import { CircularProgress } from '@mui/material'
import React from 'react'

type Props = {}

export default function Loader({}: Props) {
  return (
    <div className='flex justify-center items-center h-full w-full'><CircularProgress /></div>
  )
}