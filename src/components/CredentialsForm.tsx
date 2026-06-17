"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CredentialsForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const email = (e.currentTarget.elements.namedItem("email") as HTMLInputElement).value;
    const password = (e.currentTarget.elements.namedItem("password") as HTMLInputElement).value;
    
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    
    if (res?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="w-full space-y-4 mt-6">
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}
        <div>
          <label className="sr-only">Email address</label>
          <input name="email" type="email" placeholder="Email address" required className="w-full border border-gray-300 dark:border-[#2a2c33] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#19c985] focus:border-[#19c985] sm:text-sm" />
        </div>
        <div>
          <label className="sr-only">Password</label>
          <input name="password" type="password" placeholder="Password" required className="w-full border border-gray-300 dark:border-[#2a2c33] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#19c985] focus:border-[#19c985] sm:text-sm" />
        </div>
        <div className="flex items-center justify-between text-sm py-1">
          <a href="/register" className="text-[#19c985] hover:underline p-2 -ml-2 relative z-20 block cursor-pointer">Create account</a>
          <a href="/forgot-password" className="text-[#19c985] hover:underline p-2 -mr-2 relative z-20 block cursor-pointer">Forgot password?</a>
        </div>
        <button disabled={loading} type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#19c985] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#19c985] disabled:opacity-50">
          {loading ? "Signing in..." : "Sign In with Email"}
        </button>
      </form>
      
    </div>
  );
}
