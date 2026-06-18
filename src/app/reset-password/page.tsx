"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/app/actions/auth";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }
    setIsSubmitting(true);
    setError("");

    const formData = new FormData();
    formData.append('token', token);
    formData.append('password', password);

    const result = await resetPassword(formData);
    
    setIsSubmitting(false);
    
    if (result.error) {
      setError(result.error);
    } else {
      router.push("/login?reset=true");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#121417]">
      <div className="w-full max-w-md bg-white dark:bg-[#1b1d22] rounded-xl shadow-lg border border-gray-100 dark:border-[#2a2c33] p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Set New Password</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-2.5 bg-gray-50 dark:bg-[#121417] border border-gray-300 dark:border-[#2a2c33] rounded-md focus:outline-none focus:ring-2 focus:ring-[#19c985] text-gray-900 dark:text-white"
              required
              minLength={6}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isSubmitting || !token}
            className="w-full py-2.5 bg-[#19c985] text-[#121417] font-bold rounded-md hover:bg-[#16b376] transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
