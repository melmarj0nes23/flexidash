import CredentialsForm from "@/components/CredentialsForm";
import GridGlowBackground from "@/components/ui/grid-glow-background";

export const runtime = "edge";

export default function LoginPage() {
  return (
    <GridGlowBackground>
      <div className="w-full max-w-md bg-white dark:bg-[#1b1d22] rounded-xl shadow-lg border border-gray-100 dark:border-[#2a2c33] p-8 relative">
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full border-4 border-white shadow-sm flex items-center justify-center">
           <svg className="w-10 h-10 text-[#19c985]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        </div>
        
        <div className="text-center mb-6 mt-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">FlexiDash</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Sign in to your workspace</p>
        </div>

        <CredentialsForm />

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-[#2a2c33]">
           <p className="text-center text-xs text-gray-400">
             Your email serves as your unique workspace identifier.
           </p>
        </div>
      </div>
    </GridGlowBackground>
  );
}
