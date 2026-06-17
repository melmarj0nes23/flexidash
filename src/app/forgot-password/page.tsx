"use client";
export const runtime = "edge";
import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/app/actions/auth";

export default function ForgotPasswordPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const formData = new FormData(e.currentTarget);
    const res = await requestPasswordReset(formData);
    
    if (res.error) {
      setError(res.error);
      setStatus("idle");
    } else {
      setStatus("success");
    }
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#121417] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Check your email</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">We have sent a password reset link to your email address.</p>
          <div className="mt-6">
            <Link href="/login" className="font-medium text-[#19c985] hover:text-blue-500">Return to login</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121417] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Reset your password
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-[#1b1d22] py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200 dark:border-[#2a2c33]">
          <form className="space-y-6" onSubmit={onSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
              <input name="email" type="email" required className="mt-1 block w-full border border-gray-300 dark:border-[#2a2c33] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#19c985] focus:border-[#19c985] sm:text-sm" />
            </div>
            <div>
              <button disabled={status === "loading"} type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#19c985] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#19c985] disabled:opacity-50">
                {status === "loading" ? "Sending..." : "Send Reset Link"}
              </button>
            </div>
          </form>
          <div className="mt-6 text-center">
            <Link href="/login" className="font-medium text-[#19c985] hover:text-blue-500">
              Return to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
