"use client";
import React from "react";
import { useAppSelector } from "../redux";
import Image from "next/image";


const ProfilePage = () => {
  const user = useAppSelector((state) => state.auth.user);
  return (
    <div className="flex flex-col items-start justify-start w-full min-h-screen bg-[#f5f5f5] p-6">
      <div className="w-full bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-start items-center gap-x-4">
          {user?.profilePictureUrl ? (
            <Image
              src={user.profilePictureUrl}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-2xl text-secondary-950">
                {user?.username.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex flex-col justify-start items-start gap-y-2">
            <h1 className="text-2xl font-bold text-secondary-950">
              {user?.username}
            </h1>
            <p className="text-gray-500">{user?.email}</p>
          </div>
        </div>
        <div className="mt-8 flex flex-col w-1/2 justify-start items-start gap-y-2">
          <h1 className="text-2xl font-bold text-secondary-950 text-left">
            Account Info :
          </h1>
          <div className="flex justify-between gap-x-6 items-center w-full ">
            <div className="rounded-sm border-gray-500 border-1 p-2 w-full">
              <input
                type="text"
                value={user?.username}
                readOnly
                className="bg-transparent outline-none border-none w-full"
              />
            </div>
            <div className="rounded-sm border-gray-500 border-1 p-2 w-full">
              <input
                type="text"
                value={user?.username}
                readOnly
                className="bg-transparent outline-none border-none w-full"
              />
            </div>
          </div>

          <div className="rounded-sm border-gray-500 border-1 p-2 w-full">
            <input
              type="text"
              value={user?.email}
              readOnly
              className="bg-transparent outline-none border-none w-full"
            />
          </div>
          <div className="flex justify-end gap-x-4">
            <button className="bg-primary-600 text-white text-md px-6 py-2 rounded-md">
              Save
            </button>
            <button className="bg-primary-600 text-white text-md px-6 py-2 rounded-md">
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
