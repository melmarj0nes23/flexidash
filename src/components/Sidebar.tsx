"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import ThemeToggle from "./ThemeToggle";

export default function Sidebar({ user }: { user?: any }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const links = [
    { href: "/", label: "Dashboard", icon: "layout" },
    { href: "/entry", label: "Data Entry", icon: "list" },
    { href: "/settings", label: "Catalog & Settings", icon: "settings" },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#19c985]">FlexiDash</h1>
          <button className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" onClick={() => setIsMobileMenuOpen(false)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Financial Overview</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === '/' ? 'bg-[#19c985] text-white' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#2a2c33]'}`}>
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          Dashboard
        </Link>
        <Link href="/sales" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === '/sales' ? 'bg-[#19c985] text-white' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#2a2c33]'}`}>
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Sales Entry
        </Link>
        <Link href="/expense" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === '/expense' ? 'bg-[#19c985] text-white' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#2a2c33]'}`}>
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
          Expense Entry
        </Link>
        <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === '/settings' ? 'bg-[#19c985] text-white' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#2a2c33]'}`}>
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          Settings
        </Link>
      </nav>

      {user && (
        <div className="p-4 border-t border-gray-200 dark:border-[#2a2c33] mt-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3 overflow-hidden">
              {user.image ? (
                  <img src={user.image} alt="Avatar" className="w-10 h-10 rounded-full border border-gray-200 dark:border-[#2a2c33] shadow-sm flex-shrink-0" />
              ) : (
                  <div className="w-10 h-10 bg-[#19c985] text-[#121417] rounded-full flex items-center justify-center font-bold text-lg shadow-sm flex-shrink-0">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
              )}
              <div className="flex flex-col overflow-hidden whitespace-nowrap">
                <span className="text-sm font-bold text-gray-900 dark:text-white truncate" title={user.name}>{user.name || "User"}</span>
              </div>
            </div>
            <ThemeToggle />
          </div>
          <button onClick={() => signOut()} className="w-full flex items-center justify-center space-x-2 bg-white dark:bg-[#1b1d22] border border-gray-200 dark:border-[#2a2c33] text-gray-700 dark:text-gray-300 py-2 px-4 rounded-md hover:bg-gray-50 dark:hover:bg-[#22242a] transition text-sm font-bold shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-gray-50 dark:bg-[#121417] border-r border-gray-200 dark:border-[#2a2c33] min-h-screen flex-col z-10">
        <SidebarContent />
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white dark:bg-[#121417] border-b border-gray-200 dark:border-[#2a2c33] z-40 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-700 dark:text-gray-300 p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <h1 className="text-xl font-bold text-[#19c985]">FlexiDash</h1>
        </div>
      </div>

      {/* Mobile Slide-out Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={() => setIsMobileMenuOpen(false)}></div>
          <aside className="relative w-72 max-w-[80%] bg-gray-50 dark:bg-[#121417] h-full flex flex-col shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
