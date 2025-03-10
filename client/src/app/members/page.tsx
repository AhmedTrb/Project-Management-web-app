"use client";
import React, { useState } from 'react';
import { Users, Mail, Search, } from 'lucide-react';
import {  Team, TeamMemberRole} from '../types/types';
import { useAppSelector } from '../redux';
import { useGetUserTeamsQuery } from '@/state/api';
import Image from 'next/image';
import { CircularProgress } from '@mui/material';


const MembersPage = () => {

  const {data:teams, isLoading} = useGetUserTeamsQuery();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTeams, setFilteredTeams] = useState<Team[]>(teams || []);
  const currentUser = useAppSelector((state) => state.auth.user);
  
  if(isLoading) return <div className='flex justify-center items-center h-screen w-full'><CircularProgress /> </div>
      

  const getRoleBadgeColors = (role: string): string => {
    switch (role) {
      case TeamMemberRole.OWNER:
        return 'bg-primary-600 text-primary-600';
      case TeamMemberRole.ADMIN:
        return 'bg-orange-500 text-orange-500';
      default:
        return 'bg-gray-400 text-gray-400';
    }
  };
 

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    const filtered = teams ? teams.filter(team => team.teamName.toLowerCase().includes(event.target.value.toLowerCase())) : [];
    setFilteredTeams(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="flex-1 min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-secondary-950">My Teams</h1>
                <p className="mt-2 text-gray-600">
                  View teams from projects you own or are a part of
                </p>
              </div>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search teams or projects..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-600"
                aria-label="Search teams"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
              {teams?.map((team) => (
                <div
                key={team.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-primary-600">
                        {team.teamName}
                      </h2>
          
                    </div>
                    {currentUser?.userId && team.members?.some((member) => member.userId === currentUser.userId && member.role === TeamMemberRole.OWNER) && (
                      <span className="px-3 py-1 bg-primary-100 text-secondary-950 rounded-full text-sm">
                        You manage this team
                      </span>
                    )}
                  </div>
                </div>
          
                <div className="p-6">
                  <div className="grid gap-4">
                    {team.members ? team.members.map((teamMember) => {
                      return (
                        <div
                          key={teamMember.userId}
                          className="flex items-center space-x-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                        >
                          {teamMember.user.profilePictureUrl ? (
                            <Image
                              width={48}
                              height={48}
                              src={teamMember.user.profilePictureUrl}
                              alt={`${teamMember.user.username}'s profile`}
                              className="w-12 h-12 rounded-full object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                              <Users className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {teamMember.user.username}
                            </h3>
                            <div className="flex items-center mt-1">
                              <Mail className="w-4 h-4 text-gray-400 mr-1" />
                              <a
                                href={`mailto:${teamMember.user.email}`}
                                className="text-sm text-gray-600 hover:text-primary-600 transition-colors duration-200 truncate"
                              >
                                {teamMember.user.email}
                              </a>
                            </div>
                          </div>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full bg-opacity-10 text-xs font-medium ${getRoleBadgeColors(
                              teamMember.role
                            )}`}
                          >
                            {teamMember.role}
                          </span>
                        </div>
                      );
                    } ) : <div className='text-center w-full text-secondary-950 font-normal'>No Team members found</div>} 
                  </div>
                </div>
              </div>
              ))} 
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

  

export default MembersPage;
