"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useGetTeamMessagesQuery, useGetUserTeamsQuery } from '@/state/api';
import { CircularProgress } from '@mui/material';
import { io, Socket } from 'socket.io-client';
import { MessageSquare, MoreVertical, Paperclip, Search, Send, User, Users } from 'lucide-react';
import { Team } from '@/app/types/types';

import { Message } from '@/app/types/types';
import { useAppSelector } from '../redux';

export default function ChatPage() {
  const { data: teams, isLoading } = useGetUserTeamsQuery();
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUser = useAppSelector((state) => state.auth.user);

  const { data: chatHistory, isLoading: chatHistoryLoading, isFetching: chatHistoryFetching } = useGetTeamMessagesQuery(
    { teamId: String(selectedTeamId) },
    { skip: selectedTeamId === null }
  );

  useEffect(() => {
    if (chatHistory && !chatHistoryLoading && !chatHistoryFetching) {
      setMessages(chatHistory);
    }
  }, [chatHistory, chatHistoryLoading, chatHistoryFetching]); // Depend on chatHistory and its loading/fetching states
  // Setup Socket.IO and fetch history when team selected
  useEffect(() => {
    if (!selectedTeamId || !currentUser) return;

    const socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:9000', {
      withCredentials: true,
      auth: {
        userId: currentUser.userId // Send user ID during connection
      }
    });
    
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to socket');
      socket.emit('joinTeam', selectedTeamId);
    });

    socket.on('newMessage', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('error', (error: { message: string }) => {
      console.error('Socket error:', error);
      // TODO: Add error toast or notification here
    });

    return () => {
      socket?.disconnect();
      setMessages([]);
    };
  }, [selectedTeamId, currentUser]);

  // auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTeamSelect = (teamId: number) => {
    setSelectedTeamId(teamId);
  };

  const sendMessage = () => {
    if (!message.trim() || !socketRef.current || !selectedTeamId || !currentUser) return;
    
    socketRef.current.emit('sendMessage', {
      content: message.trim(),
      teamId: selectedTeamId,
      userId: currentUser.userId // Include userId in the payload
    });
    
    setMessage('');
  };

  return (
    <div className='flex w-full h-screen'>
      {/* Teams List */}
      <div className='w-1/4 border-r-2 border-gray-200 flex flex-col h-full overflow-hidden'>
        {/* Search */}
        <div className='relative px-4 py-2 border-b border-gray-200 flex-shrink-0'>
          <input
            type='text'
            placeholder='Search teams...'
            className='w-full pl-12 pr-4 py-1 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-600'
          />
          <Search className='absolute left-8 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3' />
        </div>
        {/* Teams list */}
        <div className='flex-1 overflow-y-auto'>
          {isLoading ? (
            <div className='flex justify-center items-center h-full'>
              <CircularProgress />
            </div>
          ) : (
            teams?.map((team: Team) => (
              <div
                key={team.id}
                onClick={() => handleTeamSelect(team.id)}
                className={`p-4 h-20 border-b border-gray-200 flex items-center cursor-pointer ${selectedTeamId === team.id ? 'bg-[#F5F5F5]' : ''}`}
              >
                <Users className='w-6 h-6 text-gray-400' />
                <h3 className='ml-4 text-sm font-semibold text-gray-900'>{team.teamName}</h3>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className='flex-1 flex flex-col h-screen'>
        {selectedTeamId ? (
          <>
            {/* Header */}
            <div className='px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0'>
              <div className='flex items-center space-x-3'>
                <Users className='w-8 h-8 text-gray-500' />
                <h2 className='font-semibold'>{teams?.find((t) => t.id === selectedTeamId)?.teamName}</h2>
              </div>
              <MoreVertical className='w-5 h-5 text-gray-500' />
            </div>

            {/* Messages */}
            <div className='flex-1 overflow-y-auto'>
              <div className='p-6 space-y-4'>
                {messages.length > 0 && messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start ${msg.senderId === currentUser?.userId ? 'justify-end' : ''} space-x-3`}
                  >
                    {msg.senderId !== currentUser?.userId && (
                      msg.senderAvatar ? 
                        <img src={msg.senderAvatar} alt={msg.senderName} className="w-8 h-8 rounded-full" /> :
                        <User className='w-5 h-5 text-gray-500' />
                    )}
                    <div className={`${msg.senderId === currentUser?.userId ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'} p-3 rounded-lg max-w-md`}> 
                      <p className='text-sm'>{msg.text}</p>
                      <span className='text-xs text-gray-500 block mt-1'>
                        {msg.senderName} • {new Date(msg.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    {msg.senderId === currentUser?.userId && (
                      msg.senderAvatar ? 
                        <img src={msg.senderAvatar} alt={msg.senderName} className="w-8 h-8 rounded-full" /> :
                        <User className='w-5 h-5 text-gray-500' />
                    )}
                  </div>
                ))}
              </div>
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className='px-6 py-4 border-t border-gray-200 flex-shrink-0'>
              <div className='flex items-center space-x-3'>
                <Paperclip className='w-5 h-5 text-gray-500' />
                <input
                  type='text'
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder='Type a message...'
                  className='flex-1 pl-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600'
                />
                <Send onClick={sendMessage} className='w-6 h-6 text-blue-600 cursor-pointer' />
              </div>
            </div>
          </>
        ) : (
          <div className='flex-1 flex items-center justify-center'>
            <MessageSquare className='w-16 h-16 text-gray-400' />
            <p className='mt-2 text-gray-500'>Select a team to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}