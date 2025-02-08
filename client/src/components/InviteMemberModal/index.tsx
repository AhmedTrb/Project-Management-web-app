import React, { useState } from "react";
import Modal from "../Modal";
import Select from "react-select";
import { useGetUsersQuery } from "@/state/api";
import { User } from "@/app/types/types";
import { useAppSelector } from "@/app/redux";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

type Role = {
  value: string;
  label: string;
};

const roleOptions: Role[] = [
  { value: "member", label: "Member" },
  { value: "admin", label: "Admin" },
  { value: "guest", label: "Guest" },
];

export default function InviteMemberModal({ isOpen, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role | null>(null);
  const [error, setError] = useState("");
  
  const {data:users,isLoading,isError} = useGetUsersQuery();
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const currentUser = useAppSelector((state) => state.auth.user);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedUsers.length === 0) {
      setError("Please select at least one user");
      return;
    }


    try {
      


      setEmail("");
      setRole(null);
    } catch (err: any) {

    } finally {

    }

    
  };

  const inputClasses = "w-full rounded border border-gray-300 p-2 shadow-sm";

  return (
    <Modal title="Invite Member" isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-y-4 p-4">
        
        {/* Added padding */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* <input
                        type="email"
                        placeholder="Member Email"
                        className={inputClasses}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <Select
                        options={roleOptions}
                        className="basic-single"
                        classNamePrefix="select"
                        placeholder="Select Role"
                        value={role}
                        onChange={(selected: Role | null) => setRole(selected)}
                        required
                    /> */}

          <Select
            isMulti
            className="basic-multi-select"
            classNamePrefix="select"
            placeholder="Select User"
            value={selectedUsers.map((user) => ({ value: user, label: user.username }))}
            options={
              users
                ? users.filter((user) => user.userId !== currentUser?.userId && !selectedUsers.includes(user)).map((user) => ({
                    value: user,
                    label: user.username,
                  }))
                : []
            }
            onChange={(selected) =>
              setSelectedUsers(
                selected ? selected.map((option) => option.value) : []
              )
            }
          />

        {/* Error handling  */}
          {error && (
            <div className="text-red-500 bg-red-500 bg-opacity-15 p-2 w-full rounded">
              {error}
            </div>
          )}
          {!error && (
            <div className="text-green-500 bg-green-500 bg-opacity-15 p-2 w-full rounded">
              Member invited successfully!
            </div>
          )}

          <button
            type="submit"
            className={`w-full rounded text-lg bg-primary-600 text-white p-2 shadow-sm ${
              isLoading ? "opacity-40 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
          >
            Add Member
          </button>
        </form>
      </div>
    </Modal>
  );
}
