"use client";
import React, { useState } from "react";
import { useSignUpUserMutation } from "@/state/api";
import { useAppDispatch } from "@/app/redux";
import { setCredentials } from "@/state/authSlice";
import { useRouter } from "next/navigation";
import { ApiError } from "@/app/types/types";

type Props = {
  setLogin:React.Dispatch<React.SetStateAction<boolean>>;
};

export const Signup = ({setLogin}:Props) => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [signupUser] = useSignUpUserMutation();
    const dispatch = useAppDispatch();
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(""); 
      setLoading(true);
    
      if (!username || !email || !phone || !password || !confirmPassword) {
        setError("All fields are required.");
        setLoading(false);
        return;
      }
    
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }
    
      try {
        const result = await signupUser({ username, email, password }).unwrap();
        dispatch(setCredentials({ user: result.user, token: result.token }));
        
        router.push("/dashboard");
        router.refresh();
      } catch (error: unknown) {
        const err = error as ApiError;
        const errorMessage = err.data?.error || err.error || "Signup failed. Please try again.";
        setError(errorMessage);
    } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="flex items-center justify-center min-h-screen bg-primary-50">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-center text-primary-600">Sign Up</h2>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 mt-1 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 mt-1 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 mt-1 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter your phone number"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 mt-1 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter your password"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 mt-1 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Confirm your password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Sign Up
            </button>
          </form>
          {error && <p className="mt-4 text-md py-1 rounded bg-red-500 bg-opacity-20 text-center text-red-500">{error}</p>}
          <div className="text-center mt-5 text-gray-600">Already have an account? <span className="text-primary-600 font-bold cursor-pointer" onClick={() => setLogin(true)}>Sign in</span> </div>
        </div>
      </div>
    );
  };