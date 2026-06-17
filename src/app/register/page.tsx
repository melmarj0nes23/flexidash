"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/app/actions/auth";
import GridGlowBackground from "@/components/ui/grid-glow-background";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <GridGlowBackground>
      <div className="w-full max-w-md bg-white dark:bg-[#1b1d22] rounded-xl shadow-lg border border-gray-100 dark:border-[#2a2c33] p-8 relative">
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full border-4 border-white shadow-sm flex items-center justify-center">
           <svg className="w-10 h-10 text-[#19c985]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        </div>
        
        <div className="text-center mb-6 mt-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">FlexiDash</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Create a new workspace</p>
        </div>

        <div className="space-y-6" id="register-form">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
            <input id="name-input" name="name" type="text" required className="mt-1 block w-full border border-gray-300 dark:border-[#2a2c33] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#19c985] focus:border-[#19c985] sm:text-sm bg-transparent dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
            <input id="email-input" name="email" type="email" required className="mt-1 block w-full border border-gray-300 dark:border-[#2a2c33] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#19c985] focus:border-[#19c985] sm:text-sm bg-transparent dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input id="password-input" name="password" type="password" required minLength={6} className="mt-1 block w-full border border-gray-300 dark:border-[#2a2c33] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#19c985] focus:border-[#19c985] sm:text-sm bg-transparent dark:text-white" />
          </div>
          <div>
            <button 
              disabled={loading} 
              type="button" 
              onClick={async (e) => {
                e.preventDefault();
                setLoading(true);
                setError("");
                
                const name = (document.getElementById('name-input') as HTMLInputElement)?.value;
                const email = (document.getElementById('email-input') as HTMLInputElement)?.value;
                const password = (document.getElementById('password-input') as HTMLInputElement)?.value;
                
                if (!name || !email || !password) {
                   setError("All fields are required.");
                   setLoading(false);
                   return;
                }
                
                const formData = new FormData();
                formData.append('name', name);
                formData.append('email', email);
                formData.append('password', password);
                
                try {
                  const res = await registerUser(formData);
                  if (res?.error) {
                    setError(res.error);
                    setLoading(false);
                  }
                } catch (err) {
                  console.error(err);
                  setError("An unexpected error occurred. Please try again.");
                  setLoading(false);
                }
              }}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#19c985] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#19c985] disabled:opacity-50">
              {loading ? "Creating..." : "Sign Up"}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/login" className="font-medium text-[#19c985] hover:text-[#14a16b]">
            Already have an account? Sign in
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-[#2a2c33]">
           <p className="text-center text-xs text-gray-400">
             Your email will be used as your unique workspace identifier.
           </p>
        </div>
      </div>
    </GridGlowBackground>
  );
}
