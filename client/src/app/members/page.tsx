"use client";
import React, { useState } from 'react';
import { Users, Mail, Search, Filter, X } from 'lucide-react';
import { sampleTeams, sampleUsers, Team, User } from '../types/types';
import { useAppSelector } from '../redux';
import { useGetUserTeamsQuery } from '@/state/api';


const MembersPage = () => {
  const users:User[] = sampleUsers;
  const teams:Team[] = sampleTeams;
  const {data:teamsss} = useGetUserTeamsQuery();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTeams, setFilteredTeams] = useState<Team[]>(teams);
  console.log(teamsss);
  const currentUser = useAppSelector((state) => state.auth.user);
  const getTeamUsers = (team: Team): User[] => {
    return users.filter(user => user.teamId === team.id);
  };
  const getUserRole = (userId: number, team: Team): string => {
    if (userId === team.projectManagerUserId) return 'Project Manager';
    if (userId === team.productOwnerUserId) return 'Product Owner';
    return 'Team Member';
  };

  const getRoleBadgeColors = (role: string): string => {
    switch (role) {
      case 'Project Manager':
        return 'bg-primary-600 text-primary-600';
      case 'Product Owner':
        return 'bg-orange-500 text-orange-500';
      default:
        return 'bg-gray-400 text-gray-400';
    }
  };
 

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    const filtered = teams.filter(team => team.teamName.toLowerCase().includes(event.target.value.toLowerCase()));
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
              {filteredTeams.map((team) => (
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
                    {currentUser?.userId && getUserRole( currentUser.userId,team) === 'Project Manager' && (
                      <span className="px-3 py-1 bg-primary-100 text-primary-600 rounded-full text-sm">
                        You manage this team
                      </span>
                    )}
                  </div>
                </div>
          
                <div className="p-6">
                  <div className="grid gap-4">
                    {getTeamUsers(team).map((user) => {
                      const role = getUserRole( user.userId,team);
                      return (
                        <div
                          key={user.userId}
                          className="flex items-center space-x-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                        >
                          {user.profilePictureUrl ? (
                            <img
                              src={user.profilePictureUrl}
                              alt={`${user.username}'s profile`}
                              className="w-12 h-12 rounded-full object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                              <Users className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {user.username}
                            </h3>
                            <div className="flex items-center mt-1">
                              <Mail className="w-4 h-4 text-gray-400 mr-1" />
                              <a
                                href={`mailto:${user.email}`}
                                className="text-sm text-gray-600 hover:text-primary-600 transition-colors duration-200 truncate"
                              >
                                {user.email}
                              </a>
                            </div>
                          </div>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full bg-opacity-10 text-xs font-medium ${getRoleBadgeColors(
                              role
                            )}`}
                          >
                            {role}
                          </span>
                        </div>
                      );
                    })}
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
