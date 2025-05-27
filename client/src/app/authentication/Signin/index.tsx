'use client';
import { useAppDispatch } from "@/app/redux";
import { ApiError } from "@/app/types/types";
import { useLoginMutation } from "@/state/api";
import { setCredentials } from "@/state/authSlice";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

type Props = {
  setLogin: React.Dispatch<React.SetStateAction<boolean>>;
};

export const SignIn = ({ setLogin }: Props) => {
  const dispatch = useAppDispatch();
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [login] = useLoginMutation();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const result = await login({ email, password }).unwrap();
      dispatch(setCredentials({ user: result.user, token: result.token }));
      router.push("/dashboard");
    } catch (error: unknown) {
      const err = error as ApiError;
      const errorMessage =
        err.data?.error || err.error || "Signin failed. Please try again.";
      setError(errorMessage);
      console.error("Signin error:", errorMessage);
    }
  };

  const fillDemo = () => {
    setEmail("test@gmail.com");
    setPassword("1111");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-primary-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-center text-primary-600">
          Sign In
        </h2>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
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
          <div className="relative">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 mt-1 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-3 mt-3 text-sm text-gray-500 hover:text-gray-700"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Sign In
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={fillDemo}
            className="text-sm text-secondary-600 underline hover:text-secondary-800"
          >
            Use demo account
          </button>
        </div>

        {error && (
          <div className="text-red-500 text-center bg-opacity-10 bg-red-500 w-full py-2 rounded-sm mt-5">
            {error}
          </div>
        )}

        <div className="text-center mt-5 text-gray-600">
          Don’t have an account?{" "}
          <span
            className="text-primary-600 font-bold cursor-pointer"
            onClick={() => setLogin(false)}
          >
            Sign Up
          </span>
        </div>
      </div>
    </div>
  );
};
