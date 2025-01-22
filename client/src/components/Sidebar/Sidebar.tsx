"use client"
import React, { useState } from 'react';
import Image from 'next/image';
import { assets } from '@/app/assets/assets';
import { ChevronLeft, ChevronsLeft, Ellipsis, LayoutDashboard, ListChecks, LucideIcon, MessageSquare, Plus, Settings, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDeleteProjectMutation, useGetProjectsQuery } from '@/state/api';
import { useAppDispatch } from '@/app/redux';
import { toggleModal } from '@/state';
type Props = {}

const Sidebar = (props: Props) => {
    const { data: projects, isLoading, error } = useGetProjectsQuery();
    const dispatch = useAppDispatch();
    
  return (
    <div className='w-60 fixed h-full bg-white  flex flex-col gap-y-4 justify-start items-center overflow-x-auto border-r border-[#DBDBDB] '>
        {/* TOP LOGO */}
        <div className='w-full h-16 flex justify-between items-center border-b border-[#DBDBDB] px-4'>
            <Image src={assets.logo} alt='logo' width={120}  />
            <ChevronsLeft size={25} className='text-gray-500 cursor-pointer'/>
        </div>

        {/* MENU ITEMS */}
        <nav className='w-full flex flex-col gap-y-2 px-4 border-b border-[#DBDBDB] pb-4'>
            <SidebarItem title='Home'  href='/dashboard' Icon={LayoutDashboard}/>
            <SidebarItem title='Messages'  href='/messages' Icon={MessageSquare}/>
            <SidebarItem title='Members'  href='/members' Icon={Users}/>
            <SidebarItem title='Tasks'  href='/tasks' Icon={ListChecks}/>
            <SidebarItem title='Settings'  href='/settings' Icon={Settings}/>
        </nav>

        {/* Projects List */}
        <div className='w-full flex flex-col gap-y-2 px-4'>
            <div className='flex justify-between items-center'>
                <p className='text-sm font-medium text-gray-500'>MY PROJECTS</p>
                <button className='rounded-sm p-1 border-1 border-gray-500 flex items-center justify-center cursor-pointer' onClick={() => dispatch(toggleModal())}>
                    <Plus size={18} className='text-gray-500'/>
                </button>
            </div>
        </div>

        {/* PROJECTS LIST items*/}
        <div className='w-full flex flex-col gap-y-2 px-4'>
            {projects?.map((project) => (
                <ProjectItem key={project.id} title={project.name} href={`/projects/${project.id}`} projectId={project.id.toString()} color='bg-green-400'/>
            ))}
        </div>
    </div>
  )
}

interface SidebarItemProps {
    title: string;
    href: string;
    Icon: LucideIcon;
    
};

const SidebarItem = ({title, Icon,href}: SidebarItemProps) => {
    const pathname = usePathname();
    const isActive = (pathname === href || (pathname === "/" && href === "/dashboard"));
    return (
        <Link href={href}>
            <div className={`flex gap-4 items-center justify-start w-full hover:bg-[#5130e514] rounded-md p-2  cursor-pointer ${isActive ? 'bg-[#5130e514] text-primary-600' : ''}`}>
                <Icon size={20} className={`${isActive ? "fill-primary-600" : ""}`} />
                <p className='text-md font-medium '>{title}</p>
            </div>
        </Link>
    )
}
interface ProjectItemProps {
    title: string;
    href: string;
    color: string;
    projectId: string;
}
const ProjectItem = ({title, href, color, projectId}: ProjectItemProps) => {
    const pathname = usePathname();
    const isActive = (pathname === href );
    const [isProjectOptionsOpen, setIsProjectOptionsOpen] = useState(false);
    const [deleteProject] = useDeleteProjectMutation();

    return (
        <Link href={href}>
            <div className={`relative flex  items-center justify-between w-full hover:bg-[#5130e514] hover:text-gray-950 rounded-md p-2 cursor-pointer ${isActive ? 'bg-[#5130e514] text-gray-950' : ''}`}>
                <div className='flex items-center gap-x-4 w-full'>
                    <div className={`block w-2 h-2 rounded-full ${color}`}></div>
                    <p className={`text-sm font-medium text-gray-500 truncate line-clamp-1 flex-1 w-40 ${isActive ? 'text-primary-600' : ''}`}>{title}</p>
                    <Ellipsis size={20} className={`text-gray-500  ${isActive ? 'text-primary-600' : ''}`} onClick={() => setIsProjectOptionsOpen(!isProjectOptionsOpen)}/>
                </div>
                {isProjectOptionsOpen && isActive &&(
                    <div className=' z-50 absolute  top-7 right-0 w-2/3 px-3  py-2 bg-white rounded-md shadow-md flex flex-col gap-y-2'>
                        <p className='text-sm font-medium text-gray-500' onClick={() => deleteProject({projectId})} >Delete</p>
                        <p className='text-sm font-medium text-gray-500'>Open</p>
                    </div>
                )}
                </div>
        </Link>
    )
}
export default Sidebar