"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { FullPageSpinner } from "@/components/Spinner";
import { useAuth } from "@/context/AuthContext";

// Wraps /login and /register. Logged-in users have no business here.
export default function AuthLayout({ children }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  if (status !== "unauthenticated") return <FullPageSpinner />;

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white/80 p-8 shadow-xl shadow-violet-200/50 ring-1 ring-violet-100 backdrop-blur">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-2xl shadow-lg shadow-violet-300/60">
            💸
          </span>
          <h1 className="text-2xl font-bold text-violet-700">SpendWise</h1>
          <p className="text-sm text-gray-500">Know where your money goes.</p>
        </div>
        {children}
      </div>
    </main>
  );
}