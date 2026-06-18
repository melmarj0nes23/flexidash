import Sidebar from "@/components/Sidebar";
import { auth } from "@/auth";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <div className="flex flex-col md:flex-row h-screen w-full relative">
      <Sidebar user={session?.user} />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden pt-14 md:pt-0">
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50 dark:bg-[#121417]">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
