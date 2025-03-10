"use client";
import { useGetUserTeamsQuery } from '@/state/api';
import { CircularProgress } from '@mui/material';
import { MessageSquare, Mic, MoreVertical, Paperclip, Phone, Search, Send, Smile, User, Users, Video } from 'lucide-react'
import React, { useState } from 'react'

type Props = {}

export default function page({}: Props) {
    const {data:teams, isLoading} = useGetUserTeamsQuery();
    const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
    const [message, setMessage] = useState("");

    const handleTeamSelect = (teamId: number) => {
        setSelectedTeamId(Number(teamId));
    };

    return (
        <div className='flex w-full h-full'>
            {/* Chats List */}
            <div className='w-1/4 border-r-2 border-gray-200 flex flex-col'>
                {/* Search Bar */}
                <div className="relative px-4 py-2 border-b border-gray-200">
                    <input
                        type="text"
                        placeholder="Search teams or projects..."
                        className="w-full pl-12 pr-4 py-1 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-600"
                        aria-label="Search teams"
                    />
                    <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3" />
                </div>
                {/* Team Chat Cards */}
                {isLoading ? <div className='flex justify-center items-center h-screen w-full'><CircularProgress/> </div> : teams?.map((team) => (
                    <div 
                        key={team.id} 
                        className={`p-4 border-b border-gray-200 flex items-center space-x-4 cursor-pointer ${selectedTeamId === team.id ? 'bg-[#F5F5F5]' : ''}`}
                        onClick={() => handleTeamSelect(team.id)}
                    >
                        <div className='w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center'>
                            <Users className='w-6 h-6 text-gray-400' />
                        </div>
                        <div className='flex flex-col gap-y-1 w-[80%]'>
                            <h3 className='text-sm font-semibold text-gray-950'>{team.teamName}</h3>
                            <div className='flex justify-between items-center'>
                                <p className='text-xs text-gray-500 overflow-ellipsis'>{team.members?.map((member) => member.user.username).join(', ')}</p>
                                <div className='w-2 h-2 rounded-full bg-green-500'></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Chat Area */}
            <div className='flex-1 flex flex-col h-full'>
                {selectedTeamId ? (
                    <>
                        {/* Chat Header */}
                        <div className='px-6 py-4 border-b border-gray-200 flex items-center justify-between'>
                            <div className='flex items-center space-x-4'>
                                <div className='w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center'>
                                    <Users className='w-5 h-5 text-gray-400' />
                                </div>
                                <div>
                                    <h2 className='font-semibold text-gray-900'>
                                        {teams?.find(team => team.id === selectedTeamId)?.teamName}
                                    </h2>
                                    <p className='text-xs text-gray-500'>
                                        {teams?.find(team => team.id === selectedTeamId)?.members?.length} members
                                    </p>
                                </div>
                            </div>
                            <div className='flex items-center space-x-4'>
                                <button className='p-2 rounded-full hover:bg-gray-100'>
                                    <Phone className='w-5 h-5 text-gray-500' />
                                </button>
                                <button className='p-2 rounded-full hover:bg-gray-100'>
                                    <Video className='w-5 h-5 text-gray-500' />
                                </button>
                                <button className='p-2 rounded-full hover:bg-gray-100'>
                                    <MoreVertical className='w-5 h-5 text-gray-500' />
                                </button>
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div className='flex-1 p-6 overflow-y-auto'>
                            <div className='space-y-6'>
                                {/* Example messages - these would come from your data */}
                                <div className='flex items-start space-x-3'>
                                    <div className='w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center'>
                                        <User className='w-4 h-4 text-blue-500' />
                                    </div>
                                    <div className='bg-gray-100 rounded-lg p-3 max-w-md'>
                                        <p className='text-sm text-gray-900'>Hey team, I just finished the design for the landing page!</p>
                                        <span className='text-xs text-gray-500 block mt-1'>10:32 AM</span>
                                    </div>
                                </div>
                                <div className='flex items-start space-x-3 justify-end'>
                                    <div className='bg-blue-500 rounded-lg p-3 max-w-md'>
                                        <p className='text-sm text-white'>That looks great! Can you share the Figma link?</p>
                                        <span className='text-xs text-blue-100 block mt-1'>10:34 AM</span>
                                    </div>
                                    <div className='w-8 h-8 rounded-full bg-green-100 flex items-center justify-center'>
                                        <User className='w-4 h-4 text-green-500' />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Message Input */}
                        <div className='px-6 py-4 border-t border-gray-200'>
                            <div className='flex items-center space-x-4'>
                                <button className='p-2 rounded-full hover:bg-gray-100'>
                                    <Paperclip className='w-5 h-5 text-gray-500' />
                                </button>
                                <div className='flex-1 relative'>
                                    <input
                                        type="text"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className='w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-600'
                                    />
                                    <div className='absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2'>
                                        <button className='p-1 rounded-full hover:bg-gray-100'>
                                            <Smile className='w-5 h-5 text-gray-500' />
                                        </button>
                                        <button className='p-1 rounded-full hover:bg-gray-100'>
                                            <Mic className='w-5 h-5 text-gray-500' />
                                        </button>
                                    </div>
                                </div>
                                <button className='p-3 rounded-full bg-blue-500 hover:bg-blue-600'>
                                    <Send className='w-5 h-5 text-white' />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className='flex-1 flex items-center justify-center'>
                        <div className='text-center'>
                            <div className='w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4'>
                                <MessageSquare className='w-10 h-10 text-gray-400' />
                            </div>
                            <h3 className='text-lg font-semibold text-gray-900'>No chat selected</h3>
                            <p className='text-sm text-gray-500 mt-2'>Select a team from the list to start chatting</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}