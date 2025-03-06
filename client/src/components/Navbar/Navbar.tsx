"use client";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { Bell, CalendarDays, ChevronDown, Search } from "lucide-react";
import React, { useState } from "react";
import { logOut } from "@/state/authSlice";
import { useRouter } from "next/navigation";
import { useLogoutMutation } from "@/state/api";
import Image from "next/image";



function Navbar() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [logout] = useLogoutMutation();
  const [dropDownIsOpen, setDropDownIsOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logOut());
    logout();
    router.push("/");
  };
  return (
    <div className="flex items-center justify-between h-16 py-5 px-10 md:px-8 w-full border-b border-[#d5d5d5]">
      {/* SEARCH BAR */}
      <div className="bg-gray-100 rounded-md px-2 py-1 flex items-center gap-x-2 w-1/3">
        <Search size={20} className="text-gray-500" />
        <input
          type="text"
          placeholder="Search"
          className="bg-transparent outline-none border-none w-full"
        />
      </div>

      {/* USER PROFILE */}
      <div className="flex items-center justify-between gap-12">
        {/* Icons */}
        <div className="flex items-center justify-between gap-4">
          <CalendarDays size={25} className="text-gray-500 cursor-pointer" />
          <div>
            <div className="relative cursor-pointer">
              <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></div>
              <Bell size={25} className="text-gray-500" />
            </div>
          </div>
        </div>
        {/* Profile */}
        <div className="flex items-center justify-between gap-x-12">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">{user?.username}</p>
            <p className="text-xs text-gray-500">TN ,Tunis</p>
          </div>
          <div className="flex items-center justify-start gap-3">
            {user?.profilePictureUrl ? (
              <Image
                src={user.profilePictureUrl}
                width={40}
                height={40}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-lg text-secondary-950">
                  {user?.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div
              className="relative "
              onMouseEnter={() => setDropDownIsOpen(true)}
              onMouseLeave={() => setDropDownIsOpen(false)}
            >
              <ChevronDown
                size={25}
                className="text-gray-500 cursor-pointer hover:transform-rotate-180 hover:text-black duration-300"
              />
              {dropDownIsOpen && (
                <div className="absolute top-5 right-0 w-40 bg-white shadow rounded-md p-2 border border-gray-200 flex flex-col gap-y-2 z-50">
                  <div className="cursor-pointer border-b border-red-600 w-full">
                    <p
                      className="text-sm  text-red-500  mb-1 hover:text-red-600 hover:bg-red-300 hover:bg-opacity-40 rounded-md px-2 py-1 w-full"
                      onClick={handleLogout}
                    >
                      Logout
                    </p>
                  </div>
                  <div className="cursor-pointer border-b border-gray-500 w-full">
                    <a href="/profile">
                      <p className="text-sm  text-gray-500  mb-1 hover:text-gray-950 hover:bg-gray-100 rounded-md px-2 py-1">
                        Profile
                      </p>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
