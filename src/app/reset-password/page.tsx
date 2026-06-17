"use client";
export const runtime = "edge";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/app/actions/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#121417]">
        <div className="text-center">
          <h2 className="text-xl text-red-600 font-bold">Invalid Token</h2>
          <p className="text-gray-500 dark:text-gray-400">The password reset link is missing or invalid.</p>
        </div>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    formData.append("token", token!);
    
    const res = await resetPassword(formData);
    
    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push("/login?reset=success");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121417] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Create new password
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
              <input name="password" type="password" required minLength={6} className="mt-1 block w-full border border-gray-300 dark:border-[#2a2c33] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#19c985] focus:border-[#19c985] sm:text-sm" />
            </div>
            <div>
              <button disabled={loading} type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#19c985] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#19c985] disabled:opacity-50">
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
